from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from database import get_db
from models import User, Debate, DebateMessage
from schemas import DebateCreate, DebateResponse, DebateListItem, MessageCreate, MessageSendResponse
from auth import get_current_user
from services.ai_service import generate_ai_response
from services.scoring_service import generate_debate_report

router = APIRouter(prefix="/debates", tags=["Debates"])

def get_total_rounds(mode: str) -> int:
    rounds_map = {
        "Friendly": 3,
        "Academic": 4,
        "Devil's Advocate": 3,
        "Socratic": 4,
        "Competitive": 5
    }
    return rounds_map.get(mode, 3)

@router.get("", response_model=List[DebateListItem])
def get_debates(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    debates = db.query(Debate).filter(Debate.user_id == current_user.id).order_by(Debate.started_at.desc()).all()
    return debates

@router.post("", response_model=DebateResponse)
def create_debate(debate_data: DebateCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ai_position = "AGAINST" if debate_data.user_position.upper() == "FOR" else "FOR"
    total_rounds = get_total_rounds(debate_data.mode)
    
    new_debate = Debate(
        user_id=current_user.id,
        topic=debate_data.topic,
        domain=debate_data.domain,
        mode=debate_data.mode,
        user_position=debate_data.user_position,
        ai_position=ai_position,
        first_turn=debate_data.first_turn,
        total_rounds=total_rounds,
        current_round=0,
        status="active"
    )
    
    db.add(new_debate)
    db.commit()
    db.refresh(new_debate)
    return new_debate

@router.get("/{id}", response_model=DebateResponse)
def get_debate(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    debate = db.query(Debate).filter(Debate.id == id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    if debate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this debate")
    return debate

@router.post("/{id}/message", response_model=MessageSendResponse)
def send_message(id: int, message_data: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    debate = db.query(Debate).filter(Debate.id == id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    if debate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this debate")
    if debate.status != "active":
        raise HTTPException(status_code=400, detail="Debate is no longer active")
        
    debate.current_round += 1
    
    user_msg = DebateMessage(
        debate_id=debate.id,
        sender="user",
        round_number=debate.current_round,
        message=message_data.message
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)
    
    previous_messages = db.query(DebateMessage).filter(DebateMessage.debate_id == debate.id).order_by(DebateMessage.created_at).all()
    
    ai_response_text = generate_ai_response(debate, previous_messages[:-1], message_data.message, db)
    
    ai_msg = DebateMessage(
        debate_id=debate.id,
        sender="ai",
        round_number=debate.current_round,
        message=ai_response_text
    )
    db.add(ai_msg)
    
    if debate.current_round >= debate.total_rounds:
        debate.status = "completed"
        debate.completed_at = datetime.now(timezone.utc)
        
    db.commit()
    db.refresh(ai_msg)
    db.refresh(debate)
    
    return {
        "user_message": user_msg,
        "ai_message": ai_msg,
        "debate_status": debate.status,
        "current_round": debate.current_round,
        "total_rounds": debate.total_rounds
    }

@router.post("/{id}/ai-opening")
def ai_opening(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    debate = db.query(Debate).filter(Debate.id == id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    if debate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this debate")
    if debate.status != "active":
        raise HTTPException(status_code=400, detail="Debate is no longer active")
    
    # Ensure there are no messages yet
    existing_messages = db.query(DebateMessage).filter(DebateMessage.debate_id == debate.id).count()
    if existing_messages > 0:
        raise HTTPException(status_code=400, detail="Debate has already started")

    debate.current_round = 1
    
    # Generate opening
    ai_response_text = generate_ai_response(debate, [], "", db)
    
    ai_msg = DebateMessage(
        debate_id=debate.id,
        sender="ai",
        round_number=debate.current_round,
        message=ai_response_text
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    db.refresh(debate)
    
    return {
        "ai_message": ai_msg,
        "debate_status": debate.status,
        "current_round": debate.current_round,
        "total_rounds": debate.total_rounds
    }

@router.post("/{id}/finish")
def finish_debate(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    debate = db.query(Debate).filter(Debate.id == id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    if debate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this debate")
        
    messages = db.query(DebateMessage).filter(DebateMessage.debate_id == debate.id).order_by(DebateMessage.created_at).all()
    if not messages:
        raise HTTPException(status_code=400, detail="Cannot finish a debate with no messages")
        
    if debate.status != "completed":
        debate.status = "completed"
        debate.completed_at = datetime.now(timezone.utc)
        db.commit()
        
    if not debate.report:
        report = generate_debate_report(debate, messages, db)
        debate.overall_score = report.overall_score
        db.commit()
        db.refresh(debate)
        
    return {"debate": debate, "report": debate.report}
