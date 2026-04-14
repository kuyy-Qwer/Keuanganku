import { useState, useEffect, useRef } from "react";
import {
  addTransaction, getCategories, getBalance, formatRupiah, type Category,
  isCategoryOverBudget, getBudgetStatus, predictCashFlow,
  getBankAccounts, addBankTransaction, getTransferContacts, upsertTransferContact,
  type BankAccount, type TransferContact,
  getDebts, addDebtPayment,
  getAssets, getCashWalletBalance, addCashWalletTransaction,
  getBankAvailableBalance,
} from "../../app/store/database";
import { playAlertSound, playIncomeSound, playExpenseSound } from "../../app/lib/sounds";
import { dispatchNotif } from "../../app/lib/notify";
import BarcodeScanner from "../../app/components/BarcodeScanner";

interface TransactionInputProps {
  onClose?: () => void;
}

type InputMode = "transaksi" | "barcode";

export default function TransactionInputWithNotesGoPayInspired({ onClose }: TransactionInputProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [barcodeItems, setBarcodeItems] = useState<{ id: string; name: string; price: number }[]>([]);
  const [protectionStatus, setProtectionStatus] = useState<ReturnType<typeof predictCashFlow> | null>(null);

  // ── Bank & Transfer state ────────────────────────────────────────
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [contacts, setContacts] = useState<TransferContact[]>([]);
  const [paymentSource, setPaymentSource] = useState<"cash" | string>("cash"); // "cash" atau bankAccountId
  const [adminFee, setAdminFee] = useState("");
  const [debtsOptions, setDebtsOptions] = useState<{ id: string; personName: string; remainingAmount: number; type: "debt" | "loan" }[]>([]);
  const [assetsOptions, setAssetsOptions] = useState<{ id: string; name: string; emoji: string; currentValue: number }[]>([]);
  const [cashWalletBal, setCashWalletBal] = useState(0);
  // Transfer fields (muncul jika kategori = Transfer)
  const [transferMode, setTransferMode] = useState<"own_bank" | "other_person">("own_bank");
  const [transferToAccountId, setTransferToAccountId] = useState("");
  const [transferToName, setTransferToName] = useState("");
  const [transferToBank, setTransferToBank] = useState("");
  const [transferToNumber, setTransferToNumber] = useState("");
  const [selectedContact, setSelectedContact] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | undefined>();
  const [belanjaSubMode, setBelanjaSubMode] = useState<"none" | "offline" | "online">("none");
  const [showMarketplace, setShowMarketplace] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const getCategoryEmoji = (catName: string): string => {
    const map: Record<string, string> = {
      "Belanja": "🛍️",
      "Belanja Offline": "🏬",
      "Shopee": "🛒",
      "Tokopedia": "🛍️",
      "TikTok Shop": "🎵",
      "Lazada": "📦",
      "Bukalapak": "🛍️",
      "Blibli": "📳",
      "JD.ID": "📦",
      "Amazon": "📦",
    };
    return map[catName] || "";
  };

  useEffect(() => {
    setProtectionStatus(predictCashFlow());
    const load = () => {
      setBankAccounts(getBankAccounts());
      setContacts(getTransferContacts());
      setDebtsOptions(getDebts().filter(d => !d.isPaid).map(d => ({ id: d.id, personName: d.personName, remainingAmount: d.remainingAmount, type: d.type })));
      setAssetsOptions(getAssets().map(a => ({ id: a.id, name: a.name, emoji: a.emoji, currentValue: a.currentValue })));
      setCashWalletBal(getCashWalletBalance());
    };
    load();
    const handler = () => load();
    window.addEventListener("luminary_data_change", handler);
    return () => window.removeEventListener("luminary_data_change", handler);
  }, []);

  const barcodeSubtotal = barcodeItems.reduce((s, item) => s + item.price, 0);

  const handleBarcodeConfirm = () => {
    if (!selectedCategory) return;
    const validItems = barcodeItems.filter(i => i.name.trim() && i.price > 0);
    if (validItems.length === 0) {
      setError("Tambah minimal 1 item dengan harga");
      return;
    }
    if (barcodeSubtotal < 1000) {
      setError("Nominal minimal Rp 1.000");
      return;
    }
    const tx = addTransaction({
      amount: barcodeSubtotal,
      category: selectedCategory,
      notes: notes + (validItems.length > 1 ? ` (${validItems.length} items scanned)` : ""),
      type: "expense",
      paymentSource: { type: "cash", label: "Cash" },
    });
    // barcode flow default: cash wallet
    addCashWalletTransaction({
      type: "out",
      amount: barcodeSubtotal,
      category: selectedCategory,
      notes: notes + (validItems.length > 1 ? ` (${validItems.length} items scanned)` : ""),
      date: new Date().toISOString(),
      relatedTransactionId: tx.id,
    });
    playExpenseSound();
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose?.(); }, 1200);
  };

  useEffect(() => { setCategories(getCategories()); }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowCatDropdown(false);
    if (showCatDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showCatDropdown]);

  const filteredCats = categories.filter(c => c.type === txType || c.type === "both");
  const searchFilteredCats = categorySearch.trim() 
    ? filteredCats.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
    : filteredCats;

  const handleDigit = (digit: string) => {
    if (waitingForSecond) { setDisplay(digit); setWaitingForSecond(false); }
    else { setDisplay(display === "0" ? digit : display + digit); }
  };
  const handleDot = () => {
    if (waitingForSecond) { setDisplay("0."); setWaitingForSecond(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  };
  const handleOperator = (nextOp: string) => {
    const val = parseFloat(display);
    if (firstOperand === null) { setFirstOperand(val); }
    else if (operator && !waitingForSecond) { const r = calc(firstOperand, val, operator); setDisplay(String(r)); setFirstOperand(r); }
    setOperator(nextOp); setWaitingForSecond(true);
  };
  const calc = (a: number, b: number, op: string) => {
    if (op === "+") return a + b; if (op === "−") return a - b;
    if (op === "×") return a * b; if (op === "÷") return b !== 0 ? a / b : 0; return b;
  };
  const handleEquals = () => {
    if (!operator || firstOperand === null) return;
    const r = calc(firstOperand, parseFloat(display), operator);
    setDisplay(String(parseFloat(r.toFixed(10)))); setFirstOperand(null); setOperator(null); setWaitingForSecond(false);
  };
  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };
  const handleClear = () => { setDisplay("0"); setFirstOperand(null); setOperator(null); setWaitingForSecond(false); };
  const handleCalcPress = (v: string) => {
    if (v === "AC") return handleClear(); if (v === "⌫") return handleBackspace(); if (v === "=") return handleEquals();
    if (["÷","×","−","+"].includes(v)) return handleOperator(v); if (v === ".") return handleDot(); return handleDigit(v);
  };
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const raw = e.target.value.replace(/\./g, ""); 
    setDisplay(raw.replace(/[^0-9.]/g, "") || "0"); 
    setError(null);
  };
  const formatDisplay = () => { const n = parseFloat(display); if (isNaN(n)) return "0"; if (display.endsWith(".")) return display; return n.toLocaleString("id-ID").replace(/,/g, "."); };
  const formatRupiahInput = (val: string) => { const n = parseFloat(val); if (isNaN(n)) return "0"; return n.toLocaleString("id-ID").replace(/,/g, "."); };

  const isTransferCategory = selectedCategory.toLowerCase() === "transfer";
  const sourceBank = bankAccounts.find(a => a.id === paymentSource) ?? null;
  const adminFeeNum = parseInt(adminFee.replace(/\D/g, ""), 10) || 0;
  const isBankSource = paymentSource !== "cash" && !!sourceBank;
  const isDebtSource = paymentSource.startsWith("debt:");
  const isAssetSource = paymentSource.startsWith("asset:");
  const selectedDebtId = isDebtSource ? paymentSource.slice("debt:".length) : "";
  const selectedAssetId = isAssetSource ? paymentSource.slice("asset:".length) : "";

  useEffect(() => {
    if (!isTransferCategory) return;

    // Untuk kategori Transfer, sumber dana harus Bank.
    if (bankAccounts.length === 0) {
      setError("Kategori Transfer membutuhkan minimal 1 rekening bank. Tambahkan rekening bank terlebih dulu.");
      return;
    }
    const isCurrentBank = bankAccounts.some(a => a.id === paymentSource);
    if (!isCurrentBank) {
      setPaymentSource(bankAccounts[0].id);
      setError(null);
    }
  }, [isTransferCategory, bankAccounts, paymentSource]);

  const handleConfirm = () => {
    const amount = parseFloat(display);
    if (!selectedCategory) return;
    
    if (amount < 1000) {
      const msg = "Nominal minimal adalah " + formatRupiah(1000);
      setError(msg);
      playAlertSound();
      dispatchNotif({ type: "alert", title: "Nominal Terlalu Kecil", message: msg, emoji: "⚠️" });
      return;
    }

    if (txType === "expense") {
      // Kategori Transfer hanya boleh menggunakan Bank sebagai sumber dana.
      if (isTransferCategory && !isBankSource) {
        const msg = "Untuk kategori Transfer, sumber dana hanya bisa Bank.";
        setError(msg);
        playAlertSound();
        dispatchNotif({ type: "alert", title: "Sumber Dana Tidak Sesuai", message: msg, emoji: "🏦" });
        return;
      }

      // Validasi saldo bank jika pakai bank
      if (isBankSource) {
        const totalNeeded = amount + adminFeeNum;
        const available = getBankAvailableBalance(sourceBank.id);
        if (available < totalNeeded) {
          const msg = `Saldo ${sourceBank.bankName} tidak cukup. Tersedia: ${formatRupiah(available)}, Dibutuhkan: ${formatRupiah(totalNeeded)}`;
          setError(msg);
          playAlertSound();
          return;
        }
      } else if (paymentSource === "cash") {
        if (cashWalletBal < amount) {
          const msg = `Cash tidak cukup. Tersedia: ${formatRupiah(cashWalletBal)}, Dibutuhkan: ${formatRupiah(amount)}`;
          setError(msg);
          playAlertSound();
          return;
        }
      } else {
        const currentBal = getBalance();
        if (amount > currentBal) {
          const msg = `Uang anda kurang: ${formatRupiah(amount - currentBal)}`;
          setError(msg);
          playAlertSound();
          dispatchNotif({ type: "alert", title: "Saldo Tidak Mencukupi", message: msg, emoji: "⚠️" });
          return;
        }
      }

      if (protectionStatus?.protectionMode && protectionStatus.affectedCategories.includes(selectedCategory)) {
        const msg = `Mode Proteksi Aktif! Kategori "${selectedCategory}" dibatasi untuk menjaga saldo. ${protectionStatus.message}`;
        setError(msg);
        playAlertSound();
        dispatchNotif({ type: "alert", title: "Proteksi Keuangan Aktif", message: msg, emoji: "🛡️" });
        return;
      }

      if (isCategoryOverBudget(selectedCategory)) {
        const budgetStatus = getBudgetStatus(selectedCategory);
        const msg = `Anggaran kategori "${selectedCategory}" sudah habis (${formatRupiah(budgetStatus.spent)} / ${formatRupiah(budgetStatus.limit)}). Silakan sesuaikan budget Anda.`;
        setError(msg);
        playAlertSound();
        dispatchNotif({ type: "alert", title: "Anggaran Habis", message: msg, emoji: "🚫" });
        return;
      }
    }

    // Simpan ke transaksi utama
    const tx = addTransaction({
      amount,
      category: selectedCategory,
      notes,
      type: txType,
      paymentSource: isBankSource ? { type: "bank", id: sourceBank!.id, label: sourceBank!.bankName }
        : isDebtSource ? { type: "debt", id: selectedDebtId, label: debtsOptions.find(d => d.id === selectedDebtId)?.personName }
        : isAssetSource ? { type: "asset", id: selectedAssetId, label: assetsOptions.find(a => a.id === selectedAssetId)?.name }
        : { type: "cash", label: "Cash" },
    });

    // Jika pakai bank → update saldo bank
    if (isBankSource) {
      let transferToContactId: string | undefined;
      let toName = transferToName.trim();
      let toBank = transferToBank.trim();
      let toNumber = transferToNumber.trim();

      if (isTransferCategory && transferMode === "other_person" && selectedContact) {
        const c = contacts.find(c => c.id === selectedContact);
        if (c) { toName = c.name; toBank = c.bankName; toNumber = c.accountNumber; transferToContactId = c.id; }
      }
      if (isTransferCategory && transferMode === "other_person" && toName && toBank && toNumber) {
        transferToContactId = upsertTransferContact({ name: toName, bankName: toBank, accountNumber: toNumber });
      }

      addBankTransaction({
        bankAccountId: sourceBank.id,
        type: isTransferCategory ? "transfer_out" : txType === "income" ? "credit" : "debit",
        amount,
        adminFee: adminFeeNum,
        category: selectedCategory,
        notes,
        paymentMethod: sourceBank.id,
        receiptImageUrl: receiptImage,
        transferToAccountId: isTransferCategory && transferMode === "own_bank" ? transferToAccountId : undefined,
        transferToContactId,
        transferToName: toName || undefined,
        transferToBank: toBank || undefined,
        transferToNumber: toNumber || undefined,
        date: new Date().toISOString(),
      });
    }

    // Jika pakai cash → catat cash wallet tx
    if (paymentSource === "cash") {
      addCashWalletTransaction({
        type: txType === "income" ? "in" : "out",
        amount,
        category: selectedCategory,
        notes,
        date: new Date().toISOString(),
        relatedTransactionId: tx.id,
      });
    }

    // Jika pakai hutang/piutang → bayar cicilan (expense)
    if (isDebtSource && selectedDebtId) {
      if (txType === "expense") addDebtPayment(selectedDebtId, amount);
    }

    if (txType === "income") playIncomeSound();
    else playExpenseSound();
    
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose?.(); }, 1200);
  };

  const calcButtons = [["7","8","9","÷"],["4","5","6","×"],["1","2","3","−"],["AC","0",".","+"]];

  if (saved) {
    return (
      <div className="relative w-full" onClick={e => e.stopPropagation()}>
        <div className="rounded-t-[40px] border-t p-10 flex flex-col items-center gap-4"
          style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="bg-[rgba(78,222,163,0.15)] rounded-full size-20 flex items-center justify-center"><span className="text-[40px]">✅</span></div>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[20px]" style={{ color: "var(--app-text)" }}>
            {txType === "income" ? "Pemasukan" : "Pengeluaran"} Tersimpan!
          </p>
            <p className="font-['Inter'] text-[14px]" style={{ color: "var(--app-text2)" }}>
            {txType === "income" ? "+" : "-"}Rp{formatRupiahInput(display)} · {selectedCategory}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" onClick={e => e.stopPropagation()}>
      <div className="flex justify-center pt-3 pb-1"><div className="bg-[rgba(51,65,85,0.5)] h-1 rounded-full w-10" /></div>
      <div className="rounded-t-[40px] border-t shadow-[0px_-20px_60px_0px_rgba(0,0,0,0.4)] w-full"
        style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
        <div className="overflow-y-auto max-h-[85vh] px-7 pt-7 pb-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[22px]" style={{ color: "var(--app-text)" }}>Transaksi Baru</h2>
              <p className="font-['Inter'] text-[13px] mt-0.5" style={{ color: "var(--app-text2)" }}>Catat pergerakan keuangan</p>
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); onClose?.(); }}
              className="bg-[rgba(255,255,255,0.05)] flex items-center justify-center rounded-full size-9 hover:bg-[rgba(255,255,255,0.1)]">
              <svg className="size-3" fill="none" viewBox="0 0 14 14"><path d="M13 1L1 13M1 1L13 13" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* Type Toggle */}
          <div className="flex gap-2 mb-5">
            <button type="button" onClick={e => { e.stopPropagation(); setTxType("expense"); setSelectedCategory(""); }}
              className="flex-1 py-2.5 rounded-full font-['Inter'] font-semibold text-[13px] transition-all"
              style={{ backgroundColor: txType === "expense" ? "rgba(255,180,171,0.15)" : "#2d3449", color: txType === "expense" ? "#ffb4ab" : "#64748b", border: txType === "expense" ? "1px solid rgba(255,180,171,0.3)" : "1px solid transparent" }}>
              Pengeluaran
            </button>
            <button type="button" onClick={e => { e.stopPropagation(); setTxType("income"); setSelectedCategory(""); setError(null); }}
              className="flex-1 py-2.5 rounded-full font-['Inter'] font-semibold text-[13px] transition-all"
              style={{ backgroundColor: txType === "income" ? "rgba(78,222,163,0.15)" : "#2d3449", color: txType === "income" ? "#4edea3" : "#64748b", border: txType === "income" ? "1px solid rgba(78,222,163,0.3)" : "1px solid transparent" }}>
              Pemasukan
            </button>
          </div>

          {/* Amount */}
          <div className="bg-[rgba(45,52,73,0.4)] relative rounded-[16px] w-full mb-5 border border-[rgba(255,255,255,0.05)]">
            <div className="absolute top-px bottom-px left-px w-1.5 rounded-l-[14px]" style={{ backgroundColor: txType === "income" ? "#4edea3" : "#ffb4ab" }} />
            <div className="p-5 pl-7">
              <p className="font-['Inter'] font-semibold text-[10px] tracking-[2px] uppercase opacity-80 mb-1.5" style={{ color: txType === "income" ? "#4edea3" : "#ffb4ab" }}>MASUKKAN NOMINAL</p>
              <div className="flex items-baseline gap-1">
                <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[18px] text-[#64748b]">Rp</span>
                {showCalculator ? (
                  <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[36px] tracking-[-1px] leading-[40px]" style={{ color: "var(--app-text)" }}>{formatRupiahInput(display)}</span>
                ) : (
                  <input type="text" inputMode="decimal" 
                    value={display === "0" ? "" : formatRupiahInput(display)} 
                    onChange={handleAmountChange} placeholder="0"
                    className="font-['Plus_Jakarta_Sans'] font-extrabold text-[36px] tracking-[-1px] leading-[40px] bg-transparent outline-none w-full placeholder-[#334155]"
                    style={{ color: "var(--app-text)" }} />
                )}
              </div>
            </div>
          </div>

          {/* Categories - Dropdown - Hidden when calculator is expanded */}
          {!showCalculator && selectedCategory !== "Belanja" && belanjaSubMode === "none" && !showMarketplace && (
          <div className="mb-5">
            <p className="font-['Inter'] font-semibold text-[10px] text-[#64748b] tracking-[2px] uppercase mb-3">PILIH KATEGORI</p>
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowCatDropdown(!showCatDropdown)}
                className="w-full h-[48px] px-4 rounded-[12px] flex items-center justify-between text-[13px] font-['Inter']"
                style={{ backgroundColor: "var(--app-card2)", border: "1px solid var(--app-border)", color: selectedCategory ? "var(--app-text)" : "var(--app-text2)" }}
              >
                <span className="flex items-center gap-2">
                  {selectedCategory ? (
                    <>
                      <span>{filteredCats.find(c => c.name === selectedCategory)?.emoji || getCategoryEmoji(selectedCategory)}</span>
                      <span>{selectedCategory}</span>
                    </>
                  ) : (
                    "Pilih kategori..."
                  )}
                </span>
                <svg className={`w-4 h-4 transition-transform ${showCatDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {showCatDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-[12px] border z-50 max-h-[200px] overflow-y-auto"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                  {/* Search in dropdown */}
                  <div className="sticky top-0 p-2 border-b" style={{ borderColor: "var(--app-border)" }}>
                    <input 
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Cari..."
                      className="w-full h-[36px] px-3 rounded-[8px] bg-[var(--app-card)] border text-[13px] outline-none"
                      style={{ borderColor: "var(--app-border)", color: "var(--app-text)" }}
                      autoFocus
                    />
                  </div>
                  {searchFilteredCats.length > 0 ? (
                    searchFilteredCats.map(cat => {
                      const budgetStatus = getBudgetStatus(cat.name);
                      const isOverBudget = budgetStatus.isOverBudget;
                      const isProtected = protectionStatus?.protectionMode && protectionStatus.affectedCategories.includes(cat.name);
                      return (
                      <button key={cat.id} type="button"
                        onClick={(e) => { 
                          if (isOverBudget && cat.type !== "income") {
                            setError(`Anggaran "${cat.name}" sudah habis bulan ini!`);
                            playAlertSound();
                            return;
                          }
                          if (isProtected && cat.type !== "income") {
                            setError(`Mode Proteksi Aktif! Kategori "${cat.name}" dibatasi sementara.`);
                            playAlertSound();
                            return;
                          }
                          e.stopPropagation(); 
                          if (cat.name === "Belanja") {
                            setSelectedCategory(cat.name);
                            setShowCatDropdown(false);
                            setCategorySearch("");
                            setBelanjaSubMode("none");
                            setShowMarketplace(false);
                            setError(null);
                          } else {
                            setSelectedCategory(cat.name); setShowCatDropdown(false); setCategorySearch(""); setError(null); 
                            setBelanjaSubMode("none");
                            setShowMarketplace(false);
                          } 
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${(isOverBudget || isProtected) && cat.type !== "income" ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5"}`}
                        style={{ backgroundColor: selectedCategory === cat.name ? "rgba(0,209,139,0.1)" : "transparent" }}
                      >
                        <span className="text-[18px]">{cat.emoji}</span>
                        <div className="flex-1 flex flex-col">
                          <span className="text-[13px] font-['Inter']" style={{ color: selectedCategory === cat.name ? "#00d18b" : isOverBudget || isProtected ? "#94a3b8" : "var(--app-text)" }}>{cat.name}</span>
                          {isOverBudget && cat.type !== "income" && (
                            <span className="text-[10px] text-[#ff6464]">Anggaran habis</span>
                          )}
                          {isProtected && cat.type !== "income" && !isOverBudget && (
                            <span className="text-[10px] text-[#ff8c00]">Terbatas Proteksi</span>
                          )}
                        </div>
                      </button>
                    );})
                  ) : (
                    <p className="text-[12px] text-[#64748b] text-center py-4">Tidak ada kategori</p>
                  )}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Belanja Sub-Mode Selection */}
          {selectedCategory === "Belanja" && belanjaSubMode === "none" && !showMarketplace && (
            <div className="mb-5">
              <p className="font-['Inter'] font-semibold text-[10px] text-[#64748b] tracking-[2px] uppercase mb-3">PILIH TIPE BELANJA</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button"
                  onClick={() => { setBelanjaSubMode("offline"); setSelectedCategory("Belanja Offline"); }}
                  className="py-4 px-3 rounded-[16px] flex flex-col items-center gap-2 border transition-all active:scale-95"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                  <span className="text-[28px]">🏬</span>
                  <span className="text-[13px] font-['Inter'] font-semibold" style={{ color: "var(--app-text)" }}>Offline</span>
                  <span className="text-[10px]" style={{ color: "var(--app-text2)" }}>Toko fisik</span>
                </button>
                <button type="button"
                  onClick={() => { setBelanjaSubMode("online"); setShowMarketplace(true); }}
                  className="py-4 px-3 rounded-[16px] flex flex-col items-center gap-2 border transition-all active:scale-95"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                  <span className="text-[28px]">📱</span>
                  <span className="text-[13px] font-['Inter'] font-semibold" style={{ color: "var(--app-text)" }}>Online</span>
                  <span className="text-[10px]" style={{ color: "var(--app-text2)" }}>Marketplace</span>
                </button>
              </div>
            </div>
          )}

          {/* Marketplace Selection */}
          {showMarketplace && belanjaSubMode === "online" && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-['Inter'] font-semibold text-[10px] text-[#64748b] tracking-[2px] uppercase">PILIH MARKETPLACE</p>
                <button type="button" onClick={() => { setShowMarketplace(false); setBelanjaSubMode("none"); setSelectedCategory("Belanja"); }}
                  className="text-[12px] text-[#ff6464]">Kembali</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Shopee", emoji: "🛒" },
                  { name: "Tokopedia", emoji: "🛍️" },
                  { name: "TikTok Shop", emoji: "🎵" },
                  { name: "Lazada", emoji: "📦" },
                  { name: "Bukalapak", emoji: "🛍️" },
                  { name: "Blibli", emoji: "📳" },
                  { name: "JD.ID", emoji: "📦" },
                  { name: "Amazon", emoji: "📦" },
                ].map(mp => (
                  <button key={mp.name} type="button"
                    onClick={() => { setSelectedCategory(mp.name); setShowMarketplace(false); }}
                    className="py-3 px-2 rounded-[12px] flex items-center gap-2 border transition-all active:scale-95"
                    style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                    <span className="text-[18px]">{mp.emoji}</span>
                    <span className="text-[12px] font-['Inter']" style={{ color: "var(--app-text)" }}>{mp.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Back button for Belanja Offline and Online (marketplace selected) */}
          {((belanjaSubMode === "offline" && selectedCategory === "Belanja Offline") || (belanjaSubMode === "online" && showMarketplace === false && selectedCategory !== "Belanja" && selectedCategory !== "")) && (
            <div className="mb-5 flex items-center">
              <button type="button" onClick={() => { 
                if (belanjaSubMode === "offline") {
                  setBelanjaSubMode("none"); 
                  setSelectedCategory("Belanja"); 
                } else {
                  setShowMarketplace(true);
                  setSelectedCategory("Belanja");
                }
              }}
                className="text-[12px] text-[#4edea3] flex items-center gap-1">
                <span>←</span> Kembali ke jenis belanja
              </button>
            </div>
          )}

          {/* Scanned Items - Hidden when calculator is expanded */}
          {(!showCalculator && barcodeItems.length > 0) && (
            <div className="mb-5 p-4 rounded-[16px]" style={{ backgroundColor: "var(--app-card2)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-['Inter'] text-[11px] text-[#64748b] uppercase">Item Ter_scan ({barcodeItems.length})</p>
                <button type="button" onClick={() => setBarcodeItems([])} className="text-[12px] text-[#ff6464]">Hapus semua</button>
              </div>
              <div className="space-y-2">
                {barcodeItems.map((item, idx) => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <span className="text-[12px] text-[#64748b] w-5 shrink-0">{idx + 1}.</span>
                    <div className="flex-1">
                      <input
                        value={item.name}
                        onChange={(e) => setBarcodeItems(barcodeItems.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                        placeholder="Nama item"
                        className="w-full h-[36px] px-3 rounded-[10px] text-[13px] outline-none"
                        style={{ backgroundColor: "var(--app-card)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
                      />
                    </div>
                    <input
                      type="number"
                      value={item.price || ""}
                      onChange={(e) => setBarcodeItems(barcodeItems.map(i => i.id === item.id ? { ...i, price: parseInt(e.target.value) || 0 } : i))}
                      placeholder="0"
                      className="w-[80px] h-[36px] px-2 rounded-[10px] text-[13px] text-right outline-none"
                      style={{ backgroundColor: "var(--app-card)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
                    />
                    <button type="button" onClick={() => setBarcodeItems(barcodeItems.filter(i => i.id !== item.id))}
                      className="size-7 rounded-full flex items-center justify-center text-[#ff6464]"
                      style={{ backgroundColor: "rgba(255,100,100,0.1)" }}>
                      <span className="text-[14px]">×</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barcode Scanner Button - Hidden when calculator is expanded */}
          {!showCalculator && (
          <>
          <p className="font-['Inter'] font-semibold text-[10px] text-[#64748b] tracking-[2px] uppercase mb-2">SCAN BARCODE STRUK / INVOICE PEMBELIAN</p>
          <button 
            type="button" 
            onClick={() => setShowScanner(true)}
            className="w-full py-3 rounded-[16px] flex items-center justify-center gap-2 mb-5"
            style={{ backgroundColor: "#2d3449", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-[20px]">📷</span>
            <span className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text)" }}>Scan Barcode / QR</span>
          </button>

          {/* Barcode Scanner Full Screen */}
          {showScanner && (
            <BarcodeScanner 
              onClose={() => setShowScanner(false)} 
              onScan={(data) => {
                setBarcodeItems([...barcodeItems, { id: crypto.randomUUID(), name: data, price: 0 }]);
                setShowScanner(false);
              }}
            />
          )}

          </>
          )}

          {/* Notes - disembunyikan saat kalkulator tampil */}
          {!showCalculator && (
          <div className="mb-5">
            <p className="font-['Inter'] font-semibold text-[10px] text-[#64748b] tracking-[2px] uppercase mb-2">CATATAN</p>
            <div className="rounded-[16px] border" style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Apa tujuan transaksi ini?"
                className="w-full bg-transparent p-4 font-['Inter'] text-[14px] resize-none outline-none min-h-[72px]"
                style={{ color: "var(--app-text)" }} />
            </div>
          </div>
          )}

          {/* ── SUMBER DANA ── */}
          {!showCalculator && (
          <div className="mb-5">
            <p className="font-['Inter'] font-semibold text-[10px] text-[#64748b] tracking-[2px] uppercase mb-2">SUMBER DANA</p>
            <select value={paymentSource} onChange={e => setPaymentSource(e.target.value)}
              className="w-full h-[48px] px-4 rounded-[12px] font-['Inter'] text-[13px] font-bold outline-none border"
              style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
              {!isTransferCategory && (
                <>
                  <option value="cash">💵 Cash</option>
                  {debtsOptions.length > 0 && (
                    <optgroup label="Hutang/Piutang">
                      {debtsOptions.map(d => (
                        <option key={d.id} value={`debt:${d.id}`}>🧾 {d.personName} — sisa {formatRupiah(d.remainingAmount)}</option>
                      ))}
                    </optgroup>
                  )}
                  {assetsOptions.length > 0 && (
                    <optgroup label="Aset">
                      {assetsOptions.map(a => (
                        <option key={a.id} value={`asset:${a.id}`}>{a.emoji} {a.name}</option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
              {bankAccounts.length === 0 ? (
                <option value="cash" disabled>🏦 Belum ada rekening bank</option>
              ) : (
                bankAccounts.map(a => (
                  <option key={a.id} value={a.id}>🏦 {a.bankName} — {formatRupiah(a.balance)}</option>
                ))
              )}
            </select>
            {sourceBank && (
              <p className="font-['Inter'] text-[10px] mt-1 text-[#4edea3]">
                Saldo {sourceBank.bankName}: {formatRupiah(getBankAvailableBalance(sourceBank.id))} (available)
              </p>
            )}
          </div>
          )}

          {/* ── BIAYA ADMIN (muncul jika pakai bank) ── */}
          {!showCalculator && isBankSource && (
          <div className="mb-5">
            <p className="font-['Inter'] font-semibold text-[10px] text-[#64748b] tracking-[2px] uppercase mb-2">BIAYA ADMIN</p>
            <div className="flex gap-2 mb-2">
              {[0, 2500, 6500, 7500, 10000].map(preset => (
                <button key={preset} type="button" onClick={() => setAdminFee(preset === 0 ? "" : String(preset))}
                  className="flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all"
                  style={{
                    backgroundColor: (adminFee === String(preset) || (preset === 0 && !adminFee)) ? "#fbbf24" : "#2d3449",
                    color: (adminFee === String(preset) || (preset === 0 && !adminFee)) ? "#003824" : "#64748b",
                  }}>
                  {preset === 0 ? "Gratis" : `${(preset/1000).toFixed(preset % 1000 === 0 ? 0 : 1)}k`}
                </button>
              ))}
            </div>
            <input type="number" value={adminFee} onChange={e => setAdminFee(e.target.value)}
              placeholder="0"
              className="w-full h-[44px] px-4 rounded-[12px] font-['Inter'] text-[14px] outline-none border"
              style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
          </div>
          )}

          {/* ── SECTION TRANSFER (muncul jika kategori = Transfer) ── */}
          {!showCalculator && isTransferCategory && (
          <div className="mb-5 rounded-[16px] p-4 border border-[rgba(96,165,250,0.25)]"
            style={{ backgroundColor: "rgba(96,165,250,0.06)" }}>
            <p className="font-['Inter'] font-semibold text-[10px] text-[#60a5fa] tracking-[2px] uppercase mb-3">TUJUAN TRANSFER</p>
            <div className="flex gap-2 mb-3">
              {[{ v: "own_bank", label: "Bank Saya" }, { v: "other_person", label: "Orang Lain" }].map(opt => (
                <button key={opt.v} type="button" onClick={() => setTransferMode(opt.v as "own_bank" | "other_person")}
                  className="flex-1 py-2 rounded-full text-[11px] font-bold transition-all"
                  style={{ backgroundColor: transferMode === opt.v ? "#60a5fa" : "#2d3449", color: transferMode === opt.v ? "#fff" : "#64748b" }}>
                  {opt.label}
                </button>
              ))}
            </div>
            {transferMode === "own_bank" ? (
              <select value={transferToAccountId} onChange={e => setTransferToAccountId(e.target.value)}
                className="w-full h-[44px] px-4 rounded-[12px] font-['Inter'] text-[13px] outline-none border"
                style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
                <option value="">Pilih rekening tujuan...</option>
                {bankAccounts.filter(a => a.id !== paymentSource).map(a => (
                  <option key={a.id} value={a.id}>{a.bankName} — {a.accountNumber}</option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                {contacts.length > 0 && (
                  <select value={selectedContact} onChange={e => {
                    setSelectedContact(e.target.value);
                    const c = contacts.find(c => c.id === e.target.value);
                    if (c) { setTransferToName(c.name); setTransferToBank(c.bankName); setTransferToNumber(c.accountNumber); }
                  }}
                    className="w-full h-[44px] px-4 rounded-[12px] font-['Inter'] text-[13px] outline-none border"
                    style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
                    <option value="">Pilih kontak tersimpan...</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name} — {c.bankName}</option>)}
                  </select>
                )}
                <input value={transferToName} onChange={e => setTransferToName(e.target.value)}
                  placeholder="Nama penerima *"
                  className="w-full h-[44px] px-4 rounded-[12px] font-['Inter'] text-[13px] outline-none border"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={transferToBank} onChange={e => setTransferToBank(e.target.value)}
                    placeholder="Bank tujuan"
                    className="h-[44px] px-3 rounded-[12px] font-['Inter'] text-[12px] outline-none border"
                    style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
                  <input value={transferToNumber} onChange={e => setTransferToNumber(e.target.value)}
                    placeholder="No. rekening"
                    className="h-[44px] px-3 rounded-[12px] font-['Inter'] text-[12px] outline-none border"
                    style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
                </div>
              </div>
            )}
          </div>
          )}

          {/* ── BUKTI PEMBAYARAN (muncul jika pakai bank atau kategori Transfer) ── */}
          {!showCalculator && (isBankSource || isTransferCategory) && (
          <div className="mb-5">
            <p className="font-['Inter'] font-semibold text-[10px] text-[#64748b] tracking-[2px] uppercase mb-2">BUKTI PEMBAYARAN</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => setReceiptImage(ev.target?.result as string);
              reader.readAsDataURL(file);
            }} />
            {receiptImage ? (
              <div className="relative">
                <img src={receiptImage} alt="receipt" className="w-full rounded-[12px] max-h-[120px] object-cover" />
                <button type="button" onClick={() => setReceiptImage(undefined)}
                  className="absolute top-2 right-2 size-7 rounded-full bg-black/60 flex items-center justify-center text-white font-bold text-[14px]">×</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full h-[44px] rounded-[12px] border-dashed border-2 flex items-center justify-center gap-2 font-['Inter'] text-[12px]"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#64748b" }}>
                📷 Ambil / Pilih Foto Struk
              </button>
            )}
          </div>
          )}

          {/* Calc Toggle */}
          <div className="flex justify-center mb-4">
            <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); 
              setShowCalculator(p => !p);
              setShowCatDropdown(false);
            }}
              className="flex items-center gap-2 px-5 py-3 rounded-full transition-all active:scale-95"
              style={{ backgroundColor: showCalculator ? "rgba(0,209,139,0.15)" : "rgba(45,52,73,0.5)", border: showCalculator ? "1px solid rgba(0,209,139,0.4)" : "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-[16px]">{showCalculator ? "🔢" : "🧮"}</span>
              <span className="font-['Inter'] font-semibold text-[13px]" style={{ color: showCalculator ? "#00d18b" : "#94a3b8" }}>
                {showCalculator ? "Sembunyikan Kalkulator" : "Tampilkan Kalkulator"}
              </span>
            </button>
          </div>

          {/* Calculator */}
          {showCalculator && (
            <div className="rounded-[24px] border p-4 mb-5" style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {calcButtons.flat().map((btn, i) => {
                  const isOp = ["÷","×","−","+"].includes(btn); const isClear = btn === "AC";
                  const isBackspace = btn === "⌫";
                  const isActive = isOp && operator === btn && waitingForSecond;
                  return (
                    <button key={i} type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); handleCalcPress(btn); }}
                      className="flex items-center justify-center rounded-[14px] h-[54px] transition-all active:scale-90"
                      style={{ backgroundColor: isActive ? "#00d18b" : isOp ? "#2d3449" : isClear ? "rgba(255,180,171,0.1)" : isBackspace ? "rgba(251,191,36,0.1)" : "rgba(45,52,73,0.5)", border: isOp ? "1px solid rgba(0,209,139,0.2)" : isClear ? "1px solid rgba(255,180,171,0.2)" : isBackspace ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="font-['Inter'] font-semibold" style={{ color: isActive ? "#060E20" : isOp ? "#00d18b" : isClear ? "#ffb4ab" : isBackspace ? "#fbbf24" : "#dae2fd", fontSize: isOp ? "22px" : "18px" }}>{btn}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); handleBackspace(); }}
                  className="h-[54px] rounded-[14px] flex items-center justify-center active:scale-95" style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
                  <span className="font-['Inter'] font-semibold text-[22px] text-[#fbbf24]">⌫</span>
                </button>
                <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); handleEquals(); }}
                  className="h-[54px] rounded-[14px] flex items-center justify-center active:scale-95" style={{ backgroundColor: "rgba(0,209,139,0.1)", border: "1px solid rgba(0,209,139,0.3)" }}>
                  <span className="font-['Inter'] font-semibold text-[22px] text-[#00d18b]">=</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-[16px] bg-[#ffb4ab]/15 border border-[#ffb4ab]/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-[18px]">⚠️</span>
              <p className="font-['Inter'] font-bold text-[13px] text-[#ffb4ab]">{error}</p>
            </div>
          )}

          {/* Confirm */}
          <button type="button" onClick={e => { e.stopPropagation(); 
            if (barcodeItems.length > 0) handleBarcodeConfirm();
            else handleConfirm();
          }}
            className="w-full rounded-[16px] py-5 shadow-[0px_12px_40px_rgba(0,209,139,0.3)] transition-all active:scale-[0.98]"
            style={{ backgroundColor: (selectedCategory && (parseFloat(display) > 0 || barcodeItems.length > 0)) ? "#00d18b" : "#2d3449" }}>
            <span className="font-['Inter'] font-semibold text-[16px] tracking-[1.8px] uppercase" style={{ color: (selectedCategory && (parseFloat(display) > 0 || barcodeItems.length > 0)) ? "#060e20" : "#64748b" }}>
              {barcodeItems.length > 0 ? `SIMPAN ${barcodeItems.length} ITEM` : "SIMPAN TRANSAKSI"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

