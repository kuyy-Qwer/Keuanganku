import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  getBankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
  getBankTransactions, deleteBankTransaction,
  getTransferContacts, deleteTransferContact,
  getCashWalletBalance, setCashWalletBalance, getCashWalletTransactions,
  formatRupiah,
  type BankAccount, type TransferContact, type CashWalletTx,
  addBankTransaction,
  addTransaction,
} from "../store/database";
import { useLang } from "../i18n";
import { playAlertSound } from "../lib/sounds";
import { crudDeleteSuccess, crudSuccess } from "../lib/notify";

const L = (lang: string, id: string, en: string) => lang === "en" ? en : id;

const BANK_COLORS = ["#0060AF","#003876","#F05A22","#E31837","#009A44","#FF6600","#7B2D8B","#00A0DC"];
const BANK_PRESETS = ["BCA","Mandiri","BNI","BRI","CIMB","Danamon","Permata","BSI","Jenius","GoPay","OVO","Dana","Cash"];

type Tab = "accounts" | "transactions" | "contacts";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

  function formatAccountNumber(value: string, bank: string): string {
    const cleaned = value.replace(/\D/g, '');
    switch (bank.toUpperCase()) {
      case 'BCA':
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3').slice(0, 13);
      case 'MANDIRI':
        return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4').slice(0, 16);
      case 'BNI':
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3').slice(0, 11);
      case 'BRI':
        return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{3})/, '$1-$2-$3-$4').slice(0, 17);
      case 'CIMB':
        return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4').slice(0, 16);
      case 'DANAMON':
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3').slice(0, 11);
      case 'PERMATA':
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3').slice(0, 13);
      case 'BSI':
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1-$2-$3-$4').slice(0, 15);
      default:
        const custom = customBanks.find(c => c.name === bank);
        if (custom) {
          const d = cleaned.slice(0, custom.digits);
          // Simple formatting: group by 4, but adjust based on digits
          if (custom.digits <= 10) return d.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3').slice(0, 13);
          if (custom.digits <= 13) return d.replace(/(\d{4})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4').slice(0, 16);
          return d; // no format for longer
        }
        // For new custom bank being added
        if (accCustomDigits && parseInt(accCustomDigits) > 0) {
          const digits = parseInt(accCustomDigits);
          const d = cleaned.slice(0, digits);
          // Simple formatting based on digits
          if (digits <= 10) return d.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3').slice(0, 13);
          if (digits <= 13) return d.replace(/(\d{4})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4').slice(0, 16);
          return d;
        }
        return cleaned.slice(0, 20); // for others like digital wallets
    }
  }

