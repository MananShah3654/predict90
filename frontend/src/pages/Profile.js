import { useEffect, useState } from "react";
import api, { avatarUrl, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Copy, Gem } from "lucide-react";

const inputCls =
  "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/60";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: "", username: "", country: "", favorite_team: "" });
  const [teams, setTeams] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, username: user.username, country: user.country || "", favorite_team: user.favorite_team || "" });
    api.get("/teams").then(({ data }) => setTeams(data));
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/me", form);
      setUser(data);
      toast.success("Profile updated!");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`Join me on Predict90! Use my referral code ${user.referral_code} at ${window.location.origin}`);
    toast.success("Referral link copied!");
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="profile-page">
      <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-8">MY PROFILE</h1>

      <div className="glass-card p-6 mb-6 flex items-center gap-5">
        <img src={avatarUrl(user.username)} alt="" className={`w-20 h-20 rounded-full border-2 ${user.is_premium ? "border-[#FFD700]" : "border-white/20"}`} />
        <div>
          <p className="font-display text-2xl tracking-wide flex items-center gap-2">
            {user.name.toUpperCase()}
            {user.is_premium && <Gem size={16} className="text-[#FFD700]" />}
          </p>
          <p className="text-sm text-white/50">@{user.username} · Level {user.level}</p>
          <p className="text-sm gold-text font-bold mt-1">{user.points} pts · {user.accuracy}% accuracy</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-white/50 block mb-1.5">Name</label>
          <input data-testid="profile-name-input" className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/50 block mb-1.5">Username</label>
          <input data-testid="profile-username-input" className={inputCls} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/50 block mb-1.5">Country</label>
          <input data-testid="profile-country-input" className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/50 block mb-1.5">Favorite Team</label>
          <select
            data-testid="profile-team-select"
            className={inputCls}
            value={form.favorite_team}
            onChange={(e) => setForm({ ...form, favorite_team: e.target.value })}
          >
            <option value="" className="bg-[#11141D]">Select team</option>
            {teams.map((t) => <option key={t.id} value={t.name} className="bg-[#11141D]">{t.name}</option>)}
          </select>
        </div>
        <button data-testid="save-profile-btn" onClick={save} disabled={saving} className="btn-gold w-full py-3 text-sm disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="glass-card p-6 mt-6">
        <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Referral Code</p>
        <div className="flex items-center gap-3">
          <span data-testid="referral-code" className="font-display text-2xl tracking-[0.2em] gold-text">{user.referral_code}</span>
          <button data-testid="copy-referral-btn" onClick={copyReferral} className="btn-ghost-light px-4 py-2 text-xs flex items-center gap-1.5">
            <Copy size={12} /> Copy Invite
          </button>
        </div>
        <p className="text-xs text-white/40 mt-2">Referral rewards coming soon — invite friends now to get a head start!</p>
      </div>
    </div>
  );
}
