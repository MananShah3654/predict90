import sys
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
# make sibling modules (wc2026_data) importable whether run as `api.index`
# locally or bundled as a top-level function on Vercel.
sys.path.insert(0, str(ROOT_DIR))
load_dotenv(ROOT_DIR / '.env')

import os
import re
import json
import uuid
import random
import string
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from wc2026_data import WC_GROUPS, BOOT_PLAYERS, GLOVE_PLAYERS, VENUES, SEED_VERSION

# ---------------- DB ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Predict90 API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("predict90")

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]


def now_utc():
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


def clean(doc):
    if doc is None:
        return None
    doc.pop("_id", None)
    return doc


def public_user(u: dict) -> dict:
    u = clean(dict(u))
    u.pop("password_hash", None)
    return u


# ---------------- Auth helpers ----------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": now_utc() + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return public_user(user)


async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------------- Pydantic models ----------------

class RegisterInput(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    country: Optional[str] = None
    favorite_team: Optional[str] = None


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthInput(BaseModel):
    credential: str  # Google ID token (JWT) from Google Identity Services


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    country: Optional[str] = None
    favorite_team: Optional[str] = None


class PredictionInput(BaseModel):
    match_id: str
    predicted_winner: str = Field(pattern="^(home|away|draw)$")
    home_score: int = Field(ge=0, le=20)
    away_score: int = Field(ge=0, le=20)


class LeagueCreate(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    description: Optional[str] = ""


class LeagueJoin(BaseModel):
    invite_code: str


class PurchaseInput(BaseModel):
    plan_id: str


class MatchCreate(BaseModel):
    home_team_id: str
    away_team_id: str
    kickoff: str
    venue: str
    stage: str


class ResultInput(BaseModel):
    home_score: int = Field(ge=0, le=20)
    away_score: int = Field(ge=0, le=20)


class TournamentPredictionInput(BaseModel):
    # group code -> team_id chosen to top the group
    group_leaders: dict = Field(default_factory=dict)
    quarter_finalists: List[str] = Field(default_factory=list)  # up to 8 team_ids
    semi_finalists: List[str] = Field(default_factory=list)     # up to 4 team_ids
    finalists: List[str] = Field(default_factory=list)          # up to 2 team_ids
    winner: Optional[str] = None                                # team_id
    golden_boot: Optional[str] = None                           # player_id
    golden_glove: Optional[str] = None                          # player_id


# ---------------- Defaults ----------------

DEFAULT_POINTS = {"winner": 3, "draw": 3, "exact_score": 10}

PREMIUM_PLANS = [
    {"id": "monthly", "name": "Premium Pass", "price": 99, "currency": "INR", "period": "month",
     "features": ["AI Match Predictions", "Win Probability Analysis", "Premium Badge", "No Ads", "Premium Leagues"]},
    {"id": "season", "name": "World Cup Season Pass", "price": 199, "currency": "INR", "period": "tournament",
     "features": ["Everything in Premium Pass", "Full Tournament Access", "Historical Insights", "Early Features", "Priority Support"]},
]

BADGES = [
    {"code": "perfect-score", "name": "Perfect Score", "description": "Predict an exact scoreline", "icon": "target", "tier": "gold"},
    {"code": "golden-predictor", "name": "Golden Predictor", "description": "3 exact score predictions", "icon": "crown", "tier": "gold"},
    {"code": "prediction-king", "name": "Prediction King", "description": "5 exact score predictions", "icon": "trophy", "tier": "legendary"},
    {"code": "world-cup-expert", "name": "World Cup Expert", "description": "10 correct predictions", "icon": "star", "tier": "gold"},
    {"code": "top-10", "name": "Top 10", "description": "Reach the global top 10", "icon": "medal", "tier": "legendary"},
    {"code": "top-100", "name": "Top 100", "description": "Reach the global top 100", "icon": "award", "tier": "silver"},
    {"code": "premium-member", "name": "Premium Member", "description": "Purchase a Premium Pass", "icon": "gem", "tier": "gold"},
    {"code": "predictions-100", "name": "100 Predictions", "description": "Make 100 predictions", "icon": "flame", "tier": "silver"},
    {"code": "predictions-500", "name": "500 Predictions", "description": "Make 500 predictions", "icon": "zap", "tier": "legendary"},
    {"code": "referral-master", "name": "Referral Master", "description": "Refer 10 friends", "icon": "users", "tier": "gold"},
]

TEAMS = [
    ("ar", "Argentina", "A"), ("br", "Brazil", "A"), ("fr", "France", "B"), ("gb-eng", "England", "B"),
    ("es", "Spain", "C"), ("de", "Germany", "C"), ("pt", "Portugal", "D"), ("nl", "Netherlands", "D"),
    ("it", "Italy", "E"), ("be", "Belgium", "E"), ("hr", "Croatia", "F"), ("uy", "Uruguay", "F"),
    ("ma", "Morocco", "G"), ("jp", "Japan", "G"), ("us", "USA", "H"), ("mx", "Mexico", "H"),
    ("sn", "Senegal", "I"), ("gh", "Ghana", "I"), ("ch", "Switzerland", "J"), ("dk", "Denmark", "J"),
    ("pl", "Poland", "K"), ("au", "Australia", "K"), ("ec", "Ecuador", "L"), ("rs", "Serbia", "L"),
]


def gen_username(name: str) -> str:
    base = re.sub(r"[^a-z0-9]", "", name.lower())[:12] or "fan"
    return f"{base}{random.randint(100, 999)}"


def gen_invite_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def new_user_doc(name, email, password, country=None, favorite_team=None, role="user", username=None, picture="", auth_provider="email"):
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "username": username or gen_username(name),
        "email": email.lower(),
        "password_hash": hash_password(password),
        "picture": picture or "",
        "auth_provider": auth_provider,
        "country": country or "",
        "favorite_team": favorite_team or "",
        "role": role,
        "points": 0,
        "xp": 0,
        "level": 1,
        "accuracy": 0.0,
        "current_streak": 0,
        "best_streak": 0,
        "total_predictions": 0,
        "correct_predictions": 0,
        "exact_predictions": 0,
        "is_premium": False,
        "premium_plan": None,
        "referral_code": "".join(random.choices(string.ascii_uppercase + string.digits, k=8)),
        "created_at": iso(now_utc()),
    }


# ---------------- Scoring automation ----------------

async def get_points_config():
    cfg = await db.settings.find_one({"key": "points"})
    return cfg or {**DEFAULT_POINTS, "key": "points"}


async def award_badge(user_id: str, code: str):
    existing = await db.user_badges.find_one({"user_id": user_id, "badge_code": code})
    if not existing:
        await db.user_badges.insert_one({
            "id": str(uuid.uuid4()), "user_id": user_id, "badge_code": code, "earned_at": iso(now_utc())
        })


async def recompute_user_stats(user_id: str):
    preds = await db.predictions.find({"user_id": user_id, "status": {"$ne": "pending"}}).to_list(5000)
    total_scored = len(preds)
    correct = sum(1 for p in preds if p["status"] in ("correct", "exact"))
    exact = sum(1 for p in preds if p["status"] == "exact")
    accuracy = round((correct / total_scored) * 100, 1) if total_scored else 0.0
    preds_sorted = sorted(preds, key=lambda p: p.get("match_kickoff", ""), reverse=True)
    streak = 0
    for p in preds_sorted:
        if p["status"] in ("correct", "exact"):
            streak += 1
        else:
            break
    total_preds = await db.predictions.count_documents({"user_id": user_id})
    points = sum(p.get("points_earned", 0) for p in await db.predictions.find({"user_id": user_id}).to_list(5000))
    user = await db.users.find_one({"id": user_id})
    best_streak = max(streak, user.get("best_streak", 0)) if user else streak
    xp = points * 10
    level = 1 + xp // 100
    await db.users.update_one({"id": user_id}, {"$set": {
        "accuracy": accuracy, "current_streak": streak, "best_streak": best_streak,
        "total_predictions": total_preds, "correct_predictions": correct,
        "exact_predictions": exact, "points": points, "xp": xp, "level": level,
    }})
    # badges
    if exact >= 1:
        await award_badge(user_id, "perfect-score")
    if exact >= 3:
        await award_badge(user_id, "golden-predictor")
    if exact >= 5:
        await award_badge(user_id, "prediction-king")
    if correct >= 10:
        await award_badge(user_id, "world-cup-expert")
    if total_preds >= 100:
        await award_badge(user_id, "predictions-100")
    if total_preds >= 500:
        await award_badge(user_id, "predictions-500")


async def award_rank_badges():
    top = await db.users.find({"role": {"$ne": "admin"}}).sort("points", -1).limit(100).to_list(100)
    for i, u in enumerate(top):
        if u.get("points", 0) <= 0:
            continue
        if i < 10:
            await award_badge(u["id"], "top-10")
        await award_badge(u["id"], "top-100")


async def score_match(match: dict):
    """Full automation: score predictions -> update points -> update stats -> award badges."""
    home, away = match["home_score"], match["away_score"]
    outcome = "home" if home > away else ("away" if away > home else "draw")
    cfg = await get_points_config()
    preds = await db.predictions.find({"match_id": match["id"], "status": "pending"}).to_list(10000)
    affected = set()
    for p in preds:
        if p["home_score"] == home and p["away_score"] == away:
            status, pts = "exact", cfg["exact_score"]
        elif p["predicted_winner"] == outcome:
            status, pts = "correct", cfg["draw"] if outcome == "draw" else cfg["winner"]
        else:
            status, pts = "wrong", 0
        await db.predictions.update_one({"id": p["id"]}, {"$set": {"status": status, "points_earned": pts}})
        affected.add(p["user_id"])
    for uid in affected:
        await recompute_user_stats(uid)
    await award_rank_badges()
    return len(preds)


# ---------------- Auth routes ----------------

@api_router.post("/auth/register")
async def register(data: RegisterInput, response: Response):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    user = new_user_doc(data.name, email, data.password, data.country, data.favorite_team)
    await db.users.insert_one(dict(user))
    token = create_access_token(user["id"], email)
    set_auth_cookie(response, token)
    out = public_user(user)
    out["token"] = token
    return out


@api_router.post("/auth/login")
async def login(data: LoginInput, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], email)
    set_auth_cookie(response, token)
    out = public_user(user)
    out["token"] = token
    return out


