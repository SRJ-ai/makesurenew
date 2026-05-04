# makesurenew

[![CI](https://github.com/SRJ-ai/makesurenew/actions/workflows/ci.yml/badge.svg)](https://github.com/SRJ-ai/makesurenew/actions/workflows/ci.yml)
[![Deploy](https://github.com/SRJ-ai/makesurenew/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/SRJ-ai/makesurenew/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

> **Repository health monitoring dashboard for developer teams.**
> Connect your GitHub repos — get a health score from 0–100, see exactly what's broken, and fix it.

**[🚀 Live Demo](https://srj-ai.github.io/makesurenew/)** · [Report a Bug](../../issues/new?template=bug_report.md) · [Request a Feature](../../issues/new?template=feature_request.md)

---

## What it does

makesurenew scans your GitHub repositories against a set of best practices and gives each one a **health score from 0–100**. You see at a glance which repos are well-maintained and which need attention — no more manually checking every project.

| Check | Points | Why it matters |
|---|---|---|
| README.md | 30 | Onboards contributors and users |
| GitHub Actions CI | 30 | Catches regressions automatically |
| LICENSE file | 20 | Required for anyone to legally use your code |
| .gitignore | 20 | Prevents secrets and binaries from being committed |

**Score ≥ 80** → Healthy · **50–79** → Needs attention · **< 50** → Critical

---

## Features

- **One-click GitHub OAuth** — no new account, no password
- **Sync all repos** — pulls your full GitHub repository list instantly
- **Background scans** — health checks run async, no page freezing
- **Drill-down view** — per-repo breakdown of every passing and failing check
- **Actionable hints** — each failing check tells you exactly how to fix it
- **Dark mode UI** — easy on the eyes, mobile-friendly

---

## Deploy to Render (free, ~5 min)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. **Fork this repo**

2. **Create a GitHub OAuth App** at [github.com/settings/developers](https://github.com/settings/developers):
   - Homepage URL: `https://makesurenew.onrender.com`
   - Callback URL: `https://makesurenew.onrender.com/api/auth/callback`

3. **New → Blueprint** on Render → select your fork → it reads `render.yaml` automatically (web service + PostgreSQL)

4. **Set secrets** in Render dashboard:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

5. **Deploy** — first build takes ~3 min.

---

## Run locally

```sh
git clone https://github.com/srj-ai/makesurenew
cd makesurenew
cp .env.example .env
# Fill in GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
# GitHub OAuth App callback: http://localhost:8000/api/auth/callback
docker compose up
```

Open **http://localhost:5173**

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12 · FastAPI · PostgreSQL · SQLAlchemy |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Auth | GitHub OAuth2 · JWT |
| Deploy | Docker · Render.com · GitHub Pages (demo) |

---

## Project structure

```
makesurenew/
├── backend/
│   └── app/
│       ├── routers/       # auth, repos, dashboard API routes
│       ├── services/      # scanner — GitHub API health checks
│       ├── models.py      # SQLAlchemy ORM models
│       └── main.py        # FastAPI app + static file serving
├── frontend/
│   └── src/
│       ├── api/           # axios client + demo mock data
│       ├── pages/         # Login, Dashboard, RepoDetail
│       ├── components/    # RepoCard, HealthBadge
│       └── hooks/         # useAuth
├── .github/
│   └── workflows/         # CI + GitHub Pages deploy
├── docker-compose.yml     # local development
├── Dockerfile             # production single-service build
└── render.yaml            # Render.com Blueprint config
```

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

- [`good first issue`](../../issues?q=is%3Aopen+label%3A%22good+first+issue%22) — great for newcomers
- [`help wanted`](../../issues?q=is%3Aopen+label%3A%22help+wanted%22) — needs more experienced contributors

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

---

## Security

Found a vulnerability? Please report it privately — see [SECURITY.md](./SECURITY.md).

---

## License

[MIT](./LICENSE) © makesurenew contributors
