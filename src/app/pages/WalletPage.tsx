import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  getLockedSavings, getTotalLocked, getSettings, formatRupiah,
  type LockedSaving,
} from "../store/database";
import { useLang } from "../i18n";

export default function WalletPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const [savings, setSavings] = useState<LockedSaving[]>([]);
  const [totalLocked, setTotalLocked] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const refresh = () => {
      setSavings(getLockedSavings());
      setTotalLocked(getTotalLocked());
      setShowBalance(getSettings().privacy.showBalance);
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("luminary_data_change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const L = (id: string, en: string) => lang === "en" ? en : id;
  const activeSavings = savings.filter(s => !s.isWithdrawn && !s.isForcedOut);
  const displayedSavings = activeSavings.slice(0, 3);
  const isLocked = (s: LockedSaving) => new Date(s.unlockAt) > new Date();
  const progress = (s: LockedSaving) => s.targetAmount > 0 ? Math.min((s.savedAmount / s.targetAmount) * 100, 100) : 0;

  return (
    <div className="w-full min-h-screen flex justify-center pb-32" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-14 space-y-6">

        {/* Header */}
        <div id="tour-wallet-header" className="flex items-center justify-between">
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[22px]" style={{ color: "var(--app-text)" }}>
            🏦 {L("Dompet", "Wallet")}
          </h1>
          <button onClick={() => navigate("/app/savings")}
            className="p-3 rounded-full text-[#6ee7b7] hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.2)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>

        {/* Total Locked Card — mint on deep teal */}
        <div id="tour-wallet-summary" className="rounded-[28px] p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f2a2a 0%, #0d3535 55%, #0a2e2e 100%)",
            border: "1px solid rgba(110,231,183,0.18)",
            boxShadow: "0 20px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(110,231,183,0.08)"
          }}>
          {/* glow orbs */}
          <div className="absolute top-[-50px] right-[-50px] size-56 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(110,231,183,0.12) 0%, transparent 65%)" }} />
          <div className="absolute bottom-[-40px] left-[-40px] size-44 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 65%)" }} />

          <div className="space-y-1 mb-5 relative z-10">
            <p className="font-['Inter'] font-semibold text-[11px] tracking-[2px] uppercase"
              style={{ color: "rgba(167,243,208,0.55)" }}>
              {L("TOTAL DANA TERKUNCI", "TOTAL LOCKED FUNDS")}
            </p>
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold tracking-tighter transition-all duration-300"
              style={{
                color: "#a7f3d0",
                fontSize: !showBalance ? '34px' :
                  formatRupiah(totalLocked).length > 15 ? '22px' :
                  formatRupiah(totalLocked).length > 12 ? '26px' :
                  formatRupiah(totalLocked).length > 9 ? '30px' : '34px',
                textShadow: "0 0 28px rgba(110,231,183,0.2)"
              }}>
              {showBalance ? formatRupiah(totalLocked) : "Rp ••••••"}
            </h2>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex -space-x-2">
              {activeSavings.slice(0, 4).map(s => (
                <div key={s.id} className="size-8 rounded-full border-2 flex items-center justify-center text-[14px]"
                  style={{ borderColor: "rgba(110,231,183,0.2)", backgroundColor: "rgba(110,231,183,0.07)" }}>
                  {s.emoji}
                </div>
              ))}
              {activeSavings.length > 4 && (
                <div className="size-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                  style={{ borderColor: "#6ee7b7", backgroundColor: "#6ee7b7", color: "#022c22" }}>
                  +{activeSavings.length - 4}
                </div>
              )}
            </div>
            <p className="font-['Inter'] text-[12px]" style={{ color: "rgba(167,243,208,0.45)" }}>
              {activeSavings.length} {L("tabungan aktif", "active savings")}
            </p>
          </div>
        </div>

        {/* Savings List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase" style={{ color: "var(--app-text2)" }}>
              {L("Daftar Tabungan", "Savings List")}
            </p>
            <button onClick={() => navigate("/app/savings")} className="text-[#6ee7b7] text-[12px] font-bold hover:underline">
              {L("Kelola Semua", "Manage All")}
            </button>
          </div>

          {activeSavings.length === 0 ? (
            <div className="rounded-[24px] p-8 text-center border mt-2"
              style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
              <span className="text-[32px] block mb-2">💰</span>
              <p className="text-[14px] font-bold mb-4" style={{ color: "var(--app-text)" }}>{L("Belum ada tabungan aktif", "No active savings list")}</p>
              <button onClick={() => navigate("/app/savings")}
                className="px-6 py-2 rounded-full font-bold text-[12px]"
                style={{ backgroundColor: "#6ee7b7", color: "#022c22" }}>
                {L("Mulai Menabung", "Start Saving")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedSavings.map(s => (
                <button key={s.id} onClick={() => navigate(`/app/savings/${s.id}`)}
                  className="w-full rounded-[20px] p-4 border text-left transition-all duration-200 hover:shadow-[0_8px_24px_rgba(110,231,183,0.1)] hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl flex items-center justify-center text-[20px]"
                        style={{ backgroundColor: "var(--app-card2)" }}>{s.emoji}</div>
                      <div>
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]" style={{ color: "var(--app-text)" }}>{s.name}</p>
                        <p className="text-[10px]" style={{ color: "var(--app-text2)" }}>{formatRupiah(s.savedAmount)} / {formatRupiah(s.targetAmount)}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLocked(s) ? 'bg-[rgba(255,180,171,0.1)] text-[#ffb4ab]' : 'text-[#6ee7b7]'}`}
                      style={!isLocked(s) ? { backgroundColor: "rgba(110,231,183,0.1)" } : {}}>
                      {isLocked(s) ? L("Terkunci", "Locked") : L("Siap", "Ready")}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-card2)" }}>
                    <div className="h-full transition-all duration-700"
                      style={{ width: `${progress(s)}%`, background: "linear-gradient(90deg, #6ee7b7, #34d399)" }} />
                  </div>
                </button>
              ))}
              {activeSavings.length > 3 && (
                <button onClick={() => navigate("/app/savings")}
                  className="w-full py-3 text-center text-[12px] font-bold rounded-xl"
                  style={{ color: "#6ee7b7", border: "1px dashed rgba(110,231,183,0.3)" }}>
                  {L("Dan", "And")} {activeSavings.length - 3} {L("lainnya...", "more...")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rekomendasi AI Card — sage green, airy */}
        <div className="rounded-[28px] p-6 relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #134e3a 0%, #1a6b4a 45%, #0f4a35 100%)",
            border: "1px solid rgba(110,231,183,0.22)",
            boxShadow: "0 16px 40px rgba(15,74,53,0.5)"
          }}
          onClick={() => navigate("/app/discipline")}>
          <div className="absolute right-[-40px] top-[-40px] size-52 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500"
            style={{ background: "radial-gradient(circle, rgba(167,243,208,0.15) 0%, transparent 65%)" }} />
          <div className="absolute left-[-30px] bottom-[-30px] size-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 65%)" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(167,243,208,0.15)" }}>
                <span className="text-[14px]">⚖️</span>
              </div>
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(167,243,208,0.7)" }}>
                {L("DISCIPLINE MASTER", "DISCIPLINE MASTER")}
              </p>
            </div>
            <h3 className="text-[20px] font-extrabold leading-tight mb-1" style={{ color: "#d1fae5" }}>
              {L("Jaga reputasi keuanganmu", "Maintain your financial reputation")}
            </h3>
            <p className="text-[13px] mb-5" style={{ color: "rgba(209,250,229,0.6)" }}>
              {L("Pantau skor, strike, dan status cooling-off kamu.", "Track your score, strikes, and cooling-off status.")}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] font-bold text-[12px] transition-all duration-200 group-hover:shadow-[0_4px_20px_rgba(110,231,183,0.35)]"
              style={{ backgroundColor: "#6ee7b7", color: "#022c22" }}>
              {L("Lihat Status Disiplin", "View Discipline Status")} →
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
