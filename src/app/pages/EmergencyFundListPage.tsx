import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getEmergencyFunds, formatRupiah, type EmergencyFund } from "../store/database";
import { useLang } from "../i18n";

export default function EmergencyFundListPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const [funds, setFunds] = useState<EmergencyFund[]>([]);

  useEffect(() => {
    const refresh = () => setFunds(getEmergencyFunds());
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("luminary_data_change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className="w-full min-h-screen flex justify-center pb-28" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/app")}
            className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
              🚨 {L("Dana Darurat", "Emergency Funds")}
            </h1>
            <p className="font-['Inter'] text-[11px]" style={{ color: "var(--app-text2)" }}>
              {L("Lihat & kelola dana darurat", "View & manage emergency funds")}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/app/emergency-funds/new")}
          className="w-full h-[50px] rounded-[18px] font-['Plus_Jakarta_Sans'] font-extrabold text-[14px] text-white active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
        >
          + {L("Tambah Dana Darurat", "Add Emergency Fund")}
        </button>

        {funds.length > 0 ? (
          <div className="space-y-3">
            {funds.map(fund => (
              <div key={fund.id} className="rounded-[24px] p-5 border"
                style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]" style={{ color: "var(--app-text)" }}>
                      🚨 {fund.name}
                    </p>
                    <p className="font-['Inter'] text-[10px] uppercase tracking-wider mt-2" style={{ color: "rgba(239,68,68,0.7)" }}>
                      {L("Dana Terkumpul", "Saved")}
                    </p>
                    <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[24px]" style={{ color: "var(--app-text)" }}>
                      {formatRupiah(fund.savedAmount)}
                    </p>
                    <p className="font-['Inter'] text-[11px] mt-1" style={{ color: "var(--app-text2)" }}>
                      {L("Target", "Target")}: {formatRupiah(fund.targetAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]"
                      style={{ color: fund.savedAmount >= fund.targetAmount ? "#4edea3" : "#ef4444" }}>
                      {fund.targetAmount > 0 ? Math.min(100, Math.round((fund.savedAmount / fund.targetAmount) * 100)) : 0}%
                    </p>
                  </div>
                </div>

                <div className="h-2 rounded-full overflow-hidden mt-4" style={{ backgroundColor: "var(--app-card2)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${fund.targetAmount > 0 ? Math.min(100, (fund.savedAmount / fund.targetAmount) * 100) : 0}%`,
                      background: fund.savedAmount >= fund.targetAmount
                        ? "linear-gradient(90deg,#4edea3,#04b4a2)"
                        : "linear-gradient(90deg,#ef4444,#fca5a5)",
                    }} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={() => navigate(`/app/emergency-funds/${fund.id}`)}
                    className="h-[46px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] border active:scale-95 transition-all"
                    style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
                  >
                    {L("Detail", "Details")}
                  </button>
                  <button
                    onClick={() => navigate(`/app/emergency-funds/${fund.id}?topup=1`)}
                    className="h-[46px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-bold text-[13px] text-white active:scale-95 transition-all"
                    style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
                  >
                    {L("Tambah Dana", "Add Funds")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] p-8 border text-center"
            style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
            <div className="size-16 rounded-full bg-[#ef4444]/15 flex items-center justify-center text-[32px] mx-auto mb-3">🚨</div>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px]" style={{ color: "var(--app-text)" }}>
              {L("Belum ada Dana Darurat", "No Emergency Fund yet")}
            </p>
            <p className="font-['Inter'] text-[12px] mt-1" style={{ color: "var(--app-text2)" }}>
              {L("Buat dana darurat untuk jaga-jaga situasi tak terduga.", "Create an emergency fund for unexpected situations.")}
            </p>
            <button
              onClick={() => navigate("/app/emergency-funds/new")}
              className="mt-5 w-full h-[48px] rounded-[16px] font-['Plus_Jakarta_Sans'] font-extrabold text-[14px] text-white active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
            >
              {L("Buat Dana Darurat", "Create Emergency Fund")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

