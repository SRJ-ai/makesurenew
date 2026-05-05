import hashlib
import hmac

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import Repository, User
from ..services.scanner import scan_repository

router = APIRouter()


def _verify_signature(body: bytes, sig_header: str | None) -> None:
    if not settings.github_webhook_secret:
        return
    if not sig_header or not sig_header.startswith("sha256="):
        raise HTTPException(status_code=400, detail="Missing signature")
    expected = "sha256=" + hmac.new(
        settings.github_webhook_secret.encode(), body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, sig_header):
        raise HTTPException(status_code=400, detail="Invalid signature")


@router.post("/webhook")
async def github_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    x_hub_signature_256: str | None = Header(None),
    x_github_event: str | None = Header(None),
):
    body = await request.body()
    _verify_signature(body, x_hub_signature_256)

    if x_github_event == "ping":
        return {"status": "ok"}

    if x_github_event != "push":
        return {"status": "ignored"}

    payload = await request.json() if not body else __import__("json").loads(body)
    full_name = payload.get("repository", {}).get("full_name")
    if not full_name:
        return {"status": "no repo"}

    repo = db.query(Repository).filter(Repository.full_name == full_name).first()
    if not repo:
        return {"status": "unknown repo"}

    user = db.query(User).filter(User.id == repo.owner_id).first()
    if not user:
        return {"status": "no user"}

    background_tasks.add_task(scan_repository, repo.id, user.access_token)
    return {"status": "scan queued", "repo": full_name}
