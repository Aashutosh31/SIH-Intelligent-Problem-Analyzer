# SIH Intelligent Problem Analyzer (SIH Intelligence)

An intelligent analysis platform that helps engineering teams prepare for the
**Smart India Hackathon (SIH)**. Paste any problem statement and it produces
an execution plan: engineering interpretation, difficulty and risk scorecard,
recommended tech stack, required skills, team-fit scoring, task allocation,
and AI/vibe-coding opportunities — grounded by the **Gemini API**.

## Major Features

- **Problem Analyzer** — Deeply analyses an SIH problem statement via Gemini
  and normalizes it into a structured execution plan (architecture, tech
  stack, required skills, risks, verdict).
- **Scorecard** — Difficulty, competition, innovation, team fit,
  AI/vibe-coding potential, and implementation risk (0–100).
- **Team & Stack** — Recommended tech stack and required skills.
- **Scored Analysis** — Difficulty, competition, innovation, team fit,
  AI/vibe-coding potential, and implementation risk.
- **Team Profile** — Anonymous team profile with members, skills, and
  preferences.
- **Team Fit Intelligence** (deterministic, application-owned) — how well the
  team covers required skills.
- **Team Resilience** — whether critical capabilities are backed by multiple
  members.
- **Task Allocation** — deterministic assignment of required capabilities to
  the strongest available team members, including bottlenecks and
  single-owner risks.
- **Skill Gap Intelligence** — recommended learning paths for capabilities the
  team lacks.
- **Verdict & Risks** — GO / CONSIDER / AVOID recommendation with red flags.

## Architecture

```
frontend/  React + Vite SPA (Vercel)
   └─ calls backend REST API over HTTPS (CORS-restricted)
backend/   Express API (Render)
   ├─ /api/analyze            → posts problem to Gemini, returns plan
   ├─ /api/team-profile       → anonymous team profile (bearer-token owned)
   └─ /api/health             → health check incl. DB connectivity
   └─ MongoDB Atlas           → stores team profiles
```

- The frontend is a **static Vite build** served by Vercel.
- The backend is an **Express (ESM)** server on Render.
- **MongoDB Atlas** stores team profiles.
- **Gemini API** performs the problem analysis.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, lucide-react |
| Backend | Node.js (ESM), Express 5, Mongoose 9, Helmet, CORS, express-rate-limit |
| AI | Google Gemini (`@google/genai`) |
| Database | MongoDB Atlas (Mongoose ODM) |

## Local Development Setup

Requirements: **Node.js ≥ 20.19** (Node 22 recommended).

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env with your MONGO_URI and GEMINI_API_KEY
npm install
npm run dev        # NODE_ENV=development, nodemon on port 5000
```

### 2. Frontend

```bash
cd frontend
npm install
# create frontend/.env
echo 'VITE_API_URL=http://localhost:5000' > .env
npm run dev        # Vite dev server
```

Open the Vite URL (default `http://localhost:5173`).

## Environment Variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `PORT` | no (default 5000) | HTTP port for the server |
| `NODE_ENV` | no (default development) | `development` or `production` |
| `MONGO_URI` | yes | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | yes | Google AI Studio API key |
| `GEMINI_MODEL` | no (default `gemini-3.6-flash`) | Gemini model ID |
| `FRONTEND_URL` | yes (production) | Exact frontend origin for CORS (no trailing slash) |
| `GEMINI_REQUEST_TIMEOUT_MS` | no (default 60000) | Timeout per Gemini attempt |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | yes (production) | Backend base URL (no trailing slash). Missing → loud config error. |

## MongoDB Atlas Setup

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user (dedicated, least-privilege).
3. Add your deployment IP / network entry to the cluster's network access list
   (do **not** open to `0.0.0.0/0` in production).
4. Copy the connection string into `MONGO_URI`. The database
   (`sih-analyzer`) is created automatically on first connection.

## Gemini API Setup

