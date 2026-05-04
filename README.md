# makesurenew

> Repository health monitoring dashboard for developer teams.

Connect your GitHub repos and instantly see what needs attention — missing CI workflows, no LICENSE file, outdated configs, and more. Every repo gets a **health score from 0–100**.

---

## Features

- **GitHub OAuth** — sign in with one click, no new account needed
- **Health scores** — 0–100 score per repo based on open-source best practices
- **Instant scans** — checks README, LICENSE, CI workflows, .gitignore, and more
- **Dashboard** — see all repos at a glance with health badges
- **Detailed view** — drill into each repo to see exactly what's failing and why

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12 + FastAPI + PostgreSQL + SQLAlchemy |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Auth | GitHub OAuth2 + JWT |
| Infra | Docker + Docker Compose |

---

## Getting started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- A [GitHub OAuth App](https://github.com/settings/developers):
  - **Homepage URL**: `http://localhost:5173`
  - **Callback URL**: `http://localhost:8000/auth/callback`

### Setup

```sh
git clone https://github.com/srj-ai/makesurenew
cd makesurenew

# Copy and fill in your GitHub OAuth credentials
cp .env.example .env

docker compose up
```

Open **http://localhost:5173** — sign in with GitHub and sync your repos.

---

## How scoring works

Each repo is scanned against a set of best-practice checks:

| Check | Points |
|---|---|
| Has README | 30 |
| Has CI workflow (GitHub Actions) | 30 |
| Has LICENSE | 20 |
| Has .gitignore | 20 |
| **Total** | **100** |

Scores ≥ 80 are **healthy**, 50–79 need **attention**, below 50 are **critical**.

---

## Contributing

We love contributions! See the [open issues](../../issues) to find something to work on.

- `good first issue` — great for newcomers
- `help wanted` — needs more experienced contributors

Please open a PR and we'll review it promptly.

---

## License

MIT
