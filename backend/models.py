from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    age_group = Column(String, nullable=True)
    hobbies = Column(String, nullable=True)
    profile_completed = Column(Boolean, default=False)
    theme_preference = Column(String, default='system')
    created_at = Column(DateTime, default=utcnow)
    
    debates = relationship("Debate", back_populates="user")

class Debate(Base):
    __tablename__ = 'debates'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    topic = Column(String)
    domain = Column(String)
    mode = Column(String)
    user_position = Column(String)
    ai_position = Column(String)
    first_turn = Column(String, default='user')
    total_rounds = Column(Integer)
    current_round = Column(Integer, default=0)
    status = Column(String, default='active')
    overall_score = Column(Integer, nullable=True)
    started_at = Column(DateTime, default=utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="debates")
    messages = relationship("DebateMessage", back_populates="debate", order_by="DebateMessage.created_at")
    report = relationship("DebateReport", back_populates="debate", uselist=False)

class DebateMessage(Base):
    __tablename__ = 'debate_messages'
    id = Column(Integer, primary_key=True, index=True)
    debate_id = Column(Integer, ForeignKey('debates.id'))
    sender = Column(String) # 'user' or 'ai'
    round_number = Column(Integer)
    message = Column(Text)
    created_at = Column(DateTime, default=utcnow)
    
    debate = relationship("Debate", back_populates="messages")

class DebateReport(Base):
    __tablename__ = 'debate_reports'
    id = Column(Integer, primary_key=True, index=True)
    debate_id = Column(Integer, ForeignKey('debates.id'), unique=True)
    overall_score = Column(Integer)
    argument_strength = Column(Integer)
    relevance = Column(Integer)
    clarity = Column(Integer)
    logical_reasoning = Column(Integer)
    counterargument_handling = Column(Integer)
    consistency = Column(Integer)
    strongest_argument = Column(Text)
    strongest_response = Column(Text)
    weaknesses = Column(Text) # JSON string
    suggestions = Column(Text) # JSON string
    key_user_arguments = Column(Text) # JSON string
    key_ai_arguments = Column(Text) # JSON string
    neutral_summary = Column(Text)
    created_at = Column(DateTime, default=utcnow)
    
    debate = relationship("Debate", back_populates="report")
