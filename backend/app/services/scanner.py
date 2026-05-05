import asyncio
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy.orm import Session, joinedload

from ..database import SessionLocal
from ..models import Repository, ScanHistory, User
from .notifier import notify_score_drop

CHECKS = {
    "has_readme":           25,
    "has_ci":               20,
    "has_license":          15,
    "has_security_policy":  10,
    "has_contributing":     10,
    "has_recent_commits":   10,
    "has_gitignore":         5,
    "has_code_of_conduct":   5,
}

MESSAGES = {
    "has_readme":          "Missing README.md — add one to describe your project",
    "has_license":         "No LICENSE file — add one to clarify usage rights",
    "has_ci":              "No CI workflow — add GitHub Actions to automate testing",
    "has_gitignore":       "No .gitignore — avoid committing unwanted files",
    "has_security_policy": "No SECURITY.md — document how to report vulnerabilities",
    "has_contributing":    "No CONTRIBUTING.md — help contributors get started",
    "has_recent_commits":  "No commits in 90 days — consider archiving or updating",
    "has_code_of_conduct": "No CODE_OF_CONDUCT.md — add one to set community standards",
}


async def _run_checks(full_name: str, token: str) -> dict[str, bool]:
    headers = {"Authorization": f"Bearer {token}"}
    base = f"https://api.github.com/repos/{full_name}"

    async def get(client: httpx.AsyncClient, url: str) -> int:
        try:
            r = await client.get(url, headers=headers)
            return r.status_code
        except httpx.HTTPError:
            return 0

    async with httpx.AsyncClient(timeout=15) as client:
        (
            readme_status, license_status, ci_resp,
            gitignore_status, security_status, contributing_status,
            coc_status, commits_resp,
        ) = await asyncio.gather(
            get(client, f"{base}/readme"),
            get(client, f"{base}/license"),
            client.get(f"{base}/contents/.github/workflows", headers=headers),
            get(client, f"{base}/contents/.gitignore"),
            get(client, f"{base}/contents/SECURITY.md"),
            get(client, f"{base}/contents/CONTRIBUTING.md"),
            get(client, f"{base}/contents/CODE_OF_CONDUCT.md"),
            client.get(f"{base}/commits?per_page=1&since={_since_iso()}", headers=headers),
        )

    ci_data = ci_resp.json() if ci_resp.status_code == 200 else []
    commits_data = commits_resp.json() if commits_resp.status_code == 200 else []
    return {
        "has_readme":           readme_status == 200,
        "has_license":          license_status == 200,
        "has_ci":               isinstance(ci_data, list) and len(ci_data) > 0,
        "has_gitignore":        gitignore_status == 200,
        "has_security_policy":  security_status == 200,
        "has_contributing":     contributing_status == 200,
        "has_code_of_conduct":  coc_status == 200,
        "has_recent_commits":   isinstance(commits_data, list) and len(commits_data) > 0,
    }


def _since_iso() -> str:
    return (datetime.now(timezone.utc) - timedelta(days=90)).strftime("%Y-%m-%dT%H:%M:%SZ")


def _score(checks: dict[str, bool]) -> tuple[int, list[dict]]:
    score = 0
    issues = []
    for check, passed in checks.items():
        weight = CHECKS.get(check, 0)
        if passed:
            score += weight
        else:
            issues.append({
                "check": check,
                "severity": "high" if weight >= 20 else "medium",
                "message": MESSAGES.get(check, check),
            })
    return score, issues


async def scan_repository(repo_id: int, access_token: str) -> None:
    db: Session = SessionLocal()
    try:
        repo = (
            db.query(Repository)
            .options(joinedload(Repository.owner))
            .filter(Repository.id == repo_id)
            .first()
        )
        if not repo:
            return
        old_score = repo.health_score
        checks = await _run_checks(repo.full_name, access_token)
        score, issues = _score(checks)
        repo.health_score = score
        repo.last_scanned_at = datetime.now(timezone.utc)
        repo.scan_results = {"checks": checks, "issues": issues}
        db.add(ScanHistory(repository_id=repo.id, health_score=score))
        db.commit()

        if old_score is not None and score <= old_score - 10:
            await notify_score_drop(repo.owner, repo, old_score, score)
    finally:
        db.close()
