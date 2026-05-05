import asyncio
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy.orm import Session, joinedload

from ..database import SessionLocal
from ..models import Repository, ScanHistory, User
from .notifier import notify_score_drop

# 18 checks — weights sum to 100 so score == percentage directly
CHECKS = {
    "has_readme":           12,
    "has_ci":               11,
    "has_tests":            10,
    "has_license":           8,
    "has_dependabot":        7,
    "has_security_policy":   6,
    "has_recent_commits":    6,
    "has_contributing":      5,
    "has_linter":            5,
    "has_releases":          4,
    "has_topics":            4,
    "has_description":       4,
    "has_changelog":         4,
    "has_issue_templates":   3,
    "has_pr_template":       3,
    "has_gitignore":         3,
    "has_env_example":       3,
    "has_code_of_conduct":   2,
}

MESSAGES = {
    "has_readme":           "Missing README.md — add one to describe your project",
    "has_ci":               "No CI workflow — add GitHub Actions to automate testing",
    "has_tests":            "No test directory found — add tests/ or __tests__/ to verify your code works",
    "has_license":          "No LICENSE file — add one to clarify usage rights",
    "has_dependabot":       "No Dependabot config — add .github/dependabot.yml to automate dependency updates",
    "has_security_policy":  "No SECURITY.md — document how to report vulnerabilities",
    "has_recent_commits":   "No commits in 90 days — consider archiving or updating",
    "has_contributing":     "No CONTRIBUTING.md — help contributors get started",
    "has_linter":           "No linter config found (.eslintrc, .flake8, .rubocop.yml) — enforce code quality automatically",
    "has_releases":         "No releases published — tag versions so users know what to install",
    "has_topics":           "No repository topics — add tags to improve discoverability",
    "has_description":      "No repository description — add one so people understand the project at a glance",
    "has_changelog":        "No CHANGELOG.md — document your release history for users and contributors",
    "has_issue_templates":  "No issue templates — add .github/ISSUE_TEMPLATE to guide bug reports",
    "has_pr_template":      "No PR template — add .github/pull_request_template.md to standardize contributions",
    "has_gitignore":        "No .gitignore — avoid committing unwanted files",
    "has_env_example":      "No .env.example — contributors can't know what environment variables are required",
    "has_code_of_conduct":  "No CODE_OF_CONDUCT.md — add one to set community standards",
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
            coc_status, commits_resp, dependabot_status,
            changelog_status, issue_tmpl_resp, pr_tmpl_status, repo_resp,
            tests_status, tests2_status, tests3_status, tests4_status,
            eslint_status, flake8_status, rubocop_status,
            releases_resp, env_example_status,
        ) = await asyncio.gather(
            get(client, f"{base}/readme"),
            get(client, f"{base}/license"),
            client.get(f"{base}/contents/.github/workflows", headers=headers),
            get(client, f"{base}/contents/.gitignore"),
            get(client, f"{base}/contents/SECURITY.md"),
            get(client, f"{base}/contents/CONTRIBUTING.md"),
            get(client, f"{base}/contents/CODE_OF_CONDUCT.md"),
            client.get(f"{base}/commits?per_page=1&since={_since_iso()}", headers=headers),
            get(client, f"{base}/contents/.github/dependabot.yml"),
            get(client, f"{base}/contents/CHANGELOG.md"),
            client.get(f"{base}/contents/.github/ISSUE_TEMPLATE", headers=headers),
            get(client, f"{base}/contents/.github/pull_request_template.md"),
            client.get(base, headers=headers),
            get(client, f"{base}/contents/tests"),
            get(client, f"{base}/contents/__tests__"),
            get(client, f"{base}/contents/test"),
            get(client, f"{base}/contents/spec"),
            get(client, f"{base}/contents/.eslintrc.json"),
            get(client, f"{base}/contents/.flake8"),
            get(client, f"{base}/contents/.rubocop.yml"),
            client.get(f"{base}/releases?per_page=1", headers=headers),
            get(client, f"{base}/contents/.env.example"),
        )

    ci_data = ci_resp.json() if ci_resp.status_code == 200 else []
    commits_data = commits_resp.json() if commits_resp.status_code == 200 else []
    issue_tmpl_data = issue_tmpl_resp.json() if issue_tmpl_resp.status_code == 200 else []
    repo_data = repo_resp.json() if repo_resp.status_code == 200 else {}
    releases_data = releases_resp.json() if releases_resp.status_code == 200 else []

    return {
        "has_readme":           readme_status == 200,
        "has_ci":               isinstance(ci_data, list) and len(ci_data) > 0,
        "has_tests":            200 in (tests_status, tests2_status, tests3_status, tests4_status),
        "has_license":          license_status == 200,
        "has_dependabot":       dependabot_status == 200,
        "has_security_policy":  security_status == 200,
        "has_recent_commits":   isinstance(commits_data, list) and len(commits_data) > 0,
        "has_contributing":     contributing_status == 200,
        "has_linter":           200 in (eslint_status, flake8_status, rubocop_status),
        "has_releases":         isinstance(releases_data, list) and len(releases_data) > 0,
        "has_topics":           len(repo_data.get("topics") or []) > 0,
        "has_description":      bool(repo_data.get("description")),
        "has_changelog":        changelog_status == 200,
        "has_issue_templates":  isinstance(issue_tmpl_data, list) and len(issue_tmpl_data) > 0,
        "has_pr_template":      pr_tmpl_status == 200,
        "has_gitignore":        gitignore_status == 200,
        "has_env_example":      env_example_status == 200,
        "has_code_of_conduct":  coc_status == 200,
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
                "severity": "high" if weight >= 8 else "medium",
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
