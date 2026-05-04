import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Repository
from ..routers.auth import get_current_user
from ..schemas import RepoOut
from ..services.scanner import scan_repository

router = APIRouter()


@router.get("/", response_model=list[RepoOut])
def list_repos(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    return db.query(Repository).filter(Repository.owner_id == user.id).all()


@router.post("/sync")
async def sync_repos(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.github.com/user/repos?per_page=100&sort=updated",
            headers={"Authorization": f"Bearer {user.access_token}"},
        )
    count = 0
    for gh in resp.json():
        repo = db.query(Repository).filter(Repository.github_repo_id == gh["id"]).first()
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
        count += 1
    db.commit()
    return {"synced": count}


@router.post("/{repo_id}/scan")
async def trigger_scan(
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
