import asyncio
import logging
from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Repository, User
from .scanner import scan_repository

logger = logging.getLogger(__name__)

_scheduler = AsyncIOScheduler()
_RESCAN_AFTER_HOURS = 6
_MAX_CONCURRENT = 5


async def _rescan_stale_repos() -> None:
    db: Session = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=_RESCAN_AFTER_HOURS)
        rows = (
            db.query(Repository, User)
            .join(User, Repository.owner_id == User.id)
            .filter(
                (Repository.last_scanned_at == None) |  # noqa: E711
                (Repository.last_scanned_at < cutoff)
            )
            .yield_per(100)
        )
        # Snapshot only the IDs and tokens we need; avoids keeping ORM objects alive
        stale = [(repo.id, user.access_token) for repo, user in rows]
    finally:
        db.close()

    if not stale:
        return

    logger.info("Scheduler: rescanning %d stale repos", len(stale))
    sem = asyncio.Semaphore(_MAX_CONCURRENT)

    async def _bounded(repo_id: int, token: str) -> None:
        async with sem:
            try:
                await scan_repository(repo_id, token)
            except Exception:
                logger.exception("Scheduler: scan failed for repo_id=%d", repo_id)

    await asyncio.gather(*[_bounded(repo_id, token) for repo_id, token in stale])


def start_scheduler() -> None:
    _scheduler.add_job(
        _rescan_stale_repos,
        trigger="interval",
        hours=_RESCAN_AFTER_HOURS,
        id="rescan_stale",
        replace_existing=True,
        next_run_time=datetime.now(timezone.utc) + timedelta(minutes=5),
    )
    _scheduler.start()
    logger.info("Scheduler started — stale repo rescan every %dh", _RESCAN_AFTER_HOURS)


def stop_scheduler() -> None:
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
