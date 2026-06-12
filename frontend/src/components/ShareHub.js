import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, Copy, Share2, Trophy, Crown, Target, Flame, Square, Smartphone } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { useAuth } from "@/context/AuthContext";
import WCLogo from "@/components/WCLogo";

const STADIUM_BG = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1400&auto=format&fit=crop";
const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

/* ---------- decorative bits ---------- */

const Confetti = () => (
  <>
    {[
      ["6%", "8%", "#FFD700", 8], ["88%", "6%", "#22c55e", 7], ["12%", "78%", "#22c55e", 6],
      ["92%", "82%", "#FFD700", 9], ["50%", "3%", "#fff", 5], ["80%", "40%", "#FFD700", 6],
      ["18%", "30%", "#fff", 5], ["70%", "70%", "#22c55e", 6],
    ].map(([l, t, c, s], i) => (
      <span key={i} className="absolute rounded-sm"
        style={{ left: l, top: t, width: s, height: s, background: c, opacity: 0.7, transform: `rotate(${i * 33}deg)` }} />
    ))}
  </>
);

const Flag = ({ team, big }) => (
  <div className="flex flex-col items-center gap-2" style={{ width: big ? 92 : 76 }}>
    <img src={team?.flag_url} crossOrigin="anonymous" alt=""
      className="object-cover rounded-md"
      style={{ width: big ? 72 : 56, height: big ? 48 : 38, boxShadow: "0 6px 18px rgba(0,0,0,.5)", border: "2px solid rgba(255,255,255,.25)" }} />
    <span className="font-bold text-center leading-tight" style={{ fontSize: big ? 14 : 12 }}>{team?.name}</span>
  </div>
);

const ScoreBig = ({ children }) => (
  <span className="font-display gold-gradient-text whitespace-nowrap"
    style={{ fontSize: 64, lineHeight: 1, filter: "drop-shadow(0 4px 24px rgba(255,215,0,.45))" }}>{children}</span>
);

const GoldPill = ({ children }) => (
  <span className="font-display tracking-wide text-black px-5 py-1.5 rounded-full mt-3 inline-block"
    style={{ background: "linear-gradient(135deg,#FFF3B0,#FFD700,#D4AF37)", boxShadow: "0 8px 24px rgba(255,215,0,.4)", fontSize: 22 }}>
    {children}
  </span>
);

const Eyebrow = ({ children }) => (
  <span className="font-display tracking-[0.3em] text-[#FFD700]" style={{ fontSize: 14 }}>{children}</span>
);

function Bar({ label, count, total, gold }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/85 font-bold">{label}</span>
        <span className={gold ? "text-[#FFD700] font-black" : "text-white/60 font-semibold"}>{count} · {pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: gold ? "linear-gradient(90deg,#D4AF37,#FFD700)" : "rgba(255,255,255,.3)" }} />
      </div>
    </div>
  );
}

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl py-3 px-1" style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.12)" }}>
    <Icon size={16} className="text-[#FFD700] mx-auto" />
    <p className="font-display text-3xl mt-1 leading-none">{value}</p>
    <p className="text-[10px] uppercase tracking-wider text-white/45 mt-1">{label}</p>
  </div>
);

const InviteChip = ({ code }) => (
  <span className="mt-4 text-xs rounded-full px-4 py-1.5 font-black tracking-widest"
    style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,215,0,.4)", color: "#FFD700" }}>
    JOIN MY LEAGUE · {code}
  </span>
);

/* ---------- card bodies ---------- */

