from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Repository

router = APIRouter()


@router.get("/{owner}/{repo_name}")
def public_repo_health(owner: str, repo_name: str, db: Session = Depends(get_db)):
    full_name = f"{owner}/{repo_name}"
    repo = db.query(Repository).filter(
        Repository.full_name == full_name,
        Repository.is_private == False,  # noqa: E712
    ).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found or not public")
    if repo.health_score is None:
        raise HTTPException(status_code=404, detail="Repository has not been scanned yet")
    return {
        "full_name": repo.full_name,
        "health_score": repo.health_score,
        "last_scanned_at": repo.last_scanned_at,
        "checks": repo.scan_results.get("checks") if repo.scan_results else {},
        "issues": repo.scan_results.get("issues") if repo.scan_results else [],
    }
