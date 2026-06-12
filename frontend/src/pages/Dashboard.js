import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { avatarUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ShareHub from "@/components/ShareHub";
import { Trophy, Crown, Goal, Hand, Users, Globe2, Target, ChevronRight, Share2 } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, testId }) => (
  <div className="glass-card p-5 fade-up" data-testid={testId}>
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-widest text-white/50">{label}</span>
      <Icon size={16} className="text-[#FFD700]" />
    </div>
    <p className="font-display text-4xl mt-2">{value}</p>
    {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);
  const [pred, setPred] = useState(null);
  const [teams, setTeams] = useState({});
  const [players, setPlayers] = useState({});
  const [share, setShare] = useState(false);

  const load = useCallback(async () => {
    const [{ data: d }, { data: p }, { data: groups }, { data: fwd }, { data: gk }] = await Promise.all([
      api.get("/dashboard"),
      api.get("/wc/prediction"),
      api.get("/wc/groups"),
      api.get("/wc/players?role=forward"),
      api.get("/wc/players?role=goalkeeper"),
    ]);
    setDash(d);
    setPred(p);
    setTeams(Object.fromEntries(groups.flatMap((g) => g.teams).map((t) => [t.id, t])));
    setPlayers(Object.fromEntries([...fwd, ...gk].map((x) => [x.id, x])));
  }, []);

  useEffect(() => { load(); }, [load]);

  const completion = useMemo(() => {
    if (!pred) return 0;
    let n = 0;
    if (Object.keys(pred.group_leaders || {}).length === 12) n++;
    if ((pred.quarter_finalists || []).length === 8) n++;
    if ((pred.semi_finalists || []).length === 4) n++;
    if ((pred.finalists || []).length === 2) n++;
    if (pred.winner) n++;
    if (pred.golden_boot) n++;
    if (pred.golden_glove) n++;
    return n;
  }, [pred]);

  if (!dash) return <div className="min-h-screen grid place-items-center"><span className="font-display text-2xl gold-text animate-pulse">LOADING...</span></div>;

  const u = dash.user;
  const champ = pred?.winner ? teams[pred.winner] : null;
  const boot = pred?.golden_boot ? players[pred.golden_boot] : null;
  const glove = pred?.golden_glove ? players[pred.golden_glove] : null;
  const pct = Math.round((completion / 7) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24" data-testid="dashboard-page">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <img src={u.picture || avatarUrl(u.username)} alt={u.name} referrerPolicy="no-referrer"
            className={`w-16 h-16 rounded-2xl object-cover border-2 ${u.is_premium ? "border-[#FFD700]" : "border-white/15"}`} />
          <div>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wide">
              WELCOME BACK, <span className="gold-gradient-text">{u.name.split(" ")[0].toUpperCase()}</span>
            </h1>
            <p className="text-white/50 text-sm mt-1">Level {u.level} · {u.xp} XP · @{u.username}</p>
          </div>
        </div>
        <button data-testid="share-achievement-btn" onClick={() => setShare(true)} className="btn-ghost-light px-4 py-2 text-sm flex items-center gap-1.5 shrink-0">
          <Share2 size={14} /> <span className="hidden sm:inline">Share My Run</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Trophy} label="Points" value={u.points} sub={`Rank #${dash.rank} of ${dash.total_users}`} testId="stat-points" />
        <StatCard icon={Target} label="Bracket" value={`${pct}%`} sub={`${completion}/7 categories`} testId="stat-bracket" />
        <StatCard icon={Users} label="Leagues" value={dash.league_count} sub="Compete with friends" testId="stat-leagues" />
        <StatCard icon={Crown} label="Your Champion" value={champ ? "" : "—"} sub={champ ? champ.name : "Not picked yet"} testId="stat-champion" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bracket summary */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl tracking-wide">YOUR WORLD CUP BRACKET</h2>
            <Link to="/predict" data-testid="edit-bracket-link" className="text-xs font-bold text-[#FFD700] flex items-center gap-1">
              {completion === 0 ? "Build it" : "Edit"} <ChevronRight size={14} />
            </Link>
          </div>

          <div className="glass-card p-6">
            {/* progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-white/50 mb-2">
                <span>Completion</span><span className="gold-text font-bold">{completion}/7</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* picks grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              <PickTile icon={Crown} label="Champion">
                {champ ? <TeamMini t={champ} /> : <Empty />}
              </PickTile>
              <PickTile icon={Goal} label="Golden Boot">
                {boot ? <PlayerMini p={boot} /> : <Empty />}
              </PickTile>
              <PickTile icon={Hand} label="Golden Glove">
                {glove ? <PlayerMini p={glove} /> : <Empty />}
              </PickTile>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <MiniStat label="Group Leaders" value={`${Object.keys(pred?.group_leaders || {}).length}/12`} />
              <MiniStat label="Quarter-finalists" value={`${(pred?.quarter_finalists || []).length}/8`} />
              <MiniStat label="Finalists" value={`${(pred?.finalists || []).length}/2`} />
            </div>

            <Link to="/predict" data-testid="dashboard-predict-cta" className="btn-gold w-full mt-6 py-3.5 text-sm flex items-center justify-center gap-2">
              {completion === 0 ? "Build My Bracket" : "Update My Bracket"} <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* side */}
        <div className="space-y-6">
          <Link to="/groups" data-testid="dashboard-groups-card" className="glass-card glass-card-hover p-5 block">
            <div className="flex items-center gap-3">
              <Globe2 size={22} className="text-[#FFD700]" />
              <div>
                <p className="font-bold">The 48 Nations</p>
                <p className="text-xs text-white/50">Explore all 12 official groups</p>
              </div>
            </div>
          </Link>

          <Link to="/leaderboard" data-testid="dashboard-leaderboard-card" className="glass-card glass-card-hover p-5 block">
            <div className="flex items-center gap-3">
              <Trophy size={22} className="text-[#FFD700]" />
              <div>
                <p className="font-bold">Leaderboard</p>
                <p className="text-xs text-white/50">You're #{dash.rank} of {dash.total_users}</p>
              </div>
            </div>
          </Link>

          <Link to="/leagues" data-testid="dashboard-leagues-card" className="glass-card glass-card-hover p-5 block">
            <div className="flex items-center gap-3">
              <Users size={22} className="text-[#FFD700]" />
              <div>
                <p className="font-bold">{dash.league_count} League{dash.league_count !== 1 ? "s" : ""}</p>
                <p className="text-xs text-white/50">Battle your friends</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <ShareHub open={share} onClose={() => setShare(false)} type="achievement" payload={{ stats: u }} />
    </div>
  );
}

const Empty = () => <p className="text-sm text-white/35">Not picked</p>;

const TeamMini = ({ t }) => (
  <div className="flex items-center gap-2">
    <img src={t.flag_url} alt={t.name} className="w-8 h-6 object-cover rounded-[3px] ring-1 ring-white/20" />
    <span className="text-sm font-bold text-white">{t.name}</span>
  </div>
);

const PlayerMini = ({ p }) => (
  <div className="flex items-center gap-2">
    <img src={p.flag_url} alt={p.country} className="w-8 h-6 object-cover rounded-[3px] ring-1 ring-white/20" />
    <div className="leading-tight">
      <p className="text-sm font-bold text-white">{p.name}</p>
      <p className="text-[11px] text-white/45">{p.club}</p>
    </div>
  </div>
);

const PickTile = ({ icon: Icon, label, children }) => (
  <div className="bg-black/25 rounded-xl p-4">
    <div className="flex items-center gap-2 text-[#FFD700] mb-2">
      <Icon size={15} />
      <span className="text-[11px] uppercase tracking-widest text-white/50">{label}</span>
    </div>
    {children}
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="bg-black/20 rounded-lg py-2">
    <p className="font-display text-xl gold-text">{value}</p>
    <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
  </div>
);
