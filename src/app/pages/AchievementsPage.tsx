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
  const expProgress = (userLevel.currentExp / expForNext) * 100;
  const L = (id: string, en: string) => lang === "en" ? en : id;

  return (
    <div className="w-full min-h-screen bg-[#0b1326] flex justify-center pb-28">
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/app/account")} className="bg-[#171f33] p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[22px] text-white">
              {L("Level Keuangan", "Financial Level")}
            </h1>
            <p className="text-[12px] text-[#64748b]">
              {L("Kumpulkan XP untuk naik level!", "Gain XP to level up!")}
            </p>
          </div>
        </div>

        {/* Level Card */}
        <div className="bg-gradient-to-br from-[#1a2740] to-[#131b2e] rounded-[28px] p-6 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] flex items-center justify-center text-[28px] shadow-lg">
                🏆
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#fbbf24] uppercase tracking-widest">LEVEL {userLevel.level}</p>
                <h2 className="text-[24px] font-black text-white">{userLevel.title}</h2>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[14px]">🔥</span>
                <span className="text-[14px] font-bold text-[#ff6b6b]">{streak.current}</span>
                <span className="text-[10px] text-[#64748b]">{L("hari streak", "day streak")}</span>
              </div>
              <p className="text-[10px] text-[#64748b]">
                🏆 Best: {streak.longest} {L("hari", "days")}
              </p>
            </div>
          </div>
          
          {/* EXP Progress */}
          <div className="mb-2">
            <div className="flex justify-between items-end mb-1">
              <p className="text-[10px] text-[#64748b]">EXP</p>
              <p className="text-[10px] font-bold text-white">{userLevel.currentExp} / {expForNext}</p>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] transition-all duration-1000" style={{ width: `${expProgress}%` }} />
            </div>
          </div>
          
          <p className="text-[9px] text-[#64748b] mt-3">
            Total EXP: {userLevel.totalExp} · {L("Setiap mencatat transaksi dapat +10 XP", "Each transaction recorded gives +10 XP")}
          </p>
        </div>

        {/* Badges Progress */}
        <div className="bg-gradient-to-br from-[#1a2740] to-[#131b2e] rounded-[28px] p-5 border border-white/5 shadow-xl">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[11px] font-bold text-[#4edea3] uppercase tracking-widest">
                {L("Lencana", "Badges")}
              </p>
              <h2 className="text-[20px] font-black text-white">{unlockedCount} / {achievements.length}</h2>
            </div>
            <p className="text-[18px] font-bold text-[#4edea3]">{progress.toFixed(0)}%</p>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#4edea3] transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 gap-4">
          {achievements.map(a => {
            const prog = getProgress(a.id);
            const progPct = prog ? Math.min((prog.current / prog.max) * 100, 100) : 0;

            return (
              <div key={a.id}
                className={`p-4 rounded-[24px] border border-white/5 flex flex-col items-center text-center transition-all
                  ${a.isUnlocked
                    ? 'bg-[#171f33] shadow-lg opacity-100'
                    : 'bg-[#131b2e] opacity-50 grayscale'
                  }`}
              >
                <div className={`size-14 rounded-2xl flex items-center justify-center text-[30px] mb-3
                  ${a.isUnlocked ? 'bg-[#4edea3]/10' : 'bg-white/5'}`}>
                  {a.emoji}
                </div>
                <h3 className="text-[12px] font-black text-white mb-1 leading-tight">{a.title}</h3>
                <p className="text-[9px] text-[#64748b] leading-tight px-1 mb-2">{a.description}</p>

                {/* Progress bar untuk yang belum unlock dan punya progress */}
                {!a.isUnlocked && prog && (
                  <div className="w-full mt-1 space-y-1">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full">
                      <div className="h-full bg-[#4edea3]/60 transition-all duration-700" style={{ width: `${progPct}%` }} />
                    </div>
                    <p className="text-[8px] text-[#4edea3]/60 font-bold">
                      {a.id === '15'
                        ? `${prog.current}% / target <${prog.max}%`
                        : `${prog.current.toLocaleString('id-ID')} / ${prog.max.toLocaleString('id-ID')}`
                      }
                    </p>
                  </div>
                )}

                {a.isUnlocked && (
                  <span className="text-[9px] font-black text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded-full mt-1">
                    ✓ {L("TERCAPAI", "ACHIEVED")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
