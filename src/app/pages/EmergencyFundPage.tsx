import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router";
import {
  getEmergencyFund, saveEmergencyFund, addToEmergencyFund,
  withdrawFromEmergencyFund, updateEmergencyFund, deleteEmergencyFund,
  getEmergencyFundETA, formatRupiah, type EmergencyFund,
  getBankAccounts, addBankTransaction, getBankAvailableBalance,
  getCashWalletBalance, addCashWalletTransaction,
  addTransaction, formatMoneyInput, parseMoneyInput,
  getEmergencyFunds,
  applyForcedWithdrawalPenalty, applyDisciplineReward,
  checkAndAutoUnlockCoolingOff, applyModalExitReward,
  getDisciplineState, isInvestFrozen, getWithdrawalStrikeCount,
} from "../store/database";
import { useLang } from "../i18n";
import { playAlertSound } from "../lib/sounds";
import { crudSuccess, crudDeleteSuccess } from "../lib/notify";

const L = (lang: string, id: string, en: string) => lang === "en" ? en : id;

type Tab = "overview" | "history" | "withdrawals";

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function parseAmount(val: string) {
  return parseMoneyInput(val);
}

function formatRupiahInput(val: string) {
  return formatMoneyInput(val);
}

export default function EmergencyFundPage() {
  const navigate = useNavigate();
  const { fundId } = useParams<{ fundId?: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const lang = useLang();
  const [fund, setFund] = useState<EmergencyFund | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [showSetup, setShowSetup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [setupForm, setSetupForm] = useState({ name: "Dana Darurat", targetAmount: "", monthlyContribution: "" });
  const [topUpAmt, setTopUpAmt] = useState("");
  const [topUpNote, setTopUpNote] = useState("");
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpSource, setTopUpSource] = useState<"cash" | string>("cash"); // cash or bankAccountId
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawDestination, setWithdrawDestination] = useState<"cash" | string>("cash"); // cash or bankAccountId
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModalExit, setShowModalExit] = useState(false); // Modal Exit popup
  const [showWithdrawWarning, setShowWithdrawWarning] = useState(false); // Peringatan sebelum tarik dana

  // ── Kalkulator Top-up ────────────────────────────────────────────
  const [showTopUpCalc, setShowTopUpCalc] = useState(false);
  const [topUpCalcDisplay, setTopUpCalcDisplay] = useState("0");
  const [topUpCalcFirst, setTopUpCalcFirst] = useState<number | null>(null);
  const [topUpCalcOp, setTopUpCalcOp] = useState<string | null>(null);
  const [topUpCalcWait, setTopUpCalcWait] = useState(false);

  // ── Kalkulator Withdraw ──────────────────────────────────────────
  const [showWdCalc, setShowWdCalc] = useState(false);
  const [wdCalcDisplay, setWdCalcDisplay] = useState("0");
  const [wdCalcFirst, setWdCalcFirst] = useState<number | null>(null);
  const [wdCalcOp, setWdCalcOp] = useState<string | null>(null);
  const [wdCalcWait, setWdCalcWait] = useState(false);

  const isCreateRoute = location.pathname.endsWith("/emergency-funds/new");

  const refresh = () => {
    if (isCreateRoute) {
      setFund(null);
      setIsLoaded(true);
      return;
    }
    // Backward compat: /app/emergency-fund loads first fund
    setFund(getEmergencyFund(fundId));
    setIsLoaded(true);
  };

  useEffect(() => {
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, [fundId, isCreateRoute]);

  useEffect(() => {
    if (searchParams.get("topup") === "1") setShowTopUp(true);
  }, [searchParams]);

  useEffect(() => {
    // Jangan auto-munculkan setup saat fund masih loading (biar tidak "dipaksa buat lagi")
    if (!isLoaded) return;
    if (isCreateRoute) {
      setShowSetup(true);
      return;
    }
    if (fund) {
      setShowSetup(false);
      return;
    }
    // Jika tidak ada fund yang ditemukan, hanya minta setup kalau memang belum ada dana darurat sama sekali
    const hasAny = getEmergencyFunds().length > 0;
    if (!hasAny) {
      setShowSetup(true);
    } else {
      // Ada dana darurat, tapi fundId tidak ditemukan → kembali ke list
      navigate("/app/emergency-funds", { replace: true });
    }
  }, [fund, isCreateRoute, isLoaded]);

  const progress = fund && fund.targetAmount > 0 ? Math.min((fund.savedAmount / fund.targetAmount) * 100, 100) : 0;
  const remaining = fund ? Math.max(0, fund.targetAmount - fund.savedAmount) : 0;
  const isComplete = progress >= 100;
  const eta = fund ? getEmergencyFundETA(fund.id) : null;
  const totalWithdrawn = fund?.withdrawals.reduce((s, w) => s + w.amount, 0) ?? 0;

  // ── Kalkulator helpers (reusable) ────────────────────────────────
  const CALC_BTNS = [["7","8","9","÷"],["4","5","6","×"],["1","2","3","−"],["AC","0",".","+"]];

  function calcDo(a: number, b: number, op: string) {
    if (op === "+") return a + b; if (op === "−") return a - b;
    if (op === "×") return a * b; if (op === "÷") return b !== 0 ? a / b : 0; return b;
  }

  // ── Top-up calculator ────────────────────────────────────────────
  function topUpCalcPress(v: string) {
    if (v === "AC") { setTopUpCalcDisplay("0"); setTopUpCalcFirst(null); setTopUpCalcOp(null); setTopUpCalcWait(false); return; }
    if (v === "⌫") { setTopUpCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0"); return; }
    if (v === "=") {
      if (!topUpCalcOp || topUpCalcFirst === null) return;
      const r = calcDo(topUpCalcFirst, parseFloat(topUpCalcDisplay), topUpCalcOp);
      const result = parseFloat(r.toFixed(10));
      setTopUpCalcDisplay(String(result));
      setTopUpCalcFirst(null); setTopUpCalcOp(null); setTopUpCalcWait(false);
      const n = Math.floor(Math.abs(result));
      if (n > 0) setTopUpAmt(formatMoneyInput(String(n)));
      return;
    }
    if (["÷","×","−","+"].includes(v)) {
      const val = parseFloat(topUpCalcDisplay);
      if (topUpCalcFirst === null) { setTopUpCalcFirst(val); }
      else if (topUpCalcOp && !topUpCalcWait) { const r = calcDo(topUpCalcFirst, val, topUpCalcOp); setTopUpCalcDisplay(String(r)); setTopUpCalcFirst(r); }
      setTopUpCalcOp(v); setTopUpCalcWait(true); return;
    }
    if (v === ".") {
      if (topUpCalcWait) { setTopUpCalcDisplay("0."); setTopUpCalcWait(false); return; }
      if (!topUpCalcDisplay.includes(".")) setTopUpCalcDisplay(prev => prev + ".");
      return;
    }
    if (topUpCalcWait) { setTopUpCalcDisplay(v); setTopUpCalcWait(false); }
    else { setTopUpCalcDisplay(prev => prev === "0" ? v : prev + v); }
  }
  function topUpCalcFmt() {
    const n = parseFloat(topUpCalcDisplay);
    if (isNaN(n)) return "0";
    if (topUpCalcDisplay.endsWith(".")) return topUpCalcDisplay;
    return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // ── Withdraw calculator ──────────────────────────────────────────
  function wdCalcPress(v: string) {
    if (v === "AC") { setWdCalcDisplay("0"); setWdCalcFirst(null); setWdCalcOp(null); setWdCalcWait(false); return; }
    if (v === "⌫") { setWdCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0"); return; }
    if (v === "=") {
      if (!wdCalcOp || wdCalcFirst === null) return;
      const r = calcDo(wdCalcFirst, parseFloat(wdCalcDisplay), wdCalcOp);
      const result = parseFloat(r.toFixed(10));
      setWdCalcDisplay(String(result));
      setWdCalcFirst(null); setWdCalcOp(null); setWdCalcWait(false);
      const n = Math.floor(Math.abs(result));
      if (n > 0) setWithdrawAmt(formatMoneyInput(String(n)));
      return;
    }
    if (["÷","×","−","+"].includes(v)) {
      const val = parseFloat(wdCalcDisplay);
      if (wdCalcFirst === null) { setWdCalcFirst(val); }
      else if (wdCalcOp && !wdCalcWait) { const r = calcDo(wdCalcFirst, val, wdCalcOp); setWdCalcDisplay(String(r)); setWdCalcFirst(r); }
      setWdCalcOp(v); setWdCalcWait(true); return;
    }
    if (v === ".") {
      if (wdCalcWait) { setWdCalcDisplay("0."); setWdCalcWait(false); return; }
      if (!wdCalcDisplay.includes(".")) setWdCalcDisplay(prev => prev + ".");
      return;
    }
    if (wdCalcWait) { setWdCalcDisplay(v); setWdCalcWait(false); }
    else { setWdCalcDisplay(prev => prev === "0" ? v : prev + v); }
  }
  function wdCalcFmt() {
    const n = parseFloat(wdCalcDisplay);
    if (isNaN(n)) return "0";
    if (wdCalcDisplay.endsWith(".")) return wdCalcDisplay;
    return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleSetup() {
    const target = parseAmount(setupForm.targetAmount);
    const monthly = parseAmount(setupForm.monthlyContribution);
    if (target <= 0) { playAlertSound(); return; }
    if (isEditing && fund) {
      updateEmergencyFund(fund.id, { name: setupForm.name || "Dana Darurat", targetAmount: target, monthlyContribution: monthly });
    } else {
      // Buat dana darurat tanpa metode pembayaran.
      // Dana masuk melalui fitur "Tambah Dana" (Top-up) yang punya metode pembayaran.
      saveEmergencyFund({ name: setupForm.name || "Dana Darurat", targetAmount: target, savedAmount: 0, monthlyContribution: monthly, isActive: true });
    }
    void crudSuccess();
    setShowSetup(false);
    setIsEditing(false);
    refresh();
  }

  function openEdit() {
    if (!fund) return;
    setSetupForm({ name: fund.name, targetAmount: formatRupiahInput(String(fund.targetAmount)), monthlyContribution: formatRupiahInput(String(fund.monthlyContribution)) });
    setIsEditing(true);
    setShowSetup(true);
  }

  function handleTopUp() {
    const amt = parseAmount(topUpAmt);
    if (amt <= 0) { playAlertSound(); return; }
    if (!fund) { playAlertSound(); return; }

    // Potong saldo dari metode pembayaran
    if (topUpSource === "cash") {
      if (getCashWalletBalance() < amt) { playAlertSound(); return; }
      // Main history tx
      const mainTx = addTransaction({
        amount: amt,
        category: "Dana Darurat",
        notes: topUpNote.trim() || "Top-up",
        type: "expense",
        paymentSource: { type: "cash", label: "Cash" },
      });
      addCashWalletTransaction({
        type: "out",
        amount: amt,
        category: "Dana Darurat",
        notes: topUpNote.trim() || "Top-up",
        date: new Date().toISOString(),
        relatedTransactionId: mainTx.id,
      });
    } else {
      const bankId = topUpSource;
      if (getBankAvailableBalance(bankId) < amt) { playAlertSound(); return; }
      const mainTx = addTransaction({
        amount: amt,
        category: "Dana Darurat",
        notes: topUpNote.trim() || "Top-up",
        type: "expense",
        paymentSource: { type: "bank", id: bankId, label: getBankAccounts().find(a => a.id === bankId)?.bankName },
      });
      addBankTransaction({
        bankAccountId: bankId,
        type: "debit",
        amount: amt,
        adminFee: 0,
        category: "Dana Darurat",
        notes: topUpNote.trim() || "Top-up",
        paymentMethod: bankId,
        relatedTransactionId: mainTx.id,
        date: new Date().toISOString(),
      });
      // Jika dana darurat belum diikat ke bank, otomatis ikat ke bank ini supaya saldo dianggap terkunci.
      if (!fund.lockedFromBankAccountId) updateEmergencyFund(fund.id, { lockedFromBankAccountId: bankId });
    }

    addToEmergencyFund(fund.id, amt, topUpNote.trim() || "Top-up");
    // 🏆 Discipline reward: top-up dana darurat
    applyDisciplineReward("topup_emergency");
    // 🔓 Auto-unlock: jika saldo ≥70% target, hapus cooling-off
    const updatedFund = getEmergencyFund(fund.id);
    if (updatedFund) {
      checkAndAutoUnlockCoolingOff(updatedFund.savedAmount, updatedFund.targetAmount);
    }
    void crudSuccess();
    setTopUpAmt(""); setTopUpNote(""); setShowTopUp(false);
    refresh();
  }

  function handleWithdraw() {
    const amt = parseAmount(withdrawAmt);
    if (amt <= 0 || !withdrawReason.trim()) { playAlertSound(); return; }
    if (!fund) { playAlertSound(); return; }
    if (fund.savedAmount < amt) { playAlertSound(); return; }

    // ⚡ DISCIPLINE MASTER: Penarikan dana darurat = penalti jika bukan darurat sejati
    // Deteksi darurat dengan sistem skor kata kunci — lebih ketat dari sekadar cek satu kata
    const reason = withdrawReason.toLowerCase();

    // Kata kunci darurat tinggi (satu saja cukup)
    const highPriorityKeywords = [
      "sakit", "medis", "rumah sakit", "rs ", "igd", "opname", "operasi",
      "kecelakaan", "accident", "emergency", "urgent", "kritis", "critical",
      "meninggal", "duka", "bencana", "kebakaran", "banjir", "gempa",
      "hospital", "dokter", "obat", "rawat inap",
    ];
    // Kata kunci darurat menengah (butuh ≥2 untuk lolos)
    const mediumPriorityKeywords = [
      "darurat", "mendesak", "penting", "terpaksa", "tidak ada pilihan",
      "harus", "segera", "sekarang", "butuh", "perlu banget",
    ];

    const hasHighPriority = highPriorityKeywords.some(k => reason.includes(k));
    const mediumCount = mediumPriorityKeywords.filter(k => reason.includes(k)).length;
    // Alasan minimal 15 karakter agar tidak bisa diisi asal
    const isLongEnough = withdrawReason.trim().length >= 15;

    const isGenuineEmergency = isLongEnough && (hasHighPriority || mediumCount >= 2);

    if (!isGenuineEmergency) {
      // 5-Strike Rule: skor -20, strike ke-5+ → cooling-off 5 hari
      applyForcedWithdrawalPenalty(amt, fund.name, withdrawReason.trim());
    }

    // Kembalikan dana ke Cash/Bank
    const note = `Dana Darurat: ${withdrawReason.trim()}`;
    if (withdrawDestination === "cash") {
      const mainTx = addTransaction({
        amount: amt,
        category: "Dana Darurat",
        notes: note,
        type: "income",
        paymentSource: { type: "cash", label: "Cash" },
      });
      addCashWalletTransaction({ type: "in", amount: amt, category: "Dana Darurat", notes: note, date: new Date().toISOString(), relatedTransactionId: mainTx.id });
    } else {
      const bankId = withdrawDestination;
      const mainTx = addTransaction({
        amount: amt,
        category: "Dana Darurat",
        notes: note,
        type: "income",
        paymentSource: { type: "bank", id: bankId, label: getBankAccounts().find(a => a.id === bankId)?.bankName },
      });
      addBankTransaction({
        bankAccountId: bankId,
        type: "credit",
        amount: amt,
        adminFee: 0,
        category: "Dana Darurat",
        notes: note,
        paymentMethod: bankId,
        relatedTransactionId: mainTx.id,
        date: new Date().toISOString(),
      });
    }

    withdrawFromEmergencyFund(fund.id, amt, withdrawReason.trim());
    void crudSuccess();
    setWithdrawAmt(""); setWithdrawReason(""); setShowWithdraw(false);
    refresh();
  }

  function handleModalExit(asModal: boolean) {
    if (!fund) return;
    if (asModal) {
      // Cairkan sebagai modal — tanpa penalti, beri reward
      applyModalExitReward();
    }
    // Cairkan seluruh saldo ke tujuan yang dipilih
    const amt = fund.savedAmount;
    const note = asModal
      ? `Modal Usaha/Investasi: ${fund.name}`
      : `Dana Darurat: Pencairan target tercapai`;
    if (withdrawDestination === "cash") {
      const mainTx = addTransaction({
        amount: amt, category: "Dana Darurat", notes: note, type: "income",
        date: new Date().toISOString(), paymentSource: { type: "cash", label: "Cash" },
      });
      addCashWalletTransaction({ type: "in", amount: amt, category: "Dana Darurat", notes: note, date: new Date().toISOString(), relatedTransactionId: mainTx.id });
    } else {
      const bankId = withdrawDestination;
      const mainTx = addTransaction({
        amount: amt, category: "Dana Darurat", notes: note, type: "income",
        date: new Date().toISOString(),
        paymentSource: { type: "bank", id: bankId, label: getBankAccounts().find(a => a.id === bankId)?.bankName },
      });
      addBankTransaction({
        bankAccountId: bankId, type: "credit", amount: amt, adminFee: 0,
        category: "Dana Darurat", notes: note, paymentMethod: bankId,
        relatedTransactionId: mainTx.id, date: new Date().toISOString(),
      });
    }
    withdrawFromEmergencyFund(fund.id, amt, note);
    void crudSuccess();
    setShowModalExit(false);
    refresh();
  }

  function handleDelete() {
    if (!fund) return;
    deleteEmergencyFund(fund.id);
    void crudDeleteSuccess();
    setFund(null);
    setShowDeleteConfirm(false);
    navigate("/app/emergency-funds");
  }

  // ── Setup / Edit Modal ──────────────────────────────────────────
  if (showSetup) {
    return (
      <div className="w-full min-h-screen flex justify-center" style={{ backgroundColor: "var(--app-bg)" }}>
        <div className="w-full max-w-[390px] px-5 pt-12 pb-10 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => { setShowSetup(false); setIsEditing(false); if (!fund) navigate("/app"); }}
              className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
              {isEditing ? L(lang, "Edit Dana Darurat", "Edit Emergency Fund") : L(lang, "Buat Dana Darurat", "Create Emergency Fund")}
            </h1>
          </div>

          <div className="rounded-[24px] p-6 border space-y-5"
            style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
            <div className="flex flex-col items-center gap-2 pb-2">
              <div className="size-16 rounded-full bg-[#ef4444]/15 flex items-center justify-center text-[32px]">🚨</div>
              <p className="font-['Inter'] text-[12px] text-center" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Dana ini digunakan untuk keadaan darurat tak terduga", "This fund is for unexpected emergencies")}
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-['Inter'] text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Nama Dana", "Fund Name")}
              </label>
              <input value={setupForm.name} onChange={e => setSetupForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Dana Darurat"
                className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
            </div>

            <div className="space-y-1">
              <label className="font-['Inter'] text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Target Dana (Rp)", "Target Amount (Rp)")}
              </label>
              <input type="text" inputMode="decimal" value={formatRupiahInput(setupForm.targetAmount)}
                onChange={e => setSetupForm(f => ({ ...f, targetAmount: formatMoneyInput(e.target.value) }))}
                placeholder="10.000.000"
                className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Rekomendasi: 3–6× pengeluaran bulanan", "Recommended: 3–6× monthly expenses")}
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-['Inter'] text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Kontribusi Bulanan (Rp, opsional)", "Monthly Contribution (Rp, optional)")}
              </label>
              <input type="text" inputMode="decimal" value={formatRupiahInput(setupForm.monthlyContribution)}
                onChange={e => setSetupForm(f => ({ ...f, monthlyContribution: formatMoneyInput(e.target.value) }))}
                placeholder="500.000"
                className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
            </div>

            {!isEditing && (
              <div className="rounded-[14px] p-3 border"
                style={{ backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.18)" }}>
                <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L(lang,
                    "Setelah dibuat, gunakan menu \"Tambah Dana\" untuk memasukkan saldo dengan metode pembayaran (Cash/Bank).",
                    "After creating it, use \"Add Funds\" to top up with a payment method (Cash/Bank)."
                  )}
                </p>
              </div>
            )}

            <button onClick={handleSetup}
              className="w-full h-[52px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-extrabold text-[15px] text-white active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
              {isEditing ? L(lang, "Simpan Perubahan", "Save Changes") : L(lang, "Buat Dana Darurat", "Create Emergency Fund")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!fund) return null;

  return (
    <div className="w-full min-h-screen flex justify-center pb-28" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/app")} className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px] leading-tight" style={{ color: "var(--app-text)" }}>
                🚨 {fund.name}
              </h1>
              <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Dibuat", "Created")} {formatDateShort(fund.createdAt)}
              </p>
            </div>
          </div>
          <button onClick={openEdit} className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
            </svg>
          </button>
        </div>

        {/* Hero Card */}
        <div className="rounded-[28px] overflow-hidden relative shadow-xl" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)" }} />
          <div className="relative p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-['Inter'] text-[11px] text-white/60 uppercase tracking-widest">
                  {L(lang, "Dana Terkumpul", "Funds Saved")}
                </p>
                <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[34px] text-white leading-none tracking-tight mt-1">
                  {formatRupiah(fund.savedAmount)}
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${isComplete ? "bg-white/20 text-white" : "bg-white/10 text-white/80"}`}>
                {isComplete ? "✅ Tercapai" : `${progress.toFixed(1)}%`}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-white/70">
                <span>{L(lang, "Target", "Target")}: {formatRupiah(fund.targetAmount)}</span>
                {!isComplete && <span>{L(lang, "Sisa", "Left")}: {formatRupiah(remaining)}</span>}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white/10 rounded-[12px] p-2.5 text-center">
                <p className="text-white/60 text-[9px] uppercase tracking-wider">{L(lang, "Top-up", "Top-ups")}</p>
                <p className="text-white font-bold text-[14px]">{fund.history.length}</p>
              </div>
              <div className="bg-white/10 rounded-[12px] p-2.5 text-center">
                <p className="text-white/60 text-[9px] uppercase tracking-wider">{L(lang, "Dipakai", "Used")}</p>
                <p className="text-white font-bold text-[14px]">{fund.withdrawals.length}×</p>
              </div>
              <div className="bg-white/10 rounded-[12px] p-2.5 text-center">
                <p className="text-white/60 text-[9px] uppercase tracking-wider">ETA</p>
                <p className="text-white font-bold text-[14px]">
                  {isComplete ? "✓" : eta !== null ? `${eta}bl` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[18px] p-4 border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
            <p className="font-['Inter'] text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--app-text2)" }}>
              {L(lang, "Kontribusi/Bulan", "Monthly Contrib.")}
            </p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]" style={{ color: "var(--app-text)" }}>
              {fund.monthlyContribution > 0 ? formatRupiah(fund.monthlyContribution) : "—"}
            </p>
          </div>
          <div className="rounded-[18px] p-4 border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
            <p className="font-['Inter'] text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--app-text2)" }}>
              {L(lang, "Total Dipakai", "Total Withdrawn")}
            </p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]" style={{ color: totalWithdrawn > 0 ? "#ffb4ab" : "var(--app-text)" }}>
              {totalWithdrawn > 0 ? formatRupiah(totalWithdrawn) : "—"}
            </p>
          </div>
        </div>

        {/* ETA Banner */}
        {!isComplete && eta !== null && (
          <div className="rounded-[16px] p-4 flex items-center gap-3 border border-[rgba(239,68,68,0.2)]"
            style={{ backgroundColor: "rgba(239,68,68,0.07)" }}>
            <span className="text-[22px]">📅</span>
            <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
              {L(lang,
                `Dengan kontribusi ${formatRupiah(fund.monthlyContribution)}/bulan, target tercapai dalam ~${eta} bulan`,
                `At ${formatRupiah(fund.monthlyContribution)}/month, target reached in ~${eta} months`
              )}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowTopUp(true)}
            className="h-[52px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-white active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M12 4v16m8-8H4" />
            </svg>
            {L(lang, "Tambah Dana", "Add Funds")}
          </button>
          <button onClick={() => {
              // Jika 100% tercapai → tampilkan Modal Exit
              if (isComplete) { setShowModalExit(true); return; }
              setShowWithdrawWarning(true);
            }}
            className="h-[52px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] active:scale-95 transition-all flex items-center justify-center gap-2 border"
            style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M4 12h16" />
            </svg>
            {L(lang, "Gunakan Dana", "Use Funds")}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: "var(--app-border)" }}>
          {(["overview", "history", "withdrawals"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="pb-2 px-1 font-['Plus_Jakarta_Sans'] font-bold text-[13px] transition-all border-b-2"
              style={{
                borderColor: tab === t ? "#ef4444" : "transparent",
                color: tab === t ? "#ef4444" : "var(--app-text2)",
              }}>
              {t === "overview" ? L(lang, "Info", "Info") : t === "history" ? L(lang, "Top-up", "Top-ups") : L(lang, "Pemakaian", "Usage")}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <div className="space-y-3">
            <div className="rounded-[18px] p-4 border space-y-3" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                {L(lang, "Tentang Dana Darurat", "About Emergency Fund")}
              </p>
              <p className="font-['Inter'] text-[12px] leading-relaxed" style={{ color: "var(--app-text2)" }}>
                {L(lang,
                  "Dana darurat adalah tabungan khusus untuk menghadapi situasi tak terduga seperti kehilangan pekerjaan, biaya medis mendadak, atau kerusakan aset penting.",
                  "An emergency fund is a dedicated savings for unexpected situations like job loss, sudden medical costs, or critical asset damage."
                )}
              </p>
              <div className="flex items-center gap-2 bg-[rgba(239,68,68,0.08)] rounded-[12px] p-3">
                <span className="text-[18px]">💡</span>
                <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "Idealnya 3–6× pengeluaran bulanan kamu", "Ideally 3–6× your monthly expenses")}
                </p>
              </div>
            </div>
            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-[44px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] border border-[rgba(239,68,68,0.3)] text-[#ef4444] active:scale-95 transition-all"
              style={{ backgroundColor: "rgba(239,68,68,0.06)" }}>
              {L(lang, "Hapus Dana Darurat", "Delete Emergency Fund")}
            </button>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-2">
            {fund.history.length === 0 ? (
              <div className="rounded-[18px] p-8 text-center" style={{ backgroundColor: "var(--app-card)" }}>
                <span className="text-[32px] block mb-2">📭</span>
                <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "Belum ada riwayat top-up", "No top-up history yet")}
                </p>
              </div>
            ) : [...fund.history].reverse().map(h => (
              <div key={h.id} className="rounded-[16px] p-4 flex items-center justify-between border"
                style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="size-[38px] rounded-full bg-[rgba(78,222,163,0.15)] flex items-center justify-center text-[16px]">💰</div>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                      {h.note || "Top-up"}
                    </p>
                    <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>{formatDateShort(h.date)}</p>
                  </div>
                </div>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-[#4edea3]">+{formatRupiah(h.amount)}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "withdrawals" && (
          <div className="space-y-2">
            {fund.withdrawals.length === 0 ? (
              <div className="rounded-[18px] p-8 text-center" style={{ backgroundColor: "var(--app-card)" }}>
                <span className="text-[32px] block mb-2">🛡️</span>
                <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "Dana belum pernah digunakan", "Fund has never been used")}
                </p>
              </div>
            ) : [...fund.withdrawals].reverse().map(w => (
              <div key={w.id} className="rounded-[16px] p-4 flex items-center justify-between border"
                style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="size-[38px] rounded-full bg-[rgba(239,68,68,0.12)] flex items-center justify-center text-[16px]">🚨</div>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                      {w.reason}
                    </p>
                    <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>{formatDateShort(w.date)}</p>
                  </div>
                </div>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-[#ffb4ab]">-{formatRupiah(w.amount)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Top-up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowTopUp(false)}>
          <div className="w-full max-w-[400px] rounded-[28px] shadow-2xl mb-4 max-h-[85vh] flex flex-col overflow-hidden"
            style={{ backgroundColor: "var(--app-card)" }} onClick={e => e.stopPropagation()}>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]" style={{ color: "var(--app-text)" }}>
              💰 {L(lang, "Tambah Dana", "Add Funds")}
            </h2>
            <div className="space-y-1">
              <label className="font-['Inter'] text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Metode Pembayaran", "Payment Method")}
              </label>
              <select value={topUpSource} onChange={e => setTopUpSource(e.target.value)}
                className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
                <option value="cash">💵 Cash — {formatRupiah(getCashWalletBalance())}</option>
                {getBankAccounts().map(a => (
                  <option key={a.id} value={a.id}>🏦 {a.bankName} — {formatRupiah(getBankAvailableBalance(a.id))} (available)</option>
                ))}
              </select>
              <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                {topUpSource === "cash"
                  ? L(lang, "Dana akan diambil dari Cash.", "Funds will be taken from Cash.")
                  : L(lang, "Dana akan diambil dari saldo tersedia bank.", "Funds will be taken from the bank's available balance.")}
              </p>
            </div>
            <div className="space-y-1">
              <label className="font-['Inter'] text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Jumlah (Rp)", "Amount (Rp)")}
              </label>
              {/* Amount display — mirrors FAB transaction */}
              <div className="relative rounded-[16px] w-full border" style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                <div className="absolute top-px bottom-px left-px w-1.5 rounded-l-[14px]" style={{ backgroundColor: "#ef4444" }} />
                <div className="p-4 pl-6">
                  <p className="font-['Inter'] font-semibold text-[10px] tracking-[2px] uppercase opacity-80 mb-1" style={{ color: "#ef4444" }}>
                    {L(lang, "MASUKKAN NOMINAL", "ENTER AMOUNT")}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[18px] text-[#64748b]">Rp</span>
                    {showTopUpCalc ? (
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[32px] tracking-[-1px] leading-[38px]" style={{ color: "var(--app-text)" }}>
                        {topUpCalcFmt()}
                      </span>
                    ) : (
                      <input type="text" inputMode="decimal" value={topUpAmt} onChange={e => setTopUpAmt(formatMoneyInput(e.target.value))}
                        placeholder="0" autoFocus
                        className="font-['Plus_Jakarta_Sans'] font-extrabold text-[32px] tracking-[-1px] leading-[38px] bg-transparent outline-none w-full"
                        style={{ color: "var(--app-text)" }} />
                    )}
                  </div>
                </div>
              </div>
              {/* Calc Toggle */}
              <div className="flex justify-center pt-1">
                <button type="button"
                  onClick={() => {
                    if (!showTopUpCalc && topUpAmt) setTopUpCalcDisplay(String(parseAmount(topUpAmt)));
                    setShowTopUpCalc(p => !p);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all active:scale-95"
                  style={{ backgroundColor: showTopUpCalc ? "rgba(0,209,139,0.15)" : "rgba(45,52,73,0.5)", border: showTopUpCalc ? "1px solid rgba(0,209,139,0.4)" : "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-[15px]">{showTopUpCalc ? "🔢" : "🧮"}</span>
                  <span className="font-['Inter'] font-semibold text-[12px]" style={{ color: showTopUpCalc ? "#00d18b" : "#94a3b8" }}>
                    {showTopUpCalc ? L(lang, "Sembunyikan Kalkulator", "Hide Calculator") : L(lang, "Tampilkan Kalkulator", "Show Calculator")}
                  </span>
                </button>
              </div>
              {/* Calculator panel */}
              {showTopUpCalc && (
                <div className="rounded-[24px] border p-4" style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {CALC_BTNS.flat().map((btn, i) => {
                      const isOp = ["÷","×","−","+"].includes(btn);
                      const isClear = btn === "AC";
                      const isBackspace = btn === "⌫";
                      const isActive = isOp && topUpCalcOp === btn && topUpCalcWait;
                      return (
                        <button key={i} type="button"
                          onClick={() => topUpCalcPress(btn)}
                          className="flex items-center justify-center rounded-[14px] h-[54px] transition-all active:scale-90"
                          style={{ backgroundColor: isActive ? "#00d18b" : isOp ? "#2d3449" : isClear ? "rgba(255,180,171,0.1)" : isBackspace ? "rgba(251,191,36,0.1)" : "rgba(45,52,73,0.5)", border: isOp ? "1px solid rgba(0,209,139,0.2)" : isClear ? "1px solid rgba(255,180,171,0.2)" : isBackspace ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
                          <span className="font-['Inter'] font-semibold" style={{ color: isActive ? "#060E20" : isOp ? "#00d18b" : isClear ? "#ffb4ab" : isBackspace ? "#fbbf24" : "#dae2fd", fontSize: isOp ? "22px" : "18px" }}>{btn}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => topUpCalcPress("⌫")}
                      className="h-[54px] rounded-[14px] flex items-center justify-center active:scale-95" style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
                      <span className="font-['Inter'] font-semibold text-[22px] text-[#fbbf24]">⌫</span>
                    </button>
                    <button type="button" onClick={() => topUpCalcPress("=")}
                      className="h-[54px] rounded-[14px] flex items-center justify-center active:scale-95" style={{ backgroundColor: "rgba(0,209,139,0.1)", border: "1px solid rgba(0,209,139,0.3)" }}>
                      <span className="font-['Inter'] font-semibold text-[22px] text-[#00d18b]">=</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="font-['Inter'] text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Catatan (opsional)", "Note (optional)")}
              </label>
              <input value={topUpNote} onChange={e => setTopUpNote(e.target.value)}
                placeholder={L(lang, "Gaji bulan ini", "This month's salary")}
                className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
            </div>
            </div>{/* end scrollable */}
            {/* Action buttons — fixed at bottom */}
            <div className="p-5 pt-3 flex gap-3 border-t" style={{ borderColor: "var(--app-border)" }}>
              <button onClick={() => setShowTopUp(false)}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px]"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                {L(lang, "Batal", "Cancel")}
              </button>
              <button onClick={handleTopUp}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-white"
                style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
                {L(lang, "Tambah", "Add")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Peringatan Sebelum Tarik Dana Darurat */}
      {showWithdrawWarning && fund && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowWithdrawWarning(false)}>
          <div className="w-full max-w-[360px] rounded-[28px] overflow-hidden shadow-2xl"
            style={{ backgroundColor: "var(--app-card)" }} onClick={e => e.stopPropagation()}>
            {/* Header merah */}
            <div className="p-5 text-center" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
              <span className="text-[48px] block mb-2">⚠️</span>
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px] text-white">
                {L(lang, "Perhatian!", "Warning!")}
              </h2>
              <p className="font-['Inter'] text-[12px] text-white/80 mt-1">
                {L(lang, "Kamu akan menggunakan dana darurat", "You are about to use your emergency fund")}
              </p>
            </div>

            {/* Isi peringatan */}
            <div className="p-5 space-y-3">
              {/* Info saldo */}
              <div className="rounded-[14px] p-3 flex items-center justify-between"
                style={{ backgroundColor: "var(--app-card2)" }}>
                <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L("Dana tersedia", "Available funds")}
                </p>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
                  {formatRupiah(fund.savedAmount)}
                </p>
              </div>

              {/* Konsekuensi */}
              <div className="rounded-[14px] p-4 space-y-2.5 border border-[rgba(239,68,68,0.2)]"
                style={{ backgroundColor: "rgba(239,68,68,0.06)" }}>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] text-[#ef4444]">
                  {L("Konsekuensi jika bukan darurat sejati:", "Consequences if not a genuine emergency:")}
                </p>
                {[
                  ["📉", L("Skor keuangan turun -20 poin", "Financial score drops -20 points")],
                  ["⚡", L(`Pelanggaran ke-${getWithdrawalStrikeCount() + 1} dari 5`, `Violation ${getWithdrawalStrikeCount() + 1} of 5`)],
                  ...(getWithdrawalStrikeCount() >= 4
                    ? [["🧊", L("Pelanggaran ke-5 → masa jeda 5 hari!", "5th violation → 5-day pause period!")]]
                    : []),
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-2">
                    <span className="text-[14px]">{icon}</span>
                    <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>{text}</p>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div className="rounded-[14px] p-3 border border-[rgba(78,222,163,0.2)]"
                style={{ backgroundColor: "rgba(78,222,163,0.06)" }}>
                <p className="font-['Inter'] text-[11px] text-[#4edea3]">
                  💡 {L(
                    "Jika ini benar-benar darurat (sakit, kecelakaan, bencana), tuliskan alasan yang jelas agar tidak dikenai penalti.",
                    "If this is a genuine emergency (illness, accident, disaster), write a clear reason to avoid penalties."
                  )}
                </p>
              </div>
            </div>

            {/* Tombol */}
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={() => setShowWithdrawWarning(false)}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px]"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                {L("Batal", "Cancel")}
              </button>
              <button onClick={() => { setShowWithdrawWarning(false); setShowWithdraw(true); }}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-white"
                style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
                {L("Lanjutkan", "Continue")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowWithdraw(false)}>
          <div className="w-full max-w-[400px] rounded-[28px] shadow-2xl mb-4 max-h-[85vh] flex flex-col overflow-hidden"
            style={{ backgroundColor: "var(--app-card)" }} onClick={e => e.stopPropagation()}>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]" style={{ color: "var(--app-text)" }}>
                🚨 {L(lang, "Gunakan Dana Darurat", "Use Emergency Fund")}
              </h2>
              <p className="font-['Inter'] text-[12px] mt-1" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Gunakan hanya untuk keadaan darurat yang sesungguhnya", "Use only for genuine emergencies")}
              </p>
            </div>
            <div className="space-y-1">
              <label className="font-['Inter'] text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Dana Masuk Ke", "Send Funds To")}
              </label>
              <select value={withdrawDestination} onChange={e => setWithdrawDestination(e.target.value)}
                className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
                <option value="cash">💵 Cash — {formatRupiah(getCashWalletBalance())}</option>
                {getBankAccounts().map(a => (
                  <option key={a.id} value={a.id}>🏦 {a.bankName} — {formatRupiah(getBankAvailableBalance(a.id))} (available)</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-['Inter'] text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Jumlah (Rp)", "Amount (Rp)")}
              </label>
              {/* Amount display */}
              <div className="relative rounded-[16px] w-full border" style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                <div className="absolute top-px bottom-px left-px w-1.5 rounded-l-[14px]" style={{ backgroundColor: "#ef4444" }} />
                <div className="p-4 pl-6">
                  <p className="font-['Inter'] font-semibold text-[10px] tracking-[2px] uppercase opacity-80 mb-1" style={{ color: "#ef4444" }}>
                    {L(lang, "MASUKKAN NOMINAL", "ENTER AMOUNT")}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[18px] text-[#64748b]">Rp</span>
                    {showWdCalc ? (
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[32px] tracking-[-1px] leading-[38px]" style={{ color: "var(--app-text)" }}>
                        {wdCalcFmt()}
                      </span>
                    ) : (
                      <input type="text" inputMode="decimal" value={withdrawAmt} onChange={e => setWithdrawAmt(formatMoneyInput(e.target.value))}
                        placeholder="0" autoFocus
                        className="font-['Plus_Jakarta_Sans'] font-extrabold text-[32px] tracking-[-1px] leading-[38px] bg-transparent outline-none w-full"
                        style={{ color: "var(--app-text)" }} />
                    )}
                  </div>
                </div>
              </div>
              {/* Calc Toggle */}
              <div className="flex justify-center pt-1">
                <button type="button"
                  onClick={() => {
                    if (!showWdCalc && withdrawAmt) setWdCalcDisplay(String(parseAmount(withdrawAmt)));
                    setShowWdCalc(p => !p);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all active:scale-95"
                  style={{ backgroundColor: showWdCalc ? "rgba(0,209,139,0.15)" : "rgba(45,52,73,0.5)", border: showWdCalc ? "1px solid rgba(0,209,139,0.4)" : "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-[15px]">{showWdCalc ? "🔢" : "🧮"}</span>
                  <span className="font-['Inter'] font-semibold text-[12px]" style={{ color: showWdCalc ? "#00d18b" : "#94a3b8" }}>
                    {showWdCalc ? L(lang, "Sembunyikan Kalkulator", "Hide Calculator") : L(lang, "Tampilkan Kalkulator", "Show Calculator")}
                  </span>
                </button>
              </div>
              {/* Calculator panel */}
              {showWdCalc && (
                <div className="rounded-[24px] border p-4" style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {CALC_BTNS.flat().map((btn, i) => {
                      const isOp = ["÷","×","−","+"].includes(btn);
                      const isClear = btn === "AC";
                      const isBackspace = btn === "⌫";
                      const isActive = isOp && wdCalcOp === btn && wdCalcWait;
                      return (
                        <button key={i} type="button"
                          onClick={() => wdCalcPress(btn)}
                          className="flex items-center justify-center rounded-[14px] h-[54px] transition-all active:scale-90"
                          style={{ backgroundColor: isActive ? "#00d18b" : isOp ? "#2d3449" : isClear ? "rgba(255,180,171,0.1)" : isBackspace ? "rgba(251,191,36,0.1)" : "rgba(45,52,73,0.5)", border: isOp ? "1px solid rgba(0,209,139,0.2)" : isClear ? "1px solid rgba(255,180,171,0.2)" : isBackspace ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
                          <span className="font-['Inter'] font-semibold" style={{ color: isActive ? "#060E20" : isOp ? "#00d18b" : isClear ? "#ffb4ab" : isBackspace ? "#fbbf24" : "#dae2fd", fontSize: isOp ? "22px" : "18px" }}>{btn}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => wdCalcPress("⌫")}
                      className="h-[54px] rounded-[14px] flex items-center justify-center active:scale-95" style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
                      <span className="font-['Inter'] font-semibold text-[22px] text-[#fbbf24]">⌫</span>
                    </button>
                    <button type="button" onClick={() => wdCalcPress("=")}
                      className="h-[54px] rounded-[14px] flex items-center justify-center active:scale-95" style={{ backgroundColor: "rgba(0,209,139,0.1)", border: "1px solid rgba(0,209,139,0.3)" }}>
                      <span className="font-['Inter'] font-semibold text-[22px] text-[#00d18b]">=</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="font-['Inter'] text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Alasan Penggunaan *", "Reason *")}
              </label>
              <input value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)}
                placeholder={L(lang, "Biaya rumah sakit, perbaikan kendaraan...", "Hospital bill, car repair...")}
                className="w-full h-[48px] px-4 rounded-[14px] outline-none border font-['Inter'] text-[14px]"
                style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
            </div>
            </div>{/* end scrollable */}
            {/* Action buttons — fixed at bottom */}
            <div className="p-5 pt-3 flex gap-3 border-t" style={{ borderColor: "var(--app-border)" }}>
              <button onClick={() => setShowWithdraw(false)}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px]"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                {L(lang, "Batal", "Cancel")}
              </button>
              <button onClick={handleWithdraw}
                className="flex-1 h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-white"
                style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
                {L(lang, "Gunakan", "Use")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Exit — Target 100% Tercapai */}
      {showModalExit && fund && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowModalExit(false)}>
          <div className="w-full max-w-[360px] rounded-[28px] p-6 shadow-2xl space-y-5"
            style={{ backgroundColor: "var(--app-card)" }} onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-2">
              <span className="text-[48px] block">🎉</span>
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
                {L(lang, "Target Tercapai!", "Goal Achieved!")}
              </h2>
              <p className="font-['Inter'] text-[13px] leading-relaxed" style={{ color: "var(--app-text2)" }}>
                {L(lang,
                  `Dana darurat ${fund.name} sudah 100% terpenuhi. Apakah dana ini akan digunakan sebagai Modal Usaha atau Investasi?`,
                  `Your emergency fund ${fund.name} is 100% complete. Will you use this as Business Capital or Investment?`
                )}
              </p>
            </div>
            {/* Destination selector */}
            <div className="rounded-[14px] border px-4" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)" }}>
              <select value={withdrawDestination} onChange={e => setWithdrawDestination(e.target.value)}
                className="w-full bg-transparent py-3 font-['Inter'] text-[13px] outline-none"
                style={{ color: "var(--app-text)", colorScheme: "dark" }}>
                <option value="cash">💵 Cash — {formatRupiah(getCashWalletBalance())}</option>
                {getBankAccounts().map(a => (
                  <option key={a.id} value={a.id}>🏦 {a.bankName} — {formatRupiah(getBankAvailableBalance(a.id))}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <button onClick={() => handleModalExit(true)}
                className="w-full h-[52px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[14px] text-white active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)", color: "#003824" }}>
                ✅ {L(lang, "Ya, Jadikan Modal — Tanpa Penalti", "Yes, Use as Capital — No Penalty")}
              </button>
              <button onClick={() => handleModalExit(false)}
                className="w-full h-[44px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] active:scale-95 transition-all border"
                style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text2)" }}>
                {L(lang, "Tidak, Cairkan Biasa", "No, Just Withdraw")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-full max-w-[320px] rounded-[24px] p-6 shadow-2xl space-y-4"
            style={{ backgroundColor: "var(--app-card)" }} onClick={e => e.stopPropagation()}>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px] text-center" style={{ color: "var(--app-text)" }}>
              {L(lang, "Hapus Dana Darurat?", "Delete Emergency Fund?")}
            </p>
            <p className="font-['Inter'] text-[13px] text-center" style={{ color: "var(--app-text2)" }}>
              {L(lang, "Semua data riwayat akan hilang permanen.", "All history data will be permanently deleted.")}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-[44px] rounded-[12px] font-['Plus_Jakarta_Sans'] font-bold text-[13px]"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                {L(lang, "Batal", "Cancel")}
              </button>
              <button onClick={handleDelete}
                className="flex-1 h-[44px] rounded-[12px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-white bg-[#ef4444]">
                {L(lang, "Hapus", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
