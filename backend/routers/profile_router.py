from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserProfile, UserResponse
from auth import get_current_user, hash_password

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("", response_model=UserResponse)
def update_profile(profile_data: UserProfile, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.age_group is not None:
        current_user.age_group = profile_data.age_group
    if profile_data.hobbies is not None:
        current_user.hobbies = ",".join(profile_data.hobbies)
    if profile_data.password is not None:
        current_user.password_hash = hash_password(profile_data.password)
    if profile_data.theme_preference is not None:
        current_user.theme_preference = profile_data.theme_preference
        
    if current_user.age_group and current_user.hobbies:
        current_user.profile_completed = True
        
    db.commit()
    db.refresh(current_user)
    return current_user
