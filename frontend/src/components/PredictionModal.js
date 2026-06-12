import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";

const ScoreStepper = ({ label, value, onChange, testId }) => (
  <div className="flex flex-col items-center gap-2">
    <span className="text-xs font-bold uppercase tracking-wider text-white/60 text-center">{label}</span>
    <div className="flex items-center gap-3">
      <button
        data-testid={`${testId}-minus`}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
      >
        <Minus size={16} />
      </button>
      <span data-testid={`${testId}-value`} className="font-display text-5xl w-12 text-center gold-text">{value}</span>
      <button
        data-testid={`${testId}-plus`}
        onClick={() => onChange(Math.min(20, value + 1))}
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>
);

export const PredictionModal = ({ match, prediction, open, onClose, onSaved }) => {
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setHome(prediction?.home_score ?? 0);
      setAway(prediction?.away_score ?? 0);
    }
  }, [open, prediction]);

  if (!match) return null;

  const outcome = home > away ? "home" : away > home ? "away" : "draw";
  const outcomeLabel =
    outcome === "draw" ? "Draw" : outcome === "home" ? match.home_team?.name : match.away_team?.name;

  const submit = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/predictions", {
        match_id: match.id,
        predicted_winner: outcome,
        home_score: home,
        away_score: away,
      });
      toast.success("Prediction locked in! 🔥");
      onSaved(data);
      onClose();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#11141D] border-white/10 text-white max-w-md" data-testid="prediction-modal">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide text-center">
            PREDICT THE SCORE
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="flex flex-col items-center gap-3">
            <img src={match.home_team?.flag_url} alt="" className="w-14 h-9 object-cover rounded shadow" />
            <ScoreStepper label={match.home_team?.name} value={home} onChange={setHome} testId="home-score" />
          </div>
          <span className="font-display text-3xl text-white/30 mt-10">:</span>
          <div className="flex flex-col items-center gap-3">
            <img src={match.away_team?.flag_url} alt="" className="w-14 h-9 object-cover rounded shadow" />
            <ScoreStepper label={match.away_team?.name} value={away} onChange={setAway} testId="away-score" />
          </div>
        </div>
        <div className="text-center text-sm text-white/60">
          Your pick: <span className="font-bold text-[#FFD700]" data-testid="predicted-outcome">{outcomeLabel}</span>
          <span className="block text-xs mt-1 text-white/40">
            Exact score = 10 pts · Correct outcome = 3 pts
          </span>
        </div>
        <button
          data-testid="submit-prediction-btn"
          onClick={submit}
          disabled={saving}
          className="btn-gold w-full py-3 mt-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Lock In Prediction"}
        </button>
      </DialogContent>
    </Dialog>
  );
};
