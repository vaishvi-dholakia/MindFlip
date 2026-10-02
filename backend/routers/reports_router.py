import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Debate, DebateReport
from schemas import ReportResponse
from auth import get_current_user

router = APIRouter(prefix="", tags=["Reports"])

@router.get("/debates/{id}/report", response_model=ReportResponse)
def get_debate_report(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    debate = db.query(Debate).filter(Debate.id == id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    if debate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this debate")
        
    report = db.query(DebateReport).filter(DebateReport.debate_id == debate.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found for this debate")
        
    # Convert report to dict and parse JSON strings
    report_dict = {c.name: getattr(report, c.name) for c in report.__table__.columns}
    
    try:
        report_dict['weaknesses'] = json.loads(report.weaknesses) if report.weaknesses else []
        report_dict['suggestions'] = json.loads(report.suggestions) if report.suggestions else []
        report_dict['key_user_arguments'] = json.loads(report.key_user_arguments) if report.key_user_arguments else []
        report_dict['key_ai_arguments'] = json.loads(report.key_ai_arguments) if report.key_ai_arguments else []
    except json.JSONDecodeError:
        pass
        
    return report_dict
