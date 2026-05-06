# makesurenew

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Live Demo](https://img.shields.io/badge/demo-live-blue)](https://srj-ai.github.io/makesurenew/)
[![CI](https://github.com/srj-ai/makesurenew/actions/workflows/ci.yml/badge.svg)](https://github.com/srj-ai/makesurenew/actions/workflows/ci.yml)

> Repository health monitoring for developers — 35 automated checks, scored out of 100.

Connect your GitHub repos and instantly see what needs attention — missing CI, no tests, outdated dependencies, broken workflows, and more. Every repo gets a **health score from 0–100** with one-click fix links for every failing check.

**[→ Try the live demo](https://srj-ai.github.io/makesurenew/)** · No login required.

---

## Deploy to Render (free, ~5 min)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Steps

1. **Fork this repo** to your GitHub account.

2. **Create a GitHub OAuth App** at https://github.com/settings/developers → "New OAuth App":
   - Homepage URL: `https://makesurenew.onrender.com`
   - Authorization callback URL: `https://makesurenew.onrender.com/api/auth/callback`
   - Copy the **Client ID** and **Client Secret**.

3. **Connect to Render**:
   - Sign up / log in at https://render.com
   - Click **New → Blueprint** → select your forked repo
   - Render reads `render.yaml` and creates: web service + PostgreSQL DB

4. **Set secrets** in the Render dashboard → makesurenew service → Environment:
   - `GITHUB_CLIENT_ID` → your OAuth App Client ID
   - `GITHUB_CLIENT_SECRET` → your OAuth App Client Secret

5. **Trigger a deploy** — Render builds the Docker image, copies the frontend, and starts the server.

> First deploy takes ~3 min. Subsequent deploys are faster.

---

## Run locally (Docker Compose)

```sh
git clone https://github.com/srj-ai/makesurenew
cd makesurenew
cp .env.example .env
# Edit .env — fill in GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
docker compose up
```

Open **http://localhost:5173** → sign in with GitHub → sync your repos.

---

## How scoring works

35 checks run in parallel via GitHub API. Weights sum to 100 — the score is a direct percentage.

| Category | Checks | Max pts |
|---|---|---|
| **Critical** | README · CI · Tests · License · CI passing | 38 |
| **Security** | Dependabot · Security policy · Lock file · Type checking | 18 |
| **Maintainability** | Recent commits · Contributing · CODEOWNERS · Linter · Formatter · Docker | 17 |
| **Discoverability** | Releases · Topics · Dev container · Makefile · Good first issues · API docs | 12 |
| **Polish** | Issue templates · PR template · .gitignore · .env.example · pre-commit · SUPPORT · Description · CHANGELOG · Docs · CoC · Stale bot · FUNDING · Homepage · Scorecard | 14 |

- **80–100** — Healthy
- **50–79** — Needs attention
- **0–49** — Critical

Each failing check includes a direct link to fix it on GitHub.

---

## Automation

- **Auto-rescan every 6 hours** via APScheduler
- **Instant rescan on git push** via GitHub webhook (`POST /api/github/webhook`)
- **Email alerts** when a repo's score drops 10+ points

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12 · FastAPI · PostgreSQL · SQLAlchemy |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Auth | GitHub OAuth2 · JWT |
| Automation | APScheduler · GitHub Webhooks |
| Deploy | Docker · Render.com |

---

## Contributing

PRs are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions.
Check the [open issues](../../issues) — `good first issue` labels are great starting points.

---

## License

[MIT](LICENSE)
