from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional
from datetime import datetime
import json

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    name: Optional[str] = None
    age_group: Optional[str] = None
    hobbies: Optional[List[str]] = None
    password: Optional[str] = None
    theme_preference: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age_group: Optional[str] = None
    hobbies: Optional[List[str]] = None
    profile_completed: bool
    theme_preference: str
    created_at: datetime
    
    @field_validator('hobbies', mode='before')
    def split_hobbies(cls, v):
        if isinstance(v, str):
            if not v.strip():
                return []
            return [h.strip() for h in v.split(',')]
        return v
    
    model_config = {'from_attributes': True}

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: UserResponse

class DebateCreate(BaseModel):
    topic: str
    domain: str
    mode: str
    user_position: str
    first_turn: str = 'user'

class MessageCreate(BaseModel):
    message: str = Field(min_length=1)

class MessageResponse(BaseModel):
    id: int
    sender: str
    round_number: int
    message: str
    created_at: datetime
    
    model_config = {'from_attributes': True}

class DebateResponse(BaseModel):
    id: int
    topic: str
    domain: str
    mode: str
    user_position: str
    ai_position: str
    first_turn: str
    total_rounds: int
    current_round: int
    status: str
    overall_score: Optional[int] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    messages: List[MessageResponse] = []
    
    model_config = {'from_attributes': True}

class DebateListItem(BaseModel):
    id: int
    topic: str
    domain: str
    mode: str
    user_position: str
    ai_position: str
    first_turn: str
    overall_score: Optional[int] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    current_round: int
    total_rounds: int
    
    model_config = {'from_attributes': True}

class MessageSendResponse(BaseModel):
    user_message: MessageResponse
    ai_message: MessageResponse
    debate_status: str
    current_round: int
    total_rounds: int

class ReportResponse(BaseModel):
    id: int
    debate_id: int
    overall_score: int
    argument_strength: int
    relevance: int
    clarity: int
    logical_reasoning: int
    counterargument_handling: int
    consistency: int
    strongest_argument: str
    strongest_response: str
    weaknesses: List[dict]
    suggestions: List[str]
    key_user_arguments: List[str]
    key_ai_arguments: List[str]
    neutral_summary: str
    created_at: datetime
    
    model_config = {'from_attributes': True}

class TopicDomain(BaseModel):
    name: str
    topics: List[str]

class TopicsResponse(BaseModel):
    domains: List[TopicDomain]

class TossQuestionResponse(BaseModel):
    question: str
    options: List[str]
    correct_index: int
