# Predict90 — FIFA World Cup 26 Predictor

A social World Cup prediction game: predict every group-stage match, build a full
tournament bracket (group leaders → champion + Golden Boot/Glove), climb the
leaderboard, run private leagues, share eye-catching cards, and win a PS5.

- **Frontend:** React (CRA + craco), Tailwind, shadcn/ui
- **Backend:** FastAPI + MongoDB (Motor), JWT auth + Google sign-in
- **Data:** real WC2026 groups, 72 fixtures, player pools (stored in MongoDB Atlas)

## Run locally

```bash
# backend (serves the built frontend too, on http://localhost:8000)
cd backend
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8000

# frontend (build it once so the backend can serve it)
cd frontend
npm install --legacy-peer-deps
npm run build
```

`backend/.env` needs: `MONGO_URL`, `DB_NAME`, `JWT_SECRET` (and optionally
`GOOGLE_CLIENT_ID`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS`).

## Deploy to Vercel (frontend + API on one project)

This repo is configured for an all-on-Vercel deploy via `vercel.json`:

- the React app is built and served as static files
- `api/index.py` runs the FastAPI app as a Python serverless function
- every `/api/*` request is routed to that function

**Steps**

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
   Leave the build settings as detected (`vercel.json` handles them).
3. Add **Environment Variables** (Settings → Environment Variables):
   - `MONGO_URL` — your MongoDB Atlas connection string
   - `DB_NAME` — e.g. `interview_copilot`
   - `JWT_SECRET` — any long random string
   - `GOOGLE_CLIENT_ID` — (optional) to enable Google sign-in
4. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0` (Vercel's IPs are dynamic).
5. **Deploy.** Same-origin means the frontend talks to `/api` automatically — no extra config.

Demo accounts are seeded in the database: `demo@predict90.com` / `Demo@123`
and admin `admin@predict90.com` / `Admin@123`.
