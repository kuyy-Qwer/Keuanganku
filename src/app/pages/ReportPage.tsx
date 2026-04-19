import { useNavigate } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { getWeeklyIncome, getWeeklyExpense, getTransactions, getCategories, getCategoryTotals, formatRupiah, trackPageVisit } from "../store/database";
import { useLang } from "../i18n";
const MONTH_NAMES_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const MONTH_NAMES_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type FilterPeriod = "week" | "month" | "year" | "custom" | "all";
type FilterType = "expense" | "income" | "all";

interface StatData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  avgTransaction: number;
  highestCategory: { name: string; amount: number } | null;
  savingsRate: number;
  incomeCount: number;
  expenseCount: number;
  highestTransaction: { category: string; amount: number; date: string } | null;
  lowestTransaction: { category: string; amount: number; date: string } | null;
}

export default function ReportPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const [weekIn, setWeekIn] = useState(0);
  const [weekOut, setWeekOut] = useState(0);
  const [catTotals, setCatTotals] = useState<Record<string, number>>({});
  const [txCount, setTxCount] = useState(0);
  const [categoryEmojiMap, setCategoryEmojiMap] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // ── Insights engine ──────────────────────────────────────────────
  const insights = useMemo(() => {
    const allTxs = getTransactions();
    const now = new Date();

    const thisMonthTxs = allTxs.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const lastMonthTxs = allTxs.filter(t => {
      const d = new Date(t.date);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth();
    });

    const mIncome  = thisMonthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const mExpense = thisMonthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const lmExpense = lastMonthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    // Category frequency this month
    const catCount: Record<string, number> = {};
    const catTotal: Record<string, number> = {};
    thisMonthTxs.filter(t => t.type === "expense").forEach(t => {
      catCount[t.category] = (catCount[t.category] || 0) + 1;
      catTotal[t.category] = (catTotal[t.category] || 0) + t.amount;
    });

    // Spending by day-of-week
    const dowTotal: number[] = Array(7).fill(0);
    allTxs.filter(t => t.type === "expense").forEach(t => {
      dowTotal[new Date(t.date).getDay()] += t.amount;
    });
    const maxDow = dowTotal.indexOf(Math.max(...dowTotal));
    const dowNames = lang === "en"
      ? ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
      : ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

    type Insight = { type: "warning" | "good" | "tip" | "info"; emoji: string; title: string; body: string };
    const list: Insight[] = [];

    // 1. Savings rate
    if (mIncome > 0) {
      const rate = ((mIncome - mExpense) / mIncome) * 100;
      if (rate >= 30) {
        list.push({ type: "good", emoji: "🏆", title: lang === "en" ? "Great savings rate!" : "Tingkat hemat luar biasa!", body: lang === "en" ? `You saved ${rate.toFixed(0)}% of your income this month. Keep it up!` : `Kamu berhasil menabung ${rate.toFixed(0)}% dari pemasukan bulan ini. Pertahankan!` });
      } else if (rate < 0) {
        list.push({ type: "warning", emoji: "🚨", title: lang === "en" ? "Spending exceeds income" : "Pengeluaran melebihi pemasukan", body: lang === "en" ? `You spent ${formatRupiah(mExpense - mIncome)} more than you earned this month.` : `Kamu menghabiskan ${formatRupiah(mExpense - mIncome)} lebih dari pemasukan bulan ini.` });
      } else if (rate < 10) {
        list.push({ type: "warning", emoji: "⚠️", title: lang === "en" ? "Low savings rate" : "Tingkat hemat rendah", body: lang === "en" ? `Only ${rate.toFixed(0)}% saved. Try to aim for at least 20%.` : `Hanya ${rate.toFixed(0)}% yang berhasil ditabung. Coba targetkan minimal 20%.` });
      }
    }

    // 2. Bocor halus — category with >= 5 transactions
    Object.entries(catCount).forEach(([cat, count]) => {
      if (count >= 5) {
        const pct = mIncome > 0 ? ((catTotal[cat] / mIncome) * 100).toFixed(0) : null;
        list.push({ type: "warning", emoji: "💧", title: lang === "en" ? `Frequent spending: ${cat}` : `Bocor halus: ${cat}`, body: lang === "en" ? `${count} transactions totaling ${formatRupiah(catTotal[cat])}${pct ? ` (${pct}% of income)` : ""}.` : `${count} transaksi senilai ${formatRupiah(catTotal[cat])}${pct ? ` (${pct}% dari pemasukan)` : ""}. Coba kurangi sedikit.` });
      }
    });

    // 3. Expense vs last month
    if (lmExpense > 0 && mExpense > 0) {
      const diff = ((mExpense - lmExpense) / lmExpense) * 100;
      if (diff > 20) {
        list.push({ type: "warning", emoji: "📈", title: lang === "en" ? "Spending up vs last month" : "Pengeluaran naik dari bulan lalu", body: lang === "en" ? `Expenses increased by ${diff.toFixed(0)}% compared to last month.` : `Pengeluaran naik ${diff.toFixed(0)}% dibanding bulan lalu. Cek kategori terbesar.` });
      } else if (diff < -10) {
        list.push({ type: "good", emoji: "📉", title: lang === "en" ? "Spending down vs last month" : "Pengeluaran turun dari bulan lalu", body: lang === "en" ? `Great! Expenses dropped by ${Math.abs(diff).toFixed(0)}% vs last month.` : `Bagus! Pengeluaran turun ${Math.abs(diff).toFixed(0)}% dibanding bulan lalu.` });
      }
    }

    // 4. Biggest spending day-of-week
    if (allTxs.length >= 10) {
      list.push({ type: "info", emoji: "📅", title: lang === "en" ? "Peak spending day" : "Hari pengeluaran terbesar", body: lang === "en" ? `You tend to spend the most on ${dowNames[maxDow]}s. Plan ahead!` : `Kamu cenderung paling banyak belanja di hari ${dowNames[maxDow]}. Rencanakan lebih baik!` });
    }

    // 5. Top category dominance
    const sortedCats = Object.entries(catTotal).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0 && mExpense > 0) {
      const [topCat, topAmt] = sortedCats[0];
      const pct = (topAmt / mExpense) * 100;
      if (pct > 50) {
        list.push({ type: "tip", emoji: "🎯", title: lang === "en" ? `${topCat} dominates spending` : `${topCat} mendominasi pengeluaran`, body: lang === "en" ? `${pct.toFixed(0)}% of your expenses go to ${topCat}. Consider setting a budget.` : `${pct.toFixed(0)}% pengeluaranmu ke ${topCat}. Pertimbangkan pasang anggaran.` });
      }
    }

    // 6. No income recorded
    if (mIncome === 0 && thisMonthTxs.length > 0) {
      list.push({ type: "tip", emoji: "💡", title: lang === "en" ? "No income recorded" : "Belum ada pemasukan dicatat", body: lang === "en" ? "Don't forget to record your income for a complete financial picture." : "Jangan lupa catat pemasukanmu agar laporan keuangan lebih lengkap." });
    }

    // 7. Healthy balance tip
    if (mIncome > 0 && mExpense > 0 && mExpense < mIncome * 0.5) {
      list.push({ type: "good", emoji: "✅", title: lang === "en" ? "Healthy spending ratio" : "Rasio pengeluaran sehat", body: lang === "en" ? "Expenses are below 50% of income. You're on track!" : "Pengeluaran di bawah 50% pemasukan. Keuanganmu sehat!" });
    }

    return list;
  }, [lang]);

  const { filteredCatTotals, statData, categories: categoryList, trendMonths, prevIncome, prevExpense, currIncome, currExpense } = useMemo(() => {
    const allTxs = getTransactions();
    const now = new Date();
    let filtered = allTxs.filter(tx => {
      const txDate = new Date(tx.date);
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (filterCategory !== "all" && tx.category !== filterCategory) return false;
      switch (filterPeriod) {
        case "week": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return txDate >= weekAgo;
        }
        case "month": {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return txDate >= monthStart;
        }
        case "year": {
          const yearStart = new Date(now.getFullYear(), 0, 1);
          return txDate >= yearStart;
        }
        case "custom": {
          if (dateFrom && dateTo) {
            const from = new Date(dateFrom);
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            return txDate >= from && txDate <= to;
          }
          return true;
        }
        default:
          return true;
      }
    });

    const totalIncome = filtered.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const catTotalsFiltered: Record<string, number> = {};
    filtered.filter(t => t.type === "expense").forEach(t => {
      catTotalsFiltered[t.category] = (catTotalsFiltered[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(catTotalsFiltered).sort((a, b) => b[1] - a[1]);
    const highest = sorted.length > 0 ? { name: sorted[0][0], amount: sorted[0][1] } : null;
    // Rata-rata per transaksi: hitung berdasarkan tipe yang dipilih
    const relevantTxs = filterType === "income"
      ? filtered.filter(t => t.type === "income")
      : filterType === "expense"
      ? filtered.filter(t => t.type === "expense")
      : filtered;
    const avg = relevantTxs.length > 0
      ? relevantTxs.reduce((s, t) => s + t.amount, 0) / relevantTxs.length
      : 0;
    // Savings rate: hanya valid jika ada pemasukan
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const incomeCount = filtered.filter(t => t.type === "income").length;
    const expenseCount = filtered.filter(t => t.type === "expense").length;
    const sortedByAmount = [...filtered].sort((a, b) => b.amount - a.amount);
    const highestTx = sortedByAmount.length > 0 ? { category: sortedByAmount[0].category, amount: sortedByAmount[0].amount, date: sortedByAmount[0].date } : null;
    const lowestTx = sortedByAmount.length > 0 ? { category: sortedByAmount[sortedByAmount.length - 1].category, amount: sortedByAmount[sortedByAmount.length - 1].amount, date: sortedByAmount[sortedByAmount.length - 1].date } : null;

    const stats: StatData = {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: filtered.length,
      avgTransaction: avg,
      highestCategory: highest,
      savingsRate,
      incomeCount,
      expenseCount,
      highestTransaction: highestTx,
      lowestTransaction: lowestTx
    };

    // Monthly trend: last 6 months
    const allTxsForTrend = getTransactions();
    const trendMonths: { label: string; income: number; expense: number }[] = [];
    const nowRef = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(nowRef.getFullYear(), nowRef.getMonth() - i, 1);
      const y = d.getFullYear(), m = d.getMonth();
      const mTxs = allTxsForTrend.filter(t => {
        const td = new Date(t.date);
        return td.getFullYear() === y && td.getMonth() === m;
      });
      trendMonths.push({
        label: (lang === "en" ? MONTH_NAMES_EN : MONTH_NAMES_ID)[m],
        income: mTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: mTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }

    // Previous month comparison
    const prevMonthDate = new Date(nowRef.getFullYear(), nowRef.getMonth() - 1, 1);
    const prevMTxs = allTxsForTrend.filter(t => {
      const td = new Date(t.date);
      return td.getFullYear() === prevMonthDate.getFullYear() && td.getMonth() === prevMonthDate.getMonth();
    });
    const prevIncome = prevMTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevMTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const currMTxs = allTxsForTrend.filter(t => {
      const td = new Date(t.date);
      return td.getFullYear() === nowRef.getFullYear() && td.getMonth() === nowRef.getMonth();
    });
    const currIncome = currMTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const currExpense = currMTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    return { filteredCatTotals: catTotalsFiltered, statData: stats, categories: getCategories(), trendMonths, prevIncome, prevExpense, currIncome, currExpense };
  }, [filterType, filterPeriod, filterCategory, dateFrom, dateTo, lang]);

  useEffect(() => {
    trackPageVisit('report');
    const refresh = () => {
      setWeekIn(getWeeklyIncome());
      setWeekOut(getWeeklyExpense());
      setCatTotals(getCategoryTotals());
      setTxCount(getTransactions().length);
      const map: Record<string, string> = {};
      getCategories().forEach(c => { map[c.name] = c.emoji; });
      setCategoryEmojiMap(map);
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  const L = (id: string, en: string) => lang === "en" ? en : id;

  const sortedCategories = Object.entries(filteredCatTotals).sort((a, b) => b[1] - a[1]);
  const totalExpense = sortedCategories.reduce((s, c) => s + c[1], 0);
  const maxCat = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  // Donut chart calculations
  let currentAngle = 0;
  const donutSlices = sortedCategories.map(([cat, total]) => {
     const percentage = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
     const angle = (percentage / 100) * 360;
     const slice = { cat, percentage, start: currentAngle, end: currentAngle + angle };
     currentAngle += angle;
     return slice;
  });

  return (
    <div className="w-full min-h-screen flex justify-center pb-32"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">

        {/* Toolbar */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/app")} className="p-2 rounded-full transition-colors"
            style={{ backgroundColor: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[20px] flex-1"
            style={{ color: "var(--app-text)" }}>{L("Analisis Keuangan", "Financial Analysis")}</h1>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3 p-4 rounded-[24px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border"
              style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
            >
              <option value="all">{L("Semua", "All Types")}</option>
              <option value="expense">{L("Pengeluaran", "Expense")}</option>
              <option value="income">{L("Pemasukan", "Income")}</option>
            </select>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border"
              style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
            >
              <option value="all">{L("Semua Waktu", "All Time")}</option>
              <option value="week">{L("Minggu Ini", "This Week")}</option>
              <option value="month">{L("Bulan Ini", "This Month")}</option>
              <option value="year">{L("Tahun Ini", "This Year")}</option>
              <option value="custom">{L("Kustom", "Custom")}</option>
            </select>
          </div>
          {filterPeriod === "custom" && (
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border"
                style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border"
                style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
              />
            </div>
          )}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs font-bold border"
            style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
          >
            <option value="all">{L("Semua Kategori", "All Categories")}</option>
            {categoryList.map(c => (
              <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-[24px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Total Pemasukan", "Total Income")}</p>
            <p className="text-[14px] font-black text-[#4edea3]">{formatRupiah(statData.totalIncome)}</p>
            <p className="text-[9px] font-bold" style={{ color: "var(--app-text2)" }}>{statData.incomeCount} {L("transaksi", "txs")}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Total Pengeluaran", "Total Expense")}</p>
            <p className="text-[14px] font-black text-[#f87171]">{formatRupiah(statData.totalExpense)}</p>
            <p className="text-[9px] font-bold" style={{ color: "var(--app-text2)" }}>{statData.expenseCount} {L("transaksi", "txs")}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Saldo Bersih", "Net Balance")}</p>
            <p className={`text-[14px] font-black ${statData.netBalance >= 0 ? 'text-[#4edea3]' : 'text-[#f87171]'}`}>{formatRupiah(statData.netBalance)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Tingkat Hemat", "Savings Rate")}</p>
            {statData.totalIncome > 0 ? (
              <p className={`text-[14px] font-black ${statData.savingsRate >= 0 ? 'text-[#4edea3]' : 'text-[#f87171]'}`}>
                {statData.savingsRate.toFixed(1)}%
              </p>
            ) : (
              <p className="text-[14px] font-black" style={{ color: "var(--app-text2)" }}>—</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>
              {filterType === "income" ? L("Rata-rata Masuk", "Avg Income") : filterType === "expense" ? L("Rata-rata Keluar", "Avg Expense") : L("Rata-rata", "Average")}
            </p>
            <p className="text-[14px] font-black" style={{ color: "var(--app-text)" }}>
              {statData.avgTransaction > 0 ? formatRupiah(statData.avgTransaction) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Jumlah Transaksi", "Transactions")}</p>
            <p className="text-[14px] font-black" style={{ color: "var(--app-text)" }}>{statData.transactionCount}</p>
          </div>
          {statData.highestTransaction && (
            <div className="col-span-2 pt-2 border-t" style={{ borderColor: "var(--app-border)" }}>
              <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Transaksi Tertinggi", "Highest Transaction")}</p>
              <p className="text-[12px] font-black text-[#f87171]">{formatRupiah(statData.highestTransaction.amount)} - {statData.highestTransaction.category}</p>
            </div>
          )}
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] uppercase tracking-widest px-1"
              style={{ color: "var(--app-text2)" }}>
              {lang === "en" ? "💡 Insights" : "💡 Insights Keuangan"}
            </h3>
            {insights.map((ins, i) => {
              const bg: Record<string, string> = {
                warning: "#f8717115",
                good:    "#4edea315",
                tip:     "#60a5fa15",
                info:    "#fbbf2415",
              };
              const border: Record<string, string> = {
                warning: "#f87171",
                good:    "#4edea3",
                tip:     "#60a5fa",
                info:    "#fbbf24",
              };
              return (
                <div key={i} className="flex gap-3 p-4 rounded-[20px] border"
                  style={{ backgroundColor: bg[ins.type], borderColor: border[ins.type] + "55" }}>
                  <span className="text-[22px] shrink-0 mt-0.5">{ins.emoji}</span>
                  <div>
                    <p className="text-[13px] font-black mb-0.5" style={{ color: border[ins.type] }}>{ins.title}</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "var(--app-text2)" }}>{ins.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Visual Summary - Donut & Legend */}
        <div className="rounded-[32px] p-8 border shadow-2xl relative overflow-hidden group"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
           </div>

           <h3 className="text-[11px] font-bold tracking-[2px] uppercase mb-8 text-center"
             style={{ color: "var(--app-text2)" }}>{L("DISTRIBUSI PENGELUARAN", "SPENDING DISTRIBUTION")}</h3>

           <div className="flex flex-col items-center gap-10">
              {/* SVG Donut */}
              <div className="relative size-[180px] flex items-center justify-center">
                 <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    {totalExpense === 0 ? (
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--app-card2)" strokeWidth="3" />
                    ) : (
                      donutSlices.map((slice, i) => {
                         const dashArray = `${slice.percentage} ${100 - slice.percentage}`;
                         const offset = 100 - donutSlices.slice(0, i).reduce((s, sl) => s + sl.percentage, 0);
                         const colors = ["#4edea3", "#60a5fa", "#fbbf24", "#f87171", "#c084fc", "#94a3b8"];
                         return (
                           <circle key={slice.cat} cx="18" cy="18" r="15.915" fill="transparent"
                             stroke={colors[i % colors.length]} strokeWidth="4"
                             strokeDasharray={dashArray} strokeDashoffset={offset + 25}
                             className="transition-all duration-1000" />
                         );
                      })
                    )}
                 </svg>
                 <div className="absolute flex flex-col items-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text2)" }}>{L("TOTAL", "TOTAL")}</p>
                    <p className="text-[18px] font-black" style={{ color: "var(--app-text)" }}>{formatRupiah(totalExpense)}</p>
                 </div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full">
                 {sortedCategories.slice(0, 4).map(([cat, total], i) => {
                    const colors = ["#4edea3", "#60a5fa", "#fbbf24", "#f87171", "#c084fc", "#94a3b8"];
                    const pct = totalExpense > 0 ? (total / totalExpense * 100).toFixed(0) : "0";
                    return (
                      <div key={cat} className="flex items-center gap-2">
                         <div className="size-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                         <span className="text-[12px] font-bold truncate flex-1" style={{ color: "var(--app-text)" }}>{cat}</span>
                         <span className="text-[10px] font-black" style={{ color: "var(--app-text2)" }}>{pct}%</span>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>

        {/* Monthly Trend Chart - 6 months */}
        {(() => {
          const maxVal = Math.max(...trendMonths.map(m => Math.max(m.income, m.expense)), 1);
          return (
            <div className="rounded-[24px] p-5 border space-y-4"
              style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--app-text2)" }}>
                  {L("TREN 6 BULAN", "6-MONTH TREND")}
                </h3>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#4edea3]" />
                    <span className="text-[9px] font-bold" style={{ color: "var(--app-text2)" }}>{L("Masuk", "In")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#f87171]" />
                    <span className="text-[9px] font-bold" style={{ color: "var(--app-text2)" }}>{L("Keluar", "Out")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2 h-[100px]">
                {trendMonths.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-0.5 h-[80px]">
                      <div className="flex-1 rounded-t-[4px] bg-[#4edea3] transition-all duration-700"
                        style={{ height: `${maxVal > 0 ? (m.income / maxVal) * 100 : 0}%`, minHeight: m.income > 0 ? "4px" : "0" }} />
                      <div className="flex-1 rounded-t-[4px] bg-[#f87171] transition-all duration-700"
                        style={{ height: `${maxVal > 0 ? (m.expense / maxVal) * 100 : 0}%`, minHeight: m.expense > 0 ? "4px" : "0" }} />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: "var(--app-text2)" }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Month-over-Month Comparison */}
        <div className="rounded-[24px] p-5 border space-y-3"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <h3 className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--app-text2)" }}>
            {L("VS BULAN LALU", "VS LAST MONTH")}
          </h3>
          {[
            { label: L("Pemasukan", "Income"), curr: currIncome, prev: prevIncome, color: "#4edea3" },
            { label: L("Pengeluaran", "Expense"), curr: currExpense, prev: prevExpense, color: "#f87171" },
          ].map(({ label, curr, prev, color }) => {
            const diff = curr - prev;
            // Hanya tampilkan persentase jika ada data bulan lalu
            const hasPrev = prev > 0;
            const pct = hasPrev ? (diff / prev) * 100 : null;
            return (
              <div key={label} className="flex items-center justify-between">
                <p className="text-[12px] font-bold" style={{ color: "var(--app-text)" }}>{label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-black" style={{ color }}>{formatRupiah(curr)}</p>
                  {pct !== null ? (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${diff >= 0 ? "bg-[#4edea322] text-[#4edea3]" : "bg-[#f8717122] text-[#f87171]"}`}>
                      {diff >= 0 ? "+" : ""}{pct.toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                      {L("Baru", "New")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-5 rounded-[24px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--app-text2)" }}>{L("PEMASUKAN MINGGUAN", "WEEKLY INCOME")}</p>
              <h4 className="text-[16px] font-black text-[#4edea3]">{formatRupiah(weekIn)}</h4>
           </div>
           <div className="p-5 rounded-[24px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--app-text2)" }}>{L("PENGELUARAN MINGGUAN", "WEEKLY SPENDING")}</p>
              <h4 className="text-[16px] font-black text-[#ffb4ab]">{formatRupiah(weekOut)}</h4>
           </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] uppercase tracking-widest"
              style={{ color: "var(--app-text)" }}>Detail Kategori</h3>
            <span className="text-[11px] font-bold" style={{ color: "var(--app-text2)" }}>
              {statData.transactionCount} {L("TRANSAKSI", "TRANSACTIONS")}
            </span>
          </div>

          <div className="space-y-2">
             {sortedCategories.map(([cat, total]) => {
                // Persentase dari total pengeluaran (bukan relatif ke kategori terbesar)
                const pctOfTotal = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
                return (
                  <div key={cat} className="rounded-[22px] p-4 border space-y-2"
                    style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <span className="text-[20px]">{categoryEmojiMap[cat] || "💰"}</span>
                           <p className="text-[14px] font-bold" style={{ color: "var(--app-text)" }}>{cat}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-black" style={{ color: "var(--app-text)" }}>{formatRupiah(total)}</p>
                          <p className="text-[10px] font-bold" style={{ color: "var(--app-text2)" }}>{pctOfTotal.toFixed(1)}%</p>
                        </div>
                     </div>
                     <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-card2)" }}>
                        <div className="h-full bg-gradient-to-r from-[#4edea3] to-[#60a5fa] rounded-full transition-all duration-1000"
                          style={{ width: `${pctOfTotal}%` }} />
                     </div>
                  </div>
                );
             })}

             {sortedCategories.length === 0 && (
               <div className="py-20 text-center rounded-[28px] border border-dashed opacity-50"
                 style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                  <span className="text-[48px] block mb-2">🔭</span>
                  <p className="text-[13px]" style={{ color: "var(--app-text)" }}>
                    {L("Belum ada data untuk dianalisis.", "No data to analyze yet.")}
                  </p>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}