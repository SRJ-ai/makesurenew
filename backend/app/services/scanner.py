from datetime import datetime

import httpx
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Repository

CHECKS = {
    "has_readme": ("readme endpoint", 30),
    "has_license": ("license endpoint", 20),
    "has_ci": ("CI workflows", 30),
    "has_gitignore": (".gitignore", 20),
}

MESSAGES = {
    "has_readme": "Missing README.md — add one to describe your project",
    "has_license": "No LICENSE file — add one to clarify usage rights",
    "has_ci": "No CI workflow — add GitHub Actions to automate testing",
    "has_gitignore": "No .gitignore — avoid committing unwanted files",
}


async def _run_checks(full_name: str, token: str) -> dict[str, bool]:
    headers = {"Authorization": f"Bearer {token}"}
    results: dict[str, bool] = {}

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"https://api.github.com/repos/{full_name}/readme", headers=headers)
        results["has_readme"] = r.status_code == 200

        r = await client.get(f"https://api.github.com/repos/{full_name}/license", headers=headers)
        results["has_license"] = r.status_code == 200

        r = await client.get(
            f"https://api.github.com/repos/{full_name}/contents/.github/workflows",
            headers=headers,
        )
        results["has_ci"] = r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) > 0

        r = await client.get(
            f"https://api.github.com/repos/{full_name}/contents/.gitignore",
            headers=headers,
        )
        results["has_gitignore"] = r.status_code == 200

    return results


def _score(checks: dict[str, bool]) -> tuple[int, list[dict]]:
    score = 0
    issues = []
    weights = {k: v[1] for k, v in CHECKS.items()}
    for check, passed in checks.items():
        weight = weights.get(check, 0)
        if passed:
            score += weight
        else:
            issues.append({
                "check": check,
                "severity": "high" if weight >= 25 else "medium",
                "message": MESSAGES.get(check, check),
            })
    return score, issues


async def scan_repository(repo_id: int, access_token: str) -> None:
    db: Session = SessionLocal()
    try:
        repo = db.query(Repository).filter(Repository.id == repo_id).first()
        if not repo:
            return
        checks = await _run_checks(repo.full_name, access_token)
        score, issues = _score(checks)
        repo.health_score = score
        repo.last_scanned_at = datetime.utcnow()
        repo.scan_results = {"checks": checks, "issues": issues}
        db.commit()
    finally:
        db.close()
