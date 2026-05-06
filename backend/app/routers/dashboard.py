from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Repository
from ..routers.auth import get_current_user
from ..schemas import AffectedRepo, DashboardSummary, TopIssue

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


@router.get("/top-issues", response_model=list[TopIssue])
def get_top_issues(
    token: str,
    db: Session = Depends(get_db),
    limit: int = Query(default=8, ge=1, le=35),
):
    user = get_current_user(token, db)
    repos = (
        db.query(Repository)
        .filter(
            Repository.owner_id == user.id,
            Repository.scan_results.isnot(None),
            Repository.health_score.isnot(None),
        )
        .all()
    )

    total_scanned = len(repos)
    failing: dict[str, list[AffectedRepo]] = {}
    for repo in repos:
        checks = repo.scan_results.get("checks", {}) if repo.scan_results else {}
        for check, passed in checks.items():
            if not passed:
                failing.setdefault(check, []).append(
                    AffectedRepo(id=repo.id, full_name=repo.full_name)
                )

    result = [
        TopIssue(
            check=check,
            failing_count=len(affected),
            total_scanned=total_scanned,
            repos=affected,
        )
        for check, affected in failing.items()
    ]
    result.sort(key=lambda x: x.failing_count, reverse=True)
    return result[:limit]
