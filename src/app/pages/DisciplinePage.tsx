import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  getDisciplineState, getFinancialScoreLabel, isInvestFrozen,
  getInvestFreezeHoursLeft, formatRupiah,
  type WithdrawalStrike, type DisciplineState,
} from "../store/database";
import { useLang } from "../i18n";

function ScoreRing({ score }: { score: number }) {
  const info = getFinancialScoreLabel(score);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center size-36">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={info.color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-[28px]">{info.emoji}</span>
        <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[28px] leading-none" style={{ color: info.color }}>{score}</p>
        <p className="font-['Inter'] text-[10px] font-bold uppercase tracking-wider" style={{ color: info.color }}>{info.label}</p>
      </div>
    </div>
  );
}

export default function DisciplinePage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const [state, setState] = useState<DisciplineState | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [freezeHours, setFreezeHours] = useState(0);

  const refresh = () => {
    setState(getDisciplineState());
    setFrozen(isInvestFrozen());
    setFreezeHours(getInvestFreezeHoursLeft());
  };

  useEffect(() => {
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  if (!state) return null;

  const scoreInfo = getFinancialScoreLabel(state.financialScore);
  const strikes = state.withdrawalStrikes ?? [];
  const strikeCount = strikes.length;
  const sisaSebelumPembekuan = Math.max(0, 5 - strikeCount);

  return (
    <div className="w-full min-h-screen flex justify-center pb-32" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
              ⚖️ {L("Disiplin Keuangan", "Financial Discipline")}
            </h1>
            <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              {L("Pantau reputasi dan kebiasaan keuanganmu", "Track your financial reputation and habits")}
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div className="rounded-[28px] p-6 border relative overflow-hidden"
          style={{ backgroundColor: "var(--app-card)", borderColor: `${scoreInfo.color}40`, boxShadow: `0 0 40px ${scoreInfo.color}15` }}>
          <div className="absolute top-0 right-0 size-40 rounded-full blur-[60px] opacity-10" style={{ backgroundColor: scoreInfo.color }} />
          <div className="flex items-center gap-6">
            <ScoreRing score={state.financialScore} />
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-['Inter'] text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--app-text2)" }}>
                  {L("Reputasi", "Reputation")}
                </p>
                <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]" style={{ color: scoreInfo.color }}>
                  {scoreInfo.emoji} {scoreInfo.label}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[12px] p-2.5" style={{ backgroundColor: "var(--app-card2)" }}>
                  <p className="font-['Inter'] text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--app-text2)" }}>
                    {L("Pelanggaran", "Violations")}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: strikeCount >= 4 ? "#ef4444" : strikeCount >= 2 ? "#fbbf24" : "#4edea3" }}>
                    {strikeCount}/5 {strikeCount >= 5 ? "🔴" : ""}
                  </p>
                </div>
                <div className="rounded-[12px] p-2.5" style={{ backgroundColor: "var(--app-card2)" }}>
                  <p className="font-['Inter'] text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--app-text2)" }}>
                    {L("Masa Jeda", "Pause Period")}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: frozen ? "#60a5fa" : "#4edea3" }}>
                    {frozen ? `🧊 ${freezeHours}${L("j", "h")}` : `✓ ${L("Bebas", "Clear")}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-card2)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${state.financialScore}%`, backgroundColor: scoreInfo.color }} />
            </div>
            <div className="flex justify-between text-[9px] mt-1.5">
              <span style={{ color: "#ef4444" }}>{L("Kritis", "Critical")} &lt;40</span>
              <span style={{ color: "#fb923c" }}>{L("Bahaya", "Danger")} &lt;60</span>
              <span style={{ color: "#fbbf24" }}>{L("Waspada", "Warning")} &lt;80</span>
              <span style={{ color: "#4edea3" }}>{L("Sehat", "Healthy")} ≥80</span>
            </div>
          </div>
        </div>

        {/* Masa Jeda banner */}
        {frozen && (
          <div className="rounded-[20px] p-4 border border-[rgba(96,165,250,0.3)]" style={{ backgroundColor: "rgba(96,165,250,0.08)" }}>
            <div className="flex items-center gap-3">
              <span className="text-[28px]">🧊</span>
              <div className="flex-1">
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-[#60a5fa]">
                  {L("Masa Jeda Aktif", "Pause Period Active")}
                </p>
                <p className="font-['Inter'] text-[12px] text-[#93c5fd]">
                  {L(`Sisa ${freezeHours} jam (${Math.ceil(freezeHours / 24)} hari) lagi`,
                     `${freezeHours} hours (${Math.ceil(freezeHours / 24)} days) remaining`)}
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-[12px] p-3" style={{ backgroundColor: "rgba(96,165,250,0.1)" }}>
              <p className="font-['Inter'] text-[11px] text-[#93c5fd]">
                💡 {L(
                  "Isi ulang dana darurat hingga ≥70% dari target untuk membuka masa jeda lebih cepat.",
                  "Top up your emergency fund to ≥70% of the target to end the pause period early."
                )}
              </p>
            </div>
          </div>
        )}

        {/* Progres Pelanggaran */}
        <div className="rounded-[20px] p-4 border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
              ⚡ {L("Batas Pelanggaran (5×)", "Violation Limit (5×)")}
            </p>
            <span className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              {strikeCount >= 5
                ? L("Masa jeda aktif", "Pause period active")
                : L(`${sisaSebelumPembekuan}× lagi → masa jeda`, `${sisaSebelumPembekuan} more → pause period`)}
            </span>
          </div>
          <div className="flex gap-2 mb-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex-1 h-3 rounded-full transition-all"
                style={{
                  backgroundColor: i <= strikeCount
                    ? (i >= 5 ? "#ef4444" : i >= 4 ? "#fb923c" : "#fbbf24")
                    : "var(--app-card2)",
                }} />
            ))}
          </div>
          <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
            {strikeCount === 0
              ? L("Belum ada pelanggaran. Pertahankan! 🎉", "No violations yet. Keep it up! 🎉")
              : strikeCount < 5
              ? L(`${strikeCount} pelanggaran tercatat. Pelanggaran ke-5 akan memicu masa jeda 5 hari.`,
                  `${strikeCount} violation(s) recorded. The 5th violation triggers a 5-day pause.`)
              : L("Pelanggaran ke-5 tercapai. Masa jeda 5 hari sedang berjalan.",
                  "5th violation reached. 5-day pause period is active.")}
          </p>
        </div>

        {/* Cara Naikkan Skor */}
        <div className="rounded-[20px] p-4 border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] mb-3" style={{ color: "var(--app-text)" }}>
            💡 {L("Cara Naikkan Skor", "How to Improve Your Score")}
          </p>
          <div className="space-y-2">
            {[
              ["🚨", L("Isi ulang dana darurat", "Top up emergency fund"), "+3 poin"],
              ["🎯", L("Capai target tabungan", "Reach savings goal"), "+5 poin"],
              ["✅", L("Tidak melanggar anggaran", "No budget violations"), L("+2 poin/bulan", "+2 pts/month")],
              ["📅", L("Awal bulan tanpa pelanggaran", "Month start with no violations"), "+5 poin"],
              ["🏆", L("Dana darurat 100% → Modal usaha", "Emergency fund 100% → Business capital"), L("+10 poin + reset pelanggaran", "+10 pts + reset violations")],
            ].map(([icon, text, gain]) => (
              <div key={text} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">{icon}</span>
                  <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>{text}</p>
                </div>
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[11px] text-[#4edea3]">{gain}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t space-y-1.5" style={{ borderColor: "var(--app-border)" }}>
            <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              ⚠️ {L("Tarik dana darurat tanpa alasan mendesak:", "Withdraw emergency fund without valid reason:")}{" "}
              <span className="text-[#fbbf24] font-bold">{L("-20 poin + 1 pelanggaran", "-20 pts + 1 violation")}</span>
            </p>
            <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              🧊 {L("Pelanggaran ke-5:", "5th violation:")}{" "}
              <span className="text-[#60a5fa] font-bold">
                {L("Masa jeda 5 hari (bukan denda uang)", "5-day pause period (no money penalty)")}
              </span>
            </p>
            <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              🔓 {L("Buka lebih cepat:", "Early unlock:")}{" "}
              <span className="text-[#4edea3] font-bold">
                {L("Isi ulang ≥70% target → masa jeda langsung berakhir", "Top up ≥70% of target → pause ends immediately")}
              </span>
            </p>
          </div>
        </div>

        {/* Riwayat Pelanggaran */}
        {strikes.length > 0 && (
          <div className="space-y-3">
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase" style={{ color: "var(--app-text2)" }}>
              📋 {L("Riwayat Pelanggaran", "Violation History")}
            </p>
            {[...strikes].reverse().map((strike: WithdrawalStrike, idx: number) => (
              <div key={strike.id} className="rounded-[16px] p-3 flex items-center justify-between border"
                style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full flex items-center justify-center font-bold text-[12px]"
                    style={{ backgroundColor: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
                    {strikes.length - idx}
                  </div>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px]" style={{ color: "var(--app-text)" }}>{strike.fundName}</p>
                    <p className="font-['Inter'] text-[10px] truncate max-w-[180px]" style={{ color: "var(--app-text2)" }}>{strike.reason}</p>
                    <p className="font-['Inter'] text-[10px]" style={{ color: "var(--app-text2)" }}>
                      {new Date(strike.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] text-[#fbbf24]">{formatRupiah(strike.amount)}</p>
              </div>
            ))}
          </div>
        )}

        {strikes.length === 0 && (
          <div className="rounded-[20px] p-6 text-center border" style={{ backgroundColor: "var(--app-card)", borderColor: "rgba(78,222,163,0.2)" }}>
            <span className="text-[40px] block mb-2">🎉</span>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]" style={{ color: "var(--app-text)" }}>
              {L("Tidak ada pelanggaran!", "No violations!")}
            </p>
            <p className="font-['Inter'] text-[12px] mt-1" style={{ color: "var(--app-text2)" }}>
              {L("Kamu disiplin. Pertahankan!", "You're disciplined. Keep it up!")}
            </p>
          </div>
        )}

        {/* Statistik */}
        <div className="rounded-[20px] p-4 border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] mb-3" style={{ color: "var(--app-text)" }}>
            📊 {L("Statistik", "Statistics")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              [L("Total Pelanggaran", "Total Violations"), `${strikeCount}×`, strikeCount >= 3 ? "#ef4444" : "#fbbf24"],
              [L("Pelanggaran Anggaran", "Budget Violations"), `${state.budgetViolationCount}×`, "#fbbf24"],
              [L("Total Tarik Paksa", "Total Force Withdrawals"), `${state.totalForcedWithdrawals}×`, state.totalForcedWithdrawals > 0 ? "#fb923c" : "#4edea3"],
              [L("Skor Saat Ini", "Current Score"), `${state.financialScore}/100`, scoreInfo.color],
            ].map(([label, val, color]) => (
              <div key={label} className="rounded-[14px] p-3" style={{ backgroundColor: "var(--app-card2)" }}>
                <p className="font-['Inter'] text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--app-text2)" }}>{label}</p>
                <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[15px]" style={{ color }}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pb-4">
          <button onClick={() => navigate("/app/emergency-funds")}
            className="w-full h-[48px] rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-white"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
            🚨 {L("Isi Ulang Dana Darurat", "Top Up Emergency Fund")}
          </button>
        </div>

      </div>
    </div>
  );
}