@api_router.post("/auth/google")
async def google_auth(data: GoogleAuthInput, response: Response):
    client_id = os.environ.get("GOOGLE_CLIENT_ID") or "301503395573-h3pknvrt7egpa6orh14gsq7dm73o8j2g.apps.googleusercontent.com"
    if not client_id:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured on this server")
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
        info = google_id_token.verify_oauth2_token(data.credential, google_requests.Request(), client_id)
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Could not verify Google sign-in")

    email = (info.get("email") or "").lower()
    if not email or not info.get("email_verified", True):
        raise HTTPException(status_code=401, detail="Google account email not available")

    user = await db.users.find_one({"email": email})
    if not user:
        user = new_user_doc(
            name=info.get("name") or email.split("@")[0],
            email=email, password=str(uuid.uuid4()),  # random; google users sign in via google
            picture=info.get("picture", ""), auth_provider="google",
        )
        await db.users.insert_one(dict(user))
    else:
        # keep the latest Google photo/name on file
        updates = {"auth_provider": user.get("auth_provider", "google")}
        if info.get("picture") and info["picture"] != user.get("picture"):
            updates["picture"] = info["picture"]
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
        user = await db.users.find_one({"id": user["id"]})

    token = create_access_token(user["id"], email)
    set_auth_cookie(response, token)
    out = public_user(user)
    out["token"] = token
    return out


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.put("/users/me")
async def update_profile(data: ProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if "username" in updates:
        existing = await db.users.find_one({"username": updates["username"], "id": {"$ne": user["id"]}})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    return public_user(await db.users.find_one({"id": user["id"]}))


# ---------------- Teams & Matches ----------------

@api_router.get("/teams")
async def get_teams():
    teams = await db.teams.find().sort("name", 1).to_list(100)
    return [clean(t) for t in teams]


async def enrich_match(m: dict) -> dict:
    m = clean(dict(m))
    home = await db.teams.find_one({"id": m["home_team_id"]})
    away = await db.teams.find_one({"id": m["away_team_id"]})
    m["home_team"] = clean(home)
    m["away_team"] = clean(away)
    return m


@api_router.get("/matches")
async def get_matches(status: Optional[str] = None):
    q = {"status": status} if status else {}
    matches = await db.matches.find(q).sort("kickoff", 1).to_list(200)
    out = []
    for m in matches:
        out.append(await enrich_match(m))
    # upcoming first by kickoff asc, finished last by kickoff desc
    return out


@api_router.get("/matches/{match_id}")
async def get_match(match_id: str):
    m = await db.matches.find_one({"id": match_id})
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")
    return await enrich_match(m)


@api_router.get("/matches/{match_id}/community")
async def match_community(match_id: str):
    preds = await db.predictions.find({"match_id": match_id}).to_list(10000)
    counts = {"home": 0, "draw": 0, "away": 0}
    for p in preds:
        counts[p["predicted_winner"]] = counts.get(p["predicted_winner"], 0) + 1
    total = sum(counts.values())
    return {"total": total, "counts": counts}


# ---------------- Predictions ----------------

@api_router.post("/predictions")
async def create_prediction(data: PredictionInput, user: dict = Depends(get_current_user)):
    m = await db.matches.find_one({"id": data.match_id})
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")
    if m["status"] != "upcoming":
        raise HTTPException(status_code=400, detail="This match is locked - predictions closed")
    kickoff = datetime.fromisoformat(m["kickoff"])
    if now_utc() >= kickoff:
        raise HTTPException(status_code=400, detail="Prediction deadline has passed")
    # consistency: winner pick must match score
    h, a = data.home_score, data.away_score
    implied = "home" if h > a else ("away" if a > h else "draw")
    if implied != data.predicted_winner:
        raise HTTPException(status_code=400, detail="Your scoreline doesn't match your winner pick")
    existing = await db.predictions.find_one({"user_id": user["id"], "match_id": data.match_id})
    doc = {
        "user_id": user["id"], "match_id": data.match_id,
        "predicted_winner": data.predicted_winner,
        "home_score": h, "away_score": a,
        "match_kickoff": m["kickoff"], "status": "pending", "points_earned": 0,
        "updated_at": iso(now_utc()),
    }
    if existing:
        await db.predictions.update_one({"id": existing["id"]}, {"$set": doc})
        doc["id"] = existing["id"]
    else:
        doc["id"] = str(uuid.uuid4())
        doc["created_at"] = iso(now_utc())
        await db.predictions.insert_one(dict(doc))
        await db.users.update_one({"id": user["id"]}, {"$inc": {"total_predictions": 1}})
    return clean(doc)


@api_router.get("/predictions/me")
async def my_predictions(user: dict = Depends(get_current_user)):
    preds = await db.predictions.find({"user_id": user["id"]}).sort("match_kickoff", -1).to_list(500)
    out = []
    for p in preds:
        p = clean(p)
        m = await db.matches.find_one({"id": p["match_id"]})
        if m:
            p["match"] = await enrich_match(m)
        out.append(p)
    return out


# ---------------- World Cup 2026 (bracket predictions) ----------------

@api_router.get("/wc/groups")
async def wc_groups():
    """Real WC2026 groups A–L with their four teams each."""
    teams = await db.teams.find().to_list(100)
    by_group = {}
    for t in teams:
        by_group.setdefault(t.get("group", "?"), []).append(clean(t))
    out = []
    for g in sorted(by_group.keys()):
        rows = sorted(by_group[g], key=lambda x: x["name"])
        out.append({"group": g, "teams": rows})
    return out


@api_router.get("/wc/players")
async def wc_players(role: Optional[str] = None):
    """Golden Boot (forward) and Golden Glove (goalkeeper) candidate cards."""
    q = {"role": role} if role in ("forward", "goalkeeper") else {}
    players = await db.players.find(q).sort("rating", -1).to_list(200)
    return [clean(p) for p in players]


@api_router.get("/wc/prediction")
async def get_wc_prediction(user: dict = Depends(get_current_user)):
    pred = await db.tournament_predictions.find_one({"user_id": user["id"]})
    if not pred:
        return {
            "group_leaders": {}, "quarter_finalists": [], "semi_finalists": [],
            "finalists": [], "winner": None, "golden_boot": None, "golden_glove": None,
            "submitted": False,
        }
    return clean(pred)


@api_router.post("/wc/prediction")
async def save_wc_prediction(data: TournamentPredictionInput, user: dict = Depends(get_current_user)):
    doc = data.model_dump()
    doc.update({"user_id": user["id"], "submitted": True, "updated_at": iso(now_utc())})
    existing = await db.tournament_predictions.find_one({"user_id": user["id"]})
    if existing:
        await db.tournament_predictions.update_one({"user_id": user["id"]}, {"$set": doc})
        doc["id"] = existing.get("id")
    else:
        doc["id"] = str(uuid.uuid4())
        doc["created_at"] = iso(now_utc())
        await db.tournament_predictions.insert_one(dict(doc))
    return clean(doc)


# ---------------- Leaderboards ----------------

async def leaderboard_rows(users: List[dict]) -> List[dict]:
    rows = []
    for i, u in enumerate(users):
        badge_count = await db.user_badges.count_documents({"user_id": u["id"]})
        rows.append({
            "rank": i + 1, "user_id": u["id"], "name": u["name"], "username": u["username"],
            "country": u.get("country", ""), "points": u.get("points", 0),
            "accuracy": u.get("accuracy", 0), "is_premium": u.get("is_premium", False),
            "badge_count": badge_count, "level": u.get("level", 1),
            "current_streak": u.get("current_streak", 0),
        })
    return rows


@api_router.get("/leaderboard")
async def leaderboard(scope: str = "global", country: Optional[str] = None, league_id: Optional[str] = None):
    q = {"role": {"$ne": "admin"}}
    if scope == "country" and country:
        q["country"] = country
    if scope == "league" and league_id:
        members = await db.league_members.find({"league_id": league_id}).to_list(1000)
        q["id"] = {"$in": [m["user_id"] for m in members]}
    users = await db.users.find(q).sort("points", -1).limit(100).to_list(100)
    return await leaderboard_rows(users)


@api_router.get("/leaderboard/me")
async def my_rank(user: dict = Depends(get_current_user)):
    higher = await db.users.count_documents({"role": {"$ne": "admin"}, "points": {"$gt": user.get("points", 0)}})
    total = await db.users.count_documents({"role": {"$ne": "admin"}})
    return {"rank": higher + 1, "total": total}


# ---------------- Leagues ----------------

@api_router.post("/leagues")
async def create_league(data: LeagueCreate, user: dict = Depends(get_current_user)):
    league = {
        "id": str(uuid.uuid4()), "name": data.name, "description": data.description or "",
        "owner_id": user["id"], "invite_code": gen_invite_code(),
        "created_at": iso(now_utc()),
    }
    await db.leagues.insert_one(dict(league))
    await db.league_members.insert_one({
        "id": str(uuid.uuid4()), "league_id": league["id"], "user_id": user["id"],
        "role": "owner", "joined_at": iso(now_utc()),
    })
    return clean(league)


@api_router.post("/leagues/join")
async def join_league(data: LeagueJoin, user: dict = Depends(get_current_user)):
    league = await db.leagues.find_one({"invite_code": data.invite_code.upper().strip()})
    if not league:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    existing = await db.league_members.find_one({"league_id": league["id"], "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="You're already in this league")
    await db.league_members.insert_one({
        "id": str(uuid.uuid4()), "league_id": league["id"], "user_id": user["id"],
        "role": "member", "joined_at": iso(now_utc()),
    })
    return clean(league)


@api_router.get("/leagues/me")
async def my_leagues(user: dict = Depends(get_current_user)):
    memberships = await db.league_members.find({"user_id": user["id"]}).to_list(100)
    out = []
    for mem in memberships:
        league = await db.leagues.find_one({"id": mem["league_id"]})
        if league:
            league = clean(league)
            league["member_count"] = await db.league_members.count_documents({"league_id": league["id"]})
            out.append(league)
    return out


@api_router.get("/leagues/{league_id}")
async def league_detail(league_id: str, user: dict = Depends(get_current_user)):
    league = await db.leagues.find_one({"id": league_id})
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    league = clean(league)
    members = await db.league_members.find({"league_id": league_id}).to_list(1000)
    member_ids = [m["user_id"] for m in members]
    users = await db.users.find({"id": {"$in": member_ids}}).sort("points", -1).to_list(1000)
    league["members"] = await leaderboard_rows(users)
    league["member_count"] = len(members)
    owner = await db.users.find_one({"id": league["owner_id"]})
    league["owner_name"] = owner["name"] if owner else "Unknown"
    return league


# ---------------- Badges ----------------

@api_router.get("/badges")
async def get_badges():
    badges = await db.badges.find().to_list(100)
    return [clean(b) for b in badges]


@api_router.get("/badges/me")
async def my_badges(user: dict = Depends(get_current_user)):
    earned = await db.user_badges.find({"user_id": user["id"]}).to_list(100)
    return [clean(b) for b in earned]


# ---------------- Premium (MOCK PAYMENTS) ----------------

@api_router.get("/premium/plans")
async def premium_plans():
    return PREMIUM_PLANS


@api_router.post("/premium/purchase")
async def purchase_premium(data: PurchaseInput, user: dict = Depends(get_current_user)):
    plan = next((p for p in PREMIUM_PLANS if p["id"] == data.plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    # MOCK payment - instantly activates premium
    await db.payments.insert_one({
        "id": str(uuid.uuid4()), "user_id": user["id"], "plan_id": plan["id"],
        "amount": plan["price"], "currency": plan["currency"], "status": "completed",
        "provider": "mock", "created_at": iso(now_utc()),
    })
    await db.users.update_one({"id": user["id"]}, {"$set": {"is_premium": True, "premium_plan": plan["id"]}})
    await award_badge(user["id"], "premium-member")
    return public_user(await db.users.find_one({"id": user["id"]}))


# ---------------- Dashboard ----------------

@api_router.get("/dashboard")
async def dashboard(user: dict = Depends(get_current_user)):
    higher = await db.users.count_documents({"role": {"$ne": "admin"}, "points": {"$gt": user.get("points", 0)}})
    total_users = await db.users.count_documents({"role": {"$ne": "admin"}})
    upcoming = await db.matches.find({"status": "upcoming"}).sort("kickoff", 1).limit(5).to_list(5)
    upcoming_enriched = [await enrich_match(m) for m in upcoming]
    my_preds = await db.predictions.find({"user_id": user["id"]}).sort("match_kickoff", -1).limit(5).to_list(5)
    preds_out = []
    for p in my_preds:
        p = clean(p)
        m = await db.matches.find_one({"id": p["match_id"]})
        if m:
            p["match"] = await enrich_match(m)
        preds_out.append(p)
    memberships = await db.league_members.count_documents({"user_id": user["id"]})
    badges = await db.user_badges.count_documents({"user_id": user["id"]})
    return {
        "user": user, "rank": higher + 1, "total_users": total_users,
        "upcoming_matches": upcoming_enriched, "recent_predictions": preds_out,
        "league_count": memberships, "badge_count": badges,
    }


# ---------------- Share Cards ----------------

@api_router.get("/share/prediction/{prediction_id}")
async def share_prediction(prediction_id: str):
    p = await db.predictions.find_one({"id": prediction_id})
    if not p:
        raise HTTPException(status_code=404, detail="Prediction not found")
    p = clean(p)
    m = await db.matches.find_one({"id": p["match_id"]})
    u = await db.users.find_one({"id": p["user_id"]})
    league_mem = await db.league_members.find_one({"user_id": p["user_id"]})
    invite_code = None
    if league_mem:
        league = await db.leagues.find_one({"id": league_mem["league_id"]})
        invite_code = league["invite_code"] if league else None
    return {
        "prediction": p, "match": await enrich_match(m) if m else None,
        "user": {"name": u["name"], "username": u["username"]} if u else None,
        "invite_code": invite_code,
    }


# ---------------- Admin ----------------

@api_router.get("/admin/users")
async def admin_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find().sort("points", -1).to_list(500)
    return [public_user(u) for u in users]


@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_admin_user)):
    total_users = await db.users.count_documents({"role": {"$ne": "admin"}})
    total_predictions = await db.predictions.count_documents({})
    premium_users = await db.users.count_documents({"is_premium": True})
    total_matches = await db.matches.count_documents({})
    total_leagues = await db.leagues.count_documents({})
    payments = await db.payments.find({"status": "completed"}).to_list(10000)
    revenue = sum(p.get("amount", 0) for p in payments)
    return {
        "total_users": total_users, "total_predictions": total_predictions,
        "premium_users": premium_users, "total_matches": total_matches,
        "total_leagues": total_leagues, "revenue": revenue,
    }


@api_router.post("/admin/matches")
async def admin_create_match(data: MatchCreate, admin: dict = Depends(get_admin_user)):
    home = await db.teams.find_one({"id": data.home_team_id})
    away = await db.teams.find_one({"id": data.away_team_id})
    if not home or not away:
        raise HTTPException(status_code=404, detail="Team not found")
    match = {
        "id": str(uuid.uuid4()), "home_team_id": data.home_team_id, "away_team_id": data.away_team_id,
        "kickoff": data.kickoff, "venue": data.venue, "stage": data.stage,
        "status": "upcoming", "home_score": None, "away_score": None,
        "created_at": iso(now_utc()),
    }
    await db.matches.insert_one(dict(match))
    return await enrich_match(match)


@api_router.put("/admin/matches/{match_id}/result")
async def admin_set_result(match_id: str, data: ResultInput, admin: dict = Depends(get_admin_user)):
    m = await db.matches.find_one({"id": match_id})
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")
    if m["status"] == "finished":
        raise HTTPException(status_code=400, detail="Result already entered")
    await db.matches.update_one({"id": match_id}, {"$set": {
        "status": "finished", "home_score": data.home_score, "away_score": data.away_score,
    }})
    m = await db.matches.find_one({"id": match_id})
    scored = await score_match(m)
    return {"message": f"Result saved. {scored} predictions scored.", "match": await enrich_match(m)}


# ---------------- Seed ----------------

async def seed_database():
    # settings
    if not await db.settings.find_one({"key": "points"}):
        await db.settings.insert_one({**DEFAULT_POINTS, "key": "points"})
    # badges
    if await db.badges.count_documents({}) == 0:
        for b in BADGES:
            await db.badges.insert_one({"id": str(uuid.uuid4()), **b})
    # admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@predict90.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin = new_user_doc("Admin", admin_email, admin_password, role="admin", username="admin")
        await db.users.insert_one(dict(admin))
    elif not verify_password(admin_password, existing_admin["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # ---- WC2026 dataset (reseed on version bump) ----
    ver = await db.settings.find_one({"key": "seed_version"})
    if ver and ver.get("value") == SEED_VERSION and await db.teams.count_documents({}) >= 48:
        await _seed_demo_users()
        return

    logger.info("Seeding WC2026 teams & players...")
    for coll in ("teams", "players", "matches", "predictions", "ai_insights"):
        await db[coll].delete_many({})

    team_ids = {}
    for group, teams in WC_GROUPS.items():
        for code, name, flag in teams:
            tid = str(uuid.uuid4())
            team_ids[code] = tid
            await db.teams.insert_one({
                "id": tid, "code": code, "name": name, "group": group,
                "flag_code": flag, "flag_url": f"https://flagcdn.com/w160/{flag}.png",
            })

    team_lookup = {c: (n, f) for g in WC_GROUPS.values() for (c, n, f) in g}

    def player_doc(name, tc, club, rating, role):
        country, flag = team_lookup.get(tc, (tc, tc))
        return {
            "id": str(uuid.uuid4()), "name": name, "team_code": tc,
            "country": country, "flag_code": flag,
            "flag_url": f"https://flagcdn.com/w160/{flag}.png",
            "club": club, "rating": rating, "role": role,
        }

    for (name, tc, club, rating) in BOOT_PLAYERS:
        await db.players.insert_one(player_doc(name, tc, club, rating, "forward"))
    for (name, tc, club, rating) in GLOVE_PLAYERS:
        await db.players.insert_one(player_doc(name, tc, club, rating, "goalkeeper"))

    # ---- group-stage fixtures: round-robin generated from the real groups ----
    now = now_utc()
    # match window opens June 11 2026; spread the 3 matchdays across the group stage
    base = datetime(2026, 6, 11, 18, 0, tzinfo=timezone.utc)
    rr = [(0, 1), (2, 3), (0, 2), (1, 3), (0, 3), (1, 2)]  # matchdays 1,1,2,2,3,3
    vi = 0
    gi = 0
    for group, teams in WC_GROUPS.items():
        codes = [c for (c, n, f) in teams]
        for mi, (a, b) in enumerate(rr):
            matchday = mi // 2  # 0,1,2
            kickoff = base + timedelta(days=matchday * 5 + (gi % 5), hours=(vi % 4) * 3)
            await db.matches.insert_one({
                "id": str(uuid.uuid4()),
                "home_team_id": team_ids[codes[a]], "away_team_id": team_ids[codes[b]],
                "kickoff": iso(kickoff), "venue": VENUES[vi % len(VENUES)],
                "stage": f"Group {group} · MD{matchday + 1}",
                "status": "upcoming", "home_score": None, "away_score": None,
                "created_at": iso(now),
            })
            vi += 1
        gi += 1

    await db.settings.update_one({"key": "seed_version"}, {"$set": {"value": SEED_VERSION}}, upsert=True)
    await _seed_demo_users()
    await _seed_demo_match_predictions()
    logger.info("Seed complete")


async def _seed_demo_match_predictions():
    """Give the demo accounts some picks so community splits / cards have data."""
    if await db.predictions.count_documents({}) > 0:
        return
    users = await db.users.find({"role": {"$ne": "admin"}}).to_list(20)
    if not users:
        return
    upcoming = await db.matches.find({"status": "upcoming"}).sort("kickoff", 1).limit(8).to_list(8)
    import random as _r
    for m in upcoming:
        # 70% of demo users lock a pick on each of the first matches -> community splits
        for u in users:
            if _r.random() > 0.7:
                continue
            h, a = _r.randint(0, 3), _r.randint(0, 2)
            winner = "home" if h > a else ("away" if a > h else "draw")
            await db.predictions.insert_one({
                "id": str(uuid.uuid4()), "user_id": u["id"], "match_id": m["id"],
                "predicted_winner": winner, "home_score": h, "away_score": a,
                "match_kickoff": m["kickoff"], "status": "pending", "points_earned": 0,
                "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
            })


async def _seed_demo_users():
    """Create demo + rival accounts and a demo league if they don't already exist."""
    now = now_utc()
    specs = [
        ("Demo User", "demo@predict90.com", "India", "Argentina", "demofan"),
        ("Rahul Verma", "rahul@predict90.com", "India", "Brazil", "rahulv"),
        ("Jay Patel", "jay@predict90.com", "India", "France", "jaypatel"),
        ("Sara Khan", "sara@predict90.com", "UAE", "Spain", "sarakhan"),
        ("Leo Costa", "leo@predict90.com", "Brazil", "Brazil", "leocosta"),
    ]
    users = []
    for name, email, country, fav, username in specs:
        u = await db.users.find_one({"email": email})
        if not u:
            u = new_user_doc(name, email, "Demo@123", country, fav, username=username)
            await db.users.insert_one(dict(u))
        users.append(u)

    if not await db.leagues.find_one({"invite_code": "LEGEND"}):
        league = {
            "id": str(uuid.uuid4()), "name": "Legends League",
            "description": "The original Predict90 league. Beat us if you can!",
            "owner_id": users[0]["id"], "invite_code": "LEGEND", "created_at": iso(now),
        }
        await db.leagues.insert_one(dict(league))
        for i, u in enumerate(users[:3]):
            await db.league_members.insert_one({
                "id": str(uuid.uuid4()), "league_id": league["id"], "user_id": u["id"],
                "role": "owner" if i == 0 else "member", "joined_at": iso(now),
            })


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id")
    await db.predictions.create_index([("user_id", 1), ("match_id", 1)])
    await db.matches.create_index("kickoff")
    await db.leagues.create_index("invite_code")
    await db.tournament_predictions.create_index("user_id", unique=True)
    await seed_database()


@api_router.get("/")
async def root():
    return {"message": "Predict90 API", "status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Serve built frontend (combined deployment) ----------------
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

BUILD_DIR = ROOT_DIR.parent / "frontend" / "build"

if BUILD_DIR.exists():
    app.mount("/static", StaticFiles(directory=BUILD_DIR / "static"), name="static")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # API routes are registered before this catch-all, so they take priority.
        candidate = BUILD_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(BUILD_DIR / "index.html")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