1. Create a project and an API key at
   [Google AI Studio](https://aistudio.google.com/).
2. Set `GEMINI_API_KEY` in your backend environment.
3. Optionally set `GEMINI_MODEL` (default `gemini-3.6-flash`).

## Production Deployment

### Frontend → Vercel

1. Import the repo and set the **Root Directory** to `frontend`.
2. Add the build-time env var:
   - `VITE_API_URL` = `https://<your-backend>.onrender.com`
3. Build command: `npm run build` · Output: `dist`.
4. Set the Node version to 22 (see Vercel settings). No `vercel.json` is
   required; the Vite build output is served as a static SPA.

Set **only** `VITE_API_URL` here. Never put `GEMINI_API_KEY` or `MONGO_URI`
in Vercel — `VITE_*` variables are inlined into the client bundle.

### Backend → Render

1. Create a **Web Service**, root directory `backend`.
2. Build command: `npm ci` · Start command: `npm start`.
3. Environment variables:

| Variable | Value |
|---|---|
| `MONGO_URI` | MongoDB Atlas SRV string |
| `GEMINI_API_KEY` | Google AI Studio key |
| `GEMINI_MODEL` | `gemini-3.6-flash` |
| `FRONTEND_URL` | `https://<your-app>.vercel.app` (exact origin) |
| `NODE_ENV` | `production` |
| `PORT` | auto-assigned by Render (server honors `process.env.PORT`) |

4. Set the Node version to 22 in Render settings.
5. `trust proxy` is enabled automatically in production so rate limiting
   respects each client's real IP behind Render's proxy.

## Security Model: Anonymous Teams

There is **no login system**. Anyone can use the analyzer.

- Each browser generates an anonymous `teamId` (stored in `localStorage`).
- When a team profile is first saved, the backend issues a **bearer access
  token** (256-bit random hex).
- The **raw token is never stored**. Only its **SHA-256 hash** is persisted
  (`accessTokenHash`), and it is **never returned in any API response**.
- Team-profile reads/writes require the matching token, so only that team can
  view or update its own profile. Token comparisons use constant-time
  (`timingSafeEqual`) checks to resist timing attacks.
- The access token is held client-side in `localStorage` (per `teamId`).

### Token behavior & limitations

- Losing the token (clearing `localStorage`, switching devices) means the
  team profile can no longer be read/updated. This is a deliberate trade-off
  for keeping ownership anonymous — there is no password reset.
- Tokens are not scoped/expiring by design. Treat the stored token like a
  credential.
- Anonymous analysis **without** a team profile works without a token.
- Because ownership is anonymous and token-based, profiles from before team
  access control existed require migration and can no longer be edited.

## Build & Lint

### Backend

```bash
cd backend
npm run lint       # ESLint
npm run check      # node --check on entrypoints
npm audit
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
npm audit
```

## Project Structure

```
.
├── LICENSE                 # MIT
├── README.md
├── backend/
│   ├── .env.example
│   └── src/
│       ├── server.js           # bootstrap
│       ├── config.js           # env validation (fail-fast in prod)
│       ├── app.js              # express app, security, routing
│       ├── controllers/        # analyze + team profile
│       ├── middleware/         # teamAuth, errorHandler
│       ├── models/             # TeamProfile (Mongoose)
│       ├── prompts/            # Gemini system prompt + schema
│       ├── routes/
│       └── services/           # gemini, analysis, team-fit, etc.
└── frontend/
    ├── .env.example
    └── src/
        ├── config.js           # VITE_API_URL resolution
        ├── services/           # analysis + team profile API
        ├── components/         # UI components / tabs
        └── utils/              # team identity
```

## Known MVP Limitations

- **No user accounts / login.** Team ownership is anonymous via bearer
  tokens (see Security Model).
- **No PDF upload yet** — the UI notes this ("upload PDF (coming soon)").
- **Rate limited** — analysis is public and capped (10 req / 15 min / IP) to
  bound Gemini cost; the general API is capped at 100 req / 15 min / IP.
- **Single-origin CORS** — only the configured `FRONTEND_URL` origin is
  allowed in production.
- **No dataset/web-research grounding** — Gemini is instructed not to invent
  external statistics; competition level is an analytical estimate.
- **Gemini cost exposure** — analysis is a paid API call; heavy repeated use
  incurs cost. Rate limits help but do not guarantee zero cost.
- Profiles/analysis data are stored in MongoDB Atlas; ensure your Atlas
  cluster is network-restricted to the backend.
