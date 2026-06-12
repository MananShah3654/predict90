import { useEffect, useState, useCallback } from "react";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Users, Target, Gem, CalendarClock, Trophy, IndianRupee, Plus } from "lucide-react";

const inputCls =
  "bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/60";

const StatTile = ({ icon: Icon, label, value, testId }) => (
  <div className="glass-card p-4" data-testid={testId}>
    <Icon size={16} className="text-[#FFD700] mb-2" />
    <p className="font-display text-3xl">{value}</p>
    <p className="text-xs text-white/50 uppercase tracking-wider">{label}</p>
  </div>
);

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tab, setTab] = useState("matches");
  const [scores, setScores] = useState({});
  const [newMatch, setNewMatch] = useState({ home_team_id: "", away_team_id: "", kickoff: "", venue: "", stage: "Group A" });
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const [s, m, u, t] = await Promise.all([
      api.get("/admin/stats"), api.get("/matches"), api.get("/admin/users"), api.get("/teams"),
    ]);
    setStats(s.data); setMatches(m.data); setUsers(u.data); setTeams(t.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setResult = async (matchId) => {
    const s = scores[matchId];
    if (!s || s.home === "" || s.away === "") return toast.error("Enter both scores");
    try {
      const { data } = await api.put(`/admin/matches/${matchId}/result`, {
        home_score: parseInt(s.home), away_score: parseInt(s.away),
      });
      toast.success(data.message);
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  const addMatch = async () => {
    try {
      await api.post("/admin/matches", { ...newMatch, kickoff: new Date(newMatch.kickoff).toISOString() });
      toast.success("Match created");
      setShowAdd(false);
      setNewMatch({ home_team_id: "", away_team_id: "", kickoff: "", venue: "", stage: "Group A" });
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  if (!stats)
    return <div className="min-h-screen flex items-center justify-center"><span className="font-display text-2xl gold-text animate-pulse">LOADING...</span></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="admin-page">
      <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-8">ADMIN <span className="gold-text">PANEL</span></h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        <StatTile icon={Users} label="Users" value={stats.total_users} testId="admin-stat-users" />
        <StatTile icon={Target} label="Predictions" value={stats.total_predictions} testId="admin-stat-predictions" />
        <StatTile icon={Gem} label="Premium" value={stats.premium_users} testId="admin-stat-premium" />
        <StatTile icon={CalendarClock} label="Matches" value={stats.total_matches} testId="admin-stat-matches" />
        <StatTile icon={Trophy} label="Leagues" value={stats.total_leagues} testId="admin-stat-leagues" />
        <StatTile icon={IndianRupee} label="Revenue" value={`₹${stats.revenue}`} testId="admin-stat-revenue" />
      </div>

      <div className="flex rounded-full bg-white/5 p-1 mb-6 max-w-xs">
        {["matches", "users"].map((t) => (
          <button
            key={t}
            data-testid={`admin-tab-${t}`}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full text-sm font-bold capitalize ${tab === t ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black" : "text-white/60"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "matches" && (
        <>
          <button data-testid="admin-add-match-btn" onClick={() => setShowAdd(!showAdd)} className="btn-ghost-light px-4 py-2 text-xs mb-4 flex items-center gap-1">
            <Plus size={13} /> Add Match
          </button>
          {showAdd && (
            <div className="glass-card p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="admin-add-match-form">
              <select data-testid="admin-home-team-select" className={inputCls} value={newMatch.home_team_id} onChange={(e) => setNewMatch({ ...newMatch, home_team_id: e.target.value })}>
                <option value="" className="bg-[#11141D]">Home team</option>
                {teams.map((t) => <option key={t.id} value={t.id} className="bg-[#11141D]">{t.name}</option>)}
              </select>
              <select data-testid="admin-away-team-select" className={inputCls} value={newMatch.away_team_id} onChange={(e) => setNewMatch({ ...newMatch, away_team_id: e.target.value })}>
                <option value="" className="bg-[#11141D]">Away team</option>
                {teams.map((t) => <option key={t.id} value={t.id} className="bg-[#11141D]">{t.name}</option>)}
              </select>
              <input data-testid="admin-kickoff-input" className={inputCls} type="datetime-local" value={newMatch.kickoff} onChange={(e) => setNewMatch({ ...newMatch, kickoff: e.target.value })} />
              <input data-testid="admin-venue-input" className={inputCls} placeholder="Venue" value={newMatch.venue} onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })} />
              <input data-testid="admin-stage-input" className={inputCls} placeholder="Stage (e.g. Group A)" value={newMatch.stage} onChange={(e) => setNewMatch({ ...newMatch, stage: e.target.value })} />
              <button data-testid="admin-create-match-btn" onClick={addMatch} className="btn-gold py-2.5 text-sm">Create Match</button>
            </div>
          )}

          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="glass-card p-4 flex flex-wrap items-center gap-3" data-testid={`admin-match-${m.id}`}>
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold text-sm">{m.home_team?.name} vs {m.away_team?.name}</p>
                  <p className="text-xs text-white/40">{m.stage} · {new Date(m.kickoff).toLocaleString()} · {m.status}</p>
                </div>
                {m.status === "finished" ? (
                  <span className="font-display text-2xl gold-text">{m.home_score} - {m.away_score}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      data-testid={`admin-home-score-${m.id}`}
                      className={`${inputCls} w-16 text-center`}
                      type="number" min="0" placeholder="H"
                      value={scores[m.id]?.home ?? ""}
                      onChange={(e) => setScores({ ...scores, [m.id]: { ...scores[m.id], home: e.target.value } })}
                    />
                    <input
                      data-testid={`admin-away-score-${m.id}`}
                      className={`${inputCls} w-16 text-center`}
                      type="number" min="0" placeholder="A"
                      value={scores[m.id]?.away ?? ""}
                      onChange={(e) => setScores({ ...scores, [m.id]: { ...scores[m.id], away: e.target.value } })}
                    />
                    <button data-testid={`admin-set-result-${m.id}`} onClick={() => setResult(m.id)} className="btn-gold px-4 py-2 text-xs">
                      Set Result
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="glass-card overflow-x-auto" data-testid="admin-users-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-white/40 border-b border-white/10">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Premium</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-bold">{u.name}</td>
                  <td className="px-4 py-3 text-white/60">{u.email}</td>
                  <td className="px-4 py-3 gold-text font-bold">{u.points}</td>
                  <td className="px-4 py-3">{u.accuracy}%</td>
                  <td className="px-4 py-3">{u.is_premium ? "✦" : "—"}</td>
                  <td className="px-4 py-3 text-white/60">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
