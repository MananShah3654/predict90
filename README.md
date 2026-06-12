<div align="center">

# ⚽ Predict90

### The social **FIFA World Cup 26™** prediction game

Predict every match, build your tournament bracket, climb the leaderboard,
battle friends in private leagues, share viral cards — and win a **PS5**.

`React` · `FastAPI` · `MongoDB` · `Tailwind` · `JWT + Google Sign-In`

</div>

---

## ✨ Features

- **🎯 Match Predictions** — call the exact score on all **72 real group-stage fixtures**. Exact score = 10 pts, correct outcome = 3 pts. Auto-scored the moment results land.
- **🏆 Tournament Bracket** — predict group leaders, quarter-finalists, semi-finalists, finalists, the champion, the **Golden Boot** and the **Golden Glove** (with FIFA-style player cards).
- **🌍 Real WC2026 data** — the official 48 teams across 12 groups (drawn Dec 2025), with flags.
- **📊 Leaderboards** — global, by country, and per private league.
- **👥 Private Leagues** — create a league, share an invite code, and compete all tournament long.
- **📱 Share Cards** — gorgeous, glowing cards (Post + Story formats) for predictions, results, group splits, league winners, leaderboards and personal stats — shareable to WhatsApp, X, Facebook, Telegram & Instagram.
- **🔐 Auth** — email/password **and** Google Sign-In (with profile photo).
- **🎮 PS5 Giveaway** — the #1 predictor wins a PlayStation 5.

## 🧱 Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, CRA + craco, Tailwind, shadcn/ui, framer-motion, lucide |
| Backend  | FastAPI, Motor (async MongoDB), PyJWT, bcrypt, google-auth |
| Database | MongoDB Atlas |
| Hosting  | Vercel (static frontend + Python serverless API) |

## 📁 Structure

```
predict90/
├── api/
│   ├── index.py        # FastAPI app — auth, predictions, bracket, leagues, admin
│   ├── wc2026_data.py  # real WC2026 groups + player pools
│   └── requirements.txt
├── frontend/           # React app (pages, components, share cards)
├── vercel.json         # static frontend build + /api serverless routing
└── requirements.txt    # Python deps (local dev)
```

## 🚀 Run locally

```bash
# 1) frontend — build once so the API can serve it
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# 2) backend API (also serves the built frontend at http://localhost:8000)
pip install -r requirements.txt
python -m uvicorn api.index:app --host 0.0.0.0 --port 8000
```

Create `api/.env`:

```env
MONGO_URL=<your MongoDB Atlas connection string>
DB_NAME=interview_copilot
JWT_SECRET=<any long random string>
# optional:
GOOGLE_CLIENT_ID=
ADMIN_EMAIL=admin@predict90.com
ADMIN_PASSWORD=Admin@123
```

The database self-seeds on first run (teams, fixtures, players, demo users).

## ▲ Deploy to Vercel

This repo is configured for an **all-on-Vercel** deploy (`vercel.json`): the React
app is served statically and `api/index.py` runs FastAPI as a serverless function,
with every `/api/*` request routed to it.

1. Import the repo on [vercel.com](https://vercel.com) → **Add New → Project**.
2. **Settings → Environment Variables** — add `MONGO_URL`, `DB_NAME`, `JWT_SECRET`
   (and `GOOGLE_CLIENT_ID` + `REACT_APP_GOOGLE_CLIENT_ID` to enable Google login).
3. **MongoDB Atlas → Network Access** → allow `0.0.0.0/0` (Vercel IPs are dynamic).
4. **Deploy.** Same-origin means the frontend calls `/api` automatically.

> To enable Google Sign-In, add your live Vercel URL to **Authorized JavaScript
> origins** in the Google Cloud Console, then set the two client-ID env vars.

## 🔑 Demo accounts

| Role  | Email | Password |
|-------|-------|----------|
| User  | `demo@predict90.com`  | `Demo@123`  |
| Admin | `admin@predict90.com` | `Admin@123` |

---

<div align="center">
Built with ⚽ for the FIFA World Cup 26™
</div>
