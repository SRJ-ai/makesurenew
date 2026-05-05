import secrets

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..routers.auth import get_current_user
from ..schemas import UserOut

router = APIRouter()


class UserPrefs(BaseModel):
    email_notifications: bool


@router.patch("/me", response_model=UserOut)
def update_preferences(prefs: UserPrefs, token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    user.email_notifications = prefs.email_notifications
    db.commit()
    db.refresh(user)
    return user


@router.post("/me/api-key", response_model=UserOut)
def generate_api_key(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    user.api_key = secrets.token_urlsafe(32)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/me/api-key", response_model=UserOut)
def revoke_api_key(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    user.api_key = None
    db.commit()
    db.refresh(user)
    return user
