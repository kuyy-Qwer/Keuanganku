import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { getAchievements, getTransactions, getLockedSavings, getBalance, getBudgets, getDebts, getPageVisits, getMonthlyIncome, getMonthlyExpense, getUserLevel, getStreak } from "../store/database";
import { useLang } from "../i18n";
function getProgress(id: string): { current: number; max: number } | null {
  const txs = getTransactions();
  const savings = getLockedSavings();
  const balance = getBalance();
  const budgets = getBudgets();
  const debts = getDebts();
  const totalSaved = savings.reduce((s, a) => s + a.savedAmount, 0);
  const reportVisits = getPageVisits('report');
  const uniqueDays = [...new Set(reportVisits)].length;
  const monthIncome = getMonthlyIncome();
  const monthExpense = getMonthlyExpense();
  const paidDebtCount = debts.filter(d => d.isPaid).length;
  const savingsCompletedCount = savings.filter(s => s.targetAmount > 0 && s.savedAmount >= s.targetAmount).length;

  switch (id) {
    case '2':  return { current: Math.min(txs.length, 10), max: 10 };
    case '6':  return { current: Math.min(budgets.length, 3), max: 3 };
    case '7':  return { current: Math.min(txs.length, 50), max: 50 };
    case '8':  return { current: Math.min(balance, 1000000), max: 1000000 };
    case '10': return { current: Math.min(totalSaved, 5000000), max: 5000000 };
    case '14': return { current: Math.min(uniqueDays, 5), max: 5 };
    case '15': return monthIncome > 0 ? { current: Math.round((monthExpense / monthIncome) * 100), max: 50 } : null;
    case '16': return { current: Math.min(balance, 10000000), max: 10000000 };
    case '17': {
      const txList = getTransactions();
      if (txList.length === 0) return { current: 0, max: 30 };
      const first = new Date(txList[txList.length - 1].date).getTime();
      return { current: Math.min(Math.floor((Date.now() - first) / 86400000), 30), max: 30 };
    }
    case '18': {
      const txList = getTransactions();
      if (txList.length === 0) return { current: 0, max: 90 };
      const first = new Date(txList[txList.length - 1].date).getTime();
      return { current: Math.min(Math.floor((Date.now() - first) / 86400000), 90), max: 90 };
    }
    case '19': return { current: Math.min(balance, 100000000), max: 100000000 };
    case '20': {
      const all = getAchievements();
      const count = all.filter(a => a.id !== '20' && a.id !== '35' && a.isUnlocked).length;
      return { current: count, max: 15 };
    }
    case '21': return { current: Math.min(txs.length, 100), max: 100 };
    case '22': return { current: Math.min(txs.length, 250), max: 250 };
    case '23': return { current: Math.min(txs.length, 500), max: 500 };
    case '24': {
      const used = new Set(txs.map(t => t.category)).size;
      return { current: Math.min(used, 12), max: 12 };
    }
    case '25': return { current: Math.min(budgets.length, 8), max: 8 };
    case '26': return { current: Math.min(totalSaved, 20000000), max: 20000000 };
    case '27': return { current: Math.min(totalSaved, 100000000), max: 100000000 };
    case '28': return { current: Math.min(balance, 250000000), max: 250000000 };
    case '29': return { current: Math.min(balance, 1000000000), max: 1000000000 };
    case '30': return { current: Math.min(paidDebtCount, 5), max: 5 };
    case '31': return { current: Math.min(savings.length, 5), max: 5 };
    case '32': return { current: Math.min(savingsCompletedCount, 3), max: 3 };
    case '33': return { current: Math.min(uniqueDays, 14), max: 14 };
    case '34': {
      const calVisits = getPageVisits('calendar');
      const calUnique = [...new Set(calVisits)].length;
      return { current: Math.min(calUnique, 14), max: 14 };
    }
    case '35': {
      const all = getAchievements();
      const count = all.filter(a => a.id !== '20' && a.id !== '35' && a.isUnlocked).length;
      return { current: Math.min(count, 30), max: 30 };
    }
    default: return null;
  }
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState<any>({ level: 1, currentExp: 0, totalExp: 0, title: "Pemula" });
  const [streak, setStreak] = useState<any>({ current: 0, longest: 0, lastDate: null });

  useEffect(() => {
    const load = () => {
      setAchievements(getAchievements());
      setUserLevel(getUserLevel());
      setStreak(getStreak());
    };
    load();
    window.addEventListener("luminary_data_change", load);
    return () => window.removeEventListener("luminary_data_change", load);
  }, []);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const progress = achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0;
  const expForNext = Math.floor(100 * Math.pow(1.2, userLevel.level - 1));
  const expProgress = Math.min((userLevel.currentExp / expForNext) * 100, 100);
  const L = (id: string, en: string) => lang === "en" ? en : id;

  return (
    <div className="w-full min-h-screen flex justify-center pb-28"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app/account")}
            className="p-2 rounded-full transition-all active:scale-90"
            style={{ backgroundColor: "var(--app-card)" }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2}
              stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[22px]"
              style={{ color: "var(--app-text)" }}>
              {L("Level Keuangan", "Financial Level")}
            </h1>
            <p className="text-[12px]" style={{ color: "var(--app-text2)" }}>
              {L("Kumpulkan XP untuk naik level!", "Gain XP to level up!")}
            </p>
          </div>
        </div>

        {/* Level Card */}
        <div className="rounded-[24px] p-5 border"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-[18px] flex items-center justify-center text-[28px] shadow-lg"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 8px 24px rgba(251,191,36,0.3)" }}>
                🏆
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#f59e0b" }}>
                  LEVEL {userLevel.level}
                </p>
                <h2 className="text-[22px] font-black" style={{ color: "var(--app-text)" }}>
                  {userLevel.title}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 mb-1 justify-end">
                <span className="text-[14px]">🔥</span>
                <span className="text-[14px] font-bold" style={{ color: "#ef4444" }}>{streak.current}</span>
                <span className="text-[10px]" style={{ color: "var(--app-text2)" }}>{L("hari", "days")}</span>
              </div>
              <p className="text-[10px]" style={{ color: "var(--app-text2)" }}>
                🏆 Best: {streak.longest} {L("hari", "days")}
              </p>
            </div>
          </div>

          {/* EXP Progress */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-text2)" }}>EXP</p>
              <p className="text-[11px] font-bold" style={{ color: "var(--app-text)" }}>
                {userLevel.currentExp} / {expForNext}
              </p>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-card2)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${expProgress}%`, background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }} />
            </div>
            <p className="text-[10px] mt-2" style={{ color: "var(--app-text2)" }}>
              Total EXP: {userLevel.totalExp} · {L("Setiap transaksi +10 XP", "Each transaction +10 XP")}
            </p>
          </div>
        </div>

        {/* Badges Progress */}
        <div className="rounded-[24px] p-5 border"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#4edea3" }}>
                {L("Lencana", "Badges")}
              </p>
              <h2 className="text-[20px] font-black" style={{ color: "var(--app-text)" }}>
                {unlockedCount} / {achievements.length}
              </h2>
            </div>
            <div className="size-12 rounded-full flex items-center justify-center"
              style={{ background: "rgba(78,222,163,0.12)", border: "1px solid rgba(78,222,163,0.2)" }}>
              <span className="text-[15px] font-black" style={{ color: "#4edea3" }}>
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-card2)" }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #4edea3, #00b4a2)" }} />
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          {achievements.map(a => {
            const prog = getProgress(a.id);
            const progPct = prog ? Math.min((prog.current / prog.max) * 100, 100) : 0;

            return (
              <div key={a.id}
                className="rounded-[20px] p-4 flex flex-col items-center text-center transition-all"
                style={{
                  backgroundColor: a.isUnlocked ? "var(--app-card)" : "var(--app-card2)",
                  border: `1px solid ${a.isUnlocked ? "rgba(78,222,163,0.25)" : "var(--app-border)"}`,
                  boxShadow: a.isUnlocked ? "0 4px 16px rgba(78,222,163,0.1)" : "none",
                  opacity: a.isUnlocked ? 1 : 0.65,
                }}
              >
                {/* Emoji icon */}
                <div className="size-12 rounded-[14px] flex items-center justify-center text-[26px] mb-2.5"
                  style={{
                    backgroundColor: a.isUnlocked ? "rgba(78,222,163,0.15)" : "var(--app-bg)",
                    border: `1px solid ${a.isUnlocked ? "rgba(78,222,163,0.2)" : "var(--app-border)"}`,
                    filter: a.isUnlocked ? "none" : "grayscale(0.6)",
                  }}>
                  {a.emoji}
                </div>

                {/* Title */}
                <h3 className="text-[12px] font-black mb-1 leading-tight"
                  style={{ color: a.isUnlocked ? "var(--app-text)" : "var(--app-text2)" }}>
                  {a.title}
                </h3>

                {/* Description */}
                <p className="text-[10px] leading-snug px-0.5 mb-2"
                  style={{ color: "var(--app-text2)" }}>
                  {a.description}
                </p>

                {/* Progress bar untuk yang belum unlock */}
                {!a.isUnlocked && prog && (
                  <div className="w-full mt-auto space-y-1">
                    <div className="h-1.5 rounded-full overflow-hidden w-full"
                      style={{ backgroundColor: "var(--app-bg)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progPct}%`, backgroundColor: "#4edea3", opacity: 0.7 }} />
                    </div>
                    <p className="text-[9px] font-bold" style={{ color: "#4edea3", opacity: 0.8 }}>
                      {a.id === '15'
                        ? `${prog.current}% / <${prog.max}%`
                        : `${prog.current.toLocaleString('id-ID')} / ${prog.max.toLocaleString('id-ID')}`
                      }
                    </p>
                  </div>
                )}

                {/* Achieved badge */}
                {a.isUnlocked && (
                  <div className="mt-auto pt-1">
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(78,222,163,0.15)", color: "#4edea3", border: "1px solid rgba(78,222,163,0.2)" }}>
                      ✓ {L("TERCAPAI", "ACHIEVED")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
