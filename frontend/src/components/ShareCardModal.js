import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, Copy, Trophy } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { useAuth } from "@/context/AuthContext";

const STADIUM_BG = "https://images.unsplash.com/photo-1614632537197-38a470542116?q=80&w=1200&auto=format&fit=crop";

export const ShareCardModal = ({ match, prediction, open, onClose, inviteCode }) => {
  const { user } = useAuth();
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  if (!match || !prediction) return null;

  const isScored = prediction.status !== "pending";
  const isWin = prediction.status === "exact" || prediction.status === "correct";
  const winnerName =
    prediction.predicted_winner === "draw"
      ? "Draw"
      : prediction.predicted_winner === "home"
      ? match.home_team?.name
      : match.away_team?.name;

  const shareText = isScored
    ? `FINAL WHISTLE! ${match.home_team?.name} ${match.home_score}-${match.away_score} ${match.away_team?.name}. I ${
        isWin ? `scored +${prediction.points_earned} points` : "got it wrong this time"
      } on Predict90! Can you beat me? ${window.location.origin}${inviteCode ? ` Join my league with code ${inviteCode}` : ""}`
    : `I predicted ${match.home_team?.name} ${prediction.home_score}-${prediction.away_score} ${match.away_team?.name} on Predict90! Can you beat me? ${window.location.origin}${inviteCode ? ` Join my league with code ${inviteCode}` : ""}`;

  const download = async () => {
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { useCORS: true, backgroundColor: "#0A0B10", scale: 2 });
      const link = document.createElement("a");
      link.download = "predict90-card.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Card downloaded!");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(shareText);
    toast.success("Copied to clipboard!");
  };

  const shareLinks = [
    { name: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(shareText)}`, color: "bg-[#25D366]" },
    { name: "X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, color: "bg-black border border-white/20" },
    { name: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`, color: "bg-[#0088cc]" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#11141D] border-white/10 text-white max-w-md p-4" data-testid="share-card-modal">
        <DialogTitle className="sr-only">Share your prediction</DialogTitle>
        <div
          ref={cardRef}
          className="relative rounded-3xl overflow-hidden border border-[#FFD700]/30"
          data-testid="share-card"
        >
          <img src={STADIUM_BG} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/75" />
          <div className="relative p-7 flex flex-col items-center text-center">
            <span className="font-display text-sm tracking-[0.3em] text-[#FFD700]">
              {isScored ? "FINAL WHISTLE" : `${(user?.name || "FAN").toUpperCase()} PREDICTED`}
            </span>
            <div className="flex items-center justify-center gap-5 mt-5">
              <div className="flex flex-col items-center gap-2 w-20">
                <img src={match.home_team?.flag_url} crossOrigin="anonymous" alt="" className="w-12 h-8 object-cover rounded" />
                <span className="text-xs font-bold">{match.home_team?.name}</span>
              </div>
              <span className="font-display text-5xl gold-gradient-text">
                {isScored
                  ? `${match.home_score} - ${match.away_score}`
                  : `${prediction.home_score} - ${prediction.away_score}`}
              </span>
              <div className="flex flex-col items-center gap-2 w-20">
                <img src={match.away_team?.flag_url} crossOrigin="anonymous" alt="" className="w-12 h-8 object-cover rounded" />
                <span className="text-xs font-bold">{match.away_team?.name}</span>
              </div>
            </div>
            {isScored ? (
              <div className="mt-5">
                {isWin ? (
                  <>
                    <span className="flex items-center justify-center gap-2 text-[#FFD700] font-display text-2xl tracking-wide">
                      <Trophy size={20} /> {prediction.status === "exact" ? "PERFECT PREDICTION" : "CORRECT CALL"}
                    </span>
                    <span className="block mt-1 text-white/80 font-bold">{user?.name} · +{prediction.points_earned} points</span>
                  </>
                ) : (
                  <span className="text-white/60 font-bold">My pick: {prediction.home_score}-{prediction.away_score} · Better luck next match!</span>
                )}
              </div>
            ) : (
              <div className="mt-5">
                <span className="text-white/70 text-sm">Winner: <span className="text-[#FFD700] font-bold">{winnerName}</span></span>
                <span className="block mt-2 font-display text-xl tracking-wider">CAN YOU BEAT ME?</span>
              </div>
            )}
            {inviteCode && (
              <span className="mt-4 text-xs bg-white/10 border border-white/20 rounded-full px-4 py-1.5 font-bold tracking-widest">
                JOIN MY LEAGUE · CODE: {inviteCode}
              </span>
            )}
            <span className="mt-4 font-display text-sm tracking-widest text-white/50">
              PREDICT<span className="text-[#FFD700]">90</span> · WORLD CUP PREDICTOR
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          {shareLinks.map((s) => (
            <a
              key={s.name}
              data-testid={`share-${s.name.toLowerCase()}`}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.color} text-white text-xs font-bold py-2.5 rounded-full text-center hover:opacity-90`}
            >
              {s.name}
            </a>
          ))}
        </div>
        <div className="flex gap-2">
          <button data-testid="download-card-btn" onClick={download} disabled={downloading} className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Download size={14} /> {downloading ? "Generating..." : "Download Image"}
          </button>
          <button data-testid="copy-share-text-btn" onClick={copyText} className="btn-ghost-light px-4 py-2.5 text-sm flex items-center gap-1.5">
            <Copy size={14} /> Copy
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
