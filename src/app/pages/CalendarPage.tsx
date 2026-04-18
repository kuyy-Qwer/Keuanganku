import { useNavigate } from "react-router";
import { useState, useMemo, useEffect } from "react";
import { getTransactions, getCategories, formatRupiah, trackPageVisit, type Transaction } from "../store/database";
import { useLang } from "../i18n";

type FilterType = "all" | "income" | "expense";

const COLORS = ["#4edea3", "#60a5fa", "#fbbf24", "#f87171", "#c084fc", "#94a3b8", "#fb923c", "#34d399"];

export default function CalendarPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryEmojiMap, setCategoryEmojiMap] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<ReturnType<typeof getCategories>>([]);

  useEffect(() => {
    trackPageVisit("calendar");
    const refresh = () => {
      setTransactions(getTransactions());
      const cats = getCategories();
      setCategories(cats);
      const map: Record<string, string> = {};
      cats.forEach(c => { map[c.name] = c.emoji; });
      setCategoryEmojiMap(map);
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  // Transactions for current month filtered
  const monthTxs = useMemo(() => {
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) return false;
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (filterCategory !== "all" && tx.category !== filterCategory) return false;
      return true;
    });
  }, [transactions, viewYear, viewMonth, filterType, filterCategory]);

  // Map day -> transactions
  const dayMap = useMemo(() => {
    const map: Record<number, Transaction[]> = {};
    monthTxs.forEach(tx => {
      const day = new Date(tx.date).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(tx);
    });
    return map;
  }, [monthTxs]);

  // Monthly stats
  const stats = useMemo(() => {
    const income = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const catTotals: Record<string, number> = {};
    monthTxs.filter(t => t.type === "expense").forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const topCat = sortedCats[0] ?? null;

    // Active days (days with transactions)
    const activeDays = new Set(monthTxs.map(t => new Date(t.date).getDate())).size;

    // Avg per active day
    const avgPerDay = activeDays > 0 ? expense / activeDays : 0;

    // Biggest single day expense
    const dayExpense: Record<number, number> = {};
    monthTxs.filter(t => t.type === "expense").forEach(t => {
      const d = new Date(t.date).getDate();
      dayExpense[d] = (dayExpense[d] || 0) + t.amount;
    });
    const maxDayEntry = Object.entries(dayExpense).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

    return {
      income, expense, net: income - expense,
      count: monthTxs.length,
      activeDays,
      avgPerDay,
      topCat,
      sortedCats,
      maxDayEntry: maxDayEntry ? { day: Number(maxDayEntry[0]), amount: Number(maxDayEntry[1]) } : null,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
    };
  }, [monthTxs]);

  // Calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const monthNames = lang === "en"
    ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    : ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const dayNames = lang === "en"
    ? ["Su","Mo","Tu","We","Th","Fr","Sa"]
    : ["Mi","Se","Se","Ra","Ka","Ju","Sa"];

  const selectedTxs = selectedDay ? (dayMap[selectedDay] ?? []) : [];

  return (
    <div className="w-full min-h-screen flex justify-center pb-32" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/app")} className="p-2 rounded-full transition-colors"
            style={{ backgroundColor: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[20px] flex-1"
            style={{ color: "var(--app-text)" }}>{L("Kalender Keuangan", "Financial Calendar")}</h1>
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-[24px] border space-y-3"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="flex gap-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value as FilterType)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border"
              style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
              <option value="all">{L("Semua", "All Types")}</option>
              <option value="expense">{L("Pengeluaran", "Expense")}</option>
              <option value="income">{L("Pemasukan", "Income")}</option>
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border"
              style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
              <option value="all">{L("Semua Kategori", "All Categories")}</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-between px-1">
          <button onClick={prevMonth} className="p-2 rounded-full"
            style={{ backgroundColor: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--app-text2)">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]"
            style={{ color: "var(--app-text)" }}>
            {monthNames[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-full"
            style={{ backgroundColor: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--app-text2)">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-[24px] border overflow-hidden"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--app-border)" }}>
            {dayNames.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-wider"
                style={{ color: "var(--app-text2)" }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - firstDow + 1;
              const isValid = dayNum >= 1 && dayNum <= daysInMonth;
              const txsForDay = isValid ? (dayMap[dayNum] ?? []) : [];
              const hasIncome = txsForDay.some(t => t.type === "income");
              const hasExpense = txsForDay.some(t => t.type === "expense");
              const isToday = isValid && dayNum === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
              const isSelected = isValid && dayNum === selectedDay;
              const dayTotal = txsForDay.reduce((s, t) => t.type === "income" ? s + t.amount : s - t.amount, 0);

              return (
                <button key={i}
                  onClick={() => isValid && setSelectedDay(dayNum === selectedDay ? null : dayNum)}
                  disabled={!isValid}
                  className="relative flex flex-col items-center py-2 px-1 min-h-[52px] transition-colors"
                  style={{
                    backgroundColor: isSelected ? "var(--app-accent, #4edea3)22" : "transparent",
                    borderBottom: "1px solid var(--app-border)",
                    borderRight: (i + 1) % 7 !== 0 ? "1px solid var(--app-border)" : "none",
                  }}>
                  {isValid && (
                    <>
                      <span className={`text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full
                        ${isToday ? "bg-[#4edea3] text-black" : ""}`}
                        style={{ color: isToday ? "black" : isSelected ? "#4edea3" : "var(--app-text)" }}>
                        {dayNum}
                      </span>
                      {txsForDay.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasIncome && <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />}
                          {hasExpense && <div className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />}
                        </div>
                      )}
                      {txsForDay.length > 0 && (
                        <span className={`text-[8px] font-black mt-0.5 ${dayTotal >= 0 ? "text-[#4edea3]" : "text-[#f87171]"}`}>
                          {dayTotal >= 0 ? "+" : ""}{Math.abs(dayTotal) >= 1000000
                            ? `${(dayTotal / 1000000).toFixed(1)}jt`
                            : Math.abs(dayTotal) >= 1000
                            ? `${(dayTotal / 1000).toFixed(0)}rb`
                            : String(dayTotal)}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail */}
        {selectedDay && (
          <div className="rounded-[24px] border p-4 space-y-3"
            style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
            <p className="text-[12px] font-black uppercase tracking-widest" style={{ color: "var(--app-text2)" }}>
              {selectedDay} {monthNames[viewMonth]} {viewYear}
            </p>
            {selectedTxs.length === 0 ? (
              <p className="text-[13px] text-center py-4 opacity-50" style={{ color: "var(--app-text)" }}>
                {L("Tidak ada transaksi", "No transactions")}
              </p>
            ) : (
              <div className="space-y-2">
                {selectedTxs.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-[16px]"
                    style={{ backgroundColor: "var(--app-card2)" }}>
                    <span className="text-[20px]">{categoryEmojiMap[tx.category] ?? "💰"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color: "var(--app-text)" }}>{tx.category}</p>
                      {tx.notes && <p className="text-[11px] truncate" style={{ color: "var(--app-text2)" }}>{tx.notes}</p>}
                    </div>
                    <p className={`text-[13px] font-black ${tx.type === "income" ? "text-[#4edea3]" : "text-[#f87171]"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Monthly Statistics */}
        <div className="space-y-3">
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] uppercase tracking-widest px-1"
            style={{ color: "var(--app-text2)" }}>
            {L("Statistik Bulan Ini", "Monthly Statistics")}
          </h3>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-[20px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Pemasukan", "Income")}</p>
              <p className="text-[15px] font-black text-[#4edea3]">{formatRupiah(stats.income)}</p>
            </div>
            <div className="p-4 rounded-[20px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Pengeluaran", "Expense")}</p>
              <p className="text-[15px] font-black text-[#f87171]">{formatRupiah(stats.expense)}</p>
            </div>
            <div className="p-4 rounded-[20px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Saldo Bersih", "Net")}</p>
              <p className={`text-[15px] font-black ${stats.net >= 0 ? "text-[#4edea3]" : "text-[#f87171]"}`}>{formatRupiah(stats.net)}</p>
            </div>
            <div className="p-4 rounded-[20px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Transaksi", "Transactions")}</p>
              <p className="text-[15px] font-black" style={{ color: "var(--app-text)" }}>{stats.count}</p>
            </div>
            <div className="p-4 rounded-[20px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Hari Aktif", "Active Days")}</p>
              <p className="text-[15px] font-black" style={{ color: "var(--app-text)" }}>{stats.activeDays}</p>
            </div>
            <div className="p-4 rounded-[20px] border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="text-[10px] font-bold uppercase" style={{ color: "var(--app-text2)" }}>{L("Tingkat Hemat", "Savings Rate")}</p>
              <p className={`text-[15px] font-black ${stats.savingsRate >= 0 ? "text-[#4edea3]" : "text-[#f87171]"}`}>
                {stats.savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Avg per active day & busiest day */}
          {stats.activeDays > 0 && (
            <div className="p-4 rounded-[20px] border space-y-2"
              style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <div className="flex justify-between">
                <p className="text-[11px] font-bold" style={{ color: "var(--app-text2)" }}>
                  {L("Rata-rata pengeluaran/hari aktif", "Avg expense per active day")}
                </p>
                <p className="text-[11px] font-black text-[#f87171]">{formatRupiah(stats.avgPerDay)}</p>
              </div>
              {stats.maxDayEntry && (
                <div className="flex justify-between">
                  <p className="text-[11px] font-bold" style={{ color: "var(--app-text2)" }}>
                    {L("Hari pengeluaran terbesar", "Biggest spending day")}
                  </p>
                  <p className="text-[11px] font-black text-[#f87171]">
                    {L("Tgl", "Day")} {stats.maxDayEntry.day} · {formatRupiah(stats.maxDayEntry.amount)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Category breakdown bar chart */}
          {stats.sortedCats.length > 0 && (
            <div className="p-4 rounded-[24px] border space-y-3"
              style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--app-text2)" }}>
                {L("Distribusi Pengeluaran", "Expense Distribution")}
              </p>
              {stats.sortedCats.map(([cat, total], i) => {
                const pct = stats.expense > 0 ? (total / stats.expense) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px]">{categoryEmojiMap[cat] ?? "💰"}</span>
                        <span className="text-[12px] font-bold" style={{ color: "var(--app-text)" }}>{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold" style={{ color: "var(--app-text2)" }}>{pct.toFixed(0)}%</span>
                        <span className="text-[12px] font-black" style={{ color: "var(--app-text)" }}>{formatRupiah(total)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-card2)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {stats.count === 0 && (
            <div className="py-16 text-center rounded-[28px] border border-dashed opacity-50"
              style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <span className="text-[40px] block mb-2">📅</span>
              <p className="text-[13px]" style={{ color: "var(--app-text)" }}>
                {L("Belum ada transaksi bulan ini", "No transactions this month")}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
