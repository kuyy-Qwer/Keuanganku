import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  getDebts, addDebt, addDebtPayment, deleteDebt, updateDebt,
  formatRupiah, type Debt,
  addTransaction,
  getBankAccounts, addBankTransaction, getBankAvailableBalance,
  getCashWalletBalance, addCashWalletTransaction,
} from "../store/database";
import { useLang } from "../i18n";
import ConfirmDialog from "../components/ConfirmDialog";
import { playDebtPaidSound, playDebtMilestoneSound, playAlertSound } from "../lib/sounds";
import { crudDeleteSuccess, crudSuccess, dispatchNotif } from "../lib/notify";

// ─── Helpers ──────────────────────────────────────────────────────
function paidPct(d: Debt) {
  return d.amount > 0 ? Math.min(((d.amount - d.remainingAmount) / d.amount) * 100, 100) : 0;
}

function timePct(d: Debt): number | null {
  if (!d.dueDate) return null;
  const start = new Date(d.createdAt).getTime();
  const end = new Date(d.dueDate).getTime();
  const now = Date.now();
  if (end <= start) return null;
  return Math.min(((now - start) / (end - start)) * 100, 100);
}

function daysLeft(d: Debt): number | null {
  if (!d.dueDate) return null;
  return Math.ceil((new Date(d.dueDate).getTime() - Date.now()) / 86400000);
}

function fmtRp(n: number) {
  return "Rp " + Math.abs(n).toLocaleString("id-ID");
}

// ─── Time Notification Checker ────────────────────────────────────
const NOTIF_KEY = "luminary_debt_notif_sent";
function getNotifSent(): Record<string, number[]> {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}"); } catch { return {}; }
}
function markNotifSent(id: string, milestone: number) {
  const s = getNotifSent();
  if (!s[id]) s[id] = [];
  if (!s[id].includes(milestone)) s[id].push(milestone);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(s));
}
function wasNotifSent(id: string, milestone: number): boolean {
  const s = getNotifSent();
  return (s[id] || []).includes(milestone);
}

function checkTimeNotifications(debts: Debt[], lang: string) {
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const milestones = [50, 80, 95, 99];
  debts.filter(d => !d.isPaid && d.dueDate).forEach(d => {
    const tp = timePct(d);
    if (tp === null) return;
    const paid = d.amount - d.remainingAmount;
    const lacking = d.remainingAmount;
    milestones.forEach(m => {
      if (tp >= m && !wasNotifSent(d.id, m)) {
        markNotifSent(d.id, m);
        playDebtMilestoneSound();
        const urgency = m >= 99 ? "🚨" : m >= 95 ? "🔥" : m >= 80 ? "⚡" : "⏳";
        const msg = m >= 99
          ? L(`Hampir jatuh tempo! Uang terkumpul: ${fmtRp(paid)} · Kurang: ${fmtRp(lacking)}`,
            `Almost due! Collected: ${fmtRp(paid)} · Remaining: ${fmtRp(lacking)}`)
          : m >= 95
            ? L(`Mendesak! Uang terkumpul: ${fmtRp(paid)} · Kurang: ${fmtRp(lacking)}`,
              `Urgent! Collected: ${fmtRp(paid)} · Remaining: ${fmtRp(lacking)}`)
            : m >= 80
              ? L(`Peringatan! Uang terkumpul: ${fmtRp(paid)} · Kurang: ${fmtRp(lacking)}`,
                `Warning! Collected: ${fmtRp(paid)} · Remaining: ${fmtRp(lacking)}`)
              : L(`Tinggal beberapa hari lagi menuju jatuh tempo. Uang terkumpul: ${fmtRp(paid)} · Kurang: ${fmtRp(lacking)}`,
                `A few days left until due. Collected: ${fmtRp(paid)} · Remaining: ${fmtRp(lacking)}`);
        dispatchNotif({
          type: "reminder",
          title: `${urgency} ${d.personName} — ${m}% ${L("waktu berlalu", "time elapsed")}`,
          message: msg,
          emoji: urgency,
        });
      }
    });
  });
}

