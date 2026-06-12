import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import WCLogo from "@/components/WCLogo";
import {
  Trophy, Crown, Goal, Hand, Flag, Users, ChevronRight, Gamepad2, Sparkles,
  Target, Share2, BarChart3, Check,
} from "lucide-react";

const HERO_BG = "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2400&auto=format&fit=crop";
const flag = (c) => `https://flagcdn.com/w160/${c}.png`;

/* ---------- visual mockups (so visitors SEE what they get) ---------- */

const FlagCol = ({ code, name }) => (
  <div className="flex flex-col items-center gap-1.5 w-20">
    <img src={flag(code)} alt={name} className="w-12 h-8 object-cover rounded shadow ring-1 ring-white/20" />
    <span className="text-xs font-bold text-center">{name}</span>
  </div>
);

const MatchMock = () => (
  <div className="glass-card p-5 w-full max-w-sm mx-auto shadow-2xl">
    <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider mb-4">
      <span>Group C · MD1</span><span>NRG Stadium</span>
    </div>
    <div className="flex items-center justify-between">
      <FlagCol code="br" name="Brazil" />
      <span className="font-display text-4xl gold-gradient-text">2 - 1</span>
      <FlagCol code="ma" name="Morocco" />
    </div>
    <div className="mt-4 btn-gold w-full py-2.5 text-center text-xs">Lock In Prediction</div>
    <p className="text-center text-[10px] text-white/40 mt-2">Exact score = 10 pts · Correct outcome = 3 pts</p>
  </div>
);

const BracketMock = () => (
  <div className="glass-card p-5 w-full max-w-sm mx-auto shadow-2xl space-y-4">
    <div>
      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Group Leaders</p>
      <div className="flex gap-2">
        {["ar", "fr", "es", "br"].map((c) => (
          <img key={c} src={flag(c)} alt="" className="w-9 h-6 object-cover rounded ring-1 ring-[#FFD700]/40" />
        ))}
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Your Champion</p>
        <div className="flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/40 rounded-lg px-3 py-2">
          <Crown size={14} className="text-[#FFD700]" />
          <img src={flag("ar")} alt="" className="w-8 h-5 object-cover rounded" />
          <span className="text-sm font-bold text-[#FFD700]">Argentina</span>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[["94", "fr", "K. Mbappé", "Golden Boot", Goal], ["90", "ar", "E. Martínez", "Golden Glove", Hand]].map(
        ([r, c, n, role, Icon]) => (
          <div key={n} className="rounded-xl p-3 bg-gradient-to-b from-[#161a26] to-[#0d1018] border border-[#FFD700]/30">
            <div className="flex justify-between items-start">
              <span className="font-display text-2xl gold-gradient-text leading-none">{r}</span>
              <img src={flag(c)} alt="" className="w-7 h-5 object-cover rounded-sm" />
            </div>
            <p className="text-xs font-bold mt-1.5">{n}</p>
            <p className="text-[10px] text-[#FFD700]/80 flex items-center gap-1 mt-0.5"><Icon size={10} /> {role}</p>
          </div>
        )
      )}
    </div>
  </div>
);

const ShareMock = () => (
  <div className="w-full max-w-[260px] mx-auto rounded-2xl overflow-hidden border border-[#FFD700]/30 shadow-2xl"
    style={{ aspectRatio: "4/5", background: "#05060a", position: "relative" }}>
    <img src={HERO_BG} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.35 }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 25%, rgba(255,190,60,.3), transparent 55%), linear-gradient(180deg, rgba(5,6,10,.45), rgba(5,6,10,.85))" }} />
    <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-lg leading-none">PREDICT<span className="text-[#FFD700]">90</span></p>
      <span className="font-display text-xs tracking-[0.25em] text-[#FFD700] mt-3">YOU PREDICT</span>
      <div className="flex items-center justify-between w-full mt-3 px-2">
        <img src={flag("ar")} alt="" className="w-12 h-8 object-cover rounded-md" style={{ border: "2px solid #FFD700" }} />
        <span className="font-display text-3xl">2 - 1</span>
        <img src={flag("br")} alt="" className="w-12 h-8 object-cover rounded-md" style={{ border: "2px solid #FFD700" }} />
      </div>
      <span className="font-display text-xl mt-4">CAN YOU BEAT ME?</span>
      <span className="text-[10px] font-bold tracking-widest text-[#FFD700] mt-3">www.prediction90.com</span>
    </div>
  </div>
);

