import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, KeyRound, ChevronRight, Crown } from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/60";

export default function Leagues() {
  const [leagues, setLeagues] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api.get("/leagues/me").then(({ data }) => setLeagues(data)), []);
  useEffect(() => { load(); }, [load]);

  const createLeague = async () => {
    setBusy(true);
    try {
      await api.post("/leagues", { name, description });
      toast.success("League created! Share your invite code 🎉");
      setShowCreate(false);
      setName(""); setDescription("");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally { setBusy(false); }
  };

  const joinLeague = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/leagues/join", { invite_code: code });
      toast.success(`Joined ${data.name}! 🔥`);
      setShowJoin(false);
      setCode("");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="leagues-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide">LEAGUES</h1>
        <div className="flex gap-2">
          <button data-testid="join-league-btn" onClick={() => setShowJoin(true)} className="btn-ghost-light px-4 py-2 text-xs flex items-center gap-1">
            <KeyRound size={13} /> Join
          </button>
          <button data-testid="create-league-btn" onClick={() => setShowCreate(true)} className="btn-gold px-4 py-2 text-xs flex items-center gap-1">
            <Plus size={13} /> Create
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {leagues.length === 0 && (
          <div className="glass-card p-10 text-center">
            <Users size={36} className="mx-auto text-[#FFD700] mb-3" />
            <p className="font-bold mb-1">No leagues yet</p>
            <p className="text-sm text-white/50 mb-2">Create your own league or join with an invite code.</p>
            <p className="text-xs text-white/40">Try code <span className="font-bold text-[#FFD700]">LEGEND</span> to join the Legends League!</p>
          </div>
        )}
        {leagues.map((l) => (
          <Link
            key={l.id}
            to={`/leagues/${l.id}`}
            data-testid={`league-item-${l.id}`}
            className="glass-card glass-card-hover p-5 flex items-center gap-4 fade-up"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 to-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center">
              <Crown size={20} className="text-[#FFD700]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{l.name}</p>
              <p className="text-xs text-white/50 truncate">{l.member_count} members · Code: {l.invite_code}</p>
            </div>
            <ChevronRight size={18} className="text-white/30" />
          </Link>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#11141D] border-white/10 text-white max-w-sm" data-testid="create-league-modal">
          <DialogHeader><DialogTitle className="font-display text-2xl tracking-wide">CREATE LEAGUE</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <input data-testid="league-name-input" className={inputCls} placeholder="League name" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea data-testid="league-desc-input" className={inputCls} placeholder="Description (optional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            <button data-testid="confirm-create-league-btn" onClick={createLeague} disabled={busy || name.length < 3} className="btn-gold w-full py-3 text-sm disabled:opacity-50">
              {busy ? "Creating..." : "Create League"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoin} onOpenChange={setShowJoin}>
        <DialogContent className="bg-[#11141D] border-white/10 text-white max-w-sm" data-testid="join-league-modal">
          <DialogHeader><DialogTitle className="font-display text-2xl tracking-wide">JOIN LEAGUE</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <input data-testid="invite-code-input" className={`${inputCls} uppercase tracking-widest text-center font-bold`} placeholder="INVITE CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} />
            <button data-testid="confirm-join-league-btn" onClick={joinLeague} disabled={busy || code.length < 4} className="btn-gold w-full py-3 text-sm disabled:opacity-50">
              {busy ? "Joining..." : "Join League"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
