import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MatchCard } from "@/components/MatchCard";
import { PredictionModal } from "@/components/PredictionModal";
import ShareHub from "@/components/ShareHub";
import { Globe2 } from "lucide-react";

const STADIUM = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2400&auto=format&fit=crop";

export default function Matches() {
  const { user, refreshUser } = useAuth();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [tab, setTab] = useState("upcoming");
  const [groupFilter, setGroupFilter] = useState("all");
  const [predictMatch, setPredictMatch] = useState(null);
  const [share, setShare] = useState(null); // {type, payload}
  const [inviteCode, setInviteCode] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: ms }, { data: preds }, { data: leagues }] = await Promise.all([
      api.get("/matches"),
      api.get("/predictions/me"),
      api.get("/leagues/me"),
    ]);
    setMatches(ms);
    const map = {};
    preds.forEach((p) => (map[p.match_id] = p));
    setPredictions(map);
    if (leagues.length > 0) setInviteCode(leagues[0].invite_code);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const groups = ["all", ...Array.from(new Set(matches.map((m) => m.stage.match(/Group ([A-L])/)?.[1]).filter(Boolean))).sort()];

  const filtered = matches
    .filter((m) => (tab === "upcoming" ? m.status === "upcoming" : m.status === "finished"))
    .filter((m) => groupFilter === "all" || m.stage.includes(`Group ${groupFilter}`))
    .sort((a, b) => (tab === "upcoming" ? a.kickoff.localeCompare(b.kickoff) : b.kickoff.localeCompare(a.kickoff)));

  const onShare = (match, prediction) => {
    if (match.status === "finished" && prediction.status !== "pending")
      setShare({ type: "result", payload: { match, prediction } });
    else
      setShare({ type: "prediction", payload: { match, prediction, inviteCode } });
  };

  const onSplit = async (match) => {
    const { data } = await api.get(`/matches/${match.id}/community`);
    setShare({ type: "group", payload: { match, counts: data.counts } });
  };

  return (
    <div className="pb-24" data-testid="matches-page">
      <div className="relative h-44 flex items-end overflow-hidden">
        <img src={STADIUM} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#0A0B10]/70 to-[#0A0B10]" />
        <div className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#FFD700]">Match Predictor</span>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">EVERY <span className="gold-gradient-text">FIXTURE</span></h1>
          <p className="text-white/55 text-xs mt-1">Call the score on all 72 group-stage matches · 10 pts exact · 3 pts outcome</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex rounded-full bg-white/5 p-1 max-w-xs">
            {["upcoming", "finished"].map((t) => (
              <button key={t} data-testid={`matches-tab-${t}`} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-colors ${
                  tab === t ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black" : "text-white/60"}`}>
                {t}
              </button>
            ))}
          </div>
          <Link to="/groups" className="text-xs font-bold text-[#FFD700] flex items-center gap-1"><Globe2 size={14} /> Groups</Link>
        </div>

        {/* group filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {groups.map((g) => (
            <button key={g} onClick={() => setGroupFilter(g)} data-testid={`group-filter-${g}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                groupFilter === g ? "bg-[#FFD700] text-black" : "bg-white/8 text-white/60 hover:bg-white/15"}`}>
              {g === "all" ? "All" : `Group ${g}`}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-white/40 text-center py-12 font-display text-xl">LOADING FIXTURES…</p>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 && <p className="text-white/40 text-center py-12">No {tab} matches{groupFilter !== "all" ? ` in Group ${groupFilter}` : ""}.</p>}
            {filtered.map((m) => (
              <MatchCard key={m.id} match={m} user={user} prediction={predictions[m.id]}
                onPredict={setPredictMatch} onShare={onShare} onSplit={onSplit} />
            ))}
          </div>
        )}
      </div>

      <PredictionModal
        match={predictMatch}
        prediction={predictMatch ? predictions[predictMatch.id] : null}
        open={!!predictMatch}
        onClose={() => setPredictMatch(null)}
        onSaved={(p) => { setPredictions({ ...predictions, [p.match_id]: p }); refreshUser(); }}
      />
      <ShareHub open={!!share} onClose={() => setShare(null)} type={share?.type} payload={share?.payload} />
    </div>
  );
}
