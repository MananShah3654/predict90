import { MapPin, Lock, Share2, BarChart3, CircleCheck, CircleX, Target } from "lucide-react";

export function kickoffLabel(kickoff) {
  const d = new Date(kickoff);
  const diff = d - new Date();
  if (diff <= 0) return "Locked";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

const statusChip = {
  exact: { label: "Perfect Score", cls: "bg-[#FFD700]/15 text-[#FFD700]", Icon: Target },
  correct: { label: "Correct", cls: "bg-green-500/15 text-green-400", Icon: CircleCheck },
  wrong: { label: "Missed", cls: "bg-red-500/15 text-red-400", Icon: CircleX },
  pending: { label: "Locked In", cls: "bg-white/10 text-white/70", Icon: Lock },
};

const TeamSide = ({ team }) => (
  <div className="flex flex-col items-center gap-2 w-24">
    <img src={team?.flag_url} alt={team?.name} className="w-12 h-8 object-cover rounded shadow-md" />
    <span className="text-sm font-bold text-center leading-tight">{team?.name}</span>
  </div>
);

export const MatchCard = ({ match, prediction, user, onPredict, onShare, onSplit }) => {
  const isFinished = match.status === "finished";
  const kickoff = new Date(match.kickoff);
  const isLocked = !isFinished && kickoff <= new Date();
  const chip = prediction ? statusChip[prediction.status] : null;

  return (
    <div data-testid={`match-card-${match.id}`} className="glass-card glass-card-hover p-6 fade-up">
      <div className="flex items-center justify-between mb-4 text-xs text-white/50 font-semibold uppercase tracking-wider">
        <span>{match.stage}</span>
        <span className="flex items-center gap-1"><MapPin size={12} /> {match.venue}</span>
      </div>

      <div className="flex items-center justify-between">
        <TeamSide team={match.home_team} />
        <div className="flex flex-col items-center gap-1">
          {isFinished ? (
            <span className="font-display text-4xl tracking-wider" data-testid={`match-score-${match.id}`}>
              {match.home_score} - {match.away_score}
            </span>
          ) : (
            <>
              <span className="font-display text-3xl text-white/40">VS</span>
              <span className="text-[11px] text-white/50">
                {kickoff.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
                {kickoff.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-[11px] font-bold text-[#FFD700]">{kickoffLabel(match.kickoff)}</span>
            </>
          )}
          {isFinished && <span className="text-[10px] uppercase tracking-widest text-white/40">Full Time</span>}
        </div>
        <TeamSide team={match.away_team} />
      </div>

      {prediction && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-black/30 border border-white/10 px-4 py-2.5">
          <span className="text-sm text-white/70">
            Your pick: <span className="font-bold text-white">{prediction.home_score} - {prediction.away_score}</span>
          </span>
          {chip && (
            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${chip.cls}`}>
              <chip.Icon size={12} /> {chip.label}
              {prediction.points_earned > 0 && ` +${prediction.points_earned}`}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!isFinished && !isLocked && (
          <button
            data-testid={`predict-btn-${match.id}`}
            onClick={() => onPredict(match)}
            className="btn-gold flex-1 py-2.5 text-sm"
          >
            {prediction ? "Edit Prediction" : "Predict Now"}
          </button>
        )}
        {isLocked && (
          <span data-testid={`locked-${match.id}`} className="flex-1 py-2.5 text-sm rounded-full bg-white/5 text-white/40 font-semibold flex items-center justify-center gap-1.5">
            <Lock size={13} /> Predictions Closed
          </span>
        )}
        {prediction && (
          <button
            data-testid={`share-btn-${match.id}`}
            onClick={() => onShare(match, prediction)}
            className="btn-ghost-light px-4 py-2.5 text-sm flex items-center gap-1.5"
          >
            <Share2 size={14} /> Share
          </button>
        )}
        {onSplit && (
          <button
            data-testid={`split-btn-${match.id}`}
            onClick={() => onSplit(match)}
            className="btn-ghost-light px-4 py-2.5 text-sm flex items-center gap-1.5"
          >
            <BarChart3 size={14} /> Split
          </button>
        )}
      </div>
    </div>
  );
};
