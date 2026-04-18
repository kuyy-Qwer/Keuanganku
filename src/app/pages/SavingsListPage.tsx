import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  getLockedSavings, getTotalLocked, getAvailableBalance, formatRupiah, 
  addLockedSaving, topUpLockedSaving, addTransaction, type LockedSaving 
} from "../store/database";
import { useLang } from "../i18n";
import { playAlertSound } from "../lib/sounds";
import { crudSuccess } from "../lib/notify";

export default function SavingsListPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const [savings, setSavings] = useState<LockedSaving[]>([]);
  const [totalLocked, setTotalLocked] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferAmt, setTransferAmt] = useState("");

  // New saving form state
  const [newSaving, setNewSaving] = useState({
    name: "",
    reason: "",
    targetAmount: "",
    savedAmount: "",
    unlockAt: "",
    emoji: "🎯"
  });

  const emojis = ["🎯", "🏠", "🚗", "💍", "🏖️", "🎓", "💻", "💼", "🏥", "🍼", "🚲", "🎸"];

  useEffect(() => {
    const refresh = () => {
      setSavings(getLockedSavings());
      setTotalLocked(getTotalLocked());
      setAvailableBalance(getAvailableBalance());
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  const handleCreate = () => {
    const target = parseInt(newSaving.targetAmount.replace(/\D/g, "")) || 0;
    const initial = parseInt(newSaving.savedAmount.replace(/\D/g, "")) || 0;
    
    if (!newSaving.name || target <= 0 || !newSaving.unlockAt) {
      playAlertSound();
      return;
    }

    addLockedSaving({
      name: newSaving.name,
      reason: newSaving.reason,
      targetAmount: target,
      savedAmount: initial,
      unlockAt: new Date(newSaving.unlockAt).toISOString(),
      emoji: newSaving.emoji
    });
    // Optional: catat dana awal sebagai transaksi history jika user mengisi "Dana Awal"
    if (initial > 0) {
      // Dana awal dianggap dana masuk ke "Tabungan" (expense dari cash)
      // Ini hanya untuk History, saldo cash/bank saat ini tidak dipotong otomatis di halaman ini.
      // (Penyesuaian saldo ada di fitur Cash/Bank.)
      // Jika kamu ingin memotong saldo juga, kita bisa sambungkan ke cash/bank flow seperti di SavingsPage.
      addTransaction({
        amount: initial,
        category: "Tabungan",
        notes: `Dana awal: ${newSaving.name}`,
        type: "expense",
        paymentSource: { type: "cash", label: "Cash" },
      });
    }
    void crudSuccess();

    setShowAddModal(false);
    setNewSaving({ name: "", reason: "", targetAmount: "", savedAmount: "", unlockAt: "", emoji: "🎯" });
  };

  const handleTransfer = () => {
    const amt = parseInt(transferAmt.replace(/\D/g, "")) || 0;
    if (!transferTargetId || amt <= 0) {
      playAlertSound();
      return;
    }
    
    topUpLockedSaving(transferTargetId, amt, L("Transfer dari Dompet", "Transfer from Wallet"));
    // Catat transfer sebagai transaksi History (expense kategori Tabungan)
    addTransaction({
      amount: amt,
      category: "Tabungan",
      notes: L("Transfer ke tabungan", "Transfer to savings"),
      type: "expense",
      paymentSource: { type: "cash", label: "Cash" },
    });
    void crudSuccess();
    setShowTransferModal(false);
    setTransferAmt("");
    setTransferTargetId("");
  };

  const activeSavings = savings.filter(s => !s.isWithdrawn && !s.isForcedOut);

  return (
    <div className="w-full min-h-screen flex justify-center pb-32"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[20px]"
            style={{ color: "var(--app-text)" }}>{L("Target Tabungan", "Savings Goals")}</h1>
        </div>

        {/* GoPay Inspired Balance Card */}
        <div className="bg-[#131b2e] relative rounded-[24px] overflow-hidden p-[25px] border border-[rgba(255,255,255,0.05)] shadow-xl">
           <div className="space-y-1 mb-6">
             <p className="font-['Plus_Jakarta_Sans'] font-semibold text-[12px] text-[#94a3b8] tracking-[0.6px] uppercase">
               {L("Total Dana Terkunci", "Total Locked Funds")}
             </p>
             <div className="flex items-center gap-2">
               <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-white transition-all duration-300"
                 style={{
                   fontSize: formatRupiah(totalLocked).length > 15 ? '20px' :
                             formatRupiah(totalLocked).length > 12 ? '24px' :
                             formatRupiah(totalLocked).length > 9 ? '28px' : '30px'
                 }}>
                 {formatRupiah(totalLocked)}
               </h2>
               <div className="px-2 py-0.5 rounded-full bg-[rgba(78,222,163,0.1)] border border-[rgba(78,222,163,0.2)]">
                 <span className="text-[10px] font-bold text-[#4edea3] uppercase tracking-wider">GROWING</span>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-4 gap-2">
             <QuickAction icon={<AddIcon />} label={L("Tambah", "Add")} onClick={() => setShowAddModal(true)} active />
             <QuickAction icon={<TransferIcon />} label={L("Transfer", "Transfer")} onClick={() => setShowTransferModal(true)} />
             <QuickAction icon={<HistoryIcon />} label={L("Riwayat", "History")} onClick={() => navigate("/app/history")} />
             <QuickAction icon={<AnalysisIcon />} label={L("Analisis", "Analysis")} onClick={() => navigate("/app/report")} />
           </div>
        </div>

        {/* Savings List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-white">
              {L("Tabungan Kamu", "Your Savings")}
            </h3>
            <button className="text-[#4edea3] text-[13px] font-bold">{L("Lihat Semua", "See All")}</button>
          </div>

          {activeSavings.length === 0 ? (
            <div className="rounded-[24px] p-8 text-center bg-[#171f33] border border-[rgba(255,255,255,0.05)]">
              <span className="text-[40px] block mb-3">🎯</span>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-white mb-1">
                {L("Belum ada target", "No goals yet")}
              </p>
              <p className="font-['Inter'] text-[12px] text-[#94a3b8] mb-4">
                {L("Mulai sisihkan uang untuk rencanamu", "Start keeping money for your plans")}
              </p>
              <button onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 rounded-full bg-[#4edea3] font-['Inter'] font-semibold text-[13px] text-[#003824]">
                {L("Buat Target", "Create Goal")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSavings.map(s => {
                const progressValue = s.targetAmount > 0 ? Math.min((s.savedAmount / s.targetAmount) * 100, 100) : 0;
                const rawPct = s.targetAmount > 0 ? (s.savedAmount / s.targetAmount) * 100 : 0;
                const daysLeftValue = Math.max(0, Math.ceil((new Date(s.unlockAt).getTime() - Date.now()) / 86400000));
                const isOver100M = s.savedAmount >= 100_000_000;
                const isSurplus = s.savedAmount > s.targetAmount && s.targetAmount > 0;
                const progLabel = rawPct >= 95
                  ? { text: L("Satu Langkah Lagi!", "Almost There!"), color: "#fb923c" }
                  : rawPct >= 50
                  ? { text: L("Setengah Jalan!", "Halfway!"), color: "#60a5fa" }
                  : null;

                return (
                  <button key={s.id} onClick={() => navigate(`/app/savings/${s.id}`)}
                    className={`w-full rounded-[20px] p-[17px] text-left active:scale-[0.98] transition-all group
                      ${isOver100M
                        ? 'bg-gradient-to-br from-[#1a2b1a] to-[#131b2e] border border-[rgba(251,191,36,0.2)] shadow-[0_0_24px_rgba(251,191,36,0.1)]'
                        : 'bg-[#171f33] border border-[rgba(255,255,255,0.05)]'
                      }`}>
                    <div className="flex gap-4">
                      <div className={`size-[56px] rounded-[16px] flex items-center justify-center text-[24px] group-hover:scale-110 transition-transform
                        ${isOver100M ? 'bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.2)]' : 'bg-[rgba(78,222,163,0.1)] border border-[rgba(78,222,163,0.1)]'}`}>
                        {s.emoji}
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-white truncate max-w-[150px]">{s.name}</h4>
                          <span className="text-[11px] font-bold text-[#64748b] uppercase">{new Date(s.unlockAt).toLocaleDateString(lang==='en'?'en-US':'id-ID', {month:'short', year:'numeric'})}</span>
                        </div>
                        <p className="font-mono text-[12px] text-[#94a3b8]">
                          {L("Terkumpul: ", "Saved: ")}
                          <span className={`font-bold ${isOver100M ? 'text-[#fbbf24]' : 'text-white'}`}>{formatRupiah(s.savedAmount)}</span>
                          <span className="text-[10px] opacity-60"> / {formatRupiah(s.targetAmount)}</span>
                        </p>
                        <div className="h-[6px] rounded-full bg-[#0b1326] overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${progressValue}%`,
                              background: isSurplus
                                ? "linear-gradient(90deg,#fbbf24,#f59e0b)"
                                : rawPct >= 95
                                ? "linear-gradient(90deg,#fb923c,#4edea3)"
                                : "linear-gradient(90deg,#4edea3,#04b4a2)",
                            }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isOver100M ? 'text-[#fbbf24]' : 'text-[#4edea3]'}`}>
                              {rawPct.toFixed(0)}% PROGRESS
                            </span>
                            {progLabel && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse"
                                style={{ backgroundColor: `${progLabel.color}20`, color: progLabel.color }}>
                                {progLabel.text}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-[#64748b] uppercase">{daysLeftValue} {L("HARI LAGI", "DAYS LEFT")}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insight Suggestion */}
        <div className="bg-gradient-to-r from-[rgba(16,185,129,0.15)] to-transparent rounded-[20px] p-[21px] border border-[rgba(78,222,163,0.2)] flex items-center gap-4">
          <div className="size-[40px] rounded-full bg-[rgba(78,222,163,0.2)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#4edea3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-white truncate">
             {L("Tingkatkan tabunganmu", "Boost your savings")}
            </h5>
            <p className="text-[10px] text-[#94a3b8]">{L("Berdasarkan pengeluaran minggu ini.", "Based on this week's spending.")}</p>
          </div>
          <button className="bg-[#4edea3] px-3 py-1.5 rounded-full text-[10px] font-extrabold text-[#003824] hover:shadow-[0_0_10px_rgba(78,222,163,0.4)] transition-all">APPLY</button>
        </div>

        {/* Distribution Summary */}
        <div className="bg-[#131b2e] rounded-[24px] p-[21px] border border-[rgba(255,255,255,0.05)] space-y-4">
          <h4 className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest">{L("Distribusi Kekayaan", "Wealth Distribution")}</h4>
          <div className="space-y-4">
             <DistributionRow 
               label={L("Tabungan Cair", "Liquid Savings")} 
               desc={L("Akses instan", "Instant access")} 
               amount={availableBalance} 
               color="#4edea3" 
             />
             <DistributionRow 
               label={L("Tabungan Terkunci", "Locked Savings")} 
               desc={L("Bunga kompetitif", "Competitive growth")} 
               amount={totalLocked} 
               color="#4fdbc8" 
             />
          </div>
        </div>

      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-[390px] animate-in slide-in-from-bottom duration-300">
            <div className="rounded-t-[32px] bg-[#171f33] border-t border-[rgba(255,255,255,0.1)] px-6 pt-8 pb-10 space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[20px] text-white">🎯 {L("Target Baru", "New Goal")}</h2>
                <button onClick={() => setShowAddModal(false)} className="text-[#94a3b8]">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Emoji Picker */}
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {emojis.map(e => (
                  <button key={e} onClick={() => setNewSaving(f => ({...f, emoji: e}))}
                    className={`size-12 rounded-2xl flex items-center justify-center text-[24px] shrink-0 transition-all ${newSaving.emoji === e ? 'bg-[#4edea3] scale-105 shadow-lg shadow-[#4edea320]' : 'bg-[#0b1326] border border-white/5'}`}>
                    {e}
                  </button>
                ))}
              </div>

              <InputField label={L("NAMA TARGET", "GOAL NAME")} value={newSaving.name} placeholder={L("e.g. Liburan ke Bali", "e.g. Bali Trip")} onChange={v => setNewSaving(f => ({...f, name: v}))} />
              <InputField label={L("ALASAN", "PURPOSE")} value={newSaving.reason} placeholder={L("e.g. Untuk refreshing", "e.g. For refreshing")} onChange={v => setNewSaving(f => ({...f, reason: v}))} />
              
              <div className="grid grid-cols-2 gap-3">
                <InputField label={L("TARGET DANA", "TARGET AMOUNT")} value={newSaving.targetAmount} placeholder="Rp0" onChange={v => setNewSaving(f => ({...f, targetAmount: v.replace(/\D/g, "")}))} prefix="Rp" />
                <InputField label={L("DANA AWAL", "INITIAL FUNDS")} value={newSaving.savedAmount} placeholder="Rp0" onChange={v => setNewSaving(f => ({...f, savedAmount: v.replace(/\D/g, "")}))} prefix="Rp" />
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-2">{L("TANGGAL PENCAIRAN", "UNLOCK DATE")}</p>
                <div className="rounded-[20px] bg-[#0b1326] border border-[rgba(255,255,255,0.05)] px-4">
                   <input type="date" value={newSaving.unlockAt} onChange={e => setNewSaving(f => ({...f, unlockAt: e.target.value}))}
                     className="w-full bg-transparent py-4 font-['Inter'] text-[15px] text-white outline-none" style={{ colorScheme: 'dark' }} />
                </div>
              </div>

              <button onClick={handleCreate} disabled={!newSaving.name || !newSaving.targetAmount || !newSaving.unlockAt}
                className="w-full py-4 rounded-[20px] bg-[#4edea3] text-[#003824] font-extrabold text-[15px] shadow-lg shadow-[#4edea320] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale">
                {L("BUAT TARGET", "CREATE GOAL")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowTransferModal(false)} />
          <div className="relative w-full max-w-[390px] animate-in slide-in-from-bottom duration-300">
            <div className="rounded-t-[32px] bg-[#171f33] border-t border-[rgba(255,255,255,0.1)] px-6 pt-8 pb-10 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[20px] text-white">💸 {L("Transfer Dana", "Transfer Funds")}</h2>
                <button onClick={() => setShowTransferModal(false)} className="text-[#94a3b8]">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {activeSavings.length === 0 ? (
                <p className="text-center text-[#94a3b8] py-8">{L("Buat target tabungan terlebih dahulu.", "Create a savings goal first.")}</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{L("PILIH TARGET", "SELECT GOAL")}</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {activeSavings.map(s => (
                        <button key={s.id} onClick={() => setTransferTargetId(s.id)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-2xl shrink-0 min-w-[80px] border transition-all ${transferTargetId === s.id ? 'bg-[#4edea3] border-[#4edea3]' : 'bg-[#0b1326] border-white/5'}`}>
                          <span className="text-[20px]">{s.emoji}</span>
                          <span className={`text-[10px] font-bold truncate max-w-[60px] ${transferTargetId === s.id ? 'text-[#003824]' : 'text-[#cbd5e1]'}`}>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <InputField label={L("JUMLAH TRANSFER", "TRANSFER AMOUNT")} value={transferAmt} placeholder="0" onChange={v => setTransferAmt(v.replace(/\D/g, ""))} prefix="Rp" />
                  
                  <div className="bg-[#0b1326] rounded-2xl p-4 border border-white/5">
                     <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-[#94a3b8]">{L("Saldo Tersedia", "Available Balance")}</span>
                        <span className="text-white font-bold">{formatRupiah(availableBalance)}</span>
                     </div>
                  </div>

                  <button onClick={handleTransfer} disabled={!transferTargetId || !transferAmt || parseInt(transferAmt) <= 0 || parseInt(transferAmt) > availableBalance}
                    className="w-full py-4 rounded-[20px] bg-[#4edea3] text-[#003824] font-extrabold text-[15px] shadow-lg disabled:opacity-50">
                    {L("TRANSFER SEKARANG", "TRANSFER NOW")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <div className={`size-[48px] rounded-[16px] flex items-center justify-center transition-all ${active ? 'bg-[#4edea3] text-[#003824]' : 'bg-[#2d3449] text-[#4edea3] hover:bg-[#3d455e]'}`}>
        {icon}
      </div>
      <span className="text-[11px] font-bold text-[#cbd5e1] group-active:scale-90 transition-transform">{label}</span>
    </button>
  );
}

function DistributionRow({ label, desc, amount, color }: { label: string, desc: string, amount: number, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-[6px] h-6 rounded-full" style={{ backgroundColor: color }} />
        <div>
          <p className="text-[12px] font-bold text-white leading-tight">{label}</p>
          <p className="text-[10px] text-[#64748b]">{desc}</p>
        </div>
      </div>
      <span className="font-bold text-white transition-all duration-300"
        style={{
          fontSize: formatRupiah(amount).length > 15 ? '10px' :
                    formatRupiah(amount).length > 12 ? '12px' : '14px'
        }}>
        {formatRupiah(amount)}
      </span>
    </div>
  );
}

function InputField({ label, value, placeholder, onChange, prefix }: { label: string, value: string, placeholder: string, onChange: (v: string) => void, prefix?: string }) {
  // Auto-format for nominal inputs (if it's numeric)
  const isNumeric = /^\d+$/.test(value.replace(/\./g, ""));
  const displayValue = (isNumeric && value !== "") 
    ? parseInt(value.replace(/\./g, "")).toLocaleString("id-ID") 
    : value;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{label}</p>
      <div className="rounded-[16px] bg-[#0b1326] border border-[rgba(255,255,255,0.05)] flex items-center px-4 gap-2">
        {prefix && <span className="text-[15px] font-bold text-[#64748b]">{prefix}</span>}
        <input 
          value={displayValue} 
          placeholder={placeholder} 
          onChange={e => {
            const raw = e.target.value.replace(/\./g, "");
            onChange(raw);
          }}
          className="flex-1 bg-transparent py-4 font-['Inter'] text-[15px] text-white outline-none placeholder:text-[#334155]" 
        />
      </div>
    </div>
  );
}

// Minimal Icons
function AddIcon() { return <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4"/></svg>; }
function TransferIcon() { return <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4"/></svg>; }
function HistoryIcon() { return <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>; }
function AnalysisIcon() { return <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>; }
