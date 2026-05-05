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
