import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getLockedSavings, topUpLockedSaving, withdrawLockedSaving,
  forceWithdrawLockedSavingAmount, deleteLockedSaving, updateLockedSaving,
  formatRupiah, type LockedSaving,
  getBankAccounts, addBankTransaction, getBankAvailableBalance,
  getCashWalletBalance, addCashWalletTransaction,
  addBankLockedFunds,
  addTransaction,
  formatMoneyInput,
  parseMoneyInput,
} from "../store/database";
import { useLang } from "../i18n";
import ConfirmDialog from "../components/ConfirmDialog";
import { playAlertSound } from "../lib/sounds";
import { crudDeleteSuccess, crudSuccess } from "../lib/notify";

export default function SavingsPage() {
  const navigate = useNavigate();
  const { savingId } = useParams<{ savingId: string }>();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const [saving, setSaving] = useState<LockedSaving | null>(null);
  const [topUpAmt, setTopUpAmt] = useState("");
  const [topUpNote, setTopUpNote] = useState("");
  const [topUpSource, setTopUpSource] = useState<"cash" | string>("cash"); // cash or bankAccountId
  const [topUpDone, setTopUpDone] = useState(false);
  const [showForce, setShowForce] = useState(false);
  const [forceReason, setForceReason] = useState("");
  const [forceAmount, setForceAmount] = useState("");
  const [forceDestination, setForceDestination] = useState<"cash" | string>("cash"); // cash or bankAccountId
  const [showForceWarning, setShowForceWarning] = useState(false); // Peringatan sebelum tarik paksa

  // ── Kalkulator Tarik Paksa ───────────────────────────────────────
  const [showForceCalc, setShowForceCalc] = useState(false);
  const [forceCalcDisplay, setForceCalcDisplay] = useState("0");
  const [forceCalcFirst, setForceCalcFirst] = useState<number | null>(null);
  const [forceCalcOp, setForceCalcOp] = useState<string | null>(null);
  const [forceCalcWait, setForceCalcWait] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", reason: "", targetAmount: "", unlockAt: "", emoji: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Calculator state ─────────────────────────────────────────────
  const [showCalc, setShowCalc] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcFirstOperand, setCalcFirstOperand] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcWaiting, setCalcWaiting] = useState(false);
  useEffect(() => {
    if (!savingId) return;
    const load = () => {
      const found = getLockedSavings().find(s => s.id === savingId) ?? null;
      setSaving(found);
    };
    load();
    window.addEventListener("luminary_data_change", load);
    return () => window.removeEventListener("luminary_data_change", load);
  }, [savingId]);

  useEffect(() => {
    if (!savingId) navigate("/app/savings", { replace: true });
  }, [savingId, navigate]);

  // ── Calculator helpers ───────────────────────────────────────────
  const calcCalc = (a: number, b: number, op: string) => {
    if (op === "+") return a + b;
    if (op === "−") return a - b;
    if (op === "×") return a * b;
    if (op === "÷") return b !== 0 ? a / b : 0;
    return b;
  };
  const calcHandleDigit = (d: string) => {
    setCalcDisplay(prev => prev === "0" || calcWaiting ? (setCalcWaiting(false), d) : prev + d);
  };
  const calcHandleDot = () => {
    if (calcWaiting) { setCalcDisplay("0."); setCalcWaiting(false); return; }
    if (!calcDisplay.includes(".")) setCalcDisplay(prev => prev + ".");
  };
  const calcHandleOperator = (op: string) => {
    const val = parseFloat(calcDisplay);
    if (calcFirstOperand === null) { setCalcFirstOperand(val); }
    else if (calcOperator && !calcWaiting) {
      const r = calcCalc(calcFirstOperand, val, calcOperator);
      setCalcDisplay(String(r)); setCalcFirstOperand(r);
    }
    setCalcOperator(op); setCalcWaiting(true);
  };
  const calcHandleEquals = () => {
    if (!calcOperator || calcFirstOperand === null) return;
    const r = calcCalc(calcFirstOperand, parseFloat(calcDisplay), calcOperator);
    const result = String(parseFloat(r.toFixed(10)));
    setCalcDisplay(result);
    setCalcFirstOperand(null); setCalcOperator(null); setCalcWaiting(false);
    // Apply result to topUpAmt
    const num = Math.floor(Math.abs(r));
    if (num > 0) setTopUpAmt(formatMoneyInput(String(num)));
  };
  const calcHandleBackspace = () => {
    setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
  };
  const calcHandleClear = () => {
    setCalcDisplay("0"); setCalcFirstOperand(null); setCalcOperator(null); setCalcWaiting(false);
  };
  const calcHandlePress = (v: string) => {
    if (v === "AC") return calcHandleClear();
    if (v === "⌫") return calcHandleBackspace();
    if (v === "=") return calcHandleEquals();
    if (["÷","×","−","+"].includes(v)) return calcHandleOperator(v);
    if (v === ".") return calcHandleDot();
    return calcHandleDigit(v);
  };
  const calcFormatDisplay = () => {
    const n = parseFloat(calcDisplay);
    if (isNaN(n)) return "0";
    if (calcDisplay.endsWith(".")) return calcDisplay;
    return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const CALC_BUTTONS = [["7","8","9","÷"],["4","5","6","×"],["1","2","3","−"],["AC","0",".","+"]];

  // ── Force calc helpers ───────────────────────────────────────────
  const forceCalcDo = (a: number, b: number, op: string) => {
    if (op === "+") return a + b; if (op === "−") return a - b;
    if (op === "×") return a * b; if (op === "÷") return b !== 0 ? a / b : 0; return b;
  };
  const forceCalcPress = (v: string) => {
    if (v === "AC") { setForceCalcDisplay("0"); setForceCalcFirst(null); setForceCalcOp(null); setForceCalcWait(false); return; }
    if (v === "⌫") { setForceCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0"); return; }
    if (v === "=") {
      if (!forceCalcOp || forceCalcFirst === null) return;
      const r = forceCalcDo(forceCalcFirst, parseFloat(forceCalcDisplay), forceCalcOp);
      const result = parseFloat(r.toFixed(10));
      setForceCalcDisplay(String(result));
      setForceCalcFirst(null); setForceCalcOp(null); setForceCalcWait(false);
      const n = Math.floor(Math.abs(result));
      if (n > 0) setForceAmount(formatMoneyInput(String(n)));
      return;
    }
    if (["÷","×","−","+"].includes(v)) {
      const val = parseFloat(forceCalcDisplay);
      if (forceCalcFirst === null) { setForceCalcFirst(val); }
      else if (forceCalcOp && !forceCalcWait) { const r = forceCalcDo(forceCalcFirst, val, forceCalcOp); setForceCalcDisplay(String(r)); setForceCalcFirst(r); }
      setForceCalcOp(v); setForceCalcWait(true); return;
    }
    if (v === ".") {
      if (forceCalcWait) { setForceCalcDisplay("0."); setForceCalcWait(false); return; }
      if (!forceCalcDisplay.includes(".")) setForceCalcDisplay(prev => prev + ".");
      return;
    }
    setForceCalcDisplay(prev => forceCalcWait ? (setForceCalcWait(false), v) : prev === "0" ? v : prev + v);
  };
  const forceCalcFmt = () => {
    const n = parseFloat(forceCalcDisplay);
    if (isNaN(n)) return "0";
    if (forceCalcDisplay.endsWith(".")) return forceCalcDisplay;
    return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleTopUp = () => {
    if (!saving) return;
    const amt = parseMoneyInput(topUpAmt);
    if (amt <= 0) {
      playAlertSound();
      return;
    }
    if (topUpSource === "cash") {
      if (getCashWalletBalance() < amt) { playAlertSound(); return; }
      const mainTx = addTransaction({
        amount: amt,
        category: "Tabungan",
        notes: topUpNote.trim() || "Top up",
        type: "expense",
        date: new Date().toISOString(),
        paymentSource: { type: "cash", label: "Cash" },
      });
      addCashWalletTransaction({ type: "out", amount: amt, category: "Tabungan", notes: topUpNote.trim() || "Top up", date: new Date().toISOString() });
    } else {
      const bankId = topUpSource;
      if (getBankAvailableBalance(bankId) < amt) { playAlertSound(); return; }
      const mainTx = addTransaction({
        amount: amt,
        category: "Tabungan",
        notes: topUpNote.trim() || "Top up",
        type: "expense",
        date: new Date().toISOString(),
        paymentSource: { type: "bank", id: bankId, label: getBankAccounts().find(a => a.id === bankId)?.bankName },
      });
      addBankTransaction({
        bankAccountId: bankId,
        type: "debit",
        amount: amt,
        adminFee: 0,
        category: "Tabungan",
        notes: topUpNote.trim() || "Top up",
        paymentMethod: bankId,
        relatedTransactionId: mainTx.id,
        date: new Date().toISOString(),
      });
      // Dana tabungan dari bank dianggap terkunci
      addBankLockedFunds(bankId, amt);
    }
    topUpLockedSaving(saving.id, amt, topUpNote.trim() || L("Top up", "Top up"));
    void crudSuccess();
    setTopUpAmt(""); setTopUpNote("");
    setTopUpDone(true);
    setTimeout(() => setTopUpDone(false), 2000);
  };

  const handleWithdraw = () => {
    if (!saving) return;
    withdrawLockedSaving(saving.id);
    void crudSuccess();
    navigate("/app/savings");
  };

  const handleForce = () => {
    if (!saving || !forceReason.trim()) {
      playAlertSound();
      return;
    }
    const amt = parseInt(forceAmount.replace(/\./g, "")) || 0;
    if (amt <= 0) { playAlertSound(); return; }
    if (amt > saving.savedAmount) { playAlertSound(); return; }

    // Kembalikan dana ke Cash/Bank
    const note = `Tarik paksa: ${saving.name} · ${forceReason.trim()}`;
    if (forceDestination === "cash") {
      addCashWalletTransaction({ type: "in", amount: amt, category: "Tabungan", notes: note, date: new Date().toISOString() });
    } else {
      const bankId = forceDestination;
      addBankTransaction({
        bankAccountId: bankId,
        type: "credit",
        amount: amt,
        adminFee: 0,
        category: "Tabungan",
        notes: note,
        paymentMethod: bankId,
        date: new Date().toISOString(),
      });
    }

    // Kurangi saldo tabungan (bukan top up)
    forceWithdrawLockedSavingAmount(saving.id, amt, note);
    playAlertSound();
    setShowForce(false);
    navigate("/app/savings");
  };

  const handleEdit = () => {
    if (!saving) return;
    const target = parseInt(editForm.targetAmount.replace(/\./g, "")) || 0;
    if (!editForm.name.trim() || !editForm.unlockAt || target <= 0) {
      playAlertSound();
      return;
    }
    updateLockedSaving(saving.id, { name: editForm.name.trim(), reason: editForm.reason.trim(), targetAmount: target, unlockAt: new Date(editForm.unlockAt).toISOString(), emoji: editForm.emoji });
    void crudSuccess();
    setShowEdit(false);
  };

  const openEdit = () => {
    if (!saving) return;
    setEditForm({
      name: saving.name,
      reason: saving.reason,
      targetAmount: String(saving.targetAmount),
      unlockAt: saving.unlockAt.slice(0, 10),
      emoji: saving.emoji,
    });
    setShowEdit(true);
  };

  if (!savingId) return null;

  if (!saving) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-8 bg-[#0b1326]">
        <span className="text-[48px]">🔍</span>
        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-[#94a3b8] text-center">
          {L("Tabungan tidak ditemukan", "Savings not found")}
        </p>
        <button onClick={() => navigate("/app/savings")}
          className="px-6 py-3 rounded-full bg-[#4edea3] font-['Inter'] font-semibold text-[14px] text-[#003824]">
          {L("Kembali", "Go Back")}
        </button>
      </div>
    );
  }

  const isLocked = new Date(saving.unlockAt) > new Date() && !saving.isWithdrawn && !saving.isForcedOut;
  const isActive = !saving.isWithdrawn && !saving.isForcedOut;
  const rawProgress = saving.targetAmount > 0 ? (saving.savedAmount / saving.targetAmount) * 100 : 0;
  const progress = Math.min(rawProgress, 100);
  const isOver100M = saving.savedAmount >= 100_000_000;
  const isSurplus = saving.savedAmount > saving.targetAmount && saving.targetAmount > 0;
  const remaining = Math.max(0, saving.targetAmount - saving.savedAmount);
  const surplus = Math.max(0, saving.savedAmount - saving.targetAmount);
  const daysLeft = Math.max(0, Math.ceil((new Date(saving.unlockAt).getTime() - Date.now()) / 86400000));
  const history = (saving.history || []).slice().reverse();

  // Pesan progres berdasarkan persentase
  function getProgressMsg(): { text: string; color: string; emoji: string } | null {
    if (saving!.targetAmount <= 0) return null;
    const pct = rawProgress;
    const r = formatRupiah(remaining);
    const s = formatRupiah(surplus);
    if (pct > 100) return { emoji: "🚀", color: "#fbbf24", text: L(`Target telah melebihi target yang dikejar. Saldo saat ini surplus ${s} dari target awal.`, `You've exceeded your target! Current balance is ${s} above the original goal.`) };
    if (pct >= 100) return { emoji: "🎉", color: "#4edea3", text: L("Selamat! Target 100% tercapai. Total uang terkumpul sudah sesuai target!", "Congratulations! 100% target reached. Your savings match the goal!") };
    if (pct >= 99) return { emoji: "🏁", color: "#4edea3", text: L(`Satu langkah lagi! 99% terkumpul. Kurang ${r} saja untuk sukses!`, `One more step! 99% saved. Only ${r} left to go!`) };
    if (pct >= 95) return { emoji: "⚡", color: "#4edea3", text: L(`Hampir sampai! Sudah 95%. Cuma kurang ${r} lagi, ayo semangat!`, `Almost there! 95% done. Just ${r} more, keep going!`) };
    if (pct >= 90) return { emoji: "🌟", color: "#4edea3", text: L(`Luar biasa! 90% sudah di tangan. Target sudah di depan mata, sisa ${r} lagi!`, `Amazing! 90% in hand. The goal is in sight, only ${r} left!`) };
    if (pct >= 80) return { emoji: "💪", color: "#60a5fa", text: L(`Mantap! Sudah 80% terkumpul. Sedikit lagi tembus, hanya kurang ${r}!`, `Great! 80% saved. Almost there, only ${r} to go!`) };
    if (pct >= 50) return { emoji: "🎯", color: "#60a5fa", text: L(`Hebat! Tabungan sudah terkumpul 50%. Baru setengah jalan, kurang ${r} lagi untuk mencapai target!`, `Halfway there! 50% saved. ${r} more to reach your goal!`) };
    return null;
  }
  const progressMsg = getProgressMsg();

  return (
    <div className="w-full min-h-screen flex justify-center pb-32 bg-[#0b1326]">
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/app/savings")}
            className="p-2 rounded-full bg-[#171f33] border border-[rgba(255,255,255,0.05)]">
            <svg className="w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-[24px]">{saving.emoji}</span>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px] text-white truncate">{saving.name}</h1>
          </div>
          {isActive && (
            <button onClick={openEdit}
              className="p-2 rounded-full bg-[#171f33] border border-[rgba(255,255,255,0.05)]">
              <svg className="w-4 h-4 text-[#4edea3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>

        {/* Premium Score Card */}
        <div className={`rounded-[28px] p-6 relative overflow-hidden border group shadow-2xl transition-all ${isSurplus ? 'bg-gradient-to-br from-[#1a2b1a] to-[#131b2e] border-[rgba(251,191,36,0.2)]' : 'bg-[#131b2e] border-[rgba(255,255,255,0.05)]'}`}>
          <div className={`absolute top-[-50px] right-[-50px] size-[150px] rounded-full blur-[50px] opacity-[0.07] group-hover:opacity-[0.12] transition-opacity ${isSurplus ? 'bg-[#fbbf24]' : 'bg-[#4edea3]'}`} />

          {saving.reason && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] mb-4">
              <span className="text-[10px]">💬</span>
              <p className="text-[11px] text-[#94a3b8] italic truncate max-w-[200px]">{saving.reason}</p>
            </div>
          )}

          {/* Layout: jika target >= 100 juta, tampil stacked (terkumpul + kurang di bawahnya) */}
          {isOver100M ? (
            <div className="mb-4">
              <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">{L("TERKUMPUL", "SAVED")}</p>
              <h2 className={`font-extrabold leading-tight transition-all duration-300 ${isSurplus ? 'text-[#fbbf24]' : 'text-white'}`}
                style={{
                  fontSize: formatRupiah(saving.savedAmount).length > 15 ? '24px' :
                            formatRupiah(saving.savedAmount).length > 12 ? '28px' : '32px'
                }}>
                {formatRupiah(saving.savedAmount)}
              </h2>
              <p className={`text-[15px] font-bold mt-1 ${isSurplus ? 'text-[#fbbf24]' : 'text-[#ffb4ab]'}`}>
                {isSurplus
                  ? `+${formatRupiah(surplus)} ${L("surplus dari target", "surplus from target")}`
                  : `(${formatRupiah(remaining)}) ${L("lagi menuju target", "remaining to target")}`
                }
              </p>
            </div>
          ) : (
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">{L("TERKUMPUL", "SAVED")}</p>
                <h2 className={`font-extrabold leading-tight transition-all duration-300 ${isSurplus ? 'text-[#fbbf24]' : 'text-white'}`}
                  style={{
                    fontSize: formatRupiah(saving.savedAmount).length > 15 ? '20px' :
                              formatRupiah(saving.savedAmount).length > 12 ? '24px' :
                              formatRupiah(saving.savedAmount).length > 9 ? '28px' : '32px'
                  }}>
                  {formatRupiah(saving.savedAmount)}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">{L("TARGET", "TARGET")}</p>
                <p className="text-[16px] font-bold text-[#94a3b8]">{formatRupiah(saving.targetAmount)}</p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="relative h-4 rounded-full bg-[#0b1326] mb-4 overflow-hidden border border-[rgba(255,255,255,0.05)]">
            <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${isSurplus ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'bg-gradient-to-r from-[#4edea3] to-[#04b4a2] shadow-[0_0_15px_rgba(78,222,163,0.3)]'}`}
              style={{ width: `${progress}%` }}>
              <div className="absolute inset-0 bg-white/20 mix-blend-overlay animate-pulse" />
            </div>
          </div>

          {/* Pesan progres */}
          {progressMsg && (
            <div className={`rounded-[16px] px-4 py-3 mb-4 border text-[12px] font-semibold leading-relaxed`}
              style={{ backgroundColor: `${progressMsg.color}10`, borderColor: `${progressMsg.color}30`, color: progressMsg.color }}>
              {progressMsg.emoji} {progressMsg.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0b1326] rounded-2xl p-4 border border-[rgba(255,255,255,0.03)]">
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1">{L("TERCAPAI", "PROGRESS")}</p>
              <p className={`text-[20px] font-extrabold ${isSurplus ? 'text-[#fbbf24]' : 'text-[#4edea3]'}`}>
                {rawProgress.toFixed(1)}%
              </p>
            </div>
            <div className="bg-[#0b1326] rounded-2xl p-4 border border-[rgba(255,255,255,0.03)]">
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1">
                {isLocked ? L("SISA HARI", "DAYS LEFT") : L("STATUS", "STATUS")}
              </p>
              <p className={`text-[20px] font-extrabold ${isLocked ? 'text-[#ffb4ab]' : 'text-[#4edea3]'}`}>
                {isLocked ? daysLeft : L("SIAP!", "READY")}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between text-[11px] text-[#64748b]">
            <span>🔒 {L("Kunci terbuka pada:", "Unlocks on:")}</span>
            <span className="font-bold text-white">
              {new Date(saving.unlockAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Actions Section */}
        {isActive && (
          <div className="space-y-4">
             <div className="bg-[#171f33] rounded-[24px] p-6 border border-[rgba(255,255,255,0.05)] space-y-4">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-white flex items-center gap-2">
                  <span className="text-[#4edea3]">💰</span> {L("Tambah Saldo", "Add Balance")}
                </h3>
                <div className="space-y-1.5">
                  <div className="rounded-2xl bg-[#0b1326] border border-[rgba(255,255,255,0.05)] px-4">
                    <select value={topUpSource} onChange={e => setTopUpSource(e.target.value)}
                      className="w-full bg-transparent py-3 font-['Inter'] text-[13px] text-white outline-none"
                      style={{ colorScheme: "dark" }}>
                      <option value="cash">💵 Cash — {formatRupiah(getCashWalletBalance())}</option>
                      {getBankAccounts().map(a => (
                        <option key={a.id} value={a.id}>🏦 {a.bankName} — {formatRupiah(getBankAvailableBalance(a.id))} (available)</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount display */}
                  <div className="rounded-2xl bg-[#0b1326] border border-[rgba(255,255,255,0.05)] flex items-center px-4 gap-3 focus-within:border-[#4edea360] transition-colors">
                    <span className="text-[16px] font-bold text-[#64748b]">Rp</span>
                    {showCalc ? (
                      <span className="flex-1 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-[28px] text-white tracking-tight">
                        {calcFormatDisplay()}
                      </span>
                    ) : (
                      <input type="text" inputMode="numeric"
                        value={topUpAmt}
                        onChange={e => setTopUpAmt(formatMoneyInput(e.target.value))}
                        placeholder="0"
                        className="flex-1 bg-transparent py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-[28px] text-white outline-none" />
                    )}
                  </div>

                  {/* Calc toggle — below input */}
                  <div className="flex justify-center">
                    <button type="button"
                      onClick={() => {
                        if (!showCalc && topUpAmt) setCalcDisplay(String(parseMoneyInput(topUpAmt)));
                        setShowCalc(p => !p);
                      }}
                      className="flex items-center gap-2 px-5 py-2 rounded-full transition-all active:scale-95"
                      style={{ backgroundColor: showCalc ? "rgba(78,222,163,0.15)" : "rgba(255,255,255,0.05)", border: showCalc ? "1px solid rgba(78,222,163,0.4)" : "1px solid rgba(255,255,255,0.08)" }}>
                      <span className="text-[15px]">{showCalc ? "🔢" : "🧮"}</span>
                      <span className="font-['Inter'] font-semibold text-[12px]" style={{ color: showCalc ? "#4edea3" : "#94a3b8" }}>
                        {showCalc ? L("Sembunyikan Kalkulator", "Hide Calculator") : L("Tampilkan Kalkulator", "Show Calculator")}
                      </span>
                    </button>
                  </div>

                  {/* Numpad Calculator — same as transaction input */}
                  {showCalc && (
                    <div className="rounded-[20px] border border-[rgba(255,255,255,0.06)] p-3 bg-[#0b1326] space-y-1.5">
                      {/* Operator indicator */}
                      {calcOperator && (
                        <div className="text-right px-1">
                          <span className="text-[12px] font-bold text-[#4edea3]">
                            {calcFormatDisplay()} {calcOperator}
                          </span>
                        </div>
                      )}
                      {/* Grid 4×4 */}
                      <div className="grid grid-cols-4 gap-2">
                        {CALC_BUTTONS.flat().map((btn, i) => {
                          const isOp = ["÷","×","−","+"].includes(btn);
                          const isClear = btn === "AC";
                          const isActive = isOp && calcOperator === btn && calcWaiting;
                          return (
                            <button key={i} type="button"
                              onClick={() => calcHandlePress(btn)}
                              className="flex items-center justify-center rounded-[14px] h-[52px] transition-all active:scale-90"
                              style={{
                                backgroundColor: isActive ? "#4edea3" : isOp ? "#1e2d3d" : isClear ? "rgba(255,180,171,0.1)" : "rgba(255,255,255,0.05)",
                                border: isOp ? "1px solid rgba(78,222,163,0.25)" : isClear ? "1px solid rgba(255,180,171,0.2)" : "1px solid rgba(255,255,255,0.05)",
                              }}>
                              <span className="font-['Inter'] font-semibold"
                                style={{
                                  color: isActive ? "#003824" : isOp ? "#4edea3" : isClear ? "#ffb4ab" : "#dae2fd",
                                  fontSize: isOp ? "22px" : "18px",
                                }}>
                                {btn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {/* ⌫ and = row */}
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => calcHandlePress("⌫")}
                          className="h-[52px] rounded-[14px] flex items-center justify-center active:scale-95"
                          style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
                          <span className="font-['Inter'] font-semibold text-[22px] text-[#fbbf24]">⌫</span>
                        </button>
                        <button type="button" onClick={() => calcHandlePress("=")}
                          className="h-[52px] rounded-[14px] flex items-center justify-center active:scale-95"
                          style={{ backgroundColor: "rgba(78,222,163,0.15)", border: "1px solid rgba(78,222,163,0.4)" }}>
                          <span className="font-['Inter'] font-semibold text-[22px] text-[#4edea3]">=</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl bg-[#0b1326] border border-[rgba(255,255,255,0.05)] px-4 focus-within:border-[#4edea330] transition-colors">
                    <input value={topUpNote} onChange={e => setTopUpNote(e.target.value)}
                      placeholder={L("Tulis catatan...", "Write a note...")}
                      className="w-full bg-transparent py-3 font-['Inter'] text-[13px] text-white outline-none" />
                  </div>
                </div>
                <button onClick={handleTopUp}
                  disabled={!topUpAmt || parseMoneyInput(topUpAmt) <= 0}
                  className="w-full py-4 rounded-[18px] font-extrabold text-[15px] transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                  style={{
                    backgroundColor: topUpAmt && parseMoneyInput(topUpAmt) > 0 ? "#4edea3" : "#2d3449",
                    color: topUpAmt && parseMoneyInput(topUpAmt) > 0 ? "#003824" : "#94a3b8",
                  }}>
                  {topUpDone ? `✓ ${L("BERHASIL!", "SUCCESS!")}` : L("TAMBAHKAN DANA", "ADD FUNDS")}
                </button>
             </div>

             <div className="grid grid-cols-2 gap-3">
                {!isLocked && (
                  <button onClick={handleWithdraw}
                    className="flex items-center justify-center gap-2 py-4 rounded-[20px] font-bold text-[13px] bg-[rgba(78,222,163,0.1)] border border-[rgba(78,222,163,0.3)] text-[#4edea3] hover:bg-[rgba(78,222,163,0.15)] transition-all">
                    <span>✨</span> {L("Cairkan", "Withdraw")}
                  </button>
                )}
                <button onClick={() => setShowForceWarning(true)}
                  className={`flex items-center justify-center gap-2 py-4 rounded-[20px] font-bold text-[13px] bg-[rgba(255,180,171,0.08)] border border-[rgba(255,180,171,0.2)] text-[#ffb4ab] hover:bg-[rgba(255,180,171,0.12)] transition-all ${!isLocked ? '' : 'col-span-2'}`}>
                  <span>⚠️</span> {L("Tarik Paksa", "Force Withdraw")}
                </button>
             </div>
          </div>
        )}

        {/* Transaction History - Redesigned */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-bold text-[#64748b] tracking-[2px] uppercase px-2">{L("Riwayat Transaksi", "Transaction History")}</h3>
          {history.length === 0 ? (
            <div className="rounded-[24px] p-10 text-center bg-[#171f33] border border-[rgba(255,255,255,0.03)]">
              <p className="text-[13px] text-[#64748b]">{L("Belum ada riwayat transaksi", "No transaction history yet")}</p>
            </div>
          ) : (
            <div className="bg-[#171f33] rounded-[24px] border border-[rgba(255,255,255,0.05)] overflow-hidden">
               {history.map((entry, i) => (
                 <div key={entry.id} className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-white/5 transition-colors">
                    <div className="flex gap-3 items-center">
                       <div className="size-10 rounded-full bg-[rgba(78,222,163,0.1)] flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#4edea3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                       </div>
                       <div>
                          <p className="text-[14px] font-bold text-white">{entry.note || L("Top up", "Top up")}</p>
                          <p className="text-[11px] text-[#64748b]">{new Date(entry.date).toLocaleDateString(lang==='en'?'en-US':'id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</p>
                       </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[15px] font-black ${entry.amount >= 0 ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                        {entry.amount >= 0 ? "+" : "-"}{formatRupiah(Math.abs(entry.amount))}
                      </p>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {isActive && !confirmDelete && (
          <button onClick={() => setConfirmDelete(true)} className="w-full text-center text-[#ffb4ab] text-[12px] font-bold py-4 opacity-50 hover:opacity-100 transition-opacity">
            🗑️ {L("Hapus Tabungan Ini", "Delete This Savings")}
          </button>
        )}

        {confirmDelete && (
          <ConfirmDialog
            title={L("Hapus Tabungan?", "Delete Savings?")}
            message={L(`"${saving.name}" akan dihapus permanen.`, `"${saving.name}" will be permanently deleted.`)}
            confirmLabel={L("Hapus", "Delete")}
            cancelLabel={L("Batal", "Cancel")}
            onConfirm={() => { deleteLockedSaving(saving.id); void crudDeleteSuccess(); navigate("/app/savings"); }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </div>

      {/* Peringatan Sebelum Tarik Paksa */}
      {showForceWarning && saving && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForceWarning(false)} />
          <div className="relative w-full max-w-[360px] mx-4 rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 text-center" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              <span className="text-[48px] block mb-2">🔒</span>
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px] text-white">
                {L("Penarikan Sebelum Waktunya", "Early Withdrawal")}
              </h2>
              <p className="font-['Inter'] text-[12px] text-white/80 mt-1">
                {saving.name}
              </p>
            </div>

            <div className="p-5 space-y-3 bg-[#171f33]">
              {/* Status tabungan */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[12px] p-3" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <p className="font-['Inter'] text-[9px] uppercase tracking-wider mb-1 text-[#64748b]">
                    {L("Terkumpul", "Saved")}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-white">
                    {formatRupiah(saving.savedAmount)}
                  </p>
                  <p className="font-['Inter'] text-[10px] text-[#64748b]">
                    {saving.targetAmount > 0
                      ? `${Math.round((saving.savedAmount / saving.targetAmount) * 100)}% ${L("dari target", "of target")}`
                      : L("Tanpa target", "No target")}
                  </p>
                </div>
                <div className="rounded-[12px] p-3" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <p className="font-['Inter'] text-[9px] uppercase tracking-wider mb-1 text-[#64748b]">
                    {L("Sisa Waktu", "Time Left")}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]"
                    style={{ color: isLocked ? "#ffb4ab" : "#4edea3" }}>
                    {isLocked
                      ? `${daysLeft} ${L("hari", "days")}`
                      : L("Sudah bisa dicairkan", "Ready to withdraw")}
                  </p>
                </div>
              </div>

              {/* Peringatan kondisi */}
              <div className="rounded-[14px] p-4 space-y-2 border border-[rgba(245,158,11,0.3)]"
                style={{ backgroundColor: "rgba(245,158,11,0.08)" }}>
                {isLocked && (
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] mt-0.5">⏰</span>
                    <p className="font-['Inter'] text-[11px] text-[#fbbf24]">
                      {L(
                        `Tabungan ini terkunci hingga ${new Date(saving.unlockAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}. Masih ${daysLeft} hari lagi.`,
                        `This saving is locked until ${new Date(saving.unlockAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}. ${daysLeft} days remaining.`
                      )}
                    </p>
                  </div>
                )}
                {saving.targetAmount > 0 && saving.savedAmount < saving.targetAmount && (
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] mt-0.5">🎯</span>
                    <p className="font-['Inter'] text-[11px] text-[#fbbf24]">
                      {L(
                        `Target belum tercapai. Masih kurang ${formatRupiah(saving.targetAmount - saving.savedAmount)} lagi.`,
                        `Goal not yet reached. Still ${formatRupiah(saving.targetAmount - saving.savedAmount)} short.`
                      )}
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-[14px] mt-0.5">💸</span>
                  <p className="font-['Inter'] text-[11px] text-[#fbbf24]">
                    {L(
                      "Menarik dana sekarang berarti kamu melepaskan tujuan yang sudah kamu tetapkan.",
                      "Withdrawing now means giving up the goal you set for yourself."
                    )}
                  </p>
                </div>
              </div>

              {/* Saran */}
              <div className="rounded-[14px] p-3 border border-[rgba(78,222,163,0.2)]"
                style={{ backgroundColor: "rgba(78,222,163,0.06)" }}>
                <p className="font-['Inter'] text-[11px] text-[#4edea3]">
                  💡 {L(
                    "Pertimbangkan kembali. Jika benar-benar mendesak, lanjutkan dan berikan alasan yang jelas.",
                    "Think it over. If truly urgent, proceed and provide a clear reason."
                  )}
                </p>
              </div>
            </div>

            {/* Tombol */}
            <div className="px-5 pb-5 pt-3 flex gap-3 bg-[#171f33]">
              <button onClick={() => setShowForceWarning(false)}
                className="flex-1 py-3 bg-[#2d3449] rounded-[16px] text-white font-['Plus_Jakarta_Sans'] font-bold text-[13px]">
                {L("Batalkan", "Cancel")}
              </button>
              <button onClick={() => { setShowForceWarning(false); setShowForce(true); }}
                className="flex-1 py-3 rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[13px]"
                style={{ backgroundColor: "#ffb4ab", color: "#003824" }}>
                {L("Tetap Tarik", "Withdraw Anyway")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Force Modal - Styled consistently */}
      {showForce && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForce(false)} />
          <div className="relative w-full max-w-[390px] animate-in slide-in-from-bottom duration-300">
            <div className="p-8 rounded-t-[32px] bg-[#171f33] border-t border-[rgba(255,255,255,0.1)] space-y-6">
               <h2 className="text-[20px] font-extrabold text-[#ffb4ab]">⚠️ {L("Penarikan Paksa", "Force Withdrawal")}</h2>
               <p className="text-[13px] text-[#94a3b8] leading-relaxed">
                 {L(
                   `"${saving.name}" terkunci hingga ${new Date(saving.unlockAt).toLocaleDateString("id-ID", {day:'numeric', month:'long'})}. Penarikan sekarang mungkin dikenakan biaya penalti atau pemberhentian bunga.`,
                   `"${saving.name}" is locked until ${new Date(saving.unlockAt).toLocaleDateString("en-US", {day:'numeric', month:'long'})}. Withdrawing now may incur penalties.`
                 )}
               </p>
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{L("DANA MASUK KE", "SEND TO")}</p>
                  <div className="rounded-2xl bg-[#0b1326] border border-[rgba(255,255,255,0.05)] px-4">
                    <select value={forceDestination} onChange={e => setForceDestination(e.target.value)}
                      className="w-full bg-transparent py-3 font-['Inter'] text-[13px] text-white outline-none"
                      style={{ colorScheme: "dark" }}>
                      <option value="cash">💵 Cash</option>
                      {getBankAccounts().map(a => (
                        <option key={a.id} value={a.id}>🏦 {a.bankName} — {formatRupiah(getBankAvailableBalance(a.id))} (available)</option>
                      ))}
                    </select>
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{L("JUMLAH", "AMOUNT")}</p>
                  {/* Amount display — mirrors FAB transaction */}
                  <div className="relative rounded-[16px] w-full border border-[rgba(255,255,255,0.05)]" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                    <div className="absolute top-px bottom-px left-px w-1.5 rounded-l-[14px] bg-[#ffb4ab]" />
                    <div className="p-4 pl-6">
                      <p className="font-['Inter'] font-semibold text-[10px] tracking-[2px] uppercase opacity-80 mb-1 text-[#ffb4ab]">
                        {L("MASUKKAN NOMINAL", "ENTER AMOUNT")}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[18px] text-[#64748b]">Rp</span>
                        {showForceCalc ? (
                          <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[32px] tracking-[-1px] leading-[38px] text-white">
                            {forceCalcFmt()}
                          </span>
                        ) : (
                          <input type="text" inputMode="numeric"
                            value={forceAmount}
                            onChange={e => setForceAmount(formatMoneyInput(e.target.value))}
                            placeholder="0"
                            className="font-['Plus_Jakarta_Sans'] font-extrabold text-[32px] tracking-[-1px] leading-[38px] bg-transparent outline-none w-full text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Calc Toggle */}
                  <div className="flex justify-center">
                    <button type="button"
                      onClick={() => {
                        if (!showForceCalc && forceAmount) setForceCalcDisplay(String(parseMoneyInput(forceAmount)));
                        setShowForceCalc(p => !p);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all active:scale-95"
                      style={{ backgroundColor: showForceCalc ? "rgba(0,209,139,0.15)" : "rgba(45,52,73,0.5)", border: showForceCalc ? "1px solid rgba(0,209,139,0.4)" : "1px solid rgba(255,255,255,0.08)" }}>
                      <span className="text-[15px]">{showForceCalc ? "🔢" : "🧮"}</span>
                      <span className="font-['Inter'] font-semibold text-[12px]" style={{ color: showForceCalc ? "#00d18b" : "#94a3b8" }}>
                        {showForceCalc ? L("Sembunyikan Kalkulator", "Hide Calculator") : L("Tampilkan Kalkulator", "Show Calculator")}
                      </span>
                    </button>
                  </div>
                  {/* Calculator panel */}
                  {showForceCalc && (
                    <div className="rounded-[24px] border p-4" style={{ backgroundColor: "rgba(45,52,73,0.5)", borderColor: "rgba(255,255,255,0.08)" }}>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {CALC_BUTTONS.flat().map((btn, i) => {
                          const isOp = ["÷","×","−","+"].includes(btn);
                          const isClear = btn === "AC";
                          const isBackspace = btn === "⌫";
                          const isActive = isOp && forceCalcOp === btn && forceCalcWait;
                          return (
                            <button key={i} type="button" onClick={() => forceCalcPress(btn)}
                              className="flex items-center justify-center rounded-[14px] h-[54px] transition-all active:scale-90"
                              style={{ backgroundColor: isActive ? "#00d18b" : isOp ? "#2d3449" : isClear ? "rgba(255,180,171,0.1)" : isBackspace ? "rgba(251,191,36,0.1)" : "rgba(45,52,73,0.5)", border: isOp ? "1px solid rgba(0,209,139,0.2)" : isClear ? "1px solid rgba(255,180,171,0.2)" : isBackspace ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
                              <span className="font-['Inter'] font-semibold" style={{ color: isActive ? "#060E20" : isOp ? "#00d18b" : isClear ? "#ffb4ab" : isBackspace ? "#fbbf24" : "#dae2fd", fontSize: isOp ? "22px" : "18px" }}>{btn}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => forceCalcPress("⌫")}
                          className="h-[54px] rounded-[14px] flex items-center justify-center active:scale-95" style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
                          <span className="font-['Inter'] font-semibold text-[22px] text-[#fbbf24]">⌫</span>
                        </button>
                        <button type="button" onClick={() => forceCalcPress("=")}
                          className="h-[54px] rounded-[14px] flex items-center justify-center active:scale-95" style={{ backgroundColor: "rgba(0,209,139,0.1)", border: "1px solid rgba(0,209,139,0.3)" }}>
                          <span className="font-['Inter'] font-semibold text-[22px] text-[#00d18b]">=</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-[#64748b]">
                    {L("Maks:", "Max:")} {formatRupiah(saving.savedAmount)}
                  </p>
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{L("ALASAN MENDESAK", "URGENT REASON")}</p>
                  <textarea value={forceReason} onChange={e => setForceReason(e.target.value)}
                    placeholder="..." className="w-full h-24 bg-[#0b1326] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 text-white text-[14px] outline-none" />
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setShowForce(false)} className="flex-1 py-4 bg-[#2d3449] rounded-[18px] text-white font-bold">{L("Batal", "Cancel")}</button>
                  <button
                    onClick={handleForce}
                    disabled={!forceReason.trim() || !(parseInt(forceAmount.replace(/\./g, "")) > 0)}
                    className="flex-1 py-4 bg-[#ffb4ab] rounded-[18px] text-[#003824] font-extrabold disabled:opacity-50"
                  >
                    {L("Tarik Dana", "Withdraw")}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Consistent Style */}
      {showEdit && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="relative w-full max-w-[390px] animate-in slide-in-from-bottom duration-300">
            <div className="p-8 rounded-t-[32px] bg-[#171f33] border-t border-[rgba(255,255,255,0.1)] space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar">
               <h2 className="text-[20px] font-extrabold text-white">✏️ {L("Edit Target", "Edit Goal")}</h2>
               
               {/* Emoji selector simplified */}
               <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {["🎯", "🏠", "🚗", "💍", "🏖️", "🎓", "💻"].map(e => (
                    <button key={e} onClick={() => setEditForm(f => ({...f, emoji: e}))}
                      className={`size-10 rounded-full flex items-center justify-center text-[20px] shrink-0 ${editForm.emoji === e ? 'bg-[#4edea3]' : 'bg-[#0b1326]'}`}>
                      {e}
                    </button>
                  ))}
               </div>

               <ModalInput label={L("NAMA", "NAME")} value={editForm.name} onChange={v => setEditForm(f => ({...f, name: v}))} />
               <ModalInput label={L("TUJUAN", "PURPOSE")} value={editForm.reason} onChange={v => setEditForm(f => ({...f, reason: v}))} multiline />
               <ModalInput label={L("TARGET", "TARGET")} value={editForm.targetAmount} onChange={v => setEditForm(f => ({...f, targetAmount: v.replace(/\D/g, "")}))} prefix="Rp" />
               
               <div>
                  <p className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase mb-2">{L("TANGGAL BUKA KUNCI", "UNLOCK DATE")}</p>
                  <div className="bg-[#0b1326] rounded-2xl border border-[rgba(255,255,255,0.05)] px-4">
                    <input type="date" value={editForm.unlockAt} onChange={e => setEditForm(f => ({...f, unlockAt: e.target.value}))}
                      className="w-full bg-transparent py-4 text-white outline-none" style={{ colorScheme: 'dark' }} />
                  </div>
               </div>

               <div className="flex gap-3 pt-2">
                 <button onClick={() => setShowEdit(false)} className="flex-1 py-4 bg-[#2d3449] rounded-[18px] text-white font-bold">{L("Batal", "Cancel")}</button>
                 <button onClick={handleEdit} className="flex-1 py-4 bg-[#4edea3] rounded-[18px] text-[#003824] font-extrabold">{L("Simpan", "Save")}</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalInput({ label, value, onChange, prefix, multiline }: { label: string, value: string, onChange: (v: string) => void, prefix?: string, multiline?: boolean }) {
  // Auto-format for nominal inputs (if it's numeric)
  const isNumeric = /^\d+$/.test(value.replace(/\./g, ""));
  const displayValue = (isNumeric && value !== "") 
    ? parseInt(value.replace(/\./g, "")).toLocaleString("id-ID") 
    : value;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">{label}</p>
      <div className="bg-[#0b1326] rounded-2xl border border-[rgba(255,255,255,0.05)] flex items-center px-4 gap-2">
        {prefix && <span className="text-[#64748b]">{prefix}</span>}
        {multiline ? (
          <textarea value={value} onChange={e => onChange(e.target.value)}
            className="flex-1 bg-transparent py-3 text-white text-[14px] outline-none min-h-[60px] resize-none" />
        ) : (
          <input 
            value={displayValue} 
            onChange={e => {
              const raw = e.target.value.replace(/\./g, "");
              onChange(raw);
            }}
            className="flex-1 bg-transparent py-4 text-white text-[14px] outline-none" 
          />
        )}
      </div>
    </div>
  );
}
