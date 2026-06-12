import { useEffect, useMemo, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Trophy, Crown, Goal, Hand, Flag, Check, Loader2, Sparkles } from "lucide-react";

const STADIUM = "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2400&auto=format&fit=crop";

/* ---------- small pieces ---------- */

function FlagImg({ team, size = "w-7 h-5" }) {
  return (
    <img
      src={team.flag_url}
      alt={team.name}
      className={`${size} object-cover rounded-[3px] shadow ring-1 ring-white/20`}
      loading="lazy"
    />
  );
}

function TeamChip({ team, selected, onClick, rank }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`team-chip-${team.code}`}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all duration-200 ${
        selected
          ? "bg-gradient-to-r from-[#FFD700]/25 to-[#D4AF37]/10 border-[#FFD700] shadow-[0_0_18px_rgba(255,215,0,0.25)] scale-[1.02]"
          : "bg-white/[0.04] border-white/10 hover:border-[#FFD700]/40 hover:bg-white/[0.07]"
      }`}
    >
      <FlagImg team={team} />
      <span className={`text-sm font-semibold truncate ${selected ? "text-[#FFD700]" : "text-white/85"}`}>
        {team.name}
      </span>
      {rank && (
        <span className="ml-auto text-[10px] font-black bg-[#FFD700] text-black rounded-full w-5 h-5 grid place-items-center">
          {rank}
        </span>
      )}
      {selected && !rank && <Check size={15} className="ml-auto text-[#FFD700]" />}
    </button>
  );
}

function PlayerCard({ player, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`player-card-${player.id}`}
      className={`relative w-full text-left rounded-2xl p-[2px] transition-all duration-200 ${
        selected ? "scale-[1.03]" : "hover:scale-[1.02]"
      }`}
      style={{
        background: selected
          ? "linear-gradient(160deg,#FFF3B0,#FFD700,#B8860B)"
          : "linear-gradient(160deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))",
      }}
    >
      <div className="rounded-2xl bg-gradient-to-b from-[#161a26] to-[#0d1018] p-4 h-full relative overflow-hidden">
        {selected && (
          <div className="absolute top-2 right-2 z-10 bg-[#FFD700] text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check size={11} /> PICK
          </div>
        )}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#FFD700]/10 blur-2xl" />
        <div className="flex items-start justify-between">
          <span className="font-display text-5xl leading-none gold-gradient-text">{player.rating}</span>
          <img src={player.flag_url} alt={player.country} className="w-9 h-6 object-cover rounded-[3px] ring-1 ring-white/20" />
        </div>
        <p className="mt-3 font-bold text-[15px] leading-tight text-white">{player.name}</p>
        <p className="text-xs text-white/55 mt-0.5">{player.club}</p>
        <p className="text-[11px] uppercase tracking-wider text-[#FFD700]/80 mt-1">{player.country}</p>
      </div>
    </button>
  );
}

function SectionTitle({ icon: Icon, title, hint, done, total }) {
  return (
    <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#FFD700]/15 text-[#FFD700]">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="font-display text-2xl sm:text-3xl tracking-wide leading-none">{title}</h2>
          {hint && <p className="text-xs text-white/45 mt-1">{hint}</p>}
        </div>
      </div>
      {total != null && (
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${done === total ? "bg-[#FFD700] text-black" : "bg-white/10 text-white/70"}`}>
          {done}/{total}
        </span>
      )}
    </div>
  );
}

/* ---------- page ---------- */

