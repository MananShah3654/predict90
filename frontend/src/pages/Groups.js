import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Flag, ChevronRight } from "lucide-react";

const STADIUM = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2400&auto=format&fit=crop";

const GROUP_COLORS = [
  "from-emerald-500/20", "from-sky-500/20", "from-amber-500/20", "from-rose-500/20",
  "from-violet-500/20", "from-cyan-500/20", "from-orange-500/20", "from-teal-500/20",
  "from-fuchsia-500/20", "from-lime-500/20", "from-indigo-500/20", "from-red-500/20",
];

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/wc/groups").then(({ data }) => { setGroups(data); setLoading(false); });
  }, []);

  return (
    <div className="pb-24" data-testid="groups-page">
      <div className="relative h-52 flex items-end overflow-hidden">
        <img src={STADIUM} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#0A0B10]/70 to-[#0A0B10]" />
        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#FFD700]">Canada · Mexico · USA</span>
          <h1 className="font-display text-4xl sm:text-6xl tracking-wide mt-1">THE <span className="gold-gradient-text">48 NATIONS</span></h1>
          <p className="text-white/60 text-sm mt-1">Official FIFA World Cup 26™ group draw — 12 groups, the road to glory.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        {loading ? (
          <p className="text-center text-white/40 font-display text-xl py-16">LOADING GROUPS…</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((g, i) => (
                <div key={g.group} className={`glass-card glass-card-hover overflow-hidden bg-gradient-to-br ${GROUP_COLORS[i % 12]} to-transparent`} data-testid={`group-${g.group}`}>
                  <div className="flex items-center justify-between px-4 pt-4">
                    <span className="font-display text-3xl tracking-widest">GROUP {g.group}</span>
                    <Flag size={18} className="text-[#FFD700]" />
                  </div>
                  <div className="p-4 pt-3 space-y-2">
                    {g.teams.map((t, idx) => (
                      <div key={t.id} className="flex items-center gap-3 bg-black/20 rounded-lg px-3 py-2">
                        <span className="text-xs font-black text-white/30 w-3">{idx + 1}</span>
                        <img src={t.flag_url} alt={t.name} className="w-8 h-6 object-cover rounded-[3px] ring-1 ring-white/20" />
                        <span className="text-sm font-semibold text-white/90">{t.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/predict" data-testid="groups-to-predict" className="btn-gold px-8 py-4 text-sm inline-flex items-center gap-2">
                Predict the Tournament <ChevronRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
