import asyncio
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy.orm import Session, joinedload

from ..database import SessionLocal
from ..models import Repository, ScanHistory, User
from .notifier import notify_score_drop

# 35 checks — weights sum to 100 so score == percentage directly
# Sources: OSSF Scorecard, repolinter, GitHub Community Standards,
#          Stack Overflow 2025 survey, GitHub Octoverse data
CHECKS = {
    # ── Critical (high severity: weight >= 5) ──────────────────────────
    "has_readme":           8,  # entry point; absence = instant trust loss
    "has_ci":               8,  # automated quality gate on every push
    "has_tests":            7,  # proves the code actually works
    "has_license":          6,  # legal clarity; blocks enterprise adoption
    "ci_passing":           5,  # failing CI means every merge is unverified

    # ── Security & reproducibility ─────────────────────────────────────
    "has_dependabot":       5,  # automatic security patches (OSSF: Dependency-Update-Tool)
    "has_security_policy":  5,  # vulnerability disclosure path (OSSF: Security-Policy)
    "has_lock_file":        5,  # reproducible builds; prevents supply-chain drift
    "has_type_checking":    4,  # catches type errors before runtime
    "has_recent_commits":   4,  # project is actively maintained
    "has_contributing":     4,  # onboarding reduces first-PR friction
    "has_codeowners":       4,  # routes PRs to right reviewers automatically

    # ── Code quality ───────────────────────────────────────────────────
    "has_linter":           3,  # enforces code style automatically
    "has_formatter":        3,  # consistent formatting across contributors
    "has_docker":           3,  # reproducible environment for any contributor

    # ── Discoverability & process ──────────────────────────────────────
    "has_releases":         2,  # lets users pin a stable version
    "has_topics":           2,  # improves GitHub search discoverability
    "has_devcontainer":     2,  # one-click dev environment in Codespaces/VS Code
    "has_makefile":         2,  # standardises test/build/lint commands
    "has_good_first_issue": 2,  # open issues labelled for new contributors
    "has_api_docs":         2,  # API contract documented for consumers

    # ── Polish (1pt each) ──────────────────────────────────────────────
    "has_issue_templates":  1,
    "has_pr_template":      1,
    "has_gitignore":        1,
    "has_env_example":      1,
    "has_pre_commit":       1,
    "has_support":          1,
    "has_description":      1,
    "has_changelog":        1,
    "has_docs":             1,
    "has_code_of_conduct":  1,
    "has_stale_bot":        1,  # auto-closes inactive issues to keep tracker clean
    "has_funding":          1,  # enables GitHub Sponsors; signals sustainability
    "has_homepage":         1,  # project website or docs link in About section
    "has_scorecard":        1,  # runs OSSF Scorecard to track security posture
}

