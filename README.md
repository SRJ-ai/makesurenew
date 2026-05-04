# makesurenew

> Repository health monitoring dashboard for developer teams.

Connect your GitHub repos and instantly see what needs attention — missing CI workflows, no LICENSE file, outdated configs, and more. Every repo gets a **health score from 0–100**.

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

5. **Update the callback URL** in render.yaml and in your GitHub OAuth App if your Render service has a different name than `makesurenew`:
   - `GITHUB_REDIRECT_URI` → `https://<your-service-name>.onrender.com/api/auth/callback`
   - `FRONTEND_URL` → `https://<your-service-name>.onrender.com`

6. **Trigger a deploy** — Render builds the Docker image, copies the frontend, and starts the server.

> First deploy takes ~3 min. Subsequent deploys are faster.

---

## Run locally (Docker Compose)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- A [GitHub OAuth App](https://github.com/settings/developers):
  - Callback URL: `http://localhost:8000/api/auth/callback`

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

| Check | Points |
|---|---|
| Has README | 30 |
| Has CI workflow (GitHub Actions) | 30 |
| Has LICENSE | 20 |
| Has .gitignore | 20 |
| **Total** | **100** |

- **80–100** — Healthy
- **50–79** — Needs attention
- **0–49** — Critical

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12 · FastAPI · PostgreSQL · SQLAlchemy |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Auth | GitHub OAuth2 · JWT |
| Deploy | Docker · Render.com |

---

## Contributing

See the [open issues](../../issues) — `good first issue` labels are great starting points.

---

## License

MIT