// ─── Progress Bar ─────────────────────────────────────────────────
function DebtProgressBar({ pct, isLoan }: { pct: number; isLoan: boolean }) {
  const color = pct >= 100
    ? "linear-gradient(90deg,#4edea3,#04b4a2)"
    : pct >= 95
      ? "linear-gradient(90deg,#fb923c,#fbbf24)"
      : pct >= 50
        ? "linear-gradient(90deg,#60a5fa,#4edea3)"
        : isLoan
          ? "linear-gradient(90deg,#4edea3,#60a5fa)"
          : "linear-gradient(90deg,#ffb4ab,#fb923c)";
  return (
    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

// ─── Debt Card ────────────────────────────────────────────────────
function DebtCard({
  debt, lang, onExpand, expanded, onEdit, onDelete, onPayment,
}: {
  debt: Debt; lang: string; expanded: boolean;
  onExpand: () => void; onEdit: () => void; onDelete: () => void; onPayment: () => void;
}) {
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const isLoan = debt.type === "loan";
  const pp = paidPct(debt);
  const tp = timePct(debt);
  const dl = daysLeft(debt);
  const isPastDue = dl !== null && dl < 0 && !debt.isPaid;
  const isOverpaid = debt.remainingAmount <= 0 && !debt.isPaid;
  const isLarge = debt.amount >= 100_000_000;

  // Swipe state
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const THRESHOLD = 72;

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; setSwiping(true); };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const dx = e.touches[0].clientX - startX.current;
    setSwipeX(Math.max(-THRESHOLD * 2, Math.min(0, dx)));
  };
  const onTouchEnd = () => {
    setSwiping(false);
    if (swipeX < -THRESHOLD) setSwipeX(-THRESHOLD * 2);
    else setSwipeX(0);
  };

  const progLabel = pp >= 100
    ? { text: L("Lunas!", "Paid Off!"), color: "#4edea3" }
    : pp >= 95
      ? { text: L("Satu Langkah Lagi!", "Almost There!"), color: "#fb923c" }
      : pp >= 50
        ? { text: L("Setengah Jalan!", "Halfway!"), color: "#60a5fa" }
        : null;

  return (
    <div className="relative overflow-hidden rounded-[24px]">
      {/* Swipe action buttons behind */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3">
        <button onClick={onEdit}
          className="size-12 rounded-2xl bg-[#60a5fa]/20 border border-[#60a5fa]/30 flex items-center justify-center text-[#60a5fa] active:scale-90 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
        <button onClick={onDelete}
          className="size-12 rounded-2xl bg-[#ffb4ab]/20 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab] active:scale-90 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Main card — slides on swipe */}
      <div
        className="relative rounded-[24px] border border-white/5 overflow-hidden transition-transform"
        style={{ backgroundColor: "var(--app-card)", transform: `translateX(${swipeX}px)`, transition: swiping ? "none" : "transform 0.25s ease" }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

        {/* Color stripe */}
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isLoan ? "bg-[#4edea3]" : "bg-[#ffb4ab]"}`} />

        <div className="pl-5 pr-4 pt-4 pb-3 cursor-pointer" onClick={() => { setSwipeX(0); onExpand(); }}>

          {/* Large amount layout (>= 100jt) */}
          {isLarge ? (
            <div className="mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: "var(--app-text2)" }}>
                {L("SUDAH TERBAYAR", "AMOUNT PAID")}
              </p>
              <p className={`font-mono font-black text-[28px] leading-tight ${isLoan ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                {fmtRp(debt.amount - debt.remainingAmount)}
              </p>
              <p className="text-[11px] font-bold mt-0.5" style={{ color: "var(--app-text2)" }}>
                {L("dari total", "of total")} {fmtRp(debt.amount)}
              </p>
              {isOverpaid && (
                <p className="text-[10px] font-black text-[#4edea3] mt-1">
                  {L("Target telah melebihi target yang dikejar", "Payment exceeds the target amount")}
                </p>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center font-black text-[16px] ${isLoan ? "bg-[#4edea3]/10 text-[#4edea3]" : "bg-[#ffb4ab]/10 text-[#ffb4ab]"}`}>
                  {debt.personName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-[15px]" style={{ color: "var(--app-text)" }}>{debt.personName}</h4>
                  <p className={`text-[10px] font-bold uppercase ${isLoan ? "text-[#4edea3]/70" : "text-[#ffb4ab]/70"}`}>
                    {isLoan ? L("Piutang", "Loan") : L("Hutang", "Debt")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-mono font-black text-[15px] ${isLoan ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                  {fmtRp(debt.remainingAmount)}
                </p>
                {pp > 0 && (
                  <p className="text-[9px] font-bold" style={{ color: "var(--app-text2)" }}>
                    {L("sisa dari", "left of")} {fmtRp(debt.amount)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Large layout name row */}
          {isLarge && (
            <div className="flex items-center gap-2 mb-3">
              <div className={`size-8 rounded-xl flex items-center justify-center font-black text-[13px] ${isLoan ? "bg-[#4edea3]/10 text-[#4edea3]" : "bg-[#ffb4ab]/10 text-[#ffb4ab]"}`}>
                {debt.personName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-[14px]" style={{ color: "var(--app-text)" }}>{debt.personName}</p>
                <p className={`text-[9px] font-bold uppercase ${isLoan ? "text-[#4edea3]/70" : "text-[#ffb4ab]/70"}`}>
                  {isLoan ? L("Piutang", "Loan") : L("Hutang", "Debt")}
                </p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                {progLabel && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse"
                    style={{ backgroundColor: `${progLabel.color}20`, color: progLabel.color }}>
                    {progLabel.text}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black" style={{ color: "var(--app-text2)" }}>{pp.toFixed(0)}%</span>
            </div>
            <DebtProgressBar pct={pp} isLoan={isLoan} />
          </div>

          {/* Time progress bar */}
          {tp !== null && (
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold" style={{ color: "var(--app-text2)" }}>
                  {L("Waktu", "Time")} {tp.toFixed(0)}%
                </span>
                {dl !== null && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isPastDue ? "bg-[#ffb4ab]/15 text-[#ffb4ab]" : dl <= 7 ? "bg-[#fb923c]/15 text-[#fb923c]" : "bg-white/5 text-[#64748b]"}`}>
                    {isPastDue ? L("Lewat jatuh tempo!", "Past due!") : `${dl} ${L("hari lagi", "days left")}`}
                  </span>
                )}
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${tp}%`, background: tp >= 95 ? "linear-gradient(90deg,#ffb4ab,#fb923c)" : tp >= 80 ? "linear-gradient(90deg,#fbbf24,#fb923c)" : "linear-gradient(90deg,#60a5fa,#94a3b8)" }} />
              </div>
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              {debt.dueDate && (
                <span className="text-[9px] font-bold text-[#64748b]">
                  📅 {new Date(debt.dueDate).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              {debt.notes && <span className="text-[9px] text-[#64748b] italic truncate max-w-[100px]">"{debt.notes}"</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); onPayment(); }}
                className={`text-[9px] font-black px-2.5 py-1 rounded-full transition-all active:scale-90 ${debt.isPaid ? "opacity-30 cursor-not-allowed" : isLoan ? "bg-[#4edea3]/15 text-[#4edea3]" : "bg-[#ffb4ab]/15 text-[#ffb4ab]"}`}
                disabled={debt.isPaid}>
                + {L("Bayar", "Pay")}
              </button>
              <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Accordion — payment history */}
        {expanded && (
          <div className="px-5 pb-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-200"
            style={{ backgroundColor: "var(--app-card2)" }}>
            <p className="text-[10px] font-black tracking-widest uppercase pt-3 pb-2" style={{ color: "var(--app-text2)" }}>
              {L("Riwayat Cicilan", "Payment History")}
            </p>
            {debt.payments.length === 0 ? (
              <p className="text-[12px] text-[#64748b] py-2">{L("Belum ada cicilan", "No payments yet")}</p>
            ) : (
              <div className="space-y-1.5">
                {[...debt.payments].reverse().map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-[11px]" style={{ color: "var(--app-text2)" }}>
                      {new Date(p.date).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className={`font-mono font-bold text-[12px] ${isLoan ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                      +{fmtRp(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-2 border-t border-white/5 flex justify-between">
              <span className="text-[10px] font-bold" style={{ color: "var(--app-text2)" }}>{L("Total terbayar", "Total paid")}</span>
              <span className={`font-mono font-black text-[12px] ${isLoan ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                {fmtRp(debt.amount - debt.remainingAmount)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function DebtPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const [debts, setDebts] = useState<Debt[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "paid">("active");

  // Add/Edit form
  const [fType, setFType] = useState<"debt" | "loan">("loan");
  const [fPerson, setFPerson] = useState("");
  const [fAmount, setFAmount] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fDueDate, setFDueDate] = useState("");
  const [fCreatedAt, setFCreatedAt] = useState("");

  // Payment form
  const [payAmt, setPayAmt] = useState("");
  const [paySource, setPaySource] = useState<"cash" | string>("cash"); // cash or bankAccountId

  useEffect(() => {
    const refresh = () => {
      const d = getDebts();
      setDebts(d);
      checkTimeNotifications(d, lang);
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, [lang]);

  const openAdd = () => {
    setEditingDebt(null);
    setFType("loan"); setFPerson(""); setFAmount(""); setFNotes(""); setFDueDate(""); setFCreatedAt("");
    setShowAddModal(true);
  };

  const openEdit = (d: Debt) => {
    setEditingDebt(d);
    setFType(d.type);
    setFPerson(d.personName);
    setFAmount(String(d.amount)); setFNotes(d.notes);
    setFDueDate(d.dueDate ? d.dueDate.slice(0, 10) : "");
    setFCreatedAt(d.createdAt ? d.createdAt.slice(0, 10) : "");
    setShowAddModal(true);
  };

  const handleSave = () => {
    const amt = parseInt(fAmount.replace(/\D/g, "")) || 0;
    const resolvedName = fPerson.trim();
    if (!resolvedName || amt <= 0) {
      playAlertSound();
      return;
    }
    if (editingDebt) {
      updateDebt(editingDebt.id, { type: fType, personName: resolvedName, amount: amt, notes: fNotes.trim(), dueDate: fDueDate || undefined });
    } else {
      // Saat buat catatan hutang/piutang baru, tidak perlu pilih metode pembayaran.
      // Metode pembayaran hanya berlaku saat "Bayar" (cicilan).
      addDebt({
        type: fType, personName: resolvedName, amount: amt, notes: fNotes.trim(),
        dueDate: fDueDate || undefined,
        createdAt: fCreatedAt ? new Date(fCreatedAt).toISOString() : undefined,
      });
    }
    void crudSuccess();
    setShowAddModal(false);
  };

  const handlePayment = () => {
    if (!payingDebt) return;
    const amt = parseInt(payAmt.replace(/\D/g, "")) || 0;
    if (amt <= 0) {
      playAlertSound();
      return;
    }
    // Pembayaran cicilan juga mempengaruhi cash/bank.
    // Untuk debt (hutang saya): bayar -> uang keluar (expense)
    // Untuk loan (piutang / saya menghutangi orang): terima bayar -> uang masuk (income)
    const isLoan = payingDebt.type === "loan";
    const mainTx = addTransaction({
      amount: amt,
      category: payingDebt.type === "loan" ? "Piutang" : "Hutang",
      notes: `Cicilan ${payingDebt.personName}`,
      type: isLoan ? "income" : "expense",
      paymentSource: paySource === "cash"
        ? { type: "cash", label: "Cash" }
        : { type: "bank", id: paySource, label: getBankAccounts().find(a => a.id === paySource)?.bankName },
    });

    if (paySource === "cash") {
      if (!isLoan && getCashWalletBalance() < amt) { playAlertSound(); return; }
      addCashWalletTransaction({
        type: isLoan ? "in" : "out",
        amount: amt,
        category: isLoan ? "Piutang" : "Hutang",
        notes: `Cicilan ${payingDebt.personName}`,
        date: new Date().toISOString(),
        relatedTransactionId: mainTx.id,
      });
    } else {
      const bankId = paySource;
      if (!isLoan && getBankAvailableBalance(bankId) < amt) { playAlertSound(); return; }
      addBankTransaction({
        bankAccountId: bankId,
        type: isLoan ? "credit" : "debit",
        amount: amt,
        adminFee: 0,
        category: isLoan ? "Piutang" : "Hutang",
        notes: `Cicilan ${payingDebt.personName}`,
        paymentMethod: bankId,
        relatedTransactionId: mainTx.id,
        date: new Date().toISOString(),
      });
    }
    const wasFullyPaid = payingDebt.remainingAmount <= amt;
    addDebtPayment(payingDebt.id, amt);
    if (wasFullyPaid) {
      playDebtPaidSound();
      try { window.alert("berhasil"); } catch { /* ignore */ }
    } else {
      void crudSuccess();
    }
    setPayAmt("");
    setPayingDebt(null);
  };

  const activeDebts = debts.filter(d => !d.isPaid);
  const paidDebts = debts.filter(d => d.isPaid);
  const totalLoan = activeDebts.filter(d => d.type === "loan").reduce((s, d) => s + d.remainingAmount, 0);
  const totalDebt = activeDebts.filter(d => d.type === "debt").reduce((s, d) => s + d.remainingAmount, 0);

  return (
    <div className="w-full min-h-screen flex justify-center pb-32 overflow-y-auto" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        {pendingDeleteId && (
          <ConfirmDialog
            title={L("Hapus Catatan?", "Delete Record?")}
            message={L("Catatan ini akan dihapus permanen.", "This record will be permanently deleted.")}
            confirmLabel={L("Hapus", "Delete")} cancelLabel={L("Batal", "Cancel")}
            onConfirm={() => { deleteDebt(pendingDeleteId); void crudDeleteSuccess(); setPendingDeleteId(null); setPayingDebt(null); }}
            onCancel={() => setPendingDeleteId(null)}
          />
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full transition-colors" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="font-extrabold text-[20px] flex-1" style={{ color: "var(--app-text)" }}>{L("Buku Hutang & Piutang", "Debt & Loan Book")}</h1>
          <button onClick={openAdd} className="size-10 rounded-full bg-[#4edea3] flex items-center justify-center text-[#003824] shadow-lg active:scale-90 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] p-5 border relative overflow-hidden" style={{ backgroundColor: "var(--app-card)", borderColor: "rgba(78,222,163,0.15)" }}>
            <div className="absolute -right-4 -top-4 size-16 bg-[#4edea3]/5 rounded-full blur-2xl" />
            <p className="text-[10px] font-black tracking-wider uppercase mb-1" style={{ color: "var(--app-text2)" }}>{L("DIHUTANGI", "LOANS OUT")}</p>
            <h2 className="text-[18px] font-black text-[#4edea3] leading-tight">{fmtRp(totalLoan)}</h2>
            <p className="text-[9px] mt-1" style={{ color: "var(--app-text2)" }}>{L("Uangmu di orang lain", "Money owed to you")}</p>
          </div>
          <div className="rounded-[24px] p-5 border relative overflow-hidden" style={{ backgroundColor: "var(--app-card)", borderColor: "rgba(255,180,171,0.15)" }}>
            <div className="absolute -right-4 -top-4 size-16 bg-[#ffb4ab]/5 rounded-full blur-2xl" />
            <p className="text-[10px] font-black tracking-wider uppercase mb-1" style={{ color: "var(--app-text2)" }}>{L("HUTANG SAYA", "MY DEBTS")}</p>
            <h2 className="text-[18px] font-black text-[#ffb4ab] leading-tight">{fmtRp(totalDebt)}</h2>
            <p className="text-[9px] mt-1" style={{ color: "var(--app-text2)" }}>{L("Wajib kamu bayar", "You owe others")}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-[14px]" style={{ backgroundColor: "var(--app-card)" }}>
          {(["active", "paid"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-[10px] text-[12px] font-bold transition-all ${activeTab === tab ? "bg-[#4edea3] text-[#003824]" : "text-[#64748b]"}`}>
              {tab === "active" ? `${L("Aktif", "Active")} (${activeDebts.length})` : `${L("Lunas", "Paid")} (${paidDebts.length})`}
            </button>
          ))}
        </div>

        {/* Hint swipe */}
        {activeTab === "active" && activeDebts.length > 0 && (
          <p className="text-[10px] text-[#64748b] text-center">
            {L("← Geser kartu untuk Edit / Hapus", "← Swipe card to Edit / Delete")}
          </p>
        )}

        {/* Active list */}
        {activeTab === "active" && (
          <div className="space-y-3">
            {activeDebts.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <span className="text-[64px] block">📒</span>
                <p className="text-[14px] font-bold mt-2" style={{ color: "var(--app-text)" }}>{L("Buku hutang kosong", "Debt book is empty")}</p>
              </div>
            ) : (
              activeDebts.map(d => (
                <DebtCard key={d.id} debt={d} lang={lang}
                  expanded={expandedId === d.id}
                  onExpand={() => setExpandedId(expandedId === d.id ? null : d.id)}
                  onEdit={() => openEdit(d)}
                  onDelete={() => setPendingDeleteId(d.id)}
                  onPayment={() => { setPayingDebt(d); setPayAmt(""); }}
                />
              ))
            )}
          </div>
        )}

        {/* Paid list */}
        {activeTab === "paid" && (
          <div className="space-y-3">
            {paidDebts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-[#64748b]">{L("Belum ada yang lunas", "No paid records yet")}</p>
              </div>
            ) : (
              paidDebts.map(d => (
                <DebtCard key={d.id} debt={d} lang={lang}
                  expanded={expandedId === d.id}
                  onExpand={() => setExpandedId(expandedId === d.id ? null : d.id)}
                  onEdit={() => openEdit(d)}
                  onDelete={() => setPendingDeleteId(d.id)}
                  onPayment={() => { }}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-[390px] animate-in slide-in-from-bottom duration-300">
            <div className="rounded-t-[40px] bg-[#171f33] border-t border-white/10 px-6 pt-6 pb-10 space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center">
                <h2 className="text-[20px] font-extrabold text-white">
                  {editingDebt ? L("Edit Catatan", "Edit Record") : L("Catatan Baru", "New Record")}
                </h2>
                <div className="flex bg-[#0b1326] p-1 rounded-xl">
                  <button onClick={() => setFType("loan")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${fType === "loan" ? "bg-[#4edea3] text-[#003824]" : "text-[#64748b]"}`}>
                    {L("PIUTANG", "LOAN")}
                  </button>
                  <button onClick={() => setFType("debt")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${fType === "debt" ? "bg-[#ffb4ab] text-[#003824]" : "text-[#64748b]"}`}>
                    {L("HUTANG", "DEBT")}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-2">
                    {fType === "loan"
                      ? L("PEMINJAM", "BORROWER")
                      : L("PEMBERI PINJAMAN", "LENDER")}
                  </p>
                  <input
                    value={fPerson}
                    onChange={e => setFPerson(e.target.value)}
                    placeholder={fType === "loan"
                      ? L("Nama peminjam...", "Borrower's name...")
                      : L("Nama pemberi pinjaman...", "Lender's name...")}
                    className="w-full bg-[#0b1326] border border-white/5 rounded-2xl p-4 text-white outline-none"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1.5">{L("NOMINAL", "AMOUNT")}</p>
                  <div className="flex bg-[#0b1326] border border-white/5 rounded-2xl items-center px-4">
                    <span className="text-[#64748b] font-bold">Rp</span>
                    <input value={fAmount ? parseInt(fAmount.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                      onChange={e => setFAmount(e.target.value.replace(/\D/g, ""))}
                      placeholder="0" className="flex-1 bg-transparent py-4 px-2 text-white outline-none font-black text-[18px]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1.5">{L("TGL PINJAM", "BORROW DATE")}</p>
                    <input type="date" value={fCreatedAt} onChange={e => setFCreatedAt(e.target.value)}
                      className="w-full bg-[#0b1326] border border-white/5 rounded-2xl p-3 text-white outline-none text-[13px]" style={{ colorScheme: "dark" }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1.5">{L("JATUH TEMPO", "DUE DATE")}</p>
                    <input type="date" value={fDueDate} onChange={e => setFDueDate(e.target.value)}
                      className="w-full bg-[#0b1326] border border-white/5 rounded-2xl p-3 text-white outline-none text-[13px]" style={{ colorScheme: "dark" }} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1.5">{L("CATATAN", "NOTES")}</p>
                  <input value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="..."
                    className="w-full bg-[#0b1326] border border-white/5 rounded-2xl p-3.5 text-white outline-none text-[13px]" />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1.5">
                    {L("CATATAN", "NOTES")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-[#2d3449] rounded-2xl text-white font-bold">{L("Batal", "Cancel")}</button>
                <button onClick={handleSave} disabled={!fPerson.trim() || !fAmount}
                  className={`flex-1 py-4 rounded-2xl font-extrabold disabled:opacity-50 ${fType === "loan" ? "bg-[#4edea3] text-[#003824]" : "bg-[#ffb4ab] text-[#003824]"}`}>
                  {L("SIMPAN", "SAVE")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payingDebt && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setPayingDebt(null)} />
          <div className="relative w-full max-w-[390px] animate-in slide-in-from-bottom duration-300">
            <div className="rounded-t-[40px] bg-[#171f33] border-t border-white/10 px-6 pt-6 pb-10 space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="text-center space-y-1">
                <div className={`size-14 mx-auto rounded-3xl flex items-center justify-center text-[22px] font-black ${payingDebt.type === "loan" ? "bg-[#4edea3]/20 text-[#4edea3]" : "bg-[#ffb4ab]/20 text-[#ffb4ab]"}`}>
                  {payingDebt.personName.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-[20px] font-black text-white">{payingDebt.personName}</h2>
                <p className="text-[11px] text-[#64748b] font-bold uppercase tracking-widest">
                  {payingDebt.type === "loan" ? L("PIUTANG", "LOAN") : L("HUTANG", "DEBT")}
                </p>
              </div>

              {/* Amount display */}
              <div className="bg-[#0b1326] p-5 rounded-[28px] border border-white/5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[11px] font-bold text-[#64748b]">{L("Sudah terbayar", "Paid so far")}</span>
                  <span className="font-mono font-black text-[13px] text-[#4edea3]">{fmtRp(payingDebt.amount - payingDebt.remainingAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] font-bold text-[#64748b]">{L("Kurang", "Remaining")}</span>
                  <span className={`font-mono font-black text-[13px] ${payingDebt.type === "loan" ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>{fmtRp(payingDebt.remainingAmount)}</span>
                </div>
                <DebtProgressBar pct={paidPct(payingDebt)} isLoan={payingDebt.type === "loan"} />
                <p className="text-[10px] text-center text-[#64748b]">{paidPct(payingDebt).toFixed(0)}% {L("terbayar dari", "paid of")} {fmtRp(payingDebt.amount)}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1.5">{L("NOMINAL BAYAR", "PAYMENT AMOUNT")}</p>
                <div className="flex bg-[#0b1326] border border-white/5 rounded-2xl items-center px-4 focus-within:border-[#4edea3]/30 transition-colors">
                  <span className="text-[#64748b] font-black">Rp</span>
                  <input value={payAmt ? parseInt(payAmt.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                    onChange={e => setPayAmt(e.target.value.replace(/\D/g, ""))}
                    placeholder="0" className="flex-1 bg-transparent py-4 px-2 text-white outline-none font-black text-[18px]" />
                  <button onClick={() => setPayAmt(String(payingDebt.remainingAmount))}
                    className="text-[10px] font-bold text-[#4edea3] bg-[#4edea3]/10 px-2 py-1 rounded-lg uppercase">
                    {L("LUNAS", "FULL")}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mb-1.5">{L("METODE PEMBAYARAN", "PAYMENT METHOD")}</p>
                <select value={paySource} onChange={e => setPaySource(e.target.value)}
                  className="w-full bg-[#0b1326] border border-white/5 rounded-2xl p-3 text-white outline-none text-[13px]"
                  style={{ colorScheme: "dark" }}>
                  <option value="cash">💵 Cash — {formatRupiah(getCashWalletBalance())}</option>
                  {getBankAccounts().map(a => (
                    <option key={a.id} value={a.id}>🏦 {a.bankName} — {formatRupiah(getBankAvailableBalance(a.id))} (available)</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPayingDebt(null)} className="flex-1 py-4 bg-[#2d3449] rounded-2xl text-white font-bold">{L("Batal", "Cancel")}</button>
                <button onClick={handlePayment} disabled={!payAmt || parseInt(payAmt.replace(/\D/g, "")) <= 0}
                  className="flex-1 py-4 bg-[#4edea3] rounded-2xl text-[#003824] font-extrabold disabled:opacity-50">
                  {L("CATAT BAYAR", "RECORD PAYMENT")}
                </button>
              </div>

              <button onClick={() => { setPendingDeleteId(payingDebt.id); setPayingDebt(null); }}
                className="w-full py-2 text-[#ffb4ab] text-[11px] font-bold opacity-50 hover:opacity-100 transition-opacity">
                🗑️ {L("Hapus Catatan Ini", "Delete This Record")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
