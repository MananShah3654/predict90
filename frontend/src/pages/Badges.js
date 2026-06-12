import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Target, Crown, Trophy, Star, Medal, Award, Gem, Flame, Zap, Users, Lock } from "lucide-react";

const ICONS = { target: Target, crown: Crown, trophy: Trophy, star: Star, medal: Medal, award: Award, gem: Gem, flame: Flame, zap: Zap, users: Users };

const tierCls = {
  legendary: "border-[#FFD700]/60 shadow-[0_0_25px_rgba(255,215,0,0.15)]",
  gold: "border-[#D4AF37]/40",
  silver: "border-white/20",
};

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [earned, setEarned] = useState(new Set());

  useEffect(() => {
    Promise.all([api.get("/badges"), api.get("/badges/me")]).then(([{ data: all }, { data: mine }]) => {
      setBadges(all);
      setEarned(new Set(mine.map((b) => b.badge_code)));
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="badges-page">
      <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-2">BADGES</h1>
      <p className="text-white/50 text-sm mb-8" data-testid="badges-earned-count">
        {earned.size} of {badges.length} unlocked
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((b, i) => {
          const Icon = ICONS[b.icon] || Award;
          const has = earned.has(b.code);
          return (
            <div
              key={b.code}
              data-testid={`badge-${b.code}`}
              className={`glass-card p-5 text-center fade-up ${has ? tierCls[b.tier] : "opacity-50"}`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 ${
                has ? "bg-gradient-to-br from-[#D4AF37]/40 to-[#FFD700]/15" : "bg-white/5"
              }`}>
                {has ? <Icon size={24} className="text-[#FFD700]" /> : <Lock size={20} className="text-white/30" />}
              </div>
              <p className="font-bold text-sm">{b.name}</p>
              <p className="text-xs text-white/50 mt-1 leading-snug">{b.description}</p>
              {has && <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">Unlocked</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
