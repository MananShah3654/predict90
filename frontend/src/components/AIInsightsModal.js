import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const ProbBar = ({ label, pct, gold }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="font-semibold">{label}</span>
      <span className={`font-bold ${gold ? "text-[#FFD700]" : "text-white/70"}`}>{pct}%</span>
    </div>
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${gold ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700]" : "bg-white/30"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>
);

export const AIInsightsModal = ({ match, open, onClose }) => {
  const { user } = useAuth();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isPremium = user?.is_premium || user?.role === "admin";

  useEffect(() => {
    if (open && match && isPremium) {
      setInsight(null);
      setError("");
      setLoading(true);
      api
        .get(`/matches/${match.id}/insights`)
        .then(({ data }) => setInsight(data))
        .catch((e) => setError(formatApiError(e.response?.data?.detail)))
        .finally(() => setLoading(false));
    }
  }, [open, match, isPremium]);

  if (!match) return null;
  const maxPct = insight ? Math.max(insight.home_win_pct, insight.draw_pct, insight.away_win_pct) : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#11141D] border-white/10 text-white max-w-md max-h-[85vh] overflow-y-auto" data-testid="ai-insights-modal">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide flex items-center gap-2">
            <Sparkles className="text-[#FFD700]" size={20} /> AI MATCH INSIGHTS
          </DialogTitle>
        </DialogHeader>

        {!isPremium ? (
          <div className="text-center py-8" data-testid="insights-premium-gate">
            <Lock size={36} className="mx-auto text-[#FFD700] mb-3" />
            <p className="font-bold mb-1">Premium Feature</p>
            <p className="text-sm text-white/60 mb-5">Unlock AI win probabilities, likely scorelines and tactical analysis.</p>
            <Link to="/premium" data-testid="insights-upgrade-link" className="btn-gold px-6 py-2.5 text-sm">Get Premium Pass</Link>
          </div>
        ) : loading ? (
          <div className="text-center py-10">
            <Sparkles size={28} className="mx-auto text-[#FFD700] animate-pulse mb-3" />
            <p className="text-sm text-white/60">Our AI analyst is studying {match.home_team?.name} vs {match.away_team?.name}...</p>
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm py-6 text-center" data-testid="insights-error">{error}</p>
        ) : insight ? (
          <div className="space-y-5" data-testid="insights-content">
            <div className="space-y-3">
              <ProbBar label={`${match.home_team?.name} Win`} pct={insight.home_win_pct} gold={insight.home_win_pct === maxPct} />
              <ProbBar label="Draw" pct={insight.draw_pct} gold={insight.draw_pct === maxPct} />
              <ProbBar label={`${match.away_team?.name} Win`} pct={insight.away_win_pct} gold={insight.away_win_pct === maxPct} />
            </div>
            <div className="glass-card p-4 text-center">
              <span className="text-xs uppercase tracking-widest text-white/50">Likely Score</span>
              <p className="font-display text-4xl gold-gradient-text mt-1">{insight.likely_score}</p>
              <p className="text-sm text-white/70">{insight.predicted_winner}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="glass-card p-3">
                <span className="text-[10px] uppercase tracking-widest text-white/50">Key Player</span>
                <p className="font-bold">{insight.key_player_home}</p>
                <p className="text-xs text-white/50">{match.home_team?.name}</p>
              </div>
              <div className="glass-card p-3">
                <span className="text-[10px] uppercase tracking-widest text-white/50">Key Player</span>
                <p className="font-bold">{insight.key_player_away}</p>
                <p className="text-xs text-white/50">{match.away_team?.name}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-white/70">
              <p><span className="font-bold text-white">Head-to-Head: </span>{insight.head_to_head}</p>
              <p><span className="font-bold text-white">Recent Form: </span>{insight.recent_form}</p>
              <p><span className="font-bold text-white">Tactical: </span>{insight.tactical_analysis}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
