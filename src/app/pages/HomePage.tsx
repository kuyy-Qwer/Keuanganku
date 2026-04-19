import { useNavigate, useOutletContext } from "react-router";
import { useState, useEffect } from "react";
import { 
  getBalance, getMonthlyIncome, getMonthlyExpense, getTransactions, 
  getCategories, getUser, getSettings, formatRupiah, formatDate, getBudgets,
  getBocorHalusInsights, getAchievements, getTasks, getEmergencyFunds, getUserLevel, getStreak, predictCashFlow, getUnreadNotifCount,
  getCashWalletBalance, getBankAccounts, getBankAvailableBalance, getTotalLocked, getAssets,
  type CashFlowPrediction, type KanbanTask, type EmergencyFund, type Transaction
} from "../store/database";
import { useLang, t } from "../i18n";
import usePWAInstall from "../hooks/usePWAInstall";

interface OutletContext { openTransactionModal: () => void; }

// ─── Task progress helper ─────────────────────────────────────────
function taskPct(task: KanbanTask): number {
  if (task.status === "done") return 100;
  const total = task.checklists.length;
  if (total === 0) return 0;
  return Math.round((task.checklists.filter(i => i.completed).length / total) * 100);
}

export default function HomePage() {
  useOutletContext<OutletContext>(); // keep context for potential future use
  const navigate = useNavigate();
  const lang = useLang();
  const [balance, setBalance] = useState(0); // legacy net balance from transactions
  const [cashBalance, setCashBalance] = useState(0);
  const [bankAvailableTotal, setBankAvailableTotal] = useState(0);
  const [lockedSavingsTotal, setLockedSavingsTotal] = useState(0);
  const [assetsTotal, setAssetsTotal] = useState(0);
  const [monthIn, setMonthIn] = useState(0);
  const [monthOut, setMonthOut] = useState(0);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [selectedRecentTx, setSelectedRecentTx] = useState<Transaction | null>(null);
  const [categoryEmojiMap, setCategoryEmojiMap] = useState<Record<string, string>>({});
  const [userName, setUserName] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [avatar, setAvatar] = useState(localStorage.getItem("luminary_avatar") || "");
  const [allBudgets, setAllBudgets] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [recentTasks, setRecentTasks] = useState<KanbanTask[]>([]);
  const [emergencyFunds, setEmergencyFunds] = useState<EmergencyFund[]>([]);
  const [userLevel, setUserLevel] = useState<ReturnType<typeof getUserLevel>>({ level: 1, currentExp: 0, totalExp: 0, title: "Pemula" });
  const [streak, setStreak] = useState<ReturnType<typeof getStreak>>({ current: 0, longest: 0, lastDate: null });
  const [guardianPrediction, setGuardianPrediction] = useState<CashFlowPrediction | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showFundsDetail, setShowFundsDetail] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  
  // PWA Install
  const { isInstallable, isStandalone, isIOS, deferredPrompt } = usePWAInstall();

  useEffect(() => {
    const updateUnreadCount = () => setUnreadNotifCount(getUnreadNotifCount());
    updateUnreadCount();
    window.addEventListener("luminary_notif_count", updateUnreadCount);
    window.addEventListener("luminary_data_change", updateUnreadCount);
    return () => {
      window.removeEventListener("luminary_notif_count", updateUnreadCount);
      window.removeEventListener("luminary_data_change", updateUnreadCount);
    };
  }, []);

  // Handle PWA Install — deteksi device spesifik
  const handleInstallPWA = async () => {
    const ua = navigator.userAgent.toLowerCase();
    const isSamsungBrowser = ua.includes('samsungbrowser');
    const isFirefox = ua.includes('firefox');
    const isChrome = ua.includes('chrome') && !ua.includes('edg');
    const isEdge = ua.includes('edg');
    const isOpera = ua.includes('opr') || ua.includes('opera');

    if (isIOS) {
      // iOS Safari — instruksi spesifik
      setShowPwaModal(true);
      return;
    }

    if (deferredPrompt) {
      // Android Chrome / Edge / Samsung — native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
        setShowPwaModal(false);
      }
      return;
    }

    // Fallback — tampilkan modal dengan instruksi sesuai browser
    setShowPwaModal(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      const pos = window.scrollY;
      setScrollPos(pos);
      setIsCollapsed(pos > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    const refresh = () => {
      setBalance(getBalance());
      setCashBalance(getCashWalletBalance());
      const banks = getBankAccounts();
      setBankAvailableTotal(banks.reduce((s, a) => s + getBankAvailableBalance(a.id), 0));
      setLockedSavingsTotal(getTotalLocked());
      setAssetsTotal(getAssets().reduce((s, a) => s + a.currentValue, 0));
      setMonthIn(getMonthlyIncome());
      setMonthOut(getMonthlyExpense());
      setRecentTx(getTransactions().slice(0, 5));
      const map: Record<string, string> = {};
      getCategories().forEach(c => { map[c.name] = c.emoji; });
      setCategoryEmojiMap(map);
      setUserName(getUser().fullName);
      setShowBalance(getSettings().privacy.showBalance);
      setAvatar(localStorage.getItem("luminary_avatar") || "");

      const budgets = getBudgets();
      const txs = getTransactions();
      const now = new Date();
      const totals: Record<string, number> = {};
      txs.filter((t: any) => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
         .forEach((t: any) => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
      
      const processed = budgets.map(b => ({
         ...b, 
         spent: totals[b.category] || 0,
         pct: (totals[b.category] || 0) / b.limit * 100
      }));
      setAllBudgets(processed);
      
      if (getSettings().notifications.reminders) {
        // critical budgets tracked via allBudgets filter in render
      }

      setInsights(getBocorHalusInsights());
      setGuardianPrediction(predictCashFlow());
      setUnlockedCount(getAchievements().filter(a => a.isUnlocked).length);
      // Recent active tasks (max 3)
      const activeTasks = getTasks().filter(t => t.status !== "done");
      setRecentTasks(activeTasks.slice(0, 3));
      // Emergency fund
      const ef = getEmergencyFunds()
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setEmergencyFunds(ef.slice(0, 3)); // max 3 terbaru
      // Level & Streak
      setUserLevel(getUserLevel());
      setStreak(getStreak());
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("luminary_data_change", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const greeting = userName
    ? (lang === "id" ? `Halo, ${userName.split(" ")[0]} 👋` : `Hi, ${userName.split(" ")[0]} 👋`)
    : t("welcomeBack", lang);

  const L = (id: string, en: string) => lang === "en" ? en : id;


  const activeFundsTotal = cashBalance + bankAvailableTotal;

  const services: { label: string, emoji: string, action: () => void }[] = [
    { label: L("Kategori", "Category"),   emoji: "🏷️", action: () => navigate("/app/settings/categories") },
    { label: L("Disiplin", "Discipline"), emoji: "⚖️", action: () => navigate("/app/discipline") },
    { label: L("Kalender", "Calendar"),   emoji: "📅", action: () => navigate("/app/calendar") },
    { label: L("Laporan", "Report"),      emoji: "📊", action: () => navigate("/app/report") },
    { label: L("Hutang", "Debt"),         emoji: "📒", action: () => navigate("/app/debt") },
    { label: L("Aset", "Assets"),         emoji: "🏦", action: () => navigate("/app/assets") },
    { label: L("Dana Darurat", "Emergency Fund"), emoji: "🚨", action: () => navigate("/app/emergency-funds") },
    { label: L("Simulasi Bank", "Bank Simulation"), emoji: "🏧", action: () => navigate("/app/bank-simulation") },
  ];

  // If we have 8 items, show in 4x2 grid, otherwise use 4-column
  const gridCols = services.length > 7 ? "grid-cols-4" : "grid-cols-4";

  return (
    <div className="w-full min-h-screen app-bg flex justify-center pb-32">
      <div className="w-full max-w-[390px] relative">
        <div className="absolute top-[80px] right-[-40px] size-64 bg-[#4edea3]/5 rounded-full blur-[80px] pointer-events-none"
          style={{ transform: `translate3d(0, ${scrollPos * 0.2}px, 0)` }} />

        <div className={`sticky top-0 z-[100] backdrop-blur-xl flex items-center justify-between border-b transition-all duration-300 ${isCollapsed ? 'py-3 px-5 mx-4 rounded-b-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] border-x' : 'px-5 pt-10 pb-4 shadow-none'}`}
          style={{ backgroundColor: "var(--app-nav-bg)", borderColor: "var(--app-border)" }}>
           <div className="flex items-center gap-3">
              <div className={`rounded-[14px] border overflow-hidden transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.2)] ${isCollapsed ? 'size-9' : 'size-12'} clickable`}
                style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card2)" }}
                onClick={() => navigate("/app/account")}>
                 {avatar ? (
                   <img src={avatar} alt="avatar" className="size-full object-cover" />
                 ) : (
                   <div className={`size-full flex items-center justify-center font-black text-[#4edea3] transition-all duration-300 ${isCollapsed ? 'text-[14px]' : 'text-[18px]'}`}>
                      {userName ? userName[0].toUpperCase() : "👤"}
                   </div>
                 )}
              </div>
              <div className="transition-all duration-300">
                 <p className={`font-['Plus_Jakarta_Sans'] font-black leading-tight transition-all duration-300 ${isCollapsed ? 'text-[14px]' : 'text-[15px]'}`}
                   style={{ color: "var(--app-text)" }}>{greeting}</p>
                 {!isCollapsed && (
                    <div className="flex items-center gap-1.5 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-300">
                       <span className="size-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                       <p className="font-['Inter'] text-[10px] font-bold tracking-wider uppercase"
                         style={{ color: "var(--app-text2)" }}>{L("Aset Terkelola", "Assets Managed")}</p>
                    </div>
                 )}
              </div>
           </div>
<div className="flex items-center gap-2">
               <button className={`relative rounded-[12px] border flex items-center justify-center text-[#4edea3] active:scale-95 transition-all duration-300 ${isCollapsed ? 'size-8' : 'size-10'} clickable`}
                 style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}
                 onClick={() => navigate("/app/notif-history")}>
                 <svg className={`${isCollapsed ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                 {unreadNotifCount > 0 && (
                   <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center">
                     {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                   </span>
                 )}
               </button>
            </div>
        </div>

        <div className="px-5 mt-6 mb-6">
          <div id="tour-balance-card" className="relative rounded-[32px] overflow-hidden transition-all balance-card-themed"
            style={{
              background: "linear-gradient(135deg, #0a2e1e 0%, #0d3d28 40%, #0a2e1e 100%)",
              boxShadow: "0 20px 60px rgba(78,222,163,0.2), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(78,222,163,0.15)",
            }}>

            {/* Ambient glow layers */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-16 -right-16 size-56 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(78,222,163,0.25) 0%, transparent 65%)", filter: "blur(20px)" }} />
              <div className="absolute -bottom-12 -left-12 size-44 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(0,180,162,0.2) 0%, transparent 65%)", filter: "blur(16px)" }} />
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(78,222,163,1) 24px, rgba(78,222,163,1) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(78,222,163,1) 24px, rgba(78,222,163,1) 25px)" }} />
            </div>

            <div className="relative z-10 p-6">

              {/* Top row: label + actions */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(78,222,163,0.2)", border: "1px solid rgba(78,222,163,0.3)" }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#4edea3" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                  </div>
                  <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[11px] tracking-[0.12em] uppercase"
                    style={{ color: "rgba(78,222,163,0.8)" }}>
                    {t("activeBalance", lang)}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/app/achievements")}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-95"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span className="text-[11px]">🏅</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px]"
                    style={{ color: "rgba(255,255,255,0.6)" }}>{unlockedCount}</span>
                </button>
              </div>

              {/* Main balance */}
              <div className="mb-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[18px]"
                    style={{ color: "rgba(78,222,163,0.7)" }}>Rp</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-black tracking-tight leading-none transition-all duration-300"
                    style={{
                      color: activeFundsTotal < 0 ? "#fca5a5" : "#ffffff",
                      fontSize: !showBalance ? '36px' :
                        activeFundsTotal.toLocaleString("id-ID").length > 13 ? '22px' :
                        activeFundsTotal.toLocaleString("id-ID").length > 10 ? '26px' :
                        activeFundsTotal.toLocaleString("id-ID").length > 8 ? '30px' : '36px',
                      textShadow: activeFundsTotal >= 0 ? "0 0 40px rgba(78,222,163,0.3)" : "none",
                    }}>
                    {showBalance ? activeFundsTotal.toLocaleString("id-ID") : "••••••••"}
                  </span>
                </div>

                {/* Streak + level pill */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="text-[11px]">🔥</span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px]"
                      style={{ color: "rgba(255,255,255,0.65)" }}>
                      {streak.current} {L("hari", "days")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
                    <span className="text-[11px]">⭐</span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px]"
                      style={{ color: "rgba(251,191,36,0.9)" }}>
                      {userLevel.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, transparent, rgba(78,222,163,0.2), transparent)" }} />

              {/* Income / Expense row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[16px] px-4 py-3"
                  style={{ background: "rgba(78,222,163,0.08)", border: "1px solid rgba(78,222,163,0.12)" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="size-4 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(78,222,163,0.25)" }}>
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#4edea3" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                      </svg>
                    </div>
                    <p className="font-['Inter'] text-[9px] font-semibold uppercase tracking-wider"
                      style={{ color: "rgba(78,222,163,0.7)" }}>{t("monthlyIn", lang)}</p>
                  </div>
                  <p className="font-['Plus_Jakarta_Sans'] font-black text-[14px]" style={{ color: "#4edea3" }}>
                    {showBalance ? formatRupiah(monthIn) : "Rp••••"}
                  </p>
                </div>

                <div className="rounded-[16px] px-4 py-3"
                  style={{ background: "rgba(252,165,165,0.06)", border: "1px solid rgba(252,165,165,0.1)" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="size-4 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(252,165,165,0.2)" }}>
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#fca5a5" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                    </div>
                    <p className="font-['Inter'] text-[9px] font-semibold uppercase tracking-wider"
                      style={{ color: "rgba(252,165,165,0.7)" }}>{t("monthlyOut", lang)}</p>
                  </div>
                  <p className="font-['Plus_Jakarta_Sans'] font-black text-[14px]" style={{ color: "#fca5a5" }}>
                    {showBalance ? formatRupiah(monthOut) : "Rp••••"}
                  </p>
                </div>
              </div>

              {/* Detail breakdown — muncul saat showFundsDetail */}
              {showFundsDetail && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  {cashBalance <= 0 && bankAvailableTotal <= 0 && lockedSavingsTotal <= 0 && assetsTotal <= 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-5 gap-2">
                      <div className="size-10 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75" />
                        </svg>
                      </div>
                      <p className="font-['Plus_Jakarta_Sans'] font-semibold text-[12px] text-center"
                        style={{ color: "rgba(255,255,255,0.35)" }}>
                        {L("Belum ada data saldo", "No balance data yet")}
                      </p>
                      <p className="font-['Inter'] text-[10px] text-center"
                        style={{ color: "rgba(255,255,255,0.2)" }}>
                        {L("Tambahkan saldo cash atau rekening bank", "Add cash balance or bank account")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-[14px] px-3 py-2.5"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="font-['Inter'] text-[9px] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>💵 Cash</p>
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                          {showBalance ? formatRupiah(cashBalance) : "Rp••••"}
                        </p>
                      </div>
                      <div className="rounded-[14px] px-3 py-2.5"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="font-['Inter'] text-[9px] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>🏦 Bank</p>
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                          {showBalance ? formatRupiah(bankAvailableTotal) : "Rp••••"}
                        </p>
                      </div>
                      {emergencyFunds[0] && emergencyFunds[0].isActive && (
                        <div className="rounded-[14px] px-3 py-2.5"
                          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                          <p className="font-['Inter'] text-[9px] mb-1" style={{ color: "rgba(239,68,68,0.6)" }}>🚨 {L("Darurat", "Emergency")}</p>
                          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: "#fca5a5" }}>
                            {showBalance ? formatRupiah(emergencyFunds[0].savedAmount) : "Rp••••"}
                          </p>
                        </div>
                      )}
                      <div className="rounded-[14px] px-3 py-2.5"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="font-['Inter'] text-[9px] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>🎯 {L("Tabungan", "Savings")}</p>
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                          {showBalance ? formatRupiah(lockedSavingsTotal) : "Rp••••"}
                        </p>
                      </div>
                      <div className="rounded-[14px] px-3 py-2.5"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="font-['Inter'] text-[9px] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>🏷️ {L("Aset", "Assets")}</p>
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                          {showBalance ? formatRupiah(assetsTotal) : "Rp••••"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Toggle button — selalu di paling bawah card */}
              <button
                type="button"
                onClick={() => setShowFundsDetail(v => !v)}
                className="w-full flex items-center justify-center gap-1.5 mt-4 py-2.5 rounded-[14px] transition-all active:scale-[0.98]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                <span className="font-['Plus_Jakarta_Sans'] font-medium text-[11px]"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  {showFundsDetail ? L("Sembunyikan detail", "Hide details") : L("Lihat detail saldo", "View balance details")}
                </span>
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-300"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    transform: showFundsDetail ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

            </div>
          </div>
        </div>

        {guardianPrediction && guardianPrediction.riskLevel !== "safe" && (
           <div className="px-5 mb-5">
              <button
                onClick={() => navigate("/app/insights")}
                className={`w-full rounded-[20px] p-4 border relative overflow-hidden text-left
                  transition-all duration-200 active:scale-[0.97] hover:brightness-110
                  hover:shadow-[0_8px_24px_rgba(239,68,68,0.25)] active:shadow-none
                  ${guardianPrediction.riskLevel === "critical"
                    ? "border-red-500/40"
                    : guardianPrediction.riskLevel === "danger"
                    ? "border-orange-500/40"
                    : "border-amber-500/40"
                  }`}
                style={{
                  backgroundColor: "var(--app-card)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Color accent strip on left */}
                <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-[20px]"
                  style={{
                    backgroundColor: guardianPrediction.riskLevel === "critical" ? "#ef4444"
                      : guardianPrediction.riskLevel === "danger" ? "#f97316"
                      : "#f59e0b"
                  }} />
                {/* Pulse ring saat protection mode */}
                {guardianPrediction.protectionMode && (
                  <span className="absolute top-3 right-3 flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-red-500" />
                  </span>
                )}
                <div className="flex items-start gap-3 pl-2">
                  <div className="size-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--app-card2)" }}>
                    {guardianPrediction.protectionMode ? "🛡️" : "⚠️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: "var(--app-text)" }}>
                        {guardianPrediction.protectionMode
                          ? L("Mode Proteksi Aktif", "Protection Mode Active")
                          : L("Peringatan Risiko", "Risk Warning")}
                      </p>
                      {guardianPrediction.protectionMode && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                          AKTIF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--app-text2)" }}>{guardianPrediction.message}</p>
                    <p className="text-[10px] mt-2" style={{ color: "var(--app-text2)", opacity: 0.7 }}>{guardianPrediction.recommendation}</p>
                    {guardianPrediction.affectedCategories.length > 0 && (
                      <p className="text-[10px] mt-1" style={{ color: "var(--app-text2)", opacity: 0.8 }}>
                        ⚠️ {L("Kategori Terbatas", "Limited Categories")}: {guardianPrediction.affectedCategories.join(", ")}
                      </p>
                    )}
                    {/* Tap hint */}
                    <div className="flex items-center gap-1 mt-2.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        style={{ color: "var(--app-text2)", opacity: 0.5 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-[10px] font-medium" style={{ color: "var(--app-text2)", opacity: 0.5 }}>
                        {lang === "en" ? "Tap for full analysis" : "Ketuk untuk analisis lengkap"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
           </div>
        )}

        {insights.length > 0 && (
           <div className="px-5 mb-6">
              <div className="rounded-[24px] p-5 border shadow-lg relative overflow-hidden"
                style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                 <div className="flex items-center gap-3 mb-3">
                    <div className="size-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(78,222,163,0.15)" }}>
                      <span className="text-[16px]">💡</span>
                    </div>
                    <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                      {L("Insight Pengeluaran", "Spending Insights")}
                    </h4>
                 </div>
                 <div className="space-y-3">
                   {insights.map((insight, i) => (
                     <p key={i} className="text-[11px] leading-relaxed italic" style={{ color: "var(--app-text2)" }}>
                       " {insight} "
                     </p>
                   ))}
                 </div>
                 <div className="mt-4 flex justify-end">
                   <button onClick={() => navigate("/app/report")}
                     className="text-[10px] font-bold uppercase tracking-widest clickable"
                     style={{ color: "#4edea3" }}>
                     {L("Detail Laporan →", "Full Report →")}
                   </button>
                 </div>
              </div>
           </div>
        )}

        <div className="px-5 mb-8">
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase mb-4"
            style={{ color: "var(--app-text2)" }}>{t("services", lang)}</p>
          <div id="tour-services" className={`grid ${services.length > 7 ? 'grid-cols-4' : 'grid-cols-4'} gap-2`}>
            {services.map(svc => (
              <button key={svc.label} onClick={svc.action}
                className="group rounded-[18px] p-3 flex flex-col items-center gap-2 border transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-[0_8px_24px_rgba(78,222,163,0.18)]"
                style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                <div className="size-10 rounded-[12px] flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                  style={{ backgroundColor: "var(--app-card2)" }}>
                  <span className="text-[20px]">{svc.emoji}</span>
                </div>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-center leading-tight transition-colors duration-200 group-hover:text-[#4edea3]"
                  style={{ color: "var(--app-text)" }}>{svc.label}</p>
              </button>
            ))}
          </div>
        </div>

        {emergencyFunds.length > 0 && emergencyFunds.some(f => f.targetAmount > 0) && (
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase"
                style={{ color: "var(--app-text2)" }}>
                {L("Dana Darurat", "Emergency Fund")}
              </p>
              <button onClick={() => navigate("/app/emergency-funds")} className="text-[#ef4444] text-[11px] font-bold clickable">
                {L("Lihat →", "See →")}
              </button>
            </div>
            <div className="space-y-3">
              {emergencyFunds.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => navigate(`/app/emergency-funds/${f.id}`)}
                  className="w-full text-left rounded-[20px] p-4 border transition-all hover:shadow-[0_8px_24px_rgba(239,68,68,0.15)] active:scale-[0.99]"
                  style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
                        <span className="text-[20px]">🚨</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[13px] truncate" style={{ color: "var(--app-text)" }}>
                          {f.name}
                        </p>
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
                          {formatRupiah(f.savedAmount)}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--app-text2)" }}>
                          {L("dari", "of")} {formatRupiah(f.targetAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[16px]" style={{ color: f.savedAmount >= f.targetAmount ? "#4edea3" : "#ef4444" }}>
                        {f.targetAmount > 0 ? Math.min(100, Math.round((f.savedAmount / f.targetAmount) * 100)) : 0}%
                      </p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-card2)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${f.targetAmount > 0 ? Math.min(100, (f.savedAmount / f.targetAmount) * 100) : 0}%`,
                        background: f.savedAmount >= f.targetAmount
                          ? "linear-gradient(90deg,#4edea3,#04b4a2)"
                          : "linear-gradient(90deg,#ef4444,#fca5a5)",
                      }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tasks reminder (max 3) */}
        {recentTasks.length > 0 && (
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase"
                style={{ color: "var(--app-text2)" }}>
                {L("Tugas", "Tasks")}
              </p>
              <button onClick={() => navigate("/app/tasks")} className="text-[#4edea3] text-[11px] font-bold clickable">
                {L("Lihat detail →", "See details →")}
              </button>
            </div>
            <div className="space-y-2">
              {recentTasks.slice(0, 3).map((task, i) => (
                <div key={task.id}
                  style={{ animation: `taskSlideIn 0.5s cubic-bezier(0.2,0.8,0.2,1) both`, animationDelay: `${i * 60}ms` }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/tasks?task=${task.id}`)}
                    className="w-full text-left rounded-[20px] p-4 border transition-all duration-200 hover:shadow-[0_8px_24px_rgba(96,165,250,0.12)] hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="size-[40px] rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "rgba(96,165,250,0.12)" }}>
                          <span className="text-[18px]">🗂️</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[14px] truncate"
                            style={{ color: "var(--app-text)" }}>
                            {task.title}
                          </p>
                          <p className="font-['Inter'] text-[11px] mt-0.5"
                            style={{ color: "var(--app-text2)" }}>
                            {task.dueDate ? `${L("Jatuh tempo", "Due")}: ${formatDate(task.dueDate)}` : L("Tanpa jatuh tempo", "No due date")}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full shrink-0"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--app-text2)" }}>
                        {task.status}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
              <button onClick={() => navigate("/app/tasks")}
                className="w-full py-3 text-center text-[11px] font-bold text-[#4edea3] border border-dashed border-[#4edea340] rounded-xl">
                {L("Lihat semua tugas →", "View all tasks →")}
              </button>
            </div>
          </div>
        )}

        {allBudgets.length > 0 && (
          <div className="px-5 mb-8">
             <div className="flex items-center justify-between mb-4">
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase"
                  style={{ color: "var(--app-text2)" }}>{L("Anggaran Bulanan", "Monthly Budgets")}</p>
                <button onClick={() => navigate("/app/settings/categories")} className="text-[#4edea3] text-[11px] font-bold clickable transition-all">{L("Kelola", "Manage")}</button>
             </div>
             <div className="space-y-3">
                {allBudgets.map((b, i) => {
                   const progLabel = b.pct >= 95
                     ? { text: "Satu Langkah Lagi!", color: "#fb923c" }
                     : b.pct >= 50
                     ? { text: "Setengah Jalan!", color: "#60a5fa" }
                     : null;
                   return (
                   <div key={b.category}
                     style={{ animation: `taskSlideIn 0.5s cubic-bezier(0.2,0.8,0.2,1) both`, animationDelay: `${i * 60}ms` }}>
                   <div className="group rounded-[24px] p-4 border space-y-2 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(78,222,163,0.12)] hover:-translate-y-0.5 active:scale-[0.98]"
                     style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                           <span className="text-[20px]">{categoryEmojiMap[b.category] || "💳"}</span>
                           <div>
                             <p className="text-[14px] font-bold" style={{ color: "var(--app-text)" }}>{b.category}</p>
                             {progLabel && (
                               <span className="text-[9px] font-black animate-pulse"
                                 style={{ color: progLabel.color }}>{progLabel.text}</span>
                             )}
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="font-mono text-[12px] font-black" style={{ color: "var(--app-text)" }}>{formatRupiah(b.spent)}</p>
                           <p className="font-mono text-[9px] font-bold" style={{ color: "var(--app-text2)" }}>/ {formatRupiah(b.limit)}</p>
                         </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-card2)" }}>
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(b.pct, 100)}%`,
                            background: b.pct >= 90 ? "linear-gradient(90deg,#fb923c,#ffb4ab)" : "linear-gradient(90deg,#4edea3,#04b4a2)",
                          }} />
                      </div>
                   </div>
                   </div>
                   );
                })}
             </div>
           </div>
        )}

        {recentTx.length > 0 && (
          <div id="tour-recent-transactions" className="px-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase"
                style={{ color: "var(--app-text2)" }}>{t("recentTransactions", lang)}</p>
              <button onClick={() => navigate("/app/history")} className="text-[#4edea3] text-[11px] font-bold clickable">{t("seeAll", lang)}</button>
            </div>
            <div className="space-y-2">
              {recentTx.slice(0, 3).map((tx, i) => (
                <div key={tx.id}
                  style={{ animation: `taskSlideIn 0.5s cubic-bezier(0.2,0.8,0.2,1) both`, animationDelay: `${i * 60}ms` }}>
                <button
                  type="button"
                  onClick={() => setSelectedRecentTx(tx)}
                  className="w-full group rounded-[20px] p-4 flex items-center justify-between border transition-all duration-200 hover:shadow-[0_8px_24px_rgba(78,222,163,0.12)] hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="size-[40px] rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: "var(--app-card2)" }}>
                      <span className="text-[18px]">{categoryEmojiMap[tx.category] || "💳"}</span>
                    </div>
                    <div>
                      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>{tx.category}</p>
                      <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <p className={`font-['Plus_Jakarta_Sans'] font-bold text-[14px] ${tx.type === "income" ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                  </p>
                </button>
                </div>
              ))}
              <button onClick={() => navigate("/app/history")}
                className="w-full py-3 text-center text-[11px] font-bold text-[#4edea3] border border-dashed border-[#4edea340] rounded-xl">
                {L("Lihat semua transaksi →", "View all transactions →")}
              </button>
            </div>
          </div>
        )}

        {/* ── PWA Install Button ── */}
        {(isInstallable || isIOS) && !isStandalone && (
          <div className="px-5 mb-6">
            <button
              onClick={handleInstallPWA}
              className="w-full rounded-[20px] border py-3.5 flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:brightness-105"
              style={{
                backgroundColor: 'var(--app-card)',
                borderColor: 'rgba(78,222,163,0.3)',
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #4edea3, #00b4a2)' }}>
                <span className="text-base">📲</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: 'var(--app-text)' }}>
                  {L('Install Keuanganku', 'Install Keuanganku')}
                </p>
                <p className="text-xs" style={{ color: 'var(--app-text2)' }}>
                  {isIOS
                    ? L('Tambahkan ke Home Screen iPhone/iPad', 'Add to iPhone/iPad Home Screen')
                    : L('Install sebagai aplikasi di HP kamu', 'Install as app on your phone')}
                </p>
              </div>
              <svg className="w-4 h-4 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="#4edea3" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        )}

        {/* PWA Install Modal — instruksi sesuai device */}
        {showPwaModal && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowPwaModal(false)}>
            <div className="w-full max-w-[390px] rounded-[28px] overflow-hidden shadow-2xl mb-4 animate-in slide-in-from-bottom-4 duration-300"
              style={{ backgroundColor: "var(--app-card)" }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="px-6 pt-6 pb-4 text-center"
                style={{ background: "linear-gradient(135deg, rgba(78,222,163,0.12), rgba(0,180,162,0.06))", borderBottom: "1px solid var(--app-border)" }}>
                <div className="size-14 rounded-[18px] mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #4edea3, #00b4a2)", boxShadow: "0 8px 24px rgba(78,222,163,0.4)" }}>
                  <span className="text-[28px]">📲</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[17px] mb-1" style={{ color: "var(--app-text)" }}>
                  {L("Install Keuanganku", "Install Keuanganku")}
                </h3>
                <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L("Akses lebih cepat dari layar utama HP kamu", "Faster access from your phone's home screen")}
                </p>
              </div>

              {/* Instruksi */}
              <div className="px-6 py-5 space-y-3">
                {isIOS ? (
                  // iOS Safari
                  <>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] uppercase tracking-wider" style={{ color: "#4edea3" }}>
                      iPhone / iPad (Safari)
                    </p>
                    {[
                      { icon: "1️⃣", text: L('Tap ikon Share (kotak dengan panah ke atas) di toolbar Safari', 'Tap the Share icon (box with arrow) in Safari toolbar') },
                      { icon: "2️⃣", text: L('Scroll ke bawah dan pilih "Tambahkan ke Layar Utama"', 'Scroll down and tap "Add to Home Screen"') },
                      { icon: "3️⃣", text: L('Tap "Tambahkan" di pojok kanan atas', 'Tap "Add" in the top right corner') },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-[14px] p-3"
                        style={{ backgroundColor: "var(--app-card2)" }}>
                        <span className="text-[18px] shrink-0">{step.icon}</span>
                        <p className="font-['Inter'] text-[13px] leading-relaxed" style={{ color: "var(--app-text)" }}>{step.text}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  // Android / Desktop
                  <>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] uppercase tracking-wider" style={{ color: "#4edea3" }}>
                      {L("Android / Desktop", "Android / Desktop")}
                    </p>
                    {[
                      { icon: "1️⃣", text: L('Tap menu ⋮ (tiga titik) di pojok kanan atas browser', 'Tap the ⋮ menu (three dots) in the top right of your browser') },
                      { icon: "2️⃣", text: L('Pilih "Install aplikasi" atau "Tambahkan ke layar utama"', 'Select "Install app" or "Add to home screen"') },
                      { icon: "3️⃣", text: L('Konfirmasi dengan tap "Install" atau "Tambahkan"', 'Confirm by tapping "Install" or "Add"') },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-[14px] p-3"
                        style={{ backgroundColor: "var(--app-card2)" }}>
                        <span className="text-[18px] shrink-0">{step.icon}</span>
                        <p className="font-['Inter'] text-[13px] leading-relaxed" style={{ color: "var(--app-text)" }}>{step.text}</p>
                      </div>
                    ))}
                  </>
                )}

                <button
                  onClick={() => setShowPwaModal(false)}
                  className="w-full rounded-[16px] py-3.5 font-['Plus_Jakarta_Sans'] font-bold text-[14px] mt-2 transition-all active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #4edea3, #00b4a2)", color: "#003824" }}>
                  {L("Mengerti", "Got it")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transaction Detail Modal (read-only, no delete) */}
        {selectedRecentTx && (
          <div
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedRecentTx(null)}
          >
            <div
              className="w-full max-w-[400px] mb-4 rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
              style={{ backgroundColor: "var(--app-card)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center overflow-hidden"
                style={{
                  background: selectedRecentTx.type === "income"
                    ? "linear-gradient(160deg,rgba(78,222,163,0.18) 0%,transparent 70%)"
                    : "linear-gradient(160deg,rgba(255,180,171,0.18) 0%,transparent 70%)",
                }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-40 rounded-full blur-[60px] pointer-events-none"
                  style={{ backgroundColor: selectedRecentTx.type === "income" ? "rgba(78,222,163,0.2)" : "rgba(255,180,171,0.2)" }} />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
                <div className="relative size-[72px] rounded-[22px] flex items-center justify-center mb-4 shadow-lg"
                  style={{
                    backgroundColor: selectedRecentTx.type === "income" ? "rgba(78,222,163,0.15)" : "rgba(255,180,171,0.15)",
                    border: `1.5px solid ${selectedRecentTx.type === "income" ? "rgba(78,222,163,0.3)" : "rgba(255,180,171,0.3)"}`,
                  }}>
                  <span className="text-[36px]">{categoryEmojiMap[selectedRecentTx.category] || "💳"}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{
                    backgroundColor: selectedRecentTx.type === "income" ? "rgba(78,222,163,0.15)" : "rgba(255,180,171,0.15)",
                    color: selectedRecentTx.type === "income" ? "#4edea3" : "#ffb4ab",
                  }}>
                  {selectedRecentTx.type === "income" ? L("Pemasukan", "Income") : L("Pengeluaran", "Expense")}
                </span>
                <p className="font-['Plus_Jakarta_Sans'] font-black text-[38px] leading-none tracking-tight"
                  style={{ color: selectedRecentTx.type === "income" ? "#4edea3" : "#ffb4ab" }}>
                  {selectedRecentTx.type === "income" ? "+" : "-"}{formatRupiah(selectedRecentTx.amount)}
                </p>
              </div>

              <div className="px-6 pb-2 space-y-1" style={{ borderTop: "1px solid var(--app-border)" }}>
                <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                  <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>{L("Kategori", "Category")}</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>{selectedRecentTx.category}</span>
                </div>

                <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                  <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>{L("Tanggal", "Date")}</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                    {new Date(selectedRecentTx.date).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                  <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>{L("Waktu", "Time")}</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                    {new Date(selectedRecentTx.date).toLocaleTimeString(lang === "en" ? "en-US" : "id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                  <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>{L("Sumber", "Source")}</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-right max-w-[220px]" style={{ color: "var(--app-text)" }}>
                    {selectedRecentTx.paymentSource?.label ?? (selectedRecentTx.paymentSource?.type ?? "cash")}
                  </span>
                </div>

                <div className="flex items-start justify-between py-3.5">
                  <span className="font-['Inter'] text-[12px] shrink-0" style={{ color: "var(--app-text2)" }}>{L("Catatan", "Notes")}</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-right max-w-[200px]"
                    style={{ color: selectedRecentTx.notes ? "var(--app-text)" : "var(--app-text2)" }}>
                    {selectedRecentTx.notes || L("Tidak ada", "None")}
                  </span>
                </div>
              </div>

              <div className="px-6 pb-6">
                <button
                  type="button"
                  onClick={() => setSelectedRecentTx(null)}
                  className="w-full h-[48px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[14px] text-[#003824] active:scale-95 transition-all"
                  style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}
                >
                  {L("Tutup", "Close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
