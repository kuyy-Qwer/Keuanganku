import { useNavigate, useOutletContext } from "react-router";
import { useState, useEffect } from "react";
import { 
  getBalance, getMonthlyIncome, getMonthlyExpense, getTransactions, 
  getCategories, getUser, getSettings, formatRupiah, formatDate, getBudgets,
  getBocorHalusInsights, getAchievements, getTasks, getEmergencyFund, getUserLevel, getStreak, predictCashFlow, getUnreadNotifCount,
  getCashWalletBalance, getBankAccounts, getBankAvailableBalance, getTotalLocked, getAssets,
  type CashFlowPrediction, type KanbanTask
} from "../store/database";
import { useLang, t } from "../i18n";

const imgBg = new URL("../../imports/WealthDashboardGoPayInspired/f84ad6d75c01f5865641dba32416e817dee06ff5.png", import.meta.url).href;

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
  const [recentTx, setRecentTx] = useState<any[]>([]);
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
  const [emergencyFund, setEmergencyFund] = useState<ReturnType<typeof getEmergencyFund> | null>(null);
  const [userLevel, setUserLevel] = useState<ReturnType<typeof getUserLevel>>({ level: 1, currentExp: 0, totalExp: 0, title: "Pemula" });
  const [streak, setStreak] = useState<ReturnType<typeof getStreak>>({ current: 0, longest: 0, lastDate: null });
  const [guardianPrediction, setGuardianPrediction] = useState<CashFlowPrediction | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showFundsDetail, setShowFundsDetail] = useState(false);

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
      setEmergencyFund(getEmergencyFund());
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
    { label: L("Kategori", "Category"), emoji: "🏷️", action: () => navigate("/app/settings/categories") },
    { label: L("Investasi", "Invest"),  emoji: "📈", action: () => navigate("/app/invest") },
    { label: L("Kalender", "Calendar"), emoji: "📅", action: () => navigate("/app/calendar") },
    { label: L("Laporan", "Report"),    emoji: "📊", action: () => navigate("/app/report") },
    { label: L("Hutang", "Debt"),       emoji: "📒", action: () => navigate("/app/debt") },
    { label: L("Aset", "Assets"),       emoji: "🏦", action: () => navigate("/app/assets") },
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
          <div className="relative rounded-[28px] overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.6)] border border-white/5 transition-all clickable group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4edea3] to-[#04b4a2]" />
            <img src={imgBg} alt="" className="absolute inset-0 w-[120%] h-[120%] object-cover mix-blend-overlay opacity-30 pointer-events-none group-hover:scale-110 transition-transform duration-700"
              style={{ transform: `translate3d(-5%, ${-5 + (scrollPos * 0.05)}%, 0)` }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} 
            />
            <div className="relative p-6 min-h-[180px] flex flex-col justify-between z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="font-['Plus_Jakarta_Sans'] font-medium text-[11px] text-[rgba(0,56,36,0.7)] tracking-[0.55px] uppercase">{t("activeBalance", lang)}</p>
                  <div className="flex gap-1 items-end">
                    <span className="font-mono font-bold text-[16px] text-[rgba(0,56,36,0.6)] leading-[28px]">Rp</span>
                    <span className="font-mono font-extrabold tracking-[-0.9px] leading-[40px] transition-all duration-300" 
                      style={{ 
                        color: activeFundsTotal < 0 ? "#8b0000" : "#003824",
                        fontSize: !showBalance ? '32px' : 
                          activeFundsTotal.toLocaleString("id-ID").length > 13 ? '20px' :
                          activeFundsTotal.toLocaleString("id-ID").length > 10 ? '24px' :
                          activeFundsTotal.toLocaleString("id-ID").length > 8 ? '28px' : '32px'
                      }}>
                      {showBalance ? activeFundsTotal.toLocaleString("id-ID") : "••••••"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    className="bg-[rgba(0,56,36,0.15)] rounded-full px-3 py-1 flex items-center gap-1.5 clickable"
                    onClick={() => setShowFundsDetail(v => !v)}
                  >
                    <span className="text-[14px]">{showFundsDetail ? "✕" : "ℹ️"}</span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-[#003824] tracking-[0.3px] uppercase">
                      {showFundsDetail ? L("Tutup", "Close") : L("Detail", "Details")}
                    </span>
                  </button>
                  <button className="bg-[rgba(0,56,36,0.15)] rounded-full px-3 py-1.5 flex items-center gap-1.5 clickable" onClick={() => navigate("/app/achievements")}>
                     <span className="text-[14px]">🏅</span>
                     <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-[#003824] tracking-[0.3px] uppercase">{unlockedCount} Badges</span>
                  </button>
                  <div className="bg-[rgba(0,56,36,0.15)] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-[14px]">🔥</span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-[#003824] tracking-[0.3px]">
                      {streak.current} {L("hari", "days")} · {userLevel.title}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <div className="bg-[rgba(0,56,36,0.1)] rounded-[14px] px-4 py-2 flex-1">
                  <p className="font-['Inter'] text-[9px] text-[rgba(0,56,36,0.6)]">{t("monthlyIn", lang)}</p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-[#003824]">+{showBalance ? formatRupiah(monthIn) : "Rp••••"}</p>
                </div>
                <div className="bg-[rgba(0,56,36,0.1)] rounded-[14px] px-4 py-2 flex-1">
                  <p className="font-['Inter'] text-[9px] text-[rgba(0,56,36,0.6)]">{t("monthlyOut", lang)}</p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-[#003824]">-{showBalance ? formatRupiah(monthOut) : "Rp••••"}</p>
                </div>
              </div>

              {showFundsDetail && (
                <div className="grid grid-cols-2 gap-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-[rgba(0,56,36,0.1)] rounded-[14px] px-4 py-2">
                    <p className="font-['Inter'] text-[9px] text-[rgba(0,56,36,0.6)]">💵 Cash</p>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-[#003824]">
                      {showBalance ? formatRupiah(cashBalance) : "Rp••••"}
                    </p>
                  </div>
                  <div className="bg-[rgba(0,56,36,0.1)] rounded-[14px] px-4 py-2">
                    <p className="font-['Inter'] text-[9px] text-[rgba(0,56,36,0.6)]">🏦 Bank (available)</p>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-[#003824]">
                      {showBalance ? formatRupiah(bankAvailableTotal) : "Rp••••"}
                    </p>
                  </div>
                  {emergencyFund && emergencyFund.isActive && (
                    <div className="bg-[rgba(239,68,68,0.1)] rounded-[14px] px-4 py-2">
                      <p className="font-['Inter'] text-[9px] text-[rgba(239,68,68,0.6)]">{L("Dana Darurat", "Emergency Fund")}</p>
                      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-[#ef4444]">
                        {showBalance ? formatRupiah(emergencyFund.savedAmount) : "Rp••••"}
                      </p>
                    </div>
                  )}
                  <div className="bg-[rgba(0,56,36,0.1)] rounded-[14px] px-4 py-2">
                    <p className="font-['Inter'] text-[9px] text-[rgba(0,56,36,0.6)]">🎯 {L("Tabungan terkunci", "Locked savings")}</p>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-[#003824]">
                      {showBalance ? formatRupiah(lockedSavingsTotal) : "Rp••••"}
                    </p>
                  </div>
                  <div className="bg-[rgba(0,56,36,0.1)] rounded-[14px] px-4 py-2">
                    <p className="font-['Inter'] text-[9px] text-[rgba(0,56,36,0.6)]">🏷️ {L("Aset", "Assets")}</p>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-[#003824]">
                      {showBalance ? formatRupiah(assetsTotal) : "Rp••••"}
                    </p>
                  </div>
                </div>
              )}
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
                    ? "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30"
                    : guardianPrediction.riskLevel === "danger"
                    ? "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30"
                    : "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30"
                  }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {/* Pulse ring saat protection mode */}
                {guardianPrediction.protectionMode && (
                  <span className="absolute top-3 right-3 flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-red-500" />
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    {guardianPrediction.protectionMode ? "🛡️" : "⚠️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] text-white">
                        {guardianPrediction.protectionMode
                          ? L("Mode Proteksi Aktif", "Protection Mode Active")
                          : L("Peringatan Risiko", "Risk Warning")}
                      </p>
                      {guardianPrediction.protectionMode && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-300">AKTIF</span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed">{guardianPrediction.message}</p>
                    <p className="text-[10px] text-white/50 mt-2">{guardianPrediction.recommendation}</p>
                    {guardianPrediction.affectedCategories.length > 0 && (
                      <p className="text-[10px] text-white/60 mt-1">
                        ⚠️ {L("Kategori Terbatas", "Limited Categories")}: {guardianPrediction.affectedCategories.join(", ")}
                      </p>
                    )}
                    {/* Tap hint */}
                    <div className="flex items-center gap-1 mt-2.5">
                      <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-[10px] text-white/40 font-medium">
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
              <div className="bg-gradient-to-br from-[#1a2740] to-[#131b2e] rounded-[24px] p-5 border border-white/5 shadow-lg relative overflow-hidden group">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="size-8 rounded-full bg-[#4edea3]/20 flex items-center justify-center"><span className="text-[16px]">💡</span></div>
                    <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-white">Insight Pengeluaran</h4>
                 </div>
                 <div className="space-y-3">{insights.map((insight, i) => <p key={i} className="text-[11px] text-[#dae2fd] leading-relaxed italic">" {insight} "</p>)}</div>
                 <div className="mt-4 flex justify-end"><button onClick={() => navigate("/app/report")} className="text-[10px] font-bold text-[#4edea3] uppercase tracking-widest clickable">Detail Laporan →</button></div>
              </div>
           </div>
        )}

        {emergencyFund && emergencyFund.targetAmount > 0 && (
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
            <button
              type="button"
              onClick={() => navigate(`/app/emergency-funds/${emergencyFund.id}`)}
              className="w-full text-left rounded-[20px] p-4 border transition-all hover:shadow-[0_8px_24px_rgba(239,68,68,0.15)] active:scale-[0.99]"
              style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
                    <span className="text-[20px]">🚨</span>
                  </div>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
                      {formatRupiah(emergencyFund.savedAmount)}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--app-text2)" }}>
                      {L("dari", "of")} {formatRupiah(emergencyFund.targetAmount)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[16px]" style={{ color: emergencyFund.savedAmount >= emergencyFund.targetAmount ? "#4edea3" : "#ef4444" }}>
                    {Math.min(100, Math.round((emergencyFund.savedAmount / emergencyFund.targetAmount) * 100))}%
                  </p>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-card2)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (emergencyFund.savedAmount / emergencyFund.targetAmount) * 100)}%`,
                    background: emergencyFund.savedAmount >= emergencyFund.targetAmount 
                      ? "linear-gradient(90deg,#4edea3,#04b4a2)" 
                      : "linear-gradient(90deg,#ef4444,#fca5a5)",
                  }} />
              </div>
            </button>
          </div>
        )}

        <div className="px-5 mb-8">
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase mb-4"
            style={{ color: "var(--app-text2)" }}>{t("services", lang)}</p>
          <div className={`grid ${services.length > 7 ? 'grid-cols-4' : 'grid-cols-4'} gap-2`}>
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

        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase"
              style={{ color: "var(--app-text2)" }}>{t("recent", lang)}</p>
            <button onClick={() => navigate("/app/history")} className="font-['Inter'] font-semibold text-[11px] text-[#4edea3] clickable">{t("seeAll", lang)}</button>
          </div>
          {recentTx.length === 0 ? (
            <div className="rounded-[20px] p-8 text-center" style={{ backgroundColor: "var(--app-card)" }}>
              <span className="text-[36px] block mb-3">📝</span>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] mb-1" style={{ color: "var(--app-text)" }}>{t("noTransactions", lang)}</p>
              <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>{t("noTransactionsDesc", lang)}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTx.slice(0, 3).map((tx, i) => (
                <div key={tx.id}
                  style={{ animation: `taskSlideIn 0.5s cubic-bezier(0.2,0.8,0.2,1) both`, animationDelay: `${i * 60}ms` }}>
                <div className="group rounded-[20px] p-4 flex items-center justify-between border transition-all duration-200 hover:shadow-[0_8px_24px_rgba(78,222,163,0.12)] hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="size-[40px] rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: "var(--app-card2)" }}>
                      <span className="text-[18px]">{categoryEmojiMap[tx.category] || "💳"}</span>
                    </div>
                    <div>
                      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>{tx.category}</p>
                      <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                        {formatDate(tx.date)}{tx.notes ? ` · ${tx.notes}` : ""}
                      </p>
                    </div>
                  </div>
                  <p className={`font-['Plus_Jakarta_Sans'] font-bold text-[14px] ${tx.type === "income" ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                  </p>
                </div>
                </div>
              ))}
              <button onClick={() => navigate("/app/history")}
                className="w-full py-3 text-center text-[11px] font-bold text-[#4edea3] border border-dashed border-[#4edea340] rounded-xl">
                {L("Lihat semua transaksi →", "View all transactions →")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
