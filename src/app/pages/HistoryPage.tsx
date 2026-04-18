import { useState, useEffect, useMemo } from "react";
import { getTransactions, deleteTransaction, getCategories, formatNumber, formatRupiah, getBankTransactions, getBankAccounts, type Transaction, type BankTransaction } from "../store/database";
import { useLang, t } from "../i18n";
import ConfirmDialog from "../components/ConfirmDialog";
import { crudDeleteSuccess } from "../lib/notify";

export default function HistoryPage() {
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const findRelatedBankTx = (txId: string): BankTransaction | null => {
    try {
      const all = getBankTransactions();
      const linked = all.find(b => b.relatedTransactionId === txId);
      return linked ?? null;
    } catch {
      return null;
    }
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | NonNullable<Transaction["paymentSource"]>["type"]>("all");
  const [categoryEmojiMap, setCategoryEmojiMap] = useState<Record<string, string>>({});
  const [showCatPicker, setShowCatPicker] = useState(false);
  const selectedCatEmoji = categoryFilter !== "all" ? (categoryEmojiMap[categoryFilter] ?? "") : "";

  useEffect(() => {
    const refresh = () => {
      setTransactions(getTransactions());
      const map: Record<string, string> = {};
      getCategories().forEach(c => { map[c.name] = c.emoji; });
      setCategoryEmojiMap(map);
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("luminary_data_change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Semua kategori yang pernah dipakai
  const allCategories = useMemo(() => {
    return [...new Set(transactions.map(t => t.category))].sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchType = typeFilter === "all" || tx.type === typeFilter;
      const matchCat = categoryFilter === "all" || tx.category === categoryFilter;
      const matchSource = (() => {
        if (sourceFilter === "all") return true;

        // Fund-based filters (based on what user sees in History)
        if (sourceFilter === "emergency_fund") return tx.category === "Dana Darurat";
        if (sourceFilter === "locked_saving") return tx.category === "Tabungan";
        if (sourceFilter === "debt") return tx.category === "Hutang" || tx.category === "Piutang";
        if (sourceFilter === "asset") return tx.category === "Aset";

        // Payment source filters (cash/bank)
        return (tx.paymentSource?.type ?? "cash") === sourceFilter;
      })();
      const matchSearch = searchQuery === "" ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.notes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchCat && matchSource && matchSearch;
    });
  }, [transactions, typeFilter, categoryFilter, sourceFilter, searchQuery]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {
      cash: 0,
      bank: 0,
      emergency_fund: 0,
      locked_saving: 0,
      debt: 0,
      asset: 0,
    };
    transactions.forEach(tx => {
      const ps = tx.paymentSource?.type ?? "cash";
      if (ps === "cash") counts.cash += 1;
      if (ps === "bank") counts.bank += 1;
      if (tx.category === "Dana Darurat") counts.emergency_fund += 1;
      if (tx.category === "Tabungan") counts.locked_saving += 1;
      if (tx.category === "Hutang" || tx.category === "Piutang") counts.debt += 1;
      if (tx.category === "Aset") counts.asset += 1;
    });
    return counts;
  }, [transactions]);

  const totalIncome  = useMemo(() => filtered.filter(tx => tx.type === "income").reduce((s, tx) => s + tx.amount, 0), [filtered]);
  const totalExpense = useMemo(() => filtered.filter(tx => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0), [filtered]);
  const netBalance   = totalIncome - totalExpense;

  // Group by date
  const grouped = useMemo(() => {
    const g: Record<string, Transaction[]> = {};
    filtered.forEach(tx => {
      const locale = lang === "en" ? "en-US" : "id-ID";
      const key = new Date(tx.date).toLocaleDateString(locale, {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
      if (!g[key]) g[key] = [];
      g[key].push(tx);
    });
    return g;
  }, [filtered, lang]);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const confirmDelete = (id: string) => setPendingDeleteId(id);
  const handleDelete = () => {
    if (!pendingDeleteId) return;
    deleteTransaction(pendingDeleteId);
    void crudDeleteSuccess();
    setPendingDeleteId(null);
    setSelectedTx(null);
  };

  return (
    <div className="w-full min-h-screen flex justify-center pb-32"
      style={{ backgroundColor: "var(--app-bg)" }}>
      {pendingDeleteId && (
        <ConfirmDialog
          title={L("Hapus Transaksi?", "Delete Transaction?")}
          message={L("Transaksi ini akan dihapus permanen.", "This transaction will be permanently deleted.")}
          confirmLabel={L("Hapus", "Delete")}
          cancelLabel={L("Batal", "Cancel")}
          onConfirm={handleDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
      <div className="w-full max-w-[390px] px-5 pt-14 space-y-4">

        <h1 id="tour-history-header" className="font-['Plus_Jakarta_Sans'] font-bold text-[18px]"
          style={{ color: "var(--app-text)" }}>{t("transactionHistory", lang)}</h1>

        {/* Summary Boxes */}
        {(() => {
          const threshold = 1_000_000;
          const isVertical = totalIncome >= threshold || totalExpense >= threshold || Math.abs(netBalance) >= threshold;
          
          return (
            <div id="tour-history-summary" className={`${isVertical ? "flex flex-col space-y-3" : "grid grid-cols-3 gap-2"}`}>
              <div className={`bg-[rgba(78,222,163,0.08)] rounded-[16px] p-3 ${isVertical ? "text-left px-5 py-4" : "text-center"}`}>
                <p className="text-[9px] font-bold text-[#64748b] uppercase mb-1">{L("Uang Masuk", "Total Income")}</p>
                <p className={`font-['Plus_Jakarta_Sans'] font-black ${isVertical ? "text-[20px]" : "text-[13px]"} text-[#4edea3]`}>
                  +Rp{formatNumber(totalIncome)}
                </p>
              </div>
              <div className={`bg-[rgba(255,180,171,0.06)] rounded-[16px] p-3 ${isVertical ? "text-left px-5 py-4" : "text-center"}`}>
                <p className="text-[9px] font-bold text-[#64748b] uppercase mb-1">{L("Uang Keluar", "Total Expense")}</p>
                <p className={`font-['Plus_Jakarta_Sans'] font-black ${isVertical ? "text-[20px]" : "text-[13px]"} text-[#ffb4ab]`}>
                  -Rp{formatNumber(totalExpense)}
                </p>
              </div>
              <div className={`rounded-[16px] p-3 ${isVertical ? "text-left px-5 py-4" : "text-center"} ${netBalance >= 0 ? 'bg-[rgba(78,222,163,0.05)]' : 'bg-[rgba(255,107,107,0.06)]'}`}>
                <p className="text-[9px] font-bold text-[#64748b] uppercase mb-1">{L("Selisih", "Net Balance")}</p>
                <p className={`font-['Plus_Jakarta_Sans'] font-black ${isVertical ? "text-[20px]" : "text-[13px]"} ${netBalance >= 0 ? 'text-[#4edea3]' : 'text-[#ff6b6b]'}`}>
                  {netBalance >= 0 ? "+" : ""}Rp{formatNumber(netBalance)}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Search */}
        <div className="rounded-[14px] border flex items-center gap-2 px-4"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder", lang)}
            className="flex-1 bg-transparent py-3 text-[14px] outline-none"
            style={{ color: "var(--app-text)" }} />
        </div>

        {/* Filter Row: Tipe + Kategori */}
        <div className="flex gap-2 items-center">
          {/* Tipe filter */}
          <div className="flex gap-1.5 flex-1">
            {(["all", "income", "expense"] as const).map(f => {
              const active = typeFilter === f;
              return (
                <button key={f} onClick={() => setTypeFilter(f)}
                  title={f === "all" ? L("Semua", "All") : f === "income" ? L("Masuk", "Income") : L("Keluar", "Expense")}
                  aria-label={f === "all" ? L("Semua", "All") : f === "income" ? L("Masuk", "Income") : L("Keluar", "Expense")}
                  className="flex-1 py-2 rounded-full font-semibold text-[12px] transition-all flex items-center justify-center"
                  style={{
                    backgroundColor: active
                      ? (f === "expense" ? "rgba(255,180,171,0.12)" : f === "income" ? "rgba(78,222,163,0.12)" : "rgba(255,255,255,0.08)")
                      : "var(--app-card)",
                    color: active
                      ? (f === "expense" ? "#ffb4ab" : f === "income" ? "#4edea3" : "var(--app-text)")
                      : "var(--app-text2)",
                    border: active
                      ? `1px solid ${f === "expense" ? "rgba(255,180,171,0.3)" : f === "income" ? "rgba(78,222,163,0.3)" : "rgba(255,255,255,0.15)"}`
                      : "1px solid var(--app-border)",
                  }}>
                  <span aria-hidden="true">
                    {f === "all" ? "🌐" : f === "income" ? "⬆️" : "⬇️"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sumber dana filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value as any)}
            className="h-[38px] px-3 rounded-full text-[11px] font-bold outline-none border shrink-0"
            style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)", color: "var(--app-text2)" }}
          >
            <option value="all">{L("Semua", "All")}</option>
            {(sourceCounts.cash > 0 || sourceCounts.bank > 0) && (
              <optgroup label={L("Metode Pembayaran", "Payment Method")}>
                {sourceCounts.cash > 0 && <option value="cash">💵 {L("Cash", "Cash")}</option>}
                {sourceCounts.bank > 0 && <option value="bank">🏦 {L("Bank", "Bank")}</option>}
              </optgroup>
            )}
            {(sourceCounts.emergency_fund > 0 || sourceCounts.locked_saving > 0 || sourceCounts.debt > 0 || sourceCounts.asset > 0) && (
              <optgroup label={L("Kategori Dana / Fitur", "Fund Category / Feature")}>
                {sourceCounts.emergency_fund > 0 && <option value="emergency_fund">🚨 {L("Dana Darurat", "Emergency Fund")}</option>}
                {sourceCounts.locked_saving > 0 && <option value="locked_saving">🎯 {L("Tabungan", "Savings")}</option>}
                {sourceCounts.debt > 0 && <option value="debt">🧾 {L("Hutang/Piutang", "Debt/Loan")}</option>}
                {sourceCounts.asset > 0 && <option value="asset">🏷️ {L("Aset", "Assets")}</option>}
              </optgroup>
            )}
          </select>

          {/* Kategori filter button */}
          <button onClick={() => setShowCatPicker(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all shrink-0"
            style={{
              backgroundColor: categoryFilter !== "all" ? "rgba(96,165,250,0.12)" : "var(--app-card)",
              color: categoryFilter !== "all" ? "#60a5fa" : "var(--app-text2)",
              border: categoryFilter !== "all" ? "1px solid rgba(96,165,250,0.3)" : "1px solid var(--app-border)",
            }}>
            {selectedCatEmoji && <span>{selectedCatEmoji}</span>}
            <span>{categoryFilter === "all" ? L("Kategori", "Category") : categoryFilter}</span>
            <svg className={`w-3 h-3 transition-transform ${showCatPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Category Picker Dropdown */}
        {showCatPicker && (
          <div className="rounded-[16px] p-3 border space-y-1 animate-in slide-in-from-top-2 duration-200"
            style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
            <button
              onClick={() => { setCategoryFilter("all"); setShowCatPicker(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${categoryFilter === "all" ? "bg-[rgba(255,255,255,0.08)] text-white" : "text-[#64748b]"}`}>
              <span>🌐</span> {L("Semua Kategori", "All Categories")}
            </button>
            {allCategories.map(cat => (
              <button key={cat}
                onClick={() => { setCategoryFilter(cat); setShowCatPicker(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${categoryFilter === cat ? "bg-[rgba(96,165,250,0.1)] text-[#60a5fa]" : "text-[#94a3b8]"}`}>
                <span>{categoryEmojiMap[cat] ?? "💳"}</span>
                <span className="flex-1 text-left">{cat}</span>
                {categoryFilter === cat && <span className="text-[10px]">✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Active filter badge */}
        {categoryFilter !== "all" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#64748b]">{L("Filter:", "Filter:")}</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(96,165,250,0.1)] border border-[rgba(96,165,250,0.2)]">
              <span className="text-[13px]">{categoryEmojiMap[categoryFilter] ?? "💳"}</span>
              <span className="text-[11px] font-bold text-[#60a5fa]">{categoryFilter}</span>
              <button onClick={() => setCategoryFilter("all")} className="text-[#60a5fa] ml-1 text-[14px] leading-none">×</button>
            </div>
          </div>
        )}

        {/* Transaction List */}
        {Object.keys(grouped).length === 0 ? (
          <div className="rounded-[20px] p-8 text-center mt-4" style={{ backgroundColor: "var(--app-card)" }}>
            <span className="text-[36px] block mb-3">📝</span>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] mb-1" style={{ color: "var(--app-text)" }}>
              {t("noTransactionsFound", lang)}
            </p>
            <p className="text-[12px]" style={{ color: "var(--app-text2)" }}>{t("addFromHome", lang)}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, txs]) => {
            const dayIn  = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
            const dayOut = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
            return (
              <div key={dateLabel}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.5px]" style={{ color: "var(--app-text2)" }}>
                    {dateLabel}
                  </p>
                  <div className="flex gap-2 text-[10px] font-bold">
                    {dayIn > 0  && <span className="text-[#4edea3]">+Rp{formatNumber(dayIn)}</span>}
                    {dayOut > 0 && <span className="text-[#ffb4ab]">-Rp{formatNumber(dayOut)}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  {txs.map(tx => (
                    <div key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="rounded-[16px] p-4 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                      style={{ backgroundColor: "var(--app-card)" }}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="size-[40px] rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "var(--app-card2)" }}>
                          <span className="text-[18px]">{categoryEmojiMap[tx.category] || "💳"}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
                            {tx.category}
                          </p>
                          <p className="text-[11px] truncate" style={{ color: "var(--app-text2)" }}>
                            {new Date(tx.date).toLocaleTimeString(lang === "en" ? "en-US" : "id-ID", { hour: "2-digit", minute: "2-digit" })}
                            {tx.notes ? ` · ${tx.notes}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className={`font-['Plus_Jakarta_Sans'] font-bold text-[14px] ${tx.type === "income" ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                          {tx.type === "income" ? "+" : "-"}Rp{formatNumber(tx.amount)}
                        </p>
                        <button onClick={e => { e.stopPropagation(); confirmDelete(tx.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-[rgba(255,180,171,0.1)] rounded-full p-1.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#ffb4ab" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {filtered.length > 0 && (
          <p className="text-center text-[11px] pb-4" style={{ color: "var(--app-text2)" }}>
            {filtered.length} {t("transactions", lang)}
          </p>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedTx(null)}>
          <div
            className="w-full max-w-[400px] mb-4 rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
            style={{ backgroundColor: "var(--app-card)" }}
            onClick={e => e.stopPropagation()}>
            {/*
              Bank metadata (admin fee, transfer details, receipt image) lives in BankTransaction.
              We link it via relatedTransactionId.
            */}
            {(() => {
              const bankMeta = findRelatedBankTx(selectedTx.id);
              const bankAcc = bankMeta ? getBankAccounts().find(a => a.id === bankMeta.bankAccountId) : null;
              const toAcc = bankMeta?.transferToAccountId ? getBankAccounts().find(a => a.id === bankMeta.transferToAccountId) : null;
              return (
                <>

            {/* Hero section */}
            <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center overflow-hidden"
              style={{
                background: selectedTx.type === "income"
                  ? "linear-gradient(160deg,rgba(78,222,163,0.18) 0%,transparent 70%)"
                  : "linear-gradient(160deg,rgba(255,180,171,0.18) 0%,transparent 70%)",
              }}>
              {/* Glow blob */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 size-40 rounded-full blur-[60px] pointer-events-none"
                style={{ backgroundColor: selectedTx.type === "income" ? "rgba(78,222,163,0.2)" : "rgba(255,180,171,0.2)" }} />

              {/* Close pill */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />

              {/* Category icon */}
              <div className="relative size-[72px] rounded-[22px] flex items-center justify-center mb-4 shadow-lg"
                style={{
                  backgroundColor: selectedTx.type === "income" ? "rgba(78,222,163,0.15)" : "rgba(255,180,171,0.15)",
                  border: `1.5px solid ${selectedTx.type === "income" ? "rgba(78,222,163,0.3)" : "rgba(255,180,171,0.3)"}`,
                }}>
                <span className="text-[36px]">{categoryEmojiMap[selectedTx.category] || "💳"}</span>
              </div>

              {/* Type badge */}
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
                style={{
                  backgroundColor: selectedTx.type === "income" ? "rgba(78,222,163,0.15)" : "rgba(255,180,171,0.15)",
                  color: selectedTx.type === "income" ? "#4edea3" : "#ffb4ab",
                }}>
                {selectedTx.type === "income" ? L("Pemasukan", "Income") : L("Pengeluaran", "Expense")}
              </span>

              {/* Amount */}
              <p className="font-['Plus_Jakarta_Sans'] font-black text-[38px] leading-none tracking-tight"
                style={{ color: selectedTx.type === "income" ? "#4edea3" : "#ffb4ab" }}>
                {selectedTx.type === "income" ? "+" : "-"}{formatRupiah(selectedTx.amount)}
              </p>
            </div>

            {/* Detail rows */}
            <div className="px-6 pb-2 space-y-1" style={{ borderTop: "1px solid var(--app-border)" }}>
              {/* Payment Source */}
              <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L("Sumber Dana", "Payment Source")}
                </span>
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-right max-w-[220px]"
                  style={{ color: "var(--app-text)" }}>
                  {selectedTx.paymentSource
                    ? `${selectedTx.paymentSource.type === "cash" ? "💵" :
                      selectedTx.paymentSource.type === "bank" ? "🏦" :
                      selectedTx.paymentSource.type === "debt" ? "🧾" :
                      selectedTx.paymentSource.type === "asset" ? "📦" :
                      selectedTx.paymentSource.type === "emergency_fund" ? "🚨" :
                      selectedTx.paymentSource.type === "locked_saving" ? "🎯" :
                      "💳"} ${selectedTx.paymentSource.label ?? selectedTx.paymentSource.type}`
                    : L("Tidak diketahui", "Unknown")}
                </span>
              </div>

              {/* Bank fee */}
              {bankMeta && bankMeta.adminFee > 0 && (
                <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                  <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                    {L("Biaya Admin", "Admin Fee")}
                  </span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "#fbbf24" }}>
                    {formatRupiah(bankMeta.adminFee)}
                  </span>
                </div>
              )}

              {/* Transfer details */}
              {bankMeta && (bankMeta.type === "transfer_out" || bankMeta.transferToName || bankMeta.transferToAccountId) && (
                <div className="py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                  <p className="font-['Inter'] text-[12px] mb-2" style={{ color: "var(--app-text2)" }}>
                    {L("Detail Transfer", "Transfer Details")}
                  </p>
                  <div className="rounded-[14px] p-3 space-y-1.5"
                    style={{ backgroundColor: "var(--app-card2)", border: "1px solid var(--app-border)" }}>
                    <p className="text-[12px] font-bold" style={{ color: "var(--app-text)" }}>
                      {bankAcc ? `🏦 ${bankAcc.bankName}` : "🏦 Bank"}
                      {" "}→{" "}
                      {toAcc ? `🏦 ${toAcc.bankName}` : bankMeta.transferToBank ? `🏦 ${bankMeta.transferToBank}` : L("Tujuan", "Destination")}
                    </p>
                    {(bankMeta.transferToName || bankMeta.transferToNumber) && (
                      <p className="text-[11px]" style={{ color: "var(--app-text2)" }}>
                        {(bankMeta.transferToName ?? "").trim()}
                        {bankMeta.transferToNumber ? ` · ${bankMeta.transferToNumber}` : ""}
                      </p>
                    )}
                    {bankMeta.adminFee > 0 && (
                      <p className="text-[11px]" style={{ color: "var(--app-text2)" }}>
                        {L("Admin", "Fee")}: {formatRupiah(bankMeta.adminFee)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L("Kategori", "Category")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">{categoryEmojiMap[selectedTx.category] || "💳"}</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
                    {selectedTx.category}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L("Tanggal", "Date")}
                </span>
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                  {new Date(selectedTx.date).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
                    weekday: "short", day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L("Waktu", "Time")}
                </span>
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                  {new Date(selectedTx.date).toLocaleTimeString(lang === "en" ? "en-US" : "id-ID", {
                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                  })}
                </span>
              </div>

              {/* Notes */}
              <div className="flex items-start justify-between py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                <span className="font-['Inter'] text-[12px] shrink-0" style={{ color: "var(--app-text2)" }}>
                  {L("Catatan", "Notes")}
                </span>
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-right max-w-[200px]"
                  style={{ color: selectedTx.notes ? "var(--app-text)" : "var(--app-text2)" }}>
                  {selectedTx.notes || L("Tidak ada catatan", "No notes")}
                </span>
              </div>

              {/* Receipt / Proof */}
              {(selectedTx.receipt?.imageDataUrl || selectedTx.receipt?.rawCode || bankMeta?.receiptImageUrl) && (
                <div className="py-3.5" style={{ borderBottom: "1px solid var(--app-border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                      {L("Bukti / Struk", "Receipt / Proof")}
                    </span>
                    {selectedTx.receipt?.codeType && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--app-text2)" }}>
                        {selectedTx.receipt.codeType}
                      </span>
                    )}
                  </div>
                  {selectedTx.receipt?.rawCode && (
                    <div className="text-[11px] font-mono rounded-[12px] p-3 mb-2"
                      style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)", border: "1px solid var(--app-border)" }}>
                      {selectedTx.receipt.rawCode}
                    </div>
                  )}
                  {(selectedTx.receipt?.imageDataUrl || bankMeta?.receiptImageUrl) && (
                    <img
                      src={selectedTx.receipt?.imageDataUrl ?? bankMeta?.receiptImageUrl}
                      alt="receipt"
                      className="w-full rounded-[16px] object-cover max-h-[220px] border"
                      style={{ borderColor: "var(--app-border)" }}
                    />
                  )}
                </div>
              )}

              {/* Transaction ID */}
              <div className="flex items-center justify-between py-3.5">
                <span className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L("ID Transaksi", "Transaction ID")}
                </span>
                <span className="font-['Inter'] text-[11px] font-mono" style={{ color: "var(--app-text2)" }}>
                  #{selectedTx.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

                </>
              );
            })()}
            {/* Actions */}
            <div className="px-6 pb-6 pt-3 flex gap-3">
              <button
                onClick={() => { setSelectedTx(null); confirmDelete(selectedTx.id); }}
                className="flex-1 h-[48px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] flex items-center justify-center gap-2 border border-[rgba(255,100,100,0.25)] text-[#ffb4ab] active:scale-95 transition-all"
                style={{ backgroundColor: "rgba(255,100,100,0.08)" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {L("Hapus", "Delete")}
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 h-[48px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-[#003824] active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
                {L("Tutup", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