export default function Predict() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [forwards, setForwards] = useState([]);
  const [keepers, setKeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [leaders, setLeaders] = useState({});      // {A: teamId}
  const [qf, setQf] = useState([]);                // teamIds (max 8)
  const [sf, setSf] = useState([]);                // (max 4)
  const [fin, setFin] = useState([]);              // (max 2)
  const [winner, setWinner] = useState(null);
  const [boot, setBoot] = useState(null);
  const [glove, setGlove] = useState(null);

  const load = useCallback(async () => {
    const [{ data: g }, { data: fwd }, { data: gk }, { data: pred }] = await Promise.all([
      api.get("/wc/groups"),
      api.get("/wc/players?role=forward"),
      api.get("/wc/players?role=goalkeeper"),
      api.get("/wc/prediction"),
    ]);
    setGroups(g); setForwards(fwd); setKeepers(gk);
    setLeaders(pred.group_leaders || {});
    setQf(pred.quarter_finalists || []);
    setSf(pred.semi_finalists || []);
    setFin(pred.finalists || []);
    setWinner(pred.winner || null);
    setBoot(pred.golden_boot || null);
    setGlove(pred.golden_glove || null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const allTeams = useMemo(() => groups.flatMap((g) => g.teams), [groups]);
  const teamById = useMemo(() => Object.fromEntries(allTeams.map((t) => [t.id, t])), [allTeams]);

  const toggleInList = (list, setList, id, cap) => {
    if (list.includes(id)) setList(list.filter((x) => x !== id));
    else if (list.length < cap) setList([...list, id]);
    else toast.warning(`You can only pick ${cap}.`);
  };

  const completion = useMemo(() => {
    let done = 0;
    if (Object.keys(leaders).length === 12) done++;
    if (qf.length === 8) done++;
    if (sf.length === 4) done++;
    if (fin.length === 2) done++;
    if (winner) done++;
    if (boot) done++;
    if (glove) done++;
    return done;
  }, [leaders, qf, sf, fin, winner, boot, glove]);

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/wc/prediction", {
        group_leaders: leaders, quarter_finalists: qf, semi_finalists: sf,
        finalists: fin, winner, golden_boot: boot, golden_glove: glove,
      });
      toast.success("Bracket saved to your account! 🏆");
    } catch (e) {
      toast.error("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <span className="font-display text-2xl gold-text animate-pulse">LOADING THE BRACKET…</span>
      </div>
    );

  return (
    <div className="pb-32" data-testid="predict-page">
      {/* hero */}
      <div className="relative h-56 sm:h-64 flex items-end overflow-hidden">
        <img src={STADIUM} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0A0B10]/70 to-[#0A0B10]" />
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#FFD700]">FIFA World Cup 26™ · Predictor</span>
          <h1 className="font-display text-4xl sm:text-6xl tracking-wide mt-1">BUILD YOUR <span className="gold-gradient-text">BRACKET</span></h1>
          <p className="text-white/60 text-sm mt-1">Call the whole tournament — from group toppers to the champions lifted in New York.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-14 mt-10">
        {/* 1. Group leaders */}
        <section data-testid="section-group-leaders">
          <SectionTitle icon={Flag} title="GROUP STAGE LEADERS" hint="Tap the team you think tops each group" done={Object.keys(leaders).length} total={12} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div key={g.group} className="glass-card p-3">
                <p className="font-display text-lg tracking-widest text-white/50 mb-2">GROUP {g.group}</p>
                <div className="space-y-2">
                  {g.teams.map((t) => (
                    <TeamChip key={t.id} team={t} selected={leaders[g.group] === t.id}
                      onClick={() => setLeaders((p) => ({ ...p, [g.group]: p[g.group] === t.id ? undefined : t.id }))} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Quarter finalists */}
        <PickGrid title="QUARTER-FINALISTS" icon={Trophy} hint="Pick the 8 teams that reach the last 8"
          teams={allTeams} selected={qf} cap={8} onToggle={(id) => toggleInList(qf, setQf, id, 8)} />

        {/* 3. Semi finalists */}
        <PickGrid title="SEMI-FINALISTS" icon={Trophy} hint="Pick the final 4"
          teams={allTeams} selected={sf} cap={4} onToggle={(id) => toggleInList(sf, setSf, id, 4)} />

        {/* 4. Finalists */}
        <PickGrid title="FINALISTS" icon={Trophy} hint="The 2 teams in the final at MetLife Stadium"
          teams={allTeams} selected={fin} cap={2} onToggle={(id) => toggleInList(fin, setFin, id, 2)} />

        {/* 5. Champion */}
        <section data-testid="section-winner">
          <SectionTitle icon={Crown} title="WORLD CHAMPIONS" hint="One nation lifts the trophy" done={winner ? 1 : 0} total={1} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {allTeams.map((t) => {
              const sel = winner === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setWinner(sel ? null : t.id)}
                  data-testid={`winner-${t.code}`}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                    sel ? "bg-gradient-to-b from-[#FFD700]/25 to-transparent border-[#FFD700] shadow-[0_0_22px_rgba(255,215,0,0.3)] scale-[1.03]"
                        : "bg-white/[0.04] border-white/10 hover:border-[#FFD700]/40"}`}>
                  {sel && <Crown size={16} className="absolute top-2 right-2 text-[#FFD700]" />}
                  <img src={t.flag_url} alt={t.name} className="w-14 h-10 object-cover rounded shadow ring-1 ring-white/20" />
                  <span className={`text-xs font-bold text-center ${sel ? "text-[#FFD700]" : "text-white/80"}`}>{t.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 6. Golden Boot */}
        <section data-testid="section-golden-boot">
          <SectionTitle icon={Goal} title="GOLDEN BOOT" hint="Top scorer of the tournament" done={boot ? 1 : 0} total={1} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {forwards.map((p) => (
              <PlayerCard key={p.id} player={p} selected={boot === p.id} onClick={() => setBoot(boot === p.id ? null : p.id)} />
            ))}
          </div>
        </section>

        {/* 7. Golden Glove */}
        <section data-testid="section-golden-glove">
          <SectionTitle icon={Hand} title="GOLDEN GLOVE" hint="Best goalkeeper of the tournament" done={glove ? 1 : 0} total={1} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {keepers.map((p) => (
              <PlayerCard key={p.id} player={p} selected={glove === p.id} onClick={() => setGlove(glove === p.id ? null : p.id)} />
            ))}
          </div>
        </section>
      </div>

      {/* sticky save bar */}
      <div className="fixed bottom-0 md:bottom-0 inset-x-0 z-40 backdrop-blur-2xl bg-black/70 border-t border-[#FFD700]/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 md:h-16 flex items-center justify-between gap-4 mb-14 md:mb-0">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-[#FFD700]" />
            <span className="text-white/70"><span className="gold-text font-bold">{completion}/7</span> categories complete</span>
          </div>
          <button onClick={save} disabled={saving} data-testid="save-bracket"
            className="btn-gold px-7 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? "Saving…" : "Save Bracket"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* reusable multi-pick team grid */
function PickGrid({ title, icon, hint, teams, selected, cap, onToggle }) {
  return (
    <section data-testid={`section-${title.toLowerCase()}`}>
      <SectionTitle icon={icon} title={title} hint={hint} done={selected.length} total={cap} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {teams.map((t) => (
          <TeamChip key={t.id} team={t} selected={selected.includes(t.id)}
            rank={selected.includes(t.id) ? selected.indexOf(t.id) + 1 : null}
            onClick={() => onToggle(t.id)} />
        ))}
      </div>
    </section>
  );
}
