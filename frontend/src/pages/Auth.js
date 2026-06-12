import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import GoogleButton from "@/components/GoogleButton";

const HERO_BG = "https://images.unsplash.com/photo-1518605368461-1e1e34cc9415?q=80&w=2400&auto=format&fit=crop";

const inputCls =
  "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/60";

export default function AuthPage() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const onGoogle = async (credential) => {
    setError("");
    try {
      const u = await loginWithGoogle(credential);
      toast.success(`Welcome, ${u.name.split(" ")[0]}! ⚽`);
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || "Google sign-in failed");
    }
  };
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register({ name: form.name, email: form.email, password: form.password, country: form.country });
      }
      toast.success(mode === "login" ? "Welcome back!" : "Welcome to Predict90!");
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ ...form, email, password });

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10">
      <img src={HERO_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#0A0B10]/90" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="block text-center font-display text-3xl tracking-wide mb-8">
          PREDICT<span className="gold-text">90</span>
        </Link>
        <div className="glass-card p-8">
          <div className="flex rounded-full bg-white/5 p-1 mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                data-testid={`auth-tab-${m}`}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-full text-sm font-bold capitalize transition-colors ${
                  mode === m ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black" : "text-white/60"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <GoogleButton onCredential={onGoogle} />
            <div className="flex items-center gap-3 my-5">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-widest text-white/30">or with email</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <input data-testid="auth-name-input" className={inputCls} placeholder="Full name" value={form.name} onChange={set("name")} required minLength={2} />
                <input data-testid="auth-country-input" className={inputCls} placeholder="Country (optional)" value={form.country} onChange={set("country")} />
              </>
            )}
            <input data-testid="auth-email-input" className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
            <input data-testid="auth-password-input" className={inputCls} type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set("password")} required minLength={6} />
            {error && <p data-testid="auth-error" className="text-red-400 text-sm">{error}</p>}
            <button data-testid="auth-submit-btn" type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-sm disabled:opacity-50">
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs text-white/40 uppercase tracking-widest text-center mb-3">Demo Accounts</p>
            <div className="flex gap-2">
              <button data-testid="demo-user-btn" onClick={() => fillDemo("demo@predict90.com", "Demo@123")} className="btn-ghost-light flex-1 py-2 text-xs">
                Demo User
              </button>
              <button data-testid="demo-admin-btn" onClick={() => fillDemo("admin@predict90.com", "Admin@123")} className="btn-ghost-light flex-1 py-2 text-xs">
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
