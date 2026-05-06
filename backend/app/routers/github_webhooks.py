import hashlib
import hmac
import json
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from ..config import settings
from ..database import get_db
from ..models import Repository
from ..services.scanner import scan_repository

router = APIRouter()
logger = logging.getLogger(__name__)


def _verify_signature(body: bytes, sig_header: str | None) -> None:
    if not settings.github_webhook_secret:
        logger.warning("GitHub webhook secret not configured — accepting unsigned requests")
        return
    if not sig_header or not sig_header.startswith("sha256="):
        raise HTTPException(status_code=400, detail="Missing webhook signature")
    expected = "sha256=" + hmac.new(
        settings.github_webhook_secret.encode(), body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, sig_header):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")


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

    payload = json.loads(body)
    full_name = payload.get("repository", {}).get("full_name")
    if not full_name:
        raise HTTPException(status_code=400, detail="Missing repository in payload")

    repo = (
        db.query(Repository)
        .options(joinedload(Repository.owner))
        .filter(Repository.full_name == full_name)
        .first()
    )
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not tracked")

    background_tasks.add_task(scan_repository, repo.id, repo.owner.access_token)
    return {"status": "scan queued", "repo": full_name}