MESSAGES = {
    "has_readme":           "Missing README.md — add one to describe your project",
    "has_ci":               "No CI workflow — add GitHub Actions, CircleCI, or GitLab CI to automate testing",
    "has_tests":            "No test directory found — add tests/, __tests__/, or cypress/ to verify your code",
    "has_license":          "No LICENSE file — required for open-source adoption",
    "ci_passing":           "CI is currently failing — fix the broken workflow so merges stay green",
    "has_dependabot":       "No Dependabot config — add .github/dependabot.yml for automatic security patches",
    "has_security_policy":  "No SECURITY.md — document how to responsibly report vulnerabilities",
    "has_lock_file":        "No lock file — add package-lock.json, pnpm-lock.yaml, poetry.lock, or go.sum for reproducible builds",
    "has_type_checking":    "No type checking config — add tsconfig.json, pyrightconfig.json, or mypy.ini to catch type errors early",
    "has_recent_commits":   "No commits in 90 days — consider archiving or updating",
    "has_contributing":     "No CONTRIBUTING.md — help new contributors get started",
    "has_codeowners":       "No CODEOWNERS file — add .github/CODEOWNERS to auto-assign reviewers",
    "has_linter":           "No linter config (.eslintrc, ruff.toml, .flake8, .rubocop.yml) — enforce code style automatically",
    "has_formatter":        "No formatter config (.prettierrc, .editorconfig) — enforce consistent formatting",
    "has_docker":           "No Dockerfile — containerise so contributors can run the project without manual setup",
    "has_releases":         "No releases published — tag versions so users know what to install",
    "has_topics":           "No repository topics — add tags to improve discoverability",
    "has_devcontainer":     "No dev container — add .devcontainer/devcontainer.json for one-click environments",
    "has_makefile":         "No Makefile — add one to standardise test, build, and lint commands",
    "has_good_first_issue": "No open 'good first issue' issues — label some to welcome new contributors",
    "has_api_docs":         "No API docs (openapi.yml, swagger.yml) — document your API contract",
    "has_issue_templates":  "No issue templates — add .github/ISSUE_TEMPLATE to guide bug reports",
    "has_pr_template":      "No PR template — add .github/pull_request_template.md to standardize contributions",
    "has_gitignore":        "No .gitignore — avoid committing build artifacts and secrets",
    "has_env_example":      "No .env.example — contributors can't know which environment variables are needed",
    "has_pre_commit":       "No pre-commit hooks — add .pre-commit-config.yaml to catch issues before push",
    "has_support":          "No SUPPORT.md — tell users where to ask questions and get help",
    "has_description":      "No repository description — add one so people understand the project at a glance",
    "has_changelog":        "No CHANGELOG.md — document your release history",
    "has_docs":             "No docs/ folder — add documentation for users and contributors",
    "has_code_of_conduct":  "No CODE_OF_CONDUCT.md — set community expectations",
    "has_stale_bot":        "No stale issue management — add .github/stale.yml to auto-close inactive issues",
    "has_funding":          "No FUNDING.yml — add .github/FUNDING.yml to enable GitHub Sponsors",
    "has_homepage":         "No homepage URL — add a project website or docs link in the About section",
    "has_scorecard":        "Not running OSSF Scorecard — add the workflow to continuously track security posture",
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
            # ── core repo data ────────────────────────────────────────
            readme_status, license_status, repo_resp,
            # ── CI — GitHub Actions, CircleCI, Travis, GitLab ─────────
            ci_resp, circleci_status, travis_status, gitlab_ci_status,
            ci_runs_resp,
            # ── tests — multiple directory conventions ─────────────────
            tests_status, tests2_status, tests3_status, tests4_status,
            tests5_status, tests6_status,                # cypress/, e2e/
            # ── security & dependencies ───────────────────────────────
            security_status, dependabot_status,
            lock1_status, lock2_status, lock3_status,    # npm, yarn, poetry
            lock4_status, lock5_status, lock6_status,    # pnpm, Gemfile, go.sum
            lock7_status,                                # Cargo.lock
            # ── type checking ─────────────────────────────────────────
            tsconfig_status, mypy_status,
            pyright_status, mypy2_status,                # pyrightconfig, .mypy.ini
            # ── linter — JS/TS, Python, Ruby, Rust ────────────────────
            eslint1_status, eslint2_status, eslint3_status,  # .eslintrc.json, eslint.config.js, .eslintrc
            flake8_status, pylint_status, ruff_status,       # Python linters
            rubocop_status,                                  # Ruby
            # ── formatter ─────────────────────────────────────────────
            prettier1_status, prettier2_status, prettier3_status,  # .prettierrc.json, .prettierrc, prettier.config.js
            editorconfig_status,
            # ── commits, contributing, codeowners ─────────────────────
            commits_resp,
            contributing_status, contributing2_status,   # root, .github/
            codeowners1_status, codeowners2_status,
            # ── changelog ─────────────────────────────────────────────
            changelog_status, changelog2_status,         # CHANGELOG.md, CHANGES.md
            # ── docs ──────────────────────────────────────────────────
            docs_status, docs2_status,                   # docs/, doc/
            # ── issue / PR templates ──────────────────────────────────
            issue_tmpl_resp, issue_tmpl2_status,         # ISSUE_TEMPLATE dir, single file
            pr_tmpl1_status, pr_tmpl2_status,            # lowercase, uppercase
            # ── discoverability & tooling ─────────────────────────────
            releases_resp, gitignore_status, env_example_status,
            docker_status, devcontainer_status, makefile_status,
            precommit_status, support_status, coc_status,
            good_first_resp,
            openapi_status, swagger_status, openapi2_status,  # .yml, .yaml, openapi.json
            stale_status, funding_status, scorecard_status,
        ) = await asyncio.gather(
            # ── core ──────────────────────────────────────────────────
            get(client, f"{base}/readme"),
            get(client, f"{base}/license"),
            client.get(base, headers=headers),
            # ── CI ────────────────────────────────────────────────────
            client.get(f"{base}/contents/.github/workflows", headers=headers),
            get(client, f"{base}/contents/.circleci/config.yml"),
            get(client, f"{base}/contents/.travis.yml"),
            get(client, f"{base}/contents/.gitlab-ci.yml"),
            client.get(f"{base}/actions/runs?per_page=1", headers=headers),
            # ── tests ─────────────────────────────────────────────────
            get(client, f"{base}/contents/tests"),
            get(client, f"{base}/contents/__tests__"),
            get(client, f"{base}/contents/test"),
            get(client, f"{base}/contents/spec"),
            get(client, f"{base}/contents/cypress"),
            get(client, f"{base}/contents/e2e"),
            # ── security & dependencies ───────────────────────────────
            get(client, f"{base}/contents/SECURITY.md"),
            get(client, f"{base}/contents/.github/dependabot.yml"),
            get(client, f"{base}/contents/package-lock.json"),
            get(client, f"{base}/contents/yarn.lock"),
            get(client, f"{base}/contents/poetry.lock"),
            get(client, f"{base}/contents/pnpm-lock.yaml"),
            get(client, f"{base}/contents/Gemfile.lock"),
            get(client, f"{base}/contents/go.sum"),
            get(client, f"{base}/contents/Cargo.lock"),
            # ── type checking ─────────────────────────────────────────
            get(client, f"{base}/contents/tsconfig.json"),
            get(client, f"{base}/contents/mypy.ini"),
            get(client, f"{base}/contents/pyrightconfig.json"),
            get(client, f"{base}/contents/.mypy.ini"),
            # ── linter ────────────────────────────────────────────────
            get(client, f"{base}/contents/.eslintrc.json"),
            get(client, f"{base}/contents/eslint.config.js"),
            get(client, f"{base}/contents/.eslintrc"),
            get(client, f"{base}/contents/.flake8"),
            get(client, f"{base}/contents/.pylintrc"),
            get(client, f"{base}/contents/ruff.toml"),
            get(client, f"{base}/contents/.rubocop.yml"),
            # ── formatter ─────────────────────────────────────────────
            get(client, f"{base}/contents/.prettierrc.json"),
            get(client, f"{base}/contents/.prettierrc"),
            get(client, f"{base}/contents/prettier.config.js"),
            get(client, f"{base}/contents/.editorconfig"),
            # ── commits, contributing, codeowners ─────────────────────
            client.get(f"{base}/commits?per_page=1&since={_since_iso()}", headers=headers),
            get(client, f"{base}/contents/CONTRIBUTING.md"),
            get(client, f"{base}/contents/.github/CONTRIBUTING.md"),
            get(client, f"{base}/contents/.github/CODEOWNERS"),
            get(client, f"{base}/contents/CODEOWNERS"),
            # ── changelog ─────────────────────────────────────────────
            get(client, f"{base}/contents/CHANGELOG.md"),
            get(client, f"{base}/contents/CHANGES.md"),
            # ── docs ──────────────────────────────────────────────────
            get(client, f"{base}/contents/docs"),
            get(client, f"{base}/contents/doc"),
            # ── templates ─────────────────────────────────────────────
            client.get(f"{base}/contents/.github/ISSUE_TEMPLATE", headers=headers),
            get(client, f"{base}/contents/.github/ISSUE_TEMPLATE.md"),
            get(client, f"{base}/contents/.github/pull_request_template.md"),
            get(client, f"{base}/contents/.github/PULL_REQUEST_TEMPLATE.md"),
            # ── tooling & polish ──────────────────────────────────────
            client.get(f"{base}/releases?per_page=1", headers=headers),
            get(client, f"{base}/contents/.gitignore"),
            get(client, f"{base}/contents/.env.example"),
            get(client, f"{base}/contents/Dockerfile"),
            get(client, f"{base}/contents/.devcontainer"),
            get(client, f"{base}/contents/Makefile"),
            get(client, f"{base}/contents/.pre-commit-config.yaml"),
            get(client, f"{base}/contents/SUPPORT.md"),
            get(client, f"{base}/contents/CODE_OF_CONDUCT.md"),
            client.get(
                f"{base}/issues?labels=good+first+issue&state=open&per_page=1",
                headers=headers,
            ),
            get(client, f"{base}/contents/openapi.yml"),
            get(client, f"{base}/contents/swagger.yml"),
            get(client, f"{base}/contents/openapi.yaml"),
            get(client, f"{base}/contents/.github/stale.yml"),
            get(client, f"{base}/contents/.github/FUNDING.yml"),
            get(client, f"{base}/contents/.github/workflows/scorecard.yml"),
        )

    # ── parse compound responses ──────────────────────────────────────
    ci_data = ci_resp.json() if ci_resp.status_code == 200 else []
    commits_data = commits_resp.json() if commits_resp.status_code == 200 else []
    issue_tmpl_data = issue_tmpl_resp.json() if issue_tmpl_resp.status_code == 200 else []
    repo_data = repo_resp.json() if repo_resp.status_code == 200 else {}
    releases_data = releases_resp.json() if releases_resp.status_code == 200 else []
    runs = (ci_runs_resp.json() if ci_runs_resp.status_code == 200 else {}).get("workflow_runs", [])
    good_first_data = good_first_resp.json() if good_first_resp.status_code == 200 else []

    return {
        "has_readme":           readme_status == 200,
        "has_ci":               (isinstance(ci_data, list) and len(ci_data) > 0)
                                or 200 in (circleci_status, travis_status, gitlab_ci_status),
        "has_tests":            200 in (tests_status, tests2_status, tests3_status,
                                        tests4_status, tests5_status, tests6_status),
        "has_license":          license_status == 200,
        "ci_passing":           bool(runs) and runs[0].get("conclusion") == "success",
        "has_dependabot":       dependabot_status == 200,
        "has_security_policy":  security_status == 200,
        "has_lock_file":        200 in (lock1_status, lock2_status, lock3_status,
                                        lock4_status, lock5_status, lock6_status, lock7_status),
        "has_type_checking":    200 in (tsconfig_status, mypy_status, pyright_status, mypy2_status),
        "has_recent_commits":   isinstance(commits_data, list) and len(commits_data) > 0,
        "has_contributing":     200 in (contributing_status, contributing2_status),
        "has_codeowners":       200 in (codeowners1_status, codeowners2_status),
        "has_linter":           200 in (eslint1_status, eslint2_status, eslint3_status,
                                        flake8_status, pylint_status, ruff_status, rubocop_status),
        "has_formatter":        200 in (prettier1_status, prettier2_status, prettier3_status,
                                        editorconfig_status),
        "has_docker":           docker_status == 200,
        "has_releases":         isinstance(releases_data, list) and len(releases_data) > 0,
        "has_topics":           len(repo_data.get("topics") or []) > 0,
        "has_devcontainer":     devcontainer_status == 200,
        "has_makefile":         makefile_status == 200,
        "has_good_first_issue": isinstance(good_first_data, list) and len(good_first_data) > 0,
        "has_api_docs":         200 in (openapi_status, swagger_status, openapi2_status),
        "has_issue_templates":  (isinstance(issue_tmpl_data, list) and len(issue_tmpl_data) > 0)
                                or issue_tmpl2_status == 200,
        "has_pr_template":      200 in (pr_tmpl1_status, pr_tmpl2_status),
        "has_gitignore":        gitignore_status == 200,
        "has_env_example":      env_example_status == 200,
        "has_pre_commit":       precommit_status == 200,
        "has_support":          support_status == 200,
        "has_description":      bool(repo_data.get("description")),
        "has_changelog":        200 in (changelog_status, changelog2_status),
        "has_docs":             200 in (docs_status, docs2_status),
        "has_code_of_conduct":  coc_status == 200,
        "has_stale_bot":        stale_status == 200,
        "has_funding":          funding_status == 200,
        "has_homepage":         bool(repo_data.get("homepage")),
        "has_scorecard":        scorecard_status == 200,
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
                "severity": "high" if weight >= 5 else "medium",
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