export default function BankSimulationPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const [tab, setTab] = useState<Tab>("accounts");
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState(getBankTransactions());
  const [cashBalance, setCashBalance] = useState(0);
  const [cashTxs, setCashTxs] = useState<CashWalletTx[]>([]);
  const [contacts, setContacts] = useState<TransferContact[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  // ── Add Account form ─────────────────────────────────────────────
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accBankName, setAccBankName] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [customBanks, setCustomBanks] = useState<{name: string, digits: number}[]>(() => {
    const stored = localStorage.getItem("luminary_custom_banks");
    return stored ? JSON.parse(stored) : [];
  });
  const [accCustomDigits, setAccCustomDigits] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [accOwner, setAccOwner] = useState("");
  const [accType, setAccType] = useState<BankAccount["type"]>("Tabungan");
  const [accColorIdx, setAccColorIdx] = useState(0);
  const [accInitialBalance, setAccInitialBalance] = useState(""); // saldo awal

  // ── Edit saldo rekening ──────────────────────────────────────────
  const [editBalanceId, setEditBalanceId] = useState<string | null>(null);
  const [editBalanceVal, setEditBalanceVal] = useState("");
  const [editCashBalance, setEditCashBalance] = useState(false);

  // ── Filter transaksi ─────────────────────────────────────────────
  const [filterAccountId, setFilterAccountId] = useState<string | null>(null);

  const refresh = () => {
    setAccounts(getBankAccounts());
    setTransactions(getBankTransactions());
    setCashBalance(getCashWalletBalance());
    setCashTxs(getCashWalletTransactions());
    setContacts(getTransferContacts().sort((a, b) =>
      new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
    ));
  };

  useEffect(() => {
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  useEffect(() => {
    if (showBankDropdown) {
      const handleClick = (e: MouseEvent) => {
        if (!(e.target as Element).closest('.bank-dropdown')) setShowBankDropdown(false);
      };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showBankDropdown]);
  const visibleTxs = filterAccountId
    ? transactions.filter(t => t.bankAccountId === filterAccountId)
    : transactions;
  const allBanks = [...BANK_PRESETS, ...customBanks.map(c => c.name)];
  const filteredBanks = allBanks.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()));
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0) + cashBalance;

  function handleSaveCashBalance() {
    const val = parseInt(editBalanceVal.replace(/\D/g, ""), 10);
    if (isNaN(val)) { playAlertSound(); return; }
    setCashWalletBalance(val);
    void crudSuccess();
    setEditCashBalance(false);
    setEditBalanceVal("");
  }

  // ── Tambah Rekening ──────────────────────────────────────────────
  function handleAddAccount() {
    if (!accBankName.trim() || !accNumber.trim() || !accOwner.trim()) { playAlertSound(); return; }
    const accountNumber = accNumber.replace(/\D/g, '');
    const initialBal = parseInt(accInitialBalance.replace(/\D/g, ""), 10) || 0;

    // If custom bank, add to customBanks
    if (!BANK_PRESETS.includes(accBankName.toUpperCase()) && !customBanks.some(c => c.name === accBankName)) {
      const digits = parseInt(accCustomDigits, 10) || 10;
      const newCustom = [...customBanks, { name: accBankName, digits }];
      setCustomBanks(newCustom);
      localStorage.setItem("luminary_custom_banks", JSON.stringify(newCustom));
    }

    const acc = addBankAccount({
      bankName: accBankName.trim().toUpperCase(),
      accountNumber,
      ownerName: accOwner.trim(),
      type: accType,
      color: BANK_COLORS[accColorIdx],
      balance: 0,
    });

    // Jika ada saldo awal, catat sebagai pemasukan + transaksi bank (credit)
    if (initialBal > 0) {
      const mainTx = addTransaction({
        amount: initialBal,
        category: "Saldo Awal",
        notes: `${acc.bankName} · Saldo awal`,
        type: "income",
        paymentSource: { type: "bank", id: acc.id, label: acc.bankName },
      });
      addBankTransaction({
        bankAccountId: acc.id,
        type: "credit",
        amount: initialBal,
        adminFee: 0,
        category: "Saldo Awal",
        notes: "Saldo awal rekening",
        paymentMethod: acc.id,
        relatedTransactionId: mainTx.id,
        date: new Date().toISOString(),
      });
    }

    void crudSuccess();
    setShowAddAccount(false);
    setAccBankName(""); setBankSearch(""); setAccNumber(""); setAccOwner(""); setAccType("Tabungan");
    setAccColorIdx(0); setAccInitialBalance(""); setAccCustomDigits("");
  }

  // ── Edit Saldo Manual ────────────────────────────────────────────
  function handleSaveBalance(id: string) {
    const val = parseInt(editBalanceVal.replace(/\D/g, ""), 10);
    if (isNaN(val)) { playAlertSound(); return; }
    const acc = getBankAccounts().find(a => a.id === id);
    if (!acc) { playAlertSound(); return; }

    const prev = acc.balance;
    const delta = val - prev;

    if (delta !== 0) {
      const now = new Date().toISOString();
      if (delta > 0) {
        // Naik -> pemasukan
        const mainTx = addTransaction({
          amount: delta,
          category: "Penyesuaian Saldo",
          notes: `${acc.bankName} · Edit saldo (naik)`,
          type: "income",
          paymentSource: { type: "bank", id, label: acc.bankName },
        });
        addBankTransaction({
          bankAccountId: id,
          type: "credit",
          amount: delta,
          adminFee: 0,
          category: "Penyesuaian Saldo",
          notes: "Edit saldo (naik)",
          paymentMethod: id,
          relatedTransactionId: mainTx.id,
          date: now,
        });
      } else {
        // Turun -> pengeluaran (selisih)
        const diff = Math.abs(delta);
        const mainTx = addTransaction({
          amount: diff,
          category: "Penyesuaian Saldo",
          notes: `${acc.bankName} · Edit saldo (turun)`,
          type: "expense",
          paymentSource: { type: "bank", id, label: acc.bankName },
        });
        addBankTransaction({
          bankAccountId: id,
          type: "debit",
          amount: diff,
          adminFee: 0,
          category: "Penyesuaian Saldo",
          notes: "Edit saldo (turun)",
          paymentMethod: id,
          relatedTransactionId: mainTx.id,
          date: now,
        });
      }
    } else {
      // No change
      updateBankAccount(id, { balance: val });
    }
    void crudSuccess();
    setEditBalanceId(null);
    setEditBalanceVal("");
  }

  return (
    <div className="w-full min-h-screen flex justify-center pb-28" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
                🏦 {L(lang, "Simulasi Bank", "Bank Simulation")}
              </h1>
              <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Catat keuangan per rekening", "Track finances per account")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {tab === "accounts" && (
              <button onClick={() => setShowAddAccount(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-full font-bold text-[12px] text-[#003824]"
                style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" d="M12 4v16m8-8H4" />
                </svg>
                {L(lang, "Rekening", "Account")}
              </button>
            )}
          </div>
        </div>

        {/* Total saldo */}
        {(accounts.length > 0 || cashBalance > 0) && (
          <div className="rounded-[20px] p-5 border"
            style={{ background: "linear-gradient(135deg,var(--app-card),var(--app-card2))", borderColor: "var(--app-border)" }}>
            <p className="font-['Inter'] text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--app-text2)" }}>
              {L(lang, "Total Saldo Semua Rekening", "Total Balance All Accounts")}
            </p>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[30px] tracking-tight" style={{ color: "var(--app-text)" }}>
              {formatRupiah(totalBalance)}
            </p>
            <div className="flex gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                <span className="font-['Inter'] text-[10px]" style={{ color: "var(--app-text2)" }}>
                  Cash: {formatRupiah(cashBalance)}
                </span>
              </div>
              {accounts.map(a => (
                <div key={a.id} className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="font-['Inter'] text-[10px]" style={{ color: "var(--app-text2)" }}>
                    {a.bankName}: {formatRupiah(a.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-[14px]" style={{ backgroundColor: "var(--app-card)" }}>
          {(["accounts", "transactions", "contacts"] as Tab[]).map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className="flex-1 py-2 rounded-[10px] text-[11px] font-bold transition-all"
              style={{ backgroundColor: tab === tb ? "#10B981" : "transparent", color: tab === tb ? "#fff" : "var(--app-text2)" }}>
              {tb === "accounts" ? L(lang, "Rekening", "Accounts") :
               tb === "transactions" ? L(lang, "Riwayat", "History") :
               L(lang, "Kontak", "Contacts")}
            </button>
          ))}
        </div>

        {/* ── TAB: ACCOUNTS ── */}
        {tab === "accounts" && (
          <div className="space-y-3">
            {/* Cash wallet card */}
            <div className="rounded-[20px] border relative overflow-hidden"
              style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: "#22c55e" }} />
              <div className="pl-4 pr-4 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-[14px] flex items-center justify-center font-black text-[16px] text-[#003824]"
                      style={{ backgroundColor: "rgba(78,222,163,0.3)" }}>
                      💵
                    </div>
                    <div>
                      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]" style={{ color: "var(--app-text)" }}>
                        Cash Wallet
                      </p>
                      <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                        {L(lang, "Dana uang cash untuk simulasi", "Cash funds for simulation")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[17px]" style={{ color: "#4edea3" }}>
                      {formatRupiah(cashBalance)}
                    </p>
                  </div>
                </div>

                {editCashBalance ? (
                  <div className="mt-3 flex gap-2">
                    <input type="number" value={editBalanceVal} onChange={e => setEditBalanceVal(e.target.value)}
                      placeholder="0" autoFocus
                      className="flex-1 h-[38px] px-3 rounded-[10px] outline-none border font-['Inter'] text-[13px]"
                      style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
                    <button onClick={handleSaveCashBalance}
                      className="px-3 h-[38px] rounded-[10px] text-[12px] font-bold text-[#003824]"
                      style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
                      {L(lang, "Simpan", "Save")}
                    </button>
                    <button onClick={() => setEditCashBalance(false)}
                      className="px-3 h-[38px] rounded-[10px] text-[12px] font-bold"
                      style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => { setEditCashBalance(true); setEditBalanceVal(String(cashBalance)); }}
                      className="flex-1 py-1.5 rounded-[10px] text-[11px] font-bold"
                      style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                      ✏️ {L(lang, "Edit Saldo", "Edit Balance")}
                    </button>
                    <button onClick={() => { setFilterAccountId("__cash__"); setTab("transactions"); }}
                      className="flex-1 py-1.5 rounded-[10px] text-[11px] font-bold text-[#4edea3]"
                      style={{ backgroundColor: "rgba(78,222,163,0.1)" }}>
                      📋 {L(lang, "Riwayat", "History")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {accounts.length === 0 ? (
              <div className="rounded-[20px] p-10 text-center" style={{ backgroundColor: "var(--app-card)" }}>
                <span className="text-[40px] block mb-3">🏦</span>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] mb-1" style={{ color: "var(--app-text)" }}>
                  {L(lang, "Belum ada rekening", "No accounts yet")}
                </p>
                <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "Mulai dengan tambah rekening bank kamu", "Start by adding your bank account")}
                </p>
              </div>
            ) : accounts.map(acc => (
              <div key={acc.id} className="rounded-[20px] border relative overflow-hidden"
                style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: acc.color }} />
                <div className="pl-4 pr-4 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-[14px] flex items-center justify-center font-black text-[16px] text-white"
                        style={{ backgroundColor: acc.color }}>
                        {acc.bankName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]" style={{ color: "var(--app-text)" }}>
                          {acc.bankName}
                        </p>
                        <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
                          {acc.accountNumber} · {acc.ownerName}
                        </p>
                        <p className="font-['Inter'] text-[10px]" style={{ color: "var(--app-text2)" }}>{acc.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[17px]"
                        style={{ color: acc.balance >= 0 ? "#4edea3" : "#ffb4ab" }}>
                        {formatRupiah(acc.balance)}
                      </p>
                    </div>
                  </div>

                  {/* Edit saldo inline */}
                  {editBalanceId === acc.id ? (
                    <div className="mt-3 flex gap-2">
                      <input type="number" value={editBalanceVal} onChange={e => setEditBalanceVal(e.target.value)}
                        placeholder="0" autoFocus
                        className="flex-1 h-[38px] px-3 rounded-[10px] outline-none border font-['Inter'] text-[13px]"
                        style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
                      <button onClick={() => handleSaveBalance(acc.id)}
                        className="px-3 h-[38px] rounded-[10px] text-[12px] font-bold text-[#003824]"
                        style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
                        {L(lang, "Simpan", "Save")}
                      </button>
                      <button onClick={() => setEditBalanceId(null)}
                        className="px-3 h-[38px] rounded-[10px] text-[12px] font-bold"
                        style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => { setEditBalanceId(acc.id); setEditBalanceVal(String(acc.balance)); }}
                        className="flex-1 py-1.5 rounded-[10px] text-[11px] font-bold"
                        style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                        ✏️ {L(lang, "Edit Saldo", "Edit Balance")}
                      </button>
                      <button onClick={() => { setFilterAccountId(acc.id); setTab("transactions"); }}
                        className="flex-1 py-1.5 rounded-[10px] text-[11px] font-bold text-[#4edea3]"
                        style={{ backgroundColor: "rgba(78,222,163,0.1)" }}>
                        📋 {L(lang, "Riwayat", "History")}
                      </button>
                      <button onClick={() => { deleteBankAccount(acc.id); void crudDeleteSuccess(); }}
                        className="py-1.5 px-3 rounded-[10px]" style={{ backgroundColor: "rgba(255,100,100,0.1)" }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#ff6464" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: TRANSACTIONS ── */}
        {tab === "transactions" && (
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setFilterAccountId(null)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold"
                style={{ backgroundColor: !filterAccountId ? "#10B981" : "var(--app-card)", color: !filterAccountId ? "#fff" : "var(--app-text2)" }}>
                {L(lang, "Semua", "All")}
              </button>
              <button onClick={() => setFilterAccountId("__cash__")}
                className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold"
                style={{ backgroundColor: filterAccountId === "__cash__" ? "#22c55e" : "var(--app-card)", color: filterAccountId === "__cash__" ? "#fff" : "var(--app-text2)" }}>
                Cash
              </button>
              {accounts.map(acc => (
                <button key={acc.id} onClick={() => setFilterAccountId(acc.id)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: filterAccountId === acc.id ? acc.color : "var(--app-card)", color: filterAccountId === acc.id ? "#fff" : "var(--app-text2)" }}>
                  {acc.bankName}
                </button>
              ))}
            </div>

            {filterAccountId === "__cash__" ? (
              cashTxs.length === 0 ? (
                <div className="rounded-[20px] p-10 text-center" style={{ backgroundColor: "var(--app-card)" }}>
                  <span className="text-[36px] block mb-2">📋</span>
                  <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
                    {L(lang, "Belum ada transaksi cash", "No cash transactions yet")}
                  </p>
                </div>
              ) : cashTxs.map(tx => {
                const isIn = tx.type === "in";
                return (
                  <div key={tx.id} className="rounded-[18px] p-4 border"
                    style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="size-10 rounded-full flex items-center justify-center text-[18px] shrink-0"
                          style={{ backgroundColor: "var(--app-card2)" }}>
                          {isIn ? "💰" : "💸"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] truncate" style={{ color: "var(--app-text)" }}>
                            {tx.category}
                          </p>
                          <p className="font-['Inter'] text-[10px]" style={{ color: "var(--app-text2)" }}>
                            Cash · {fmtDate(tx.date)} {fmtTime(tx.date)}
                          </p>
                          {tx.notes && <p className="font-['Inter'] text-[10px] italic truncate" style={{ color: "var(--app-text2)" }}>{tx.notes}</p>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-['Plus_Jakarta_Sans'] font-bold text-[14px] ${isIn ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                          {isIn ? "+" : "-"}{formatRupiah(tx.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : visibleTxs.length === 0 ? (
              <div className="rounded-[20px] p-10 text-center" style={{ backgroundColor: "var(--app-card)" }}>
                <span className="text-[36px] block mb-2">📋</span>
                <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "Belum ada transaksi", "No transactions yet")}
                </p>
              </div>
            ) : visibleTxs.map(tx => {
              const acc = accounts.find(a => a.id === tx.bankAccountId);
              const isIn = tx.type === "credit" || tx.type === "transfer_in";
              const totalDeducted = tx.amount + (tx.adminFee || 0);
              return (
                <div key={tx.id} className="rounded-[18px] p-4 border"
                  style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="size-10 rounded-full flex items-center justify-center text-[18px] shrink-0"
                        style={{ backgroundColor: "var(--app-card2)" }}>
                        {tx.type === "credit" ? "💰" : tx.type === "transfer_out" ? "↗️" : "💸"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] truncate" style={{ color: "var(--app-text)" }}>
                          {tx.type === "transfer_out"
                            ? `→ ${tx.transferToName || tx.transferToBank || L(lang, "Bank Lain", "Other Bank")}`
                            : tx.category}
                        </p>
                        <p className="font-['Inter'] text-[10px]" style={{ color: "var(--app-text2)" }}>
                          {acc?.bankName} · {fmtDate(tx.date)} {fmtTime(tx.date)}
                        </p>
                        {tx.notes && <p className="font-['Inter'] text-[10px] italic truncate" style={{ color: "var(--app-text2)" }}>{tx.notes}</p>}
                        {tx.adminFee > 0 && (
                          <p className="font-['Inter'] text-[10px] text-[#fbbf24]">
                            {L(lang, "Admin", "Fee")}: {formatRupiah(tx.adminFee)} · {L(lang, "Total potong", "Total")}: {formatRupiah(totalDeducted)}
                          </p>
                        )}
                        {tx.transferToBank && tx.type === "transfer_out" && (
                          <p className="font-['Inter'] text-[10px]" style={{ color: "var(--app-text2)" }}>
                            {tx.transferToBank} {tx.transferToNumber ? `· ${tx.transferToNumber}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-['Plus_Jakarta_Sans'] font-bold text-[14px] ${isIn ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                        {isIn ? "+" : "-"}{formatRupiah(tx.amount)}
                      </p>
                      <button onClick={() => { deleteBankTransaction(tx.id); void crudDeleteSuccess(); }}
                        className="mt-1 p-1 rounded-full" style={{ backgroundColor: "rgba(255,100,100,0.08)" }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#ff6464" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {tx.receiptImageUrl && (
                    <img src={tx.receiptImageUrl} alt="receipt" className="mt-3 w-full rounded-[12px] object-cover max-h-[140px]" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB: CONTACTS ── */}
        {tab === "contacts" && (
          <div className="space-y-3">
            {contacts.length === 0 ? (
              <div className="rounded-[20px] p-10 text-center" style={{ backgroundColor: "var(--app-card)" }}>
                <span className="text-[36px] block mb-2">👥</span>
                <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "Belum ada kontak", "No contacts yet")}
                </p>
                <p className="font-['Inter'] text-[11px] mt-1" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "Tersimpan otomatis saat transfer ke orang lain", "Auto-saved when you transfer to others")}
                </p>
              </div>
            ) : contacts.map(c => (
              <div key={c.id} className="rounded-[18px] p-4 flex items-center justify-between border"
                style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[rgba(78,222,163,0.12)] flex items-center justify-center font-black text-[16px] text-[#4edea3]">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>{c.name}</p>
                    <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>{c.bankName} · {c.accountNumber}</p>
                  </div>
                </div>
                <button onClick={() => deleteTransferContact(c.id)}
                  className="p-1.5 rounded-full" style={{ backgroundColor: "rgba(255,100,100,0.1)" }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#ff6464" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: Tambah Rekening ── */}
      {showAddAccount && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowAddAccount(false)}>
          <div className="w-full max-w-[400px] rounded-[28px] p-5 shadow-2xl mb-4 space-y-4 overflow-y-auto"
            style={{ backgroundColor: "var(--app-card)", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]" style={{ color: "var(--app-text)" }}>
              🏦 {L(lang, "Tambah Rekening", "Add Account")}
            </h2>
            <div>
              <label className="font-['Inter'] text-[10px] uppercase tracking-wider font-bold mb-2 block" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Pilih Bank", "Select Bank")}
              </label>
              <div className="relative bank-dropdown">
                <button
                  type="button"
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className="w-full h-[44px] px-4 rounded-[12px] flex items-center justify-between text-[13px] font-['Inter']"
                  style={{ backgroundColor: "var(--app-card2)", border: "1px solid var(--app-border)", color: accBankName ? "var(--app-text)" : "var(--app-text2)" }}
                >
                  <span>
                    {accBankName ? (
                      (() => {
                        const custom = customBanks.find(c => c.name === accBankName);
                        if (custom) return `${accBankName} (${custom.digits} digits)`;
                        if (!BANK_PRESETS.includes(accBankName) && accCustomDigits) return `${accBankName} (${accCustomDigits} digits)`;
                        return accBankName;
                      })()
                    ) : L(lang, "Pilih bank...", "Select bank...")}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showBankDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showBankDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-[12px] border z-50 max-h-[200px] overflow-y-auto"
                    style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                    <div className="sticky top-0 p-2 border-b" style={{ borderColor: "var(--app-border)" }}>
                      <input
                        type="text"
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        placeholder={L(lang, "Cari...", "Search...")}
                        className="w-full h-[36px] px-3 rounded-[8px] bg-[var(--app-card)] border text-[13px] outline-none"
                        style={{ borderColor: "var(--app-border)", color: "var(--app-text)" }}
                        autoFocus
                      />
                    </div>
                    {filteredBanks.map(b => (
                      <button key={b} type="button"
                        onClick={() => { setAccBankName(b); setBankSearch(""); setShowBankDropdown(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-[var(--app-card)] transition-colors"
                        style={{ color: "var(--app-text)" }}>
                        {b}
                      </button>
                    ))}
                    {bankSearch && !allBanks.some(b => b.toLowerCase() === bankSearch.toLowerCase()) && (
                      <button type="button"
                        onClick={() => {
                          setAccBankName(bankSearch.trim());
                          setAccCustomDigits("10"); // set default digits when adding new
                          setBankSearch("");
                          setShowBankDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[var(--app-card)] transition-colors"
                        style={{ color: "var(--app-text)" }}>
                        + {L(lang, "Tambah", "Add")} "{bankSearch}"
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {accBankName && !BANK_PRESETS.includes(accBankName) && !customBanks.some(c => c.name === accBankName) && (
              <div>
                <label className="font-['Inter'] text-[10px] uppercase tracking-wider font-bold mb-1 block" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "Jumlah Digit No. Rekening", "Account Number Digits")}
                </label>
                <input type="number" value={accCustomDigits} onChange={e => setAccCustomDigits(e.target.value)}
                  placeholder="10" disabled={!(accBankName && !BANK_PRESETS.includes(accBankName) && !customBanks.some(c => c.name === accBankName))}
                  className="w-full h-[44px] px-3 rounded-[12px] outline-none border font-['Inter'] text-[13px]"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-['Inter'] text-[10px] uppercase tracking-wider font-bold mb-1 block" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "No. Rekening", "Account No.")}
                </label>
                <input value={accNumber} onChange={e => setAccNumber(formatAccountNumber(e.target.value, accBankName))} placeholder="1234567890" disabled={!accBankName}
                  className="w-full h-[44px] px-3 rounded-[12px] outline-none border font-['Inter'] text-[13px]"
                  style={{ backgroundColor: !accBankName ? "var(--app-card)" : "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              </div>
              <div>
                <label className="font-['Inter'] text-[10px] uppercase tracking-wider font-bold mb-1 block" style={{ color: "var(--app-text2)" }}>
                  {L(lang, "Nama Pemilik", "Owner Name")}
                </label>
                <input value={accOwner} onChange={e => setAccOwner(e.target.value)}
                  placeholder={L(lang, "Nama lengkap", "Full name")}
                  className="w-full h-[44px] px-3 rounded-[12px] outline-none border font-['Inter'] text-[13px]"
                  style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              </div>
            </div>
            {/* Saldo Awal */}
            <div>
              <label className="font-['Inter'] text-[10px] uppercase tracking-wider font-bold mb-1 block" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Saldo Awal (Rp)", "Initial Balance (Rp)")}
              </label>
              <input type="number" value={accInitialBalance} onChange={e => setAccInitialBalance(e.target.value)}
                placeholder="0"
                className="w-full h-[44px] px-4 rounded-[12px] outline-none border font-['Inter'] text-[14px]"
                style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
              <p className="font-['Inter'] text-[10px] mt-1" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Masukkan saldo saat ini di rekening ini", "Enter your current balance in this account")}
              </p>
            </div>
            <div className="flex gap-2">
              {(["Tabungan","Giro","Deposito"] as BankAccount["type"][]).map(tp => (
                <button key={tp} onClick={() => setAccType(tp)}
                  className="flex-1 py-2 rounded-full text-[11px] font-bold transition-all"
                  style={{ backgroundColor: accType === tp ? "#10B981" : "var(--app-card2)", color: accType === tp ? "#fff" : "var(--app-text2)" }}>
                  {tp}
                </button>
              ))}
            </div>
            <div>
              <label className="font-['Inter'] text-[10px] uppercase tracking-wider font-bold mb-2 block" style={{ color: "var(--app-text2)" }}>
                {L(lang, "Warna Kartu", "Card Color")}
              </label>
              <div className="flex gap-2">
                {BANK_COLORS.map((c, i) => (
                  <button key={c} onClick={() => setAccColorIdx(i)}
                    className="size-7 rounded-full transition-all"
                    style={{ backgroundColor: c, outline: accColorIdx === i ? `3px solid ${c}` : "none", outlineOffset: "2px", transform: accColorIdx === i ? "scale(1.2)" : "scale(1)" }} />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddAccount(false)}
                className="flex-1 h-[48px] rounded-[14px] font-bold text-[14px]"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                {L(lang, "Batal", "Cancel")}
              </button>
              <button onClick={handleAddAccount}
                className="flex-1 h-[48px] rounded-[14px] font-bold text-[14px] text-[#003824]"
                style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)" }}>
                {L(lang, "Simpan", "Save")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
