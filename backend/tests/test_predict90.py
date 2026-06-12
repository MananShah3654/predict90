"""Backend regression tests for Predict90."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8000").rstrip("/")
API = f"{BASE_URL}/api"

DEMO = {"email": "demo@predict90.com", "password": "Demo@123"}
ADMIN = {"email": "admin@predict90.com", "password": "Admin@123"}
RAHUL = {"email": "rahul@predict90.com", "password": "Demo@123"}


def _login(payload):
    r = requests.post(f"{API}/auth/login", json=payload, timeout=20)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


def _h(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ----------------- Auth -----------------
class TestAuth:
    def test_health(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_login_demo(self):
        r = requests.post(f"{API}/auth/login", json=DEMO, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and d["email"] == DEMO["email"]
        # cookie should be set
        assert "access_token" in r.cookies

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": DEMO["email"], "password": "wrong"}, timeout=20)
        assert r.status_code == 401

    def test_me_with_bearer(self):
        token = _login(DEMO)
        r = requests.get(f"{API}/auth/me", headers=_h(token), timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == DEMO["email"]

    def test_register_new_user(self):
        email = f"test_{uuid.uuid4().hex[:8]}@predict90.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "Test User", "email": email, "password": "Test@1234",
        }, timeout=20)
        assert r.status_code == 200
        assert r.json()["email"] == email

    def test_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={
            "name": "Demo", "email": DEMO["email"], "password": "Demo@123",
        }, timeout=20)
        assert r.status_code == 400


# ----------------- Dashboard -----------------
class TestDashboard:
    def test_dashboard_demo_stats(self):
        token = _login(DEMO)
        r = requests.get(f"{API}/dashboard", headers=_h(token), timeout=20)
        assert r.status_code == 200
        d = r.json()
        # Seeded: demo has 2 exact (20) + 1 correct draw (3) = 23 points; 3/4 = 75% accuracy
        assert d["user"]["points"] == 23, f"expected 23 got {d['user']['points']}"
        assert d["user"]["accuracy"] == 75.0
        assert d["user"]["current_streak"] >= 1
        assert d["rank"] >= 1
        assert len(d["upcoming_matches"]) > 0


# ----------------- Matches & Predictions -----------------
class TestMatchesAndPredictions:
    def test_matches_listing(self):
        r = requests.get(f"{API}/matches", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) > 0

    def test_predict_finished_rejected(self):
        token = _login(DEMO)
        matches = requests.get(f"{API}/matches?status=finished", timeout=15).json()
        assert len(matches) > 0
        mid = matches[0]["id"]
        r = requests.post(f"{API}/predictions", headers=_h(token),
                          json={"match_id": mid, "predicted_winner": "home", "home_score": 1, "away_score": 0},
                          timeout=15)
        assert r.status_code == 400, f"finished match prediction should be 400, got {r.status_code}"

    def test_predict_upcoming_and_edit(self):
        token = _login(DEMO)
        matches = requests.get(f"{API}/matches?status=upcoming", timeout=15).json()
        # Use a non-first upcoming match (first one already has demo prediction in seed)
        mid = matches[1]["id"]
        r = requests.post(f"{API}/predictions", headers=_h(token),
                          json={"match_id": mid, "predicted_winner": "home", "home_score": 3, "away_score": 1},
                          timeout=15)
        assert r.status_code == 200, r.text
        # Edit
        r2 = requests.post(f"{API}/predictions", headers=_h(token),
                           json={"match_id": mid, "predicted_winner": "away", "home_score": 0, "away_score": 2},
                           timeout=15)
        assert r2.status_code == 200
        assert r2.json()["home_score"] == 0 and r2.json()["away_score"] == 2

    def test_winner_score_consistency(self):
        token = _login(DEMO)
        matches = requests.get(f"{API}/matches?status=upcoming", timeout=15).json()
        mid = matches[2]["id"]
        r = requests.post(f"{API}/predictions", headers=_h(token),
                          json={"match_id": mid, "predicted_winner": "home", "home_score": 0, "away_score": 2},
                          timeout=15)
        assert r.status_code == 400


# ----------------- Leaderboard -----------------
class TestLeaderboard:
    def test_global_leaderboard_rahul_first(self):
        r = requests.get(f"{API}/leaderboard?scope=global", timeout=15)
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) > 0
        assert rows[0]["points"] == 42, f"top should have 42 pts (rahul), got {rows[0]['points']}"
        assert "rahul" in rows[0]["username"].lower() or rows[0]["name"].lower().startswith("rahul")

    def test_country_filter(self):
        r = requests.get(f"{API}/leaderboard?scope=country&country=India", timeout=15)
        assert r.status_code == 200


# ----------------- Leagues -----------------
class TestLeagues:
    def test_join_legends(self):
        # Use a fresh user (rahul) who is already in legends -> 400, then a brand new user
        email = f"lu_{uuid.uuid4().hex[:8]}@predict90.com"
        reg = requests.post(f"{API}/auth/register", json={
            "name": "League User", "email": email, "password": "Test@1234",
        }, timeout=20)
        token = reg.json()["token"]
        r = requests.post(f"{API}/leagues/join", headers=_h(token),
                          json={"invite_code": "LEGEND"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["invite_code"] == "LEGEND"

    def test_create_league(self):
        token = _login(DEMO)
        r = requests.post(f"{API}/leagues", headers=_h(token),
                          json={"name": f"TEST_League_{uuid.uuid4().hex[:6]}", "description": "test"},
                          timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "invite_code" in d and len(d["invite_code"]) == 6
        # league detail
        r2 = requests.get(f"{API}/leagues/{d['id']}", headers=_h(token), timeout=15)
        assert r2.status_code == 200
        assert r2.json()["member_count"] >= 1

    def test_join_invalid_code(self):
        token = _login(DEMO)
        r = requests.post(f"{API}/leagues/join", headers=_h(token),
                          json={"invite_code": "INVALID"}, timeout=15)
        assert r.status_code == 404


# ----------------- Badges -----------------
class TestBadges:
    def test_badges_list(self):
        r = requests.get(f"{API}/badges", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 10

    def test_demo_badges_includes_perfect_score(self):
        token = _login(DEMO)
        r = requests.get(f"{API}/badges/me", headers=_h(token), timeout=15)
        assert r.status_code == 200
        codes = [b["badge_code"] for b in r.json()]
        assert "perfect-score" in codes


# ----------------- Premium -----------------
class TestPremium:
    def test_plans(self):
        r = requests.get(f"{API}/premium/plans", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_purchase_activates_premium(self):
        email = f"prem_{uuid.uuid4().hex[:8]}@predict90.com"
        reg = requests.post(f"{API}/auth/register", json={
            "name": "Prem User", "email": email, "password": "Test@1234"}, timeout=20)
        token = reg.json()["token"]
        r = requests.post(f"{API}/premium/purchase", headers=_h(token),
                          json={"plan_id": "monthly"}, timeout=15)
        assert r.status_code == 200
        u = r.json()
        assert u["is_premium"] is True
        # badge awarded
        badges = requests.get(f"{API}/badges/me", headers=_h(token), timeout=15).json()
        assert "premium-member" in [b["badge_code"] for b in badges]


# ----------------- AI Insights -----------------
class TestAIInsights:
    def test_non_premium_gated(self):
        email = f"np_{uuid.uuid4().hex[:8]}@predict90.com"
        reg = requests.post(f"{API}/auth/register", json={
            "name": "NP User", "email": email, "password": "Test@1234"}, timeout=20)
        token = reg.json()["token"]
        matches = requests.get(f"{API}/matches?status=upcoming", timeout=15).json()
        mid = matches[0]["id"]
        r = requests.get(f"{API}/matches/{mid}/insights", headers=_h(token), timeout=15)
        assert r.status_code == 403

    def test_admin_can_get_insights(self):
        token = _login(ADMIN)
        matches = requests.get(f"{API}/matches?status=upcoming", timeout=15).json()
        mid = matches[0]["id"]
        r = requests.get(f"{API}/matches/{mid}/insights", headers=_h(token), timeout=60)
        assert r.status_code == 200, f"AI insights failed: {r.status_code} {r.text[:200]}"
        d = r.json()
        assert "home_win_pct" in d and "likely_score" in d


# ----------------- Admin -----------------
class TestAdmin:
    def test_admin_stats(self):
        token = _login(ADMIN)
        r = requests.get(f"{API}/admin/stats", headers=_h(token), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["total_users"] >= 5
        assert d["total_matches"] >= 14

    def test_non_admin_blocked(self):
        token = _login(DEMO)
        r = requests.get(f"{API}/admin/stats", headers=_h(token), timeout=15)
        assert r.status_code == 403

    def test_set_result_scores_predictions(self):
        token_admin = _login(ADMIN)
        # find upcoming match with demo prediction (seed adds demo prediction on upcoming[0] = Argentina vs Spain)
        token_demo = _login(DEMO)
        my_preds = requests.get(f"{API}/predictions/me", headers=_h(token_demo), timeout=15).json()
        upcoming_pred = next((p for p in my_preds if p.get("status") == "pending" and p.get("match")), None)
        if not upcoming_pred:
            pytest.skip("No upcoming pending prediction available")
        before_points = requests.get(f"{API}/dashboard", headers=_h(token_demo), timeout=15).json()["user"]["points"]
        mid = upcoming_pred["match_id"]
        # match may have already been used by another test (set_result rejects finished)
        m = requests.get(f"{API}/matches/{mid}", timeout=15).json()
        if m["status"] != "upcoming":
            pytest.skip("Match already finished")
        # Use the demo's prediction exact score so we know points should increase by 10
        h, a = upcoming_pred["home_score"], upcoming_pred["away_score"]
        r = requests.put(f"{API}/admin/matches/{mid}/result", headers=_h(token_admin),
                         json={"home_score": h, "away_score": a}, timeout=20)
        assert r.status_code == 200, r.text
        time.sleep(1)
        after = requests.get(f"{API}/dashboard", headers=_h(token_demo), timeout=15).json()["user"]["points"]
        assert after > before_points, f"points should increase after scoring: before={before_points} after={after}"

    def test_admin_create_match(self):
        token = _login(ADMIN)
        teams = requests.get(f"{API}/teams", timeout=15).json()
        from datetime import datetime, timezone, timedelta
        kickoff = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
        r = requests.post(f"{API}/admin/matches", headers=_h(token),
                          json={"home_team_id": teams[0]["id"], "away_team_id": teams[1]["id"],
                                "kickoff": kickoff, "venue": "Test Venue", "stage": "Group X"},
                          timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "upcoming"


# ----------------- Auth guard -----------------
class TestAuthGuard:
    def test_protected_without_token(self):
        r = requests.get(f"{API}/dashboard", timeout=15)
        assert r.status_code == 401
