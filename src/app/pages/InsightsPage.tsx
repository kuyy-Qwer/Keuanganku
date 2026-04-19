import { useNavigate } from "react-router";
import { useState, useEffect, useMemo } from "react";
import {
  getTransactions, getCategories, getBalance, formatRupiah,
  getWeeklyIncome, getWeeklyExpense, computeGuardianAnalysis,
  type GuardianAnalysis,
} from "../store/database";
import { useLang } from "../i18n";
interface Insight {
  title: string;
  description: string;
  icon: string;
  type: "tip" | "warning" | "success" | "info";
}

export default function InsightsPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [weekIncome, setWeekIncome] = useState(0);
  const [weekExpense, setWeekExpense] = useState(0);
  const [guardian, setGuardian] = useState<GuardianAnalysis | null>(null);

  const L = (id: string, en: string) => lang === "en" ? en : id;

  useEffect(() => {
    const refresh = () => {
      setTransactions(getTransactions());
      setBalance(getBalance());
      setWeekIncome(getWeeklyIncome());
      setWeekExpense(getWeeklyExpense());
      setGuardian(computeGuardianAnalysis());
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  const insights = useMemo(() => {
    const result: Insight[] = [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthTxs = transactions.filter(t => new Date(t.date) >= startOfMonth);
    const lastMonthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    });

    const thisMonthIncome = thisMonthTxs.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const thisMonthExpense = thisMonthTxs.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const lastMonthIncome = lastMonthTxs.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const lastMonthExpense = lastMonthTxs.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    // Hanya tampilkan insight pengeluaran mingguan jika ada data
    if (weekExpense > 0) {
      const weekSavings = weekIncome - weekExpense;
      result.push({
        title: L("Pengeluaran Mingguan", "Weekly Spending"),
        description: weekIncome > 0
          ? L(
              `Kamu menghabiskan ${formatRupiah(weekExpense)} dari ${formatRupiah(weekIncome)} pemasukan minggu ini (${((weekExpense / weekIncome) * 100).toFixed(0)}%).`,
              `You spent ${formatRupiah(weekExpense)} of ${formatRupiah(weekIncome)} income this week (${((weekExpense / weekIncome) * 100).toFixed(0)}%).`
            )
          : L(
              `Kamu menghabiskan ${formatRupiah(weekExpense)} minggu ini. Belum ada pemasukan tercatat.`,
              `You spent ${formatRupiah(weekExpense)} this week. No income recorded yet.`
            ),
        icon: "📊",
        type: "info"
      });
    }

    // Savings rate — hanya jika ada pemasukan bulan ini
    if (thisMonthIncome > 0) {
      const savingsRate = ((thisMonthIncome - thisMonthExpense) / thisMonthIncome) * 100;
      if (savingsRate >= 20) {
        result.push({
          title: L("Tingkat Tabungan Baik", "Good Savings Rate"),
          description: L(
            `Bagus! Kamu menabung ${savingsRate.toFixed(0)}% dari pendapatan bulan ini (${formatRupiah(thisMonthIncome - thisMonthExpense)}). Pertahankan!`,
            `Great! You're saving ${savingsRate.toFixed(0)}% of your income this month (${formatRupiah(thisMonthIncome - thisMonthExpense)}). Keep it up!`
          ),
          icon: "💰",
          type: "success"
        });
      } else if (savingsRate < 0) {
        result.push({
          title: L("Pengeluaran Lebih dari Pendapatan", "Expenses Exceed Income"),
          description: L(
            `Pengeluaran bulan ini (${formatRupiah(thisMonthExpense)}) melebihi pendapatan (${formatRupiah(thisMonthIncome)}) sebesar ${formatRupiah(thisMonthExpense - thisMonthIncome)}. Coba atur budget lebih ketat.`,
            `This month's expenses (${formatRupiah(thisMonthExpense)}) exceed income (${formatRupiah(thisMonthIncome)}) by ${formatRupiah(thisMonthExpense - thisMonthIncome)}. Try setting a tighter budget.`
          ),
          icon: "🚨",
          type: "warning"
        });
      } else if (savingsRate < 10) {
        result.push({
          title: L("Tingkat Tabungan Rendah", "Low Savings Rate"),
          description: L(
            `Tingkat tabungan kamu hanya ${savingsRate.toFixed(0)}% dari pendapatan. Coba targetkan minimal 20% (${formatRupiah(thisMonthIncome * 0.2)}).`,
            `Your savings rate is only ${savingsRate.toFixed(0)}% of income. Try to aim for at least 20% (${formatRupiah(thisMonthIncome * 0.2)}).`
          ),
          icon: "⚠️",
          type: "warning"
        });
      }
    } else if (thisMonthTxs.length > 0) {
      // Ada transaksi tapi tidak ada pemasukan
      result.push({
        title: L("Belum Ada Pemasukan Bulan Ini", "No Income This Month"),
        description: L(
          "Kamu sudah mencatat pengeluaran tapi belum ada pemasukan bulan ini. Jangan lupa catat gaji atau pendapatan lainnya.",
          "You've recorded expenses but no income this month. Don't forget to log your salary or other income."
        ),
        icon: "💡",
        type: "warning"
      });
    }

    // Perbandingan bulan lalu — hanya jika ada data bulan lalu
    if (lastMonthIncome > 0 && thisMonthIncome > 0) {
      const incomeChange = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
      if (incomeChange > 10) {
        result.push({
          title: L("Pendapatan Meningkat", "Income Increased"),
          description: L(
            `Pendapatan bulan ini naik ${incomeChange.toFixed(0)}% dari bulan lalu (${formatRupiah(lastMonthIncome)} → ${formatRupiah(thisMonthIncome)}).`,
            `This month's income is up ${incomeChange.toFixed(0)}% from last month (${formatRupiah(lastMonthIncome)} → ${formatRupiah(thisMonthIncome)}).`
          ),
          icon: "📈",
          type: "success"
        });
      } else if (incomeChange < -10) {
        result.push({
          title: L("Pendapatan Menurun", "Income Decreased"),
          description: L(
            `Pendapatan bulan ini turun ${Math.abs(incomeChange).toFixed(0)}% dari bulan lalu (${formatRupiah(lastMonthIncome)} → ${formatRupiah(thisMonthIncome)}).`,
            `This month's income is down ${Math.abs(incomeChange).toFixed(0)}% from last month (${formatRupiah(lastMonthIncome)} → ${formatRupiah(thisMonthIncome)}).`
          ),
          icon: "📉",
          type: "warning"
        });
      }
    }

    if (lastMonthExpense > 0 && thisMonthExpense > 0) {
      const expenseChange = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
      if (expenseChange > 20) {
        result.push({
          title: L("Pengeluaran Naik Signifikan", "Spending Up Significantly"),
          description: L(
            `Pengeluaran bulan ini naik ${expenseChange.toFixed(0)}% dari bulan lalu (${formatRupiah(lastMonthExpense)} → ${formatRupiah(thisMonthExpense)}).`,
            `This month's spending is up ${expenseChange.toFixed(0)}% from last month (${formatRupiah(lastMonthExpense)} → ${formatRupiah(thisMonthExpense)}).`
          ),
          icon: "⚠️",
          type: "warning"
        });
      } else if (expenseChange < -10) {
        result.push({
          title: L("Pengeluaran Turun", "Spending Down"),
          description: L(
            `Pengeluaran bulan ini turun ${Math.abs(expenseChange).toFixed(0)}% dari bulan lalu. Hemat ${formatRupiah(lastMonthExpense - thisMonthExpense)}!`,
            `This month's spending is down ${Math.abs(expenseChange).toFixed(0)}% from last month. Saved ${formatRupiah(lastMonthExpense - thisMonthExpense)}!`
          ),
          icon: "✅",
          type: "success"
        });
      }
    }

    // Kategori terboros — hanya jika ada pengeluaran
    const expenseByCategory: Record<string, number> = {};
    thisMonthTxs.filter(t => t.type === "expense").forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && thisMonthExpense > 0) {
      const topCategoryPct = (topCategory[1] / thisMonthExpense) * 100;
      if (topCategoryPct > 40) {
        result.push({
          title: L("Kategori Pengeluaran Terbesar", "Largest Expense Category"),
          description: L(
            `${topCategory[0]} menyumbang ${topCategoryPct.toFixed(0)}% dari total pengeluaran bulan ini (${formatRupiah(topCategory[1])} dari ${formatRupiah(thisMonthExpense)}).`,
            `${topCategory[0]} accounts for ${topCategoryPct.toFixed(0)}% of total expenses this month (${formatRupiah(topCategory[1])} of ${formatRupiah(thisMonthExpense)}).`
          ),
          icon: "🔍",
          type: "info"
        });
      }
    }

    // Jika belum ada transaksi sama sekali
    if (transactions.length === 0) {
      result.push({
        title: L("Mulai Mencatat Keuangan", "Start Tracking Finances"),
        description: L(
          "Catat transaksi pertamamu untuk mendapatkan insights pribadi yang akurat.",
          "Record your first transaction to get accurate personalized insights."
        ),
        icon: "✨",
        type: "tip"
      });
    }

    return result;
  }, [transactions, weekExpense, weekIncome, lang, guardian]);

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success": return "#10B981";
      case "warning": return "#F59E0B";
      case "tip": return "#8B5CF6";
      default: return "#6366F1";
    }
  };

  const insightBadge = (type: Insight["type"]) => {
    if (type === "success") return { label: L("BAGUS", "GOOD"), icon: "✅" };
    if (type === "warning") return { label: L("WASPADA", "WARNING"), icon: "⚠️" };
    if (type === "tip") return { label: L("TIPS", "TIP"), icon: "💡" };
    return { label: L("INFO", "INFO"), icon: "ℹ️" };
  };

  return (
    <div className="w-full min-h-screen flex justify-center pb-28 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/app")}
            className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]"
            style={{ color: "var(--app-text)" }}>
            {L("Insights", "Insights")}
            </h1>
            <p className="font-['Inter'] text-[11px] mt-0.5" style={{ color: "var(--app-text2)" }}>
              {L("Ringkasan, pola, dan peringatan keuangan", "Summary, patterns, and financial warnings")}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="rounded-[22px] p-4 border"
          style={{ background: "linear-gradient(135deg,var(--app-card),var(--app-card2))", borderColor: "var(--app-border)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--app-text2)" }}>
                {L("Saldo (net)", "Net balance")}
              </p>
              <p className="font-mono font-extrabold text-[20px] mt-1 truncate"
                style={{ color: balance >= 0 ? "#10B981" : "#EF4444" }}>
                {formatRupiah(balance)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--app-text2)" }}>
                {L("7 Hari", "7 Days")}
              </div>
              <div className="mt-1 space-y-0.5">
                <p className="font-mono font-bold text-[12px]" style={{ color: "#10B981" }}>+{formatRupiah(weekIncome)}</p>
                <p className="font-mono font-bold text-[12px]" style={{ color: "#EF4444" }}>-{formatRupiah(weekExpense)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="rounded-[18px] p-4 border flex items-start gap-3"
              style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <div className="size-10 rounded-[14px] flex items-center justify-center text-[20px] shrink-0"
                style={{ backgroundColor: "var(--app-card2)" }}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]"
                    style={{ color: "var(--app-text)" }}>{insight.title}</h3>
                  <div className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ 
                      backgroundColor: getInsightColor(insight.type) + "20",
                      color: getInsightColor(insight.type)
                    }}>
                    {insightBadge(insight.type).icon} {insightBadge(insight.type).label}
                  </div>
                </div>
                <p className="font-['Inter'] text-[13px] leading-relaxed"
                  style={{ color: "var(--app-text2)" }}>{insight.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Tips */}
        <div className="rounded-[18px] p-5 border"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] mb-3"
            style={{ color: "var(--app-text)" }}>
            {L("Tips Keuangan", "Financial Tips")}
          </h3>
          <div className="space-y-2">
            {[
              { icon: "🧾", text: L("Catat transaksi kecil juga (biar pola terlihat)", "Log small expenses too (patterns become clear)") },
              { icon: "🎯", text: L("Pisahkan dana: harian, tabungan, dan darurat", "Separate funds: daily, savings, emergency") },
              { icon: "📅", text: L("Review mingguan: cari 1 kebocoran terbesar", "Weekly review: find your biggest leak") },
            ].map((it, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[14px] mt-[1px]">{it.icon}</span>
                <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
                  {it.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Proactive Financial Guardian ── */}
        {guardian && (
          <div className="space-y-3">
            {/* Header section */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-[18px]">🛡️</span>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] uppercase tracking-widest"
                style={{ color: "var(--app-text2)" }}>
                {L("Waspada Tanggal Tua", "Proactive Guardian")}
              </p>
              <div className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${guardian.isProtectionMode ? "bg-[rgba(239,68,68,0.15)] text-[#ef4444]" : "bg-[rgba(78,222,163,0.12)] text-[#4edea3]"}`}>
                {guardian.isProtectionMode ? L("⚠ PROTEKSI AKTIF", "⚠ PROTECTION ON") : L("✓ AMAN", "✓ SAFE")}
              </div>
            </div>

            {/* Warning banner — hanya muncul jika protection mode */}
            {guardian.isProtectionMode && guardian.warningMessage && (
              <div className="rounded-[18px] p-4 border border-[rgba(239,68,68,0.3)]"
                style={{ background: "linear-gradient(135deg,rgba(239,68,68,0.12),rgba(185,28,28,0.08))" }}>
                <div className="flex items-start gap-3">
                  <span className="text-[22px] shrink-0">🚨</span>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-black text-[13px] text-[#ef4444] mb-1">
                      {L("Peringatan Keuangan", "Financial Warning")}
                    </p>
                    <p className="font-['Inter'] text-[12px] leading-relaxed" style={{ color: "var(--app-text2)" }}>
                      {lang === "en" ? guardian.warningMessageEn : guardian.warningMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Soft warning — saldo aman tapi mendekati habis */}
            {!guardian.isProtectionMode && guardian.daysUntilZero !== null && guardian.daysUntilZero <= 14 && guardian.daysUntilZero > 0 && (
              <div className="rounded-[18px] p-4 border border-[rgba(251,191,36,0.25)]"
                style={{ backgroundColor: "rgba(251,191,36,0.07)" }}>
                <div className="flex items-start gap-3">
                  <span className="text-[20px] shrink-0">⚡</span>
                  <p className="font-['Inter'] text-[12px] leading-relaxed" style={{ color: "var(--app-text2)" }}>
                    {lang === "en"
                      ? guardian.warningMessageEn ?? `Balance predicted to last ${guardian.daysUntilZero} more days.`
                      : guardian.warningMessage ?? `Saldo diprediksi bertahan ${guardian.daysUntilZero} hari lagi.`}
                  </p>
                </div>
              </div>
            )}

            {/* Proyeksi saldo card */}
            <div className="rounded-[20px] p-5 border space-y-4"
              style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                📊 {L("Proyeksi Saldo", "Balance Projection")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[14px] p-3" style={{ backgroundColor: "var(--app-card2)" }}>
                  <p className="font-['Inter'] text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--app-text2)" }}>
                    {L("Saldo Saat Ini", "Current Balance")}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]"
                    style={{ color: guardian.currentBalance >= 0 ? "#4edea3" : "#ef4444" }}>
                    {formatRupiah(guardian.currentBalance)}
                  </p>
                </div>
                <div className="rounded-[14px] p-3" style={{ backgroundColor: "var(--app-card2)" }}>
                  <p className="font-['Inter'] text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--app-text2)" }}>
                    {L("Saldo Habis Dalam", "Balance Lasts")}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]"
                    style={{ color: (guardian.daysUntilZero ?? 99) <= 7 ? "#ef4444" : (guardian.daysUntilZero ?? 99) <= 14 ? "#fbbf24" : "#4edea3" }}>
                    {guardian.daysUntilZero !== null
                      ? `~${guardian.daysUntilZero} ${L("hari", "days")}`
                      : L("Aman", "Safe")}
                  </p>
                </div>
                <div className="rounded-[14px] p-3" style={{ backgroundColor: "var(--app-card2)" }}>
                  <p className="font-['Inter'] text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--app-text2)" }}>
                    {L("Estimasi Pemasukan", "Next Income Est.")}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                    {guardian.nextIncomeEstimate
                      ? guardian.nextIncomeEstimate.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short" })
                      : "—"}
                  </p>
                </div>
                <div className="rounded-[14px] p-3" style={{ backgroundColor: "var(--app-card2)" }}>
                  <p className="font-['Inter'] text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--app-text2)" }}>
                    {L("Pengeluaran/Hari", "Spending/Day")}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                    {guardian.categoryBreakdown.length > 0
                      ? formatRupiah(guardian.categoryBreakdown.reduce((s, c) => s + c.wmaPerDay, 0))
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown kategori terboros */}
            {guardian.categoryBreakdown.length > 0 && (
              <div className="rounded-[20px] p-5 border space-y-3"
                style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                  🔥 {L("Kategori Terboros (7 Hari)", "Top Spending Categories (7 Days)")}
                </p>
                <div className="space-y-2.5">
                  {guardian.categoryBreakdown.slice(0, 5).map((cat, i) => {
                    const maxWMA = guardian.categoryBreakdown[0].wmaPerDay;
                    const barPct = maxWMA > 0 ? (cat.wmaPerDay / maxWMA) * 100 : 0;
                    const isTop = i === 0;
                    return (
                      <div key={cat.category}
                        className={`rounded-[14px] p-3 ${isTop && guardian.isProtectionMode ? "border border-[rgba(239,68,68,0.3)]" : ""}`}
                        style={{
                          backgroundColor: isTop && guardian.isProtectionMode
                            ? "rgba(239,68,68,0.08)"
                            : "var(--app-card2)",
                          filter: isTop && guardian.isProtectionMode ? "none" : "none",
                        }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {isTop && guardian.isProtectionMode && (
                              <span className="text-[12px]">⚠️</span>
                            )}
                            <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]"
                              style={{ color: isTop && guardian.isProtectionMode ? "#ef4444" : "var(--app-text)" }}>
                              {cat.category}
                            </span>
                          </div>
                          <span className="font-['Inter'] font-bold text-[11px]" style={{ color: "var(--app-text2)" }}>
                            ~{formatRupiah(cat.wmaPerDay)}/{L("hari", "day")}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${barPct}%`,
                              background: isTop && guardian.isProtectionMode
                                ? "linear-gradient(90deg,#ef4444,#fca5a5)"
                                : i === 1 ? "linear-gradient(90deg,#fbbf24,#f59e0b)"
                                : "linear-gradient(90deg,#4edea3,#04b4a2)",
                            }} />
                        </div>
                        <p className="font-['Inter'] text-[10px] mt-1" style={{ color: "var(--app-text2)" }}>
                          {cat.transactionCount} {L("transaksi", "transactions")} · {L("total", "total")} {formatRupiah(cat.totalLast7Days)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}