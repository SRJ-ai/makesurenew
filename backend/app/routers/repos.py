import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Repository, ScanHistory
from ..routers.auth import get_current_user
from ..schemas import RepoOut, ScanHistoryOut
from ..services.scanner import scan_repository

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/", response_model=list[RepoOut])
def list_repos(
    token: str,
    db: Session = Depends(get_db),
    q: str = Query(default="", description="Filter by name"),
    sort: str = Query(default="name", description="Sort field: name|score|scanned"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=100),
):
    user = get_current_user(token, db)
    query = db.query(Repository).filter(Repository.owner_id == user.id)

    if q:
        query = query.filter(Repository.full_name.ilike(f"%{q}%"))

    if sort == "score":
        query = query.order_by(Repository.health_score.asc().nullslast())
    elif sort == "scanned":
        query = query.order_by(Repository.last_scanned_at.desc().nullslast())
    else:
        query = query.order_by(Repository.full_name.asc())

    offset = (page - 1) * per_page
    return query.offset(offset).limit(per_page).all()


@router.post("/sync")
@limiter.limit("10/minute")
async def sync_repos(request: Request, token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            "https://api.github.com/user/repos?per_page=100&sort=updated",
            headers={"Authorization": f"Bearer {user.access_token}"},
        )
    gh_repos = resp.json()

    # Batch lookup — one query instead of N
    incoming_ids = [gh["id"] for gh in gh_repos]
    existing = {
        r.github_repo_id: r
        for r in db.query(Repository).filter(Repository.github_repo_id.in_(incoming_ids)).all()
    }

    for gh in gh_repos:
        repo = existing.get(gh["id"])
        if not repo:
            repo = Repository(
                github_repo_id=gh["id"],
                owner_id=user.id,
                full_name=gh["full_name"],
                name=gh["name"],
                description=gh.get("description"),
                is_private=gh["private"],
            )
            db.add(repo)
        else:
            repo.description = gh.get("description")
            repo.is_private = gh["private"]

    db.commit()
    return {"synced": len(gh_repos)}


@router.post("/scan-all")
async def scan_all_repos(
    token: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = get_current_user(token, db)
    repos = db.query(Repository).filter(Repository.owner_id == user.id).all()
    for repo in repos:
        background_tasks.add_task(scan_repository, repo.id, user.access_token)
    return {"status": "scan queued", "count": len(repos)}


@router.post("/{repo_id}/scan")
@limiter.limit("20/minute")
async def trigger_scan(
    request: Request,
    repo_id: int,
    token: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = get_current_user(token, db)
    repo = db.query(Repository).filter(
        Repository.id == repo_id, Repository.owner_id == user.id
    ).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repo not found")
    background_tasks.add_task(scan_repository, repo.id, user.access_token)
    return {"status": "scan queued", "repo": repo.full_name}


@router.get("/{repo_id}", response_model=RepoOut)
def get_repo(repo_id: int, token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    repo = db.query(Repository).filter(
        Repository.id == repo_id, Repository.owner_id == user.id
    ).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repo not found")
    return repo


@router.get("/{repo_id}/history", response_model=list[ScanHistoryOut])
def get_repo_history(repo_id: int, token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    repo = db.query(Repository).filter(
        Repository.id == repo_id, Repository.owner_id == user.id
    ).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repo not found")
    return (
        db.query(ScanHistory)
        .filter(ScanHistory.repository_id == repo_id)
        .order_by(ScanHistory.scanned_at.desc())
        .limit(30)
        .all()
    )
