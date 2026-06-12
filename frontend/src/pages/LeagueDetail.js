import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { avatarUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ShareHub from "@/components/ShareHub";
import { Copy, ArrowLeft, Crown, Trophy, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function LeagueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [league, setLeague] = useState(null);
  const [share, setShare] = useState(false);

  useEffect(() => {
    api.get(`/leagues/${id}`).then(({ data }) => setLeague(data)).catch(() => toast.error("League not found"));
  }, [id]);

  if (!league)
    return <div className="min-h-screen flex items-center justify-center"><span className="font-display text-2xl gold-text animate-pulse">LOADING...</span></div>;

  const copyCode = () => {
    navigator.clipboard.writeText(league.invite_code);
    toast.success("Invite code copied!");
  };

  const shareText = `Join my Predict90 league "${league.name}"! Use invite code ${league.invite_code} at ${window.location.origin} — let's see who knows football best! ⚽🏆`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="league-detail-page">
      <Link to="/leagues" data-testid="back-to-leagues" className="text-sm text-white/50 flex items-center gap-1 mb-4 hover:text-white">
        <ArrowLeft size={14} /> All Leagues
      </Link>

      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFD700]/10 rounded-full blur-3xl" />
        <div className="flex items-start justify-between relative">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-wide">{league.name.toUpperCase()}</h1>
            {league.description && <p className="text-sm text-white/60 mt-1">{league.description}</p>}
            <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
              <Crown size={12} className="text-[#FFD700]" /> Owner: {league.owner_name} · {league.member_count} members
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button data-testid="copy-invite-code-btn" onClick={copyCode} className="btn-ghost-light px-4 py-2 text-sm flex items-center gap-2">
            <Copy size={14} /> Code: <span className="font-bold tracking-widest text-[#FFD700]">{league.invite_code}</span>
          </button>
          <a
            data-testid="share-league-whatsapp"
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost-light px-4 py-2 text-sm flex items-center gap-2"
          >
            <Share2 size={14} /> Invite via WhatsApp
          </a>
          <button data-testid="share-league-card-btn" onClick={() => setShare(true)} className="btn-gold px-4 py-2 text-sm flex items-center gap-2">
            <Crown size={14} /> Share League Card
          </button>
        </div>
      </div>

      <h2 className="font-display text-2xl tracking-wide mb-4">LEAGUE TABLE</h2>
      <div className="space-y-2" data-testid="league-members-list">
        {league.members.map((m) => (
          <div
            key={m.user_id}
            className={`glass-card flex items-center gap-4 px-4 py-3 ${m.user_id === user?.id ? "border-[#FFD700]/50 bg-[#FFD700]/5" : ""}`}
          >
            <span className={`font-display text-2xl w-8 text-center ${m.rank === 1 ? "text-[#FFD700]" : "text-white/50"}`}>
              {m.rank === 1 ? <Trophy size={18} className="inline" /> : `#${m.rank}`}
            </span>
            <img src={avatarUrl(m.username)} alt="" className="w-9 h-9 rounded-full border border-white/15" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{m.name} {m.user_id === user?.id && <span className="text-[#FFD700] text-xs">(You)</span>}</p>
              <p className="text-xs text-white/40">@{m.username}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl gold-text">{m.points}</p>
              <p className="text-[10px] text-white/40">{m.accuracy}% acc</p>
            </div>
          </div>
        ))}
      </div>

      <ShareHub open={share} onClose={() => setShare(false)} type="league"
        payload={{ league, winner: league.members?.[0] }} />
    </div>
  );
}
