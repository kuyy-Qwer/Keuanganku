import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useLang, t } from "../../i18n";

interface BankAccount {
  id: string;
  name: string;
  number: string;
  type: string;
  color: string;
}

const STORAGE_KEY = "luminary_linked_banks";

const DEFAULT_BANKS: BankAccount[] = [
  { id: "1", name: "BCA",     number: "••• •••• 4521", type: "Tabungan", color: "#0060AF" },
  { id: "2", name: "Mandiri", number: "••• •••• 8837", type: "Giro",     color: "#003876" },
];

function getBanks(): BankAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BankAccount[];
  } catch { /* ignore */ }
  return DEFAULT_BANKS;
}

function saveBanks(banks: BankAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banks));
}

export default function LinkedBanksPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [bankType, setBankType] = useState("Tabungan");

  useEffect(() => { setBanks(getBanks()); }, []);

  const BANK_TYPES = [
    { id: "Tabungan",  label: t("bankSavings", lang) },
    { id: "Giro",      label: t("bankGiro", lang) },
    { id: "Deposito",  label: t("bankDeposit", lang) },
  ];

  const handleAdd = () => {
    if (!bankName.trim() || !bankNumber.trim()) return;
    const colors = ["#0060AF", "#003876", "#F05A22", "#E31837", "#009A44", "#FF6600"];
    const newBank: BankAccount = {
      id: crypto.randomUUID(),
      name: bankName.trim().toUpperCase(),
      number: bankNumber.trim(),
      type: bankType,
      color: colors[banks.length % colors.length],
    };
    const updated = [...banks, newBank];
    setBanks(updated);
    saveBanks(updated);
    setBankName(""); setBankNumber(""); setBankType("Tabungan"); setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const updated = banks.filter(b => b.id !== id);
    setBanks(updated);
    saveBanks(updated);
  };

  return (
    <div className="w-full min-h-screen flex justify-center pb-28 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/app/account")}
            className="p-2 rounded-full transition-colors" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
            {t("linkedBanksTitle", lang)}
          </h1>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="rounded-[20px] p-5 border space-y-4"
            style={{ backgroundColor: "var(--app-card)", borderColor: "rgba(78,222,163,0.15)" }}>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>
              {t("addBank", lang)}
            </p>
            <div>
              <p className="font-['Inter'] font-semibold text-[10px] tracking-[2px] uppercase mb-2" style={{ color: "var(--app-text2)" }}>
                {t("bankName", lang)}
              </p>
              <div className="rounded-[14px] border" style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                <input value={bankName} onChange={e => setBankName(e.target.value)}
                  placeholder={t("bankNamePH", lang)}
                  className="w-full bg-transparent px-4 py-3 font-['Inter'] text-[14px] outline-none"
                  style={{ color: "var(--app-text)" }} />
              </div>
            </div>
            <div>
              <p className="font-['Inter'] font-semibold text-[10px] tracking-[2px] uppercase mb-2" style={{ color: "var(--app-text2)" }}>
                {t("bankNumber", lang)}
              </p>
              <div className="rounded-[14px] border" style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
                <input value={bankNumber} onChange={e => setBankNumber(e.target.value)}
                  placeholder={t("bankNumberPH", lang)} type="text"
                  className="w-full bg-transparent px-4 py-3 font-['Inter'] text-[14px] outline-none"
                  style={{ color: "var(--app-text)" }} />
              </div>
            </div>
            <div>
              <p className="font-['Inter'] font-semibold text-[10px] tracking-[2px] uppercase mb-2" style={{ color: "var(--app-text2)" }}>
                {t("bankType", lang)}
              </p>
              <div className="flex gap-2">
                {BANK_TYPES.map(bt => (
                  <button key={bt.id} onClick={() => setBankType(bt.id)}
                    className="flex-1 py-2 rounded-full font-['Inter'] font-semibold text-[12px] transition-all"
                    style={{
                      backgroundColor: bankType === bt.id ? "rgba(78,222,163,0.15)" : "var(--app-card2)",
                      color: bankType === bt.id ? "#4edea3" : "var(--app-text2)",
                      border: bankType === bt.id ? "1px solid rgba(78,222,163,0.3)" : "1px solid transparent",
                    }}>
                    {bt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-[14px] font-['Inter'] font-semibold text-[13px]"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)" }}>
                {t("cancel", lang)}
              </button>
              <button onClick={handleAdd}
                className="flex-1 py-3 rounded-[14px] bg-[#00d18b] font-['Inter'] font-semibold text-[13px] text-[#060e20]">
                {t("add", lang)}
              </button>
            </div>
          </div>
        )}

        {/* Bank List */}
        <div className="space-y-3">
          {banks.map(bank => (
            <div key={bank.id} className="rounded-[20px] p-5 flex items-center justify-between"
              style={{ backgroundColor: "var(--app-card)" }}>
              <div className="flex items-center gap-4">
                <div className="size-[44px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: bank.color + "25" }}>
                  <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[15px]"
                    style={{ color: bank.color }}>{bank.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]" style={{ color: "var(--app-text)" }}>
                    {bank.name}
                  </p>
                  <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                    {bank.number} · {bank.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[rgba(78,222,163,0.1)] px-2.5 py-1 rounded-full">
                  <span className="font-['Inter'] font-semibold text-[10px] text-[#4edea3] uppercase">
                    {t("bankActive", lang)}
                  </span>
                </div>
                <button onClick={() => handleDelete(bank.id)}
                  className="bg-[rgba(255,180,171,0.1)] rounded-full p-1.5 active:scale-90 transition-transform">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#ffb4ab" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {banks.length === 0 && (
            <div className="rounded-[20px] p-8 text-center" style={{ backgroundColor: "var(--app-card)" }}>
              <span className="text-[36px] block mb-3">🏦</span>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] mb-1" style={{ color: "var(--app-text)" }}>
                {t("noBanks", lang)}
              </p>
              <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                {t("noBanksDesc", lang)}
              </p>
            </div>
          )}
        </div>

        {!showAdd && (
          <button onClick={() => setShowAdd(true)}
            className="w-full rounded-[16px] py-4 border border-dashed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--app-card)", borderColor: "rgba(78,222,163,0.3)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4edea3" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="font-['Inter'] font-semibold text-[14px] text-[#4edea3]">
              {t("addBank", lang)}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
