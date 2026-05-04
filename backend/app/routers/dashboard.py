from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Repository
from ..routers.auth import get_current_user
from ..schemas import DashboardSummary

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_summary(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    repos = db.query(Repository).filter(Repository.owner_id == user.id).all()

    scanned = [r for r in repos if r.health_score is not None]
    avg = sum(r.health_score for r in scanned) // len(scanned) if scanned else None

    return DashboardSummary(
        total_repos=len(repos),
        scanned_repos=len(scanned),
        average_health_score=avg,
        healthy=sum(1 for r in scanned if r.health_score >= 80),
        needs_attention=sum(1 for r in scanned if r.health_score < 80),
    )
