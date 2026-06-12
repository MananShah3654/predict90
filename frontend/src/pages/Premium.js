import { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Gem, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

const PREMIUM_BG = "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?q=80&w=2000&auto=format&fit=crop";

export default function Premium() {
  const { user, setUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [buying, setBuying] = useState("");

  useEffect(() => {
    api.get("/premium/plans").then(({ data }) => setPlans(data));
  }, []);

  const purchase = async (planId) => {
    setBuying(planId);
    try {
      const { data } = await api.post("/premium/purchase", { plan_id: planId });
      setUser(data);
      toast.success("Premium activated! Welcome to the elite. 👑");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setBuying("");
    }
  };

  return (
    <div className="relative min-h-screen pb-24">
      <img src={PREMIUM_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0B10]/70 to-[#0A0B10]" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12" data-testid="premium-page">
        <div className="text-center mb-12">
          <Gem size={36} className="mx-auto text-[#FFD700] mb-4" />
          <h1 className="font-display text-4xl sm:text-6xl tracking-wide">
            PREMIUM <span className="gold-gradient-text">PASS</span>
          </h1>
          <p className="text-white/60 mt-3 max-w-md mx-auto">
            Unlock AI match insights, premium leagues and your exclusive premium badge.
          </p>
          {user?.is_premium && (
            <span data-testid="premium-active-badge" className="inline-flex items-center gap-2 mt-4 bg-[#FFD700]/15 text-[#FFD700] font-bold px-5 py-2 rounded-full text-sm">
              <Sparkles size={14} /> Premium Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map((p, i) => (
            <div
              key={p.id}
              data-testid={`plan-card-${p.id}`}
              className={`glass-card p-7 fade-up ${i === 1 ? "border-[#FFD700]/50 shadow-[0_0_40px_rgba(255,215,0,0.1)]" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {i === 1 && <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FFD700] text-black px-3 py-1 rounded-full">Best Value</span>}
              <h3 className="font-display text-2xl tracking-wide mt-3">{p.name.toUpperCase()}</h3>
              <p className="mt-2">
                <span className="font-display text-5xl gold-text">₹{p.price}</span>
                <span className="text-white/40 text-sm"> / {p.period}</span>
              </p>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <Check size={14} className="text-[#FFD700] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                data-testid={`buy-plan-${p.id}`}
                onClick={() => purchase(p.id)}
                disabled={user?.is_premium || buying === p.id}
                className="btn-gold w-full py-3 mt-6 text-sm disabled:opacity-50"
              >
                {user?.is_premium ? "Already Premium" : buying === p.id ? "Activating..." : "Get Premium"}
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-white/30 mt-8">Demo mode: payments are instant & free. Razorpay/Stripe integration coming soon.</p>
      </div>
    </div>
  );
}