const LeaderboardMock = () => (
  <div className="glass-card p-5 w-full max-w-sm mx-auto shadow-2xl">
    <p className="font-display text-lg tracking-wide mb-3">GLOBAL LEADERBOARD</p>
    {[["🥇", "Rahul Verma", 142, "ar"], ["🥈", "Sara Khan", 128, "es"], ["🥉", "You", 119, "br"]].map(
      ([m, name, pts, c], i) => (
        <div key={name} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 ${i === 2 ? "bg-[#FFD700]/10 border border-[#FFD700]/40" : "bg-black/30"}`}>
          <span className="text-lg w-6 text-center">{m}</span>
          <img src={flag(c)} alt="" className="w-8 h-5 object-cover rounded" />
          <span className="flex-1 text-sm font-bold">{name}</span>
          <span className="font-display text-xl gold-text">{pts}</span>
        </div>
      )
    )}
  </div>
);

/* ---------- feature showcase row ---------- */

const Showcase = ({ eyebrow, icon: Icon, title, desc, bullets, mock, reverse }) => (
  <div className={`grid lg:grid-cols-2 gap-10 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
    <div>
      <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-[#FFD700]">
        <Icon size={15} /> {eyebrow}
      </span>
      <h3 className="font-display text-3xl sm:text-4xl tracking-wide mt-3">{title}</h3>
      <p className="text-white/65 mt-3 leading-relaxed">{desc}</p>
      <ul className="mt-5 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-white/75">
            <Check size={16} className="text-[#FFD700] mt-0.5 shrink-0" /> {b}
          </li>
        ))}
      </ul>
    </div>
    <div>{mock}</div>
  </div>
);

const features = [
  { icon: Flag, title: "Group Leaders", desc: "Call the team that tops each of the 12 real WC26 groups." },
  { icon: Trophy, title: "The Knockouts", desc: "Predict every quarter-finalist, semi-finalist and finalist." },
  { icon: Crown, title: "World Champions", desc: "Plant your flag on the nation you believe lifts the trophy." },
  { icon: Goal, title: "Golden Boot", desc: "Pick the tournament's top scorer from the deadliest forwards." },
  { icon: Hand, title: "Golden Glove", desc: "Back the keeper who keeps the cleanest sheets." },
  { icon: Users, title: "Private Leagues", desc: "Create a league, share a code, and battle your friends." },
];

const steps = [
  { n: "01", t: "Sign Up Free", d: "Email or one-tap Google" },
  { n: "02", t: "Predict & Build", d: "Matches + your full bracket" },
  { n: "03", t: "Share Cards", d: "Flex your picks everywhere" },
  { n: "04", t: "Win a PS5", d: "Top the leaderboard" },
];

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative min-h-[94vh] flex flex-col">
        <img src={HERO_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-[#0A0B10]/85 to-[#0A0B10]" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-[#FFD700]/10 blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WCLogo variant="mark" className="h-10 w-auto" />
            <span className="font-display text-2xl tracking-wide">PREDICT<span className="gold-text">90</span></span>
          </div>
          <Link to="/auth" data-testid="landing-login-btn" className="btn-ghost-light px-5 py-2 text-sm">Log In</Link>
        </header>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pb-16">
          <WCLogo variant="full" className="h-28 sm:h-36 w-auto mb-6 fade-up drop-shadow-[0_8px_30px_rgba(255,215,0,0.25)]" />
          <Link to="/auth" className="fade-up mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white border border-[#FFD700]/40 hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(90deg,rgba(255,215,0,.18),rgba(124,58,237,.25))", boxShadow: "0 0 30px rgba(255,215,0,.25)" }}>
            <Gamepad2 size={16} className="text-[#FFD700]" /> #1 PREDICTOR WINS A <span className="gold-text">PLAYSTATION 5</span> 🎮
          </Link>
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#FFD700] mb-4 fade-up">FIFA World Cup 26™ · Canada · Mexico · USA</span>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.92] fade-up" style={{ animationDelay: "0.1s" }}>
            FEEL THE <span className="gold-gradient-text">FOOTBALL FEVER.</span><br />
            PREDICT THE WHOLE CUP.
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/70 max-w-2xl fade-up" style={{ animationDelay: "0.2s" }}>
            48 nations. 12 groups. One champion. Predict every match, build your bracket, share viral
            cards, and climb the leaderboard — free.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/auth" data-testid="cta-predict-now" className="btn-gold px-8 py-4 text-sm">Start Predicting — Free</Link>
            <a href="#how" className="btn-ghost-light px-6 py-4 text-sm">See How It Works</a>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 sm:gap-16 fade-up" style={{ animationDelay: "0.4s" }}>
            {[["48", "Nations"], ["72", "Fixtures"], ["1", "PS5 Prize"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="font-display text-4xl sm:text-5xl gold-text">{v}</p>
                <p className="text-xs uppercase tracking-widest text-white/50">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PS5 grand prize (real image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="relative overflow-hidden rounded-3xl border border-[#FFD700]/30 p-8 sm:p-10"
          style={{ background: "linear-gradient(120deg,#1a1030,#0c1230 55%,#0a0b10)" }}>
          <div className="absolute -top-16 -left-10 w-72 h-72 rounded-full bg-[#7c3aed]/30 blur-3xl" />
          <div className="absolute -bottom-16 -right-10 w-72 h-72 rounded-full bg-[#FFD700]/20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-[#FFD700]">
                <Sparkles size={14} /> Grand Prize Giveaway
              </span>
              <h2 className="font-display text-4xl sm:text-6xl tracking-wide mt-3 leading-[0.95]">
                PREDICT &amp; WIN A<br /><span className="gold-gradient-text">PLAYSTATION 5</span>
              </h2>
              <p className="text-white/70 mt-4 max-w-lg">
                The fan sitting #1 on the global leaderboard when the final whistle blows in New York
                takes home a brand-new <b className="text-white">PS5 console</b>. Every correct prediction
                climbs you closer. It's 100% free to play.
              </p>
              <Link to="/auth" data-testid="cta-ps5" className="btn-gold px-8 py-4 text-sm inline-flex items-center gap-2 mt-7">
                <Gamepad2 size={16} /> Enter the Race — Free
              </Link>
            </div>
            <div className="shrink-0 relative">
              <div className="absolute inset-0 rounded-full bg-[#FFD700]/15 blur-3xl scale-90" />
              <img src="/ps5.png" alt="PlayStation 5 console" className="relative w-60 sm:w-72 h-auto drop-shadow-[0_20px_50px_rgba(124,58,237,0.5)]" />
              <span className="absolute top-2 right-0 bg-[#FFD700] text-black text-[11px] font-black px-3 py-1 rounded-full rotate-6 shadow-lg">WIN IT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24">
        <div className="text-center">
          <h2 className="font-display text-4xl sm:text-5xl tracking-wide">EVERYTHING YOU CAN <span className="gold-text">DO</span></h2>
          <p className="text-white/55 mt-3 max-w-xl mx-auto">A complete World Cup game — predict, compete, share, and win. Here's what's inside.</p>
        </div>

        <Showcase
          eyebrow="Match Predictor" icon={Target}
          title="Predict every match"
          desc="Call the exact scoreline on all 72 group-stage fixtures. The closer you are, the more you score — and it all updates automatically as the real results come in."
          bullets={["Exact score = 10 pts, correct result = 3 pts", "All 48 real teams & official groups", "See how the community voted on each game"]}
          mock={<MatchMock />}
        />

        <Showcase
          reverse
          eyebrow="Tournament Bracket" icon={Trophy}
          title="Build your full bracket"
          desc="Go beyond single matches — predict who tops each group, who reaches the knockouts, your champion, plus the Golden Boot and Golden Glove with FIFA-style player cards."
          bullets={["Group leaders → quarters → semis → final", "Pick the champion who lifts the trophy", "Golden Boot & Golden Glove player cards"]}
          mock={<BracketMock />}
        />

        <Showcase
          eyebrow="Viral Share Cards" icon={Share2}
          title="Flex your picks everywhere"
          desc="Every prediction turns into a gorgeous, gold-lit share card — Post or Instagram-Story format — ready for WhatsApp, X, Facebook, Telegram and Instagram in one tap."
          bullets={["Before-match, result & league-winner cards", "Post (4:5) and Story (9:16) formats", "Challenge friends: “Can you beat me?”"]}
          mock={<ShareMock />}
        />

        <Showcase
          reverse
          eyebrow="Leaderboards & Leagues" icon={BarChart3}
          title="Climb the table, beat your friends"
          desc="Rank up on the global, country and private-league leaderboards. Create a league, share an invite code, and see who really knows football."
          bullets={["Global, country & league rankings", "Private leagues with invite codes", "The #1 predictor wins the PS5"]}
          mock={<LeaderboardMock />}
        />
      </section>

      {/* Compact feature grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="glass-card glass-card-hover p-5">
              <f.icon className="text-[#FFD700] mb-3" size={22} />
              <h3 className="font-display text-lg tracking-wide mb-1">{f.title.toUpperCase()}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-display text-3xl sm:text-4xl text-center mb-12">HOW IT <span className="gold-text">WORKS</span></h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <span className="font-display text-5xl text-white/15">{s.n}</span>
              <h3 className="font-bold mt-2">{s.t}</h3>
              <p className="text-sm text-white/50 mt-1">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-14">
          <Link to="/auth" data-testid="cta-bottom-signup" className="btn-gold px-10 py-4 text-sm inline-flex items-center gap-2">
            Create Free Account <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        PREDICT<span className="gold-text">90</span> · The Social FIFA World Cup 26™ Prediction Network · <span className="text-[#FFD700]">www.prediction90.com</span>
      </footer>
    </div>
  );
}