function CardBody({ type, payload, user }) {
  const name = user?.name || "Fan";

  if (type === "prediction") {
    const { match, prediction, inviteCode } = payload;
    const w = prediction.predicted_winner === "draw" ? "Draw" : prediction.predicted_winner === "home" ? match.home_team?.name : match.away_team?.name;
    return (
      <>
        <Eyebrow>{name.toUpperCase()} PREDICTS</Eyebrow>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Flag team={match.home_team} big /><ScoreBig>{prediction.home_score} - {prediction.away_score}</ScoreBig><Flag team={match.away_team} big />
        </div>
        <span className="mt-5 text-white/80 text-sm">My winner: <b className="text-[#FFD700]">{w}</b></span>
        <span className="block mt-3 font-display text-3xl tracking-wider">CAN YOU BEAT ME? 🔥</span>
        {inviteCode && <InviteChip code={inviteCode} />}
      </>
    );
  }

  if (type === "result") {
    const { match, prediction } = payload;
    const win = prediction.status === "exact" || prediction.status === "correct";
    return (
      <>
        <Eyebrow>{win ? "🎯 NAILED IT" : "FINAL WHISTLE"}</Eyebrow>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Flag team={match.home_team} big /><ScoreBig>{match.home_score} - {match.away_score}</ScoreBig><Flag team={match.away_team} big />
        </div>
        <span className="mt-5 font-display text-2xl tracking-wide flex items-center gap-2 text-[#FFD700]">
          <Trophy size={22} /> {prediction.status === "exact" ? "PERFECT PREDICTION" : win ? "CORRECT CALL" : "SO CLOSE!"}
        </span>
        <span className="mt-1 text-white/85 font-bold">{name}</span>
        <GoldPill>{win ? `+${prediction.points_earned} POINTS` : "BETTER LUCK NEXT TIME"}</GoldPill>
      </>
    );
  }

  if (type === "group") {
    const { match, counts } = payload;
    const total = counts.home + counts.draw + counts.away;
    const top = Math.max(counts.home, counts.draw, counts.away);
    const popular = top === counts.home ? match.home_team?.name : top === counts.away ? match.away_team?.name : "Draw";
    return (
      <>
        <Eyebrow>THE FANS HAVE SPOKEN</Eyebrow>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Flag team={match.home_team} /><span className="font-display text-2xl text-white/40">VS</span><Flag team={match.away_team} />
        </div>
        <div className="w-full space-y-3 mt-5">
          <Bar label={match.home_team?.name} count={counts.home} total={total} gold={popular === match.home_team?.name} />
          <Bar label="Draw" count={counts.draw} total={total} gold={popular === "Draw"} />
          <Bar label={match.away_team?.name} count={counts.away} total={total} gold={popular === match.away_team?.name} />
        </div>
        <span className="mt-4 text-sm text-white/80">Most backed: <b className="text-[#FFD700]">{popular}</b> · {total} fans</span>
      </>
    );
  }

  if (type === "league") {
    const { league, winner } = payload;
    return (
      <>
        <Eyebrow>{(league?.name || "MY LEAGUE").toUpperCase()}</Eyebrow>
        <Crown size={46} className="text-[#FFD700] mt-5" style={{ filter: "drop-shadow(0 6px 20px rgba(255,215,0,.5))" }} />
        <span className="mt-3 text-white/55 text-xs uppercase tracking-widest">League Leader</span>
        <span className="font-display text-4xl tracking-wide gold-gradient-text">{winner?.name || "You"}</span>
        <GoldPill>{winner?.points ?? 0} POINTS</GoldPill>
        {league?.invite_code && <InviteChip code={league.invite_code} />}
      </>
    );
  }

  if (type === "leaderboard") {
    const { rows, title } = payload;
    const medals = ["🥇", "🥈", "🥉"];
    return (
      <>
        <Eyebrow>{title || "TOP PREDICTORS"}</Eyebrow>
        <div className="w-full mt-5 space-y-2.5">
          {rows.slice(0, 3).map((r, i) => (
            <div key={r.user_id || i} className="flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: i === 0 ? "linear-gradient(90deg,rgba(255,215,0,.22),rgba(255,215,0,.04))" : "rgba(0,0,0,.35)", border: `1px solid ${i === 0 ? "rgba(255,215,0,.5)" : "rgba(255,255,255,.1)"}` }}>
              <span className="flex items-center gap-2.5 font-bold"><span style={{ fontSize: 22 }}>{medals[i]}</span> {r.name}</span>
              <span className="font-display text-3xl gold-text leading-none">{r.points}</span>
            </div>
          ))}
        </div>
        <span className="block mt-4 font-display text-2xl tracking-wider">CAN YOU BEAT THEM? ⚽</span>
      </>
    );
  }

  if (type === "achievement") {
    const { stats } = payload;
    const s = stats || user;
    return (
      <>
        <Eyebrow>MY WORLD CUP RUN</Eyebrow>
        <div className="flex items-center gap-3 mt-5">
          <img src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a1f2e&textColor=FFD700`}
            crossOrigin="anonymous" referrerPolicy="no-referrer" alt=""
            className="w-16 h-16 rounded-2xl object-cover" style={{ border: "2px solid #FFD700" }} />
          <div className="text-left">
            <p className="font-display text-3xl tracking-wide leading-none">{name}</p>
            <p className="text-white/50 text-xs mt-1">@{user?.username} · Level {s?.level}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full mt-6">
          <Stat icon={Trophy} label="Points" value={s?.points ?? 0} />
          <Stat icon={Target} label="Accuracy" value={`${s?.accuracy ?? 0}%`} />
          <Stat icon={Flame} label="Best Streak" value={s?.best_streak ?? 0} />
        </div>
      </>
    );
  }
  return null;
}

/* ---------- share text ---------- */

function buildShareText(type, payload, user) {
  const name = user?.name || "I";
  const m = payload.match;
  switch (type) {
    case "prediction": return `${name} predicted ${m.home_team?.name} ${payload.prediction.home_score}-${payload.prediction.away_score} ${m.away_team?.name} for the World Cup on Predict90! Can you beat me? ${ORIGIN}${payload.inviteCode ? ` Join my league: ${payload.inviteCode}` : ""}`;
    case "result": { const win = payload.prediction.status === "exact" || payload.prediction.status === "correct"; return `FINAL WHISTLE! ${m.home_team?.name} ${m.home_score}-${m.away_score} ${m.away_team?.name}. ${win ? `I scored +${payload.prediction.points_earned} pts 🎯` : "I missed this one 😅"} on Predict90! ${ORIGIN}`; }
    case "group": { const t = payload.counts.home + payload.counts.draw + payload.counts.away; return `${t} fans predicted ${m.home_team?.name} vs ${m.away_team?.name} on Predict90. Where do you stand? ${ORIGIN}`; }
    case "league": return `${payload.winner?.name || name} is topping ${payload.league?.name} on Predict90! ${payload.league?.invite_code ? `Join with code ${payload.league.invite_code}. ` : ""}${ORIGIN}`;
    case "leaderboard": return `🏆 Top predictors on Predict90: ${payload.rows.slice(0, 3).map((r, i) => `#${i + 1} ${r.name} (${r.points})`).join(", ")}. Can you beat them? ${ORIGIN}`;
    case "achievement": return `My Predict90 World Cup run: ${user?.points} pts · ${user?.accuracy}% accuracy · Level ${user?.level} ⚽🏆 Catch me if you can! ${ORIGIN}`;
    default: return ORIGIN;
  }
}

/* ---------- modal ---------- */

export default function ShareHub({ open, onClose, type, payload }) {
  const { user } = useAuth();
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [format, setFormat] = useState("post"); // post 4:5 | story 9:16
  if (!open || !type || !payload) return null;

  const shareText = buildShareText(type, payload, user);
  const makeCanvas = () => html2canvas(cardRef.current, { useCORS: true, backgroundColor: "#05060a", scale: 2.5 });

  const download = async () => {
    setDownloading(true);
    try {
      const canvas = await makeCanvas();
      const link = document.createElement("a");
      link.download = `predict90-${type}-${format}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success(format === "story" ? "Story saved — post it to Instagram! 🎉" : "Card saved! 🎉");
    } catch { toast.error("Download failed"); }
    finally { setDownloading(false); }
  };

  const nativeShare = async () => {
    try {
      if (navigator.share && navigator.canShare) {
        const canvas = await makeCanvas();
        const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
        const file = new File([blob], "predict90.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ text: shareText, files: [file] }); return; }
      }
      if (navigator.share) { await navigator.share({ text: shareText, url: ORIGIN }); return; }
      navigator.clipboard.writeText(shareText); toast.success("Copied — paste anywhere!");
    } catch {}
  };

  const platforms = [
    { name: "WhatsApp", color: "#25D366", url: `https://wa.me/?text=${encodeURIComponent(shareText)}` },
    { name: "X", color: "#000", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` },
    { name: "Facebook", color: "#1877F2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ORIGIN)}&quote=${encodeURIComponent(shareText)}` },
    { name: "Telegram", color: "#0088cc", url: `https://t.me/share/url?url=${encodeURIComponent(ORIGIN)}&text=${encodeURIComponent(shareText)}` },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0d0f15] border-white/10 text-white max-w-md p-4 max-h-[92vh] overflow-y-auto" data-testid="share-hub">
        <DialogTitle className="sr-only">Share card</DialogTitle>

        {/* format toggle */}
        <div className="flex justify-center gap-1 bg-white/5 rounded-full p-1 w-fit mx-auto">
          {[["post", Square, "Post"], ["story", Smartphone, "Story"]].map(([f, Icon, label]) => (
            <button key={f} onClick={() => setFormat(f)} data-testid={`format-${f}`}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${format === f ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black" : "text-white/60"}`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* the card */}
        <div className="mx-auto mt-3" style={{ width: format === "story" ? 260 : 320 }}>
          <div ref={cardRef} className="relative overflow-hidden rounded-3xl" data-testid="share-card"
            style={{ aspectRatio: format === "story" ? "9 / 16" : "4 / 5", border: "1px solid rgba(255,215,0,.3)" }}>
            {/* layered background */}
            <img src={STADIUM_BG} crossOrigin="anonymous" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.16 }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 18% 0%, rgba(255,215,0,.28), transparent 45%), radial-gradient(circle at 100% 100%, rgba(16,185,129,.22), transparent 45%), linear-gradient(165deg,#0c0f17,#05060a)" }} />
            <Confetti />
            {/* brand row */}
            <div className="absolute top-4 inset-x-0 flex items-center justify-center gap-2 z-10">
              <WCLogo variant="mark" className="h-7 w-auto" />
              <span className="font-display tracking-wide text-lg">PREDICT<span className="gold-text">90</span></span>
            </div>
            {/* body */}
            <div className="relative h-full w-full flex flex-col items-center justify-center text-center px-6 pt-10 pb-9">
              <CardBody type={type} payload={payload} user={user} />
            </div>
            {/* footer */}
            <span className="absolute bottom-3.5 inset-x-0 text-center font-display tracking-widest text-white/45" style={{ fontSize: 11 }}>
              FIFA WORLD CUP 26™ · PREDICT &amp; WIN
            </span>
          </div>
        </div>

        {/* platforms */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {platforms.map((s) => (
            <a key={s.name} data-testid={`share-${s.name.toLowerCase()}`} href={s.url} target="_blank" rel="noopener noreferrer"
              className="text-white text-[11px] font-bold py-2.5 rounded-full text-center hover:opacity-90"
              style={{ background: s.color, border: s.name === "X" ? "1px solid rgba(255,255,255,.2)" : "none" }}>
              {s.name}
            </a>
          ))}
        </div>

        <div className="flex gap-2">
          <button data-testid="download-card-btn" onClick={download} disabled={downloading}
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Download size={14} /> {downloading ? "Generating…" : format === "story" ? "Save Story" : "Save Image"}
          </button>
          <button data-testid="native-share-btn" onClick={nativeShare} className="btn-ghost-light px-4 py-2.5 text-sm flex items-center"><Share2 size={14} /></button>
          <button data-testid="copy-share-text-btn" onClick={() => { navigator.clipboard.writeText(shareText); toast.success("Copied!"); }}
            className="btn-ghost-light px-4 py-2.5 text-sm flex items-center"><Copy size={14} /></button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
