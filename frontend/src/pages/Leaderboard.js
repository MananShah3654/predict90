import { useEffect, useState, useCallback } from "react";
import api, { avatarUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ShareHub from "@/components/ShareHub";
import { Trophy, Flame, Share2 } from "lucide-react";

const rankColor = (rank) =>
  rank === 1 ? "text-[#FFD700]" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-amber-600" : "text-white/50";

export default function Leaderboard() {
  const { user } = useAuth();
  const [scope, setScope] = useState("global");
  const [rows, setRows] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState(null);

  useEffect(() => {
    api.get("/leagues/me").then(({ data }) => {
      setLeagues(data);
      if (data.length > 0) setSelectedLeague(data[0].id);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    let url = "/leaderboard?scope=global";
    if (scope === "country" && user?.country) url = `/leaderboard?scope=country&country=${encodeURIComponent(user.country)}`;
    if (scope === "league" && selectedLeague) url = `/leaderboard?scope=league&league_id=${selectedLeague}`;
    const { data } = await api.get(url);
    setRows(data);
    setLoading(false);
  }, [scope, selectedLeague, user]);

  useEffect(() => { load(); }, [load]);

  const tabs = [
    { id: "global", label: "Global" },
    { id: "country", label: user?.country ? user.country : "Country" },
    { id: "league", label: "My League" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="leaderboard-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide">LEADERBOARD</h1>
        {rows.length > 0 && (
          <button data-testid="share-leaderboard-btn" onClick={() => setShare({ type: "leaderboard", payload: { rows, title: scope === "league" ? "LEAGUE TOP 3" : "TOP PREDICTORS" } })}
            className="btn-ghost-light px-4 py-2 text-sm flex items-center gap-1.5">
            <Share2 size={14} /> Share
          </button>
        )}
      </div>

      <div className="flex rounded-full bg-white/5 p-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            data-testid={`leaderboard-tab-${t.id}`}
            onClick={() => setScope(t.id)}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${
              scope === t.id ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black" : "text-white/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {scope === "league" && leagues.length > 1 && (
        <select
          data-testid="leaderboard-league-select"
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="mb-4 bg-[#11141D] border border-white/15 rounded-xl px-4 py-2.5 text-sm w-full"
        >
          {leagues.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      )}

      {scope === "league" && leagues.length === 0 ? (
        <p className="text-white/40 text-center py-12">Join or create a league to see its leaderboard.</p>
      ) : loading ? (
        <p className="text-white/40 text-center py-12 font-display text-xl">LOADING...</p>
      ) : (
        <div className="space-y-2">
          {rows.length === 0 && <p className="text-white/40 text-center py-12">No predictors here yet.</p>}
          {rows.map((r) => (
            <div
              key={r.user_id}
              data-testid={`leaderboard-row-${r.rank}`}
              className={`glass-card flex items-center gap-4 px-4 py-3 fade-up ${
                r.user_id === user?.id ? "border-[#FFD700]/50 bg-[#FFD700]/5" : ""
              }`}
            >
              <span className={`font-display text-2xl w-10 text-center ${rankColor(r.rank)}`}>
                {r.rank <= 3 ? <Trophy size={20} className="inline" /> : `#${r.rank}`}
              </span>
              <img src={avatarUrl(r.username)} alt="" className={`w-10 h-10 rounded-full border-2 ${r.is_premium ? "border-[#FFD700]" : "border-white/15"}`} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">
                  {r.name} {r.user_id === user?.id && <span className="text-[#FFD700] text-xs">(You)</span>}
                </p>
                <p className="text-xs text-white/40 truncate">
                  @{r.username}{r.country ? ` · ${r.country}` : ""} · {r.badge_count} badges
                </p>
              </div>
              {r.current_streak > 1 && (
                <span className="flex items-center gap-0.5 text-xs font-bold text-orange-400"><Flame size={12} />{r.current_streak}</span>
              )}
              <div className="text-right">
                <p className="font-display text-2xl gold-text">{r.points}</p>
                <p className="text-[10px] text-white/40 uppercase">{r.accuracy}% acc</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <ShareHub open={!!share} onClose={() => setShare(null)} type={share?.type} payload={share?.payload} />
    </div>
  );
}
