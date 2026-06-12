import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import WCLogo from "@/components/WCLogo";
import { Trophy, Crown, Goal, Hand, Flag, Users, ChevronRight, Gamepad2, Sparkles } from "lucide-react";

const HERO_BG = "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2400&auto=format&fit=crop";

const features = [
  { icon: Flag, title: "Group Leaders", desc: "Call the team that tops each of the 12 real WC26 groups, drawn in Washington D.C." },
  { icon: Trophy, title: "The Knockouts", desc: "Predict every quarter-finalist, semi-finalist and finalist on the road to MetLife." },
  { icon: Crown, title: "World Champions", desc: "Plant your flag on the one nation you believe lifts the trophy in 2026." },
  { icon: Goal, title: "Golden Boot", desc: "Pick the tournament's top scorer from a deck of the world's deadliest forwards." },
  { icon: Hand, title: "Golden Glove", desc: "Back the keeper who keeps the cleanest sheets with FIFA-style player cards." },
  { icon: Users, title: "Beat Your Friends", desc: "Climb global, country & private-league leaderboards all tournament long." },
];

const steps = [
  { n: "01", t: "Sign Up Free", d: "Create your profile in seconds" },
  { n: "02", t: "Build Your Bracket", d: "Groups → knockouts → champions" },
  { n: "03", t: "Lock It In", d: "Saved straight to your account" },
  { n: "04", t: "Climb the Table", d: "Score as the real results land" },
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
        {/* gold glow accents */}
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
            48 nations. 12 groups. One champion. Build your bracket — group toppers, knockouts,
            the winner, the Golden Boot &amp; the Golden Glove — and prove you called it first.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/auth" data-testid="cta-predict-now" className="btn-gold px-8 py-4 text-sm">Build My Bracket</Link>
            <Link to="/auth" data-testid="cta-view-leaderboard" className="btn-ghost-light px-6 py-4 text-sm">View Leaderboard</Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 sm:gap-16 fade-up" style={{ animationDelay: "0.4s" }}>
            {[["48", "Nations"], ["12", "Groups"], ["1", "Champion"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="font-display text-4xl sm:text-5xl gold-text">{v}</p>
                <p className="text-xs uppercase tracking-widest text-white/50">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PS5 grand prize */}
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
                takes home a brand-new <b className="text-white">PS5 console</b>. Every correct prediction climbs you closer. It's free to play.
              </p>
              <Link to="/auth" data-testid="cta-ps5" className="btn-gold px-8 py-4 text-sm inline-flex items-center gap-2 mt-7">
                <Gamepad2 size={16} /> Enter the Race — Free
              </Link>
            </div>
            <div className="shrink-0">
              <div className="relative grid place-items-center w-56 h-56 rounded-3xl"
                style={{ background: "linear-gradient(160deg,#11141d,#05060a)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 20px 60px rgba(124,58,237,.35)" }}>
                <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,215,0,.18), transparent 60%)" }} />
                <Gamepad2 size={84} className="text-white relative drop-shadow-[0_8px_24px_rgba(124,58,237,.6)]" strokeWidth={1.2} />
                <span className="font-display text-6xl tracking-widest mt-2 relative gold-gradient-text">PS5</span>
                <span className="absolute -top-3 -right-3 bg-[#FFD700] text-black text-[11px] font-black px-3 py-1 rounded-full rotate-6 shadow-lg">WIN IT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-display text-3xl sm:text-4xl text-center mb-12">CALL EVERY <span className="gold-text">MOMENT</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="glass-card glass-card-hover p-6 fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <f.icon className="text-[#FFD700] mb-4" size={26} />
              <h3 className="font-display text-xl tracking-wide mb-2">{f.title.toUpperCase()}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
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
            Start Predicting Free <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        PREDICT<span className="gold-text">90</span> · The Social FIFA World Cup 26™ Prediction Network
      </footer>
    </div>
  );
}
