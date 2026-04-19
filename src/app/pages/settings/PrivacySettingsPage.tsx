import { useNavigate } from "react-router";
import { useState } from "react";
import { getSettings, saveSettings, type AppSettings } from "../../store/database";
import { useLang, t } from "../../i18n";
export default function PrivacySettingsPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const [settings, setSettings] = useState<AppSettings["privacy"]>(getSettings().privacy);

  const items: { key: keyof AppSettings["privacy"]; label: string; desc: string; icon: string }[] = [
    { key: "showBalance",  label: t("showBalance", lang),  desc: t("showBalanceDesc", lang),  icon: "👁️" },
    { key: "twoFactor",    label: t("twoFactor", lang),    desc: t("twoFactorDesc", lang),    icon: "🔑" },
    { key: "loginAlerts",  label: t("loginAlerts", lang),  desc: t("loginAlertsDesc", lang),  icon: "🔔" },
    { key: "shareData",    label: t("shareData", lang),    desc: t("shareDataDesc", lang),    icon: "📊" },
  ];

  const toggle = (key: keyof AppSettings["privacy"]) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveSettings({ privacy: updated });
  };

  return (
    <div className="w-full min-h-screen flex justify-center pb-28 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">

        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/app/account")}
            className="p-2 rounded-full transition-colors" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]" style={{ color: "var(--app-text)" }}>
            {t("privacyTitle", lang)}
          </h1>
        </div>

        <div className="rounded-[14px] p-4 flex gap-3 border border-[rgba(78,222,163,0.12)]"
          style={{ backgroundColor: "rgba(78,222,163,0.05)" }}>
          <span className="text-[18px]">🛡️</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed" style={{ color: "var(--app-text2)" }}>
            {t("privacyDesc", lang)}
          </p>
        </div>

        <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: "var(--app-card)" }}>
          {items.map((item, i) => {
            const isUnavailable = ["twoFactor", "loginAlerts", "shareData"].includes(item.key);
            return (
              <div key={item.key}
                className={`flex items-center justify-between p-5 ${i > 0 ? "border-t" : ""} ${isUnavailable ? "opacity-50" : ""}`}
                style={{ borderColor: "var(--app-border)" }}>
                <div className="flex items-center gap-4 flex-1 mr-4">
                  <div className="size-[38px] rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--app-card2)" }}>
                    <span className="text-[16px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-['Inter'] font-medium text-[15px]" style={{ color: "var(--app-text)" }}>
                      {item.label}
                      {isUnavailable && (
                        <span className="block text-[9px] text-[#ffb4ab] font-black uppercase mt-0.5 tracking-wider">
                          {L("Fitur ini belum tersedia", "Feature not available yet")}
                        </span>
                      )}
                    </p>
                    <p className="font-['Inter'] text-[11px] mt-0.5" style={{ color: "var(--app-text2)" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isUnavailable && toggle(item.key)}
                  disabled={isUnavailable}
                  className={`w-[48px] h-[24px] rounded-full transition-all duration-200 relative shrink-0 ${isUnavailable ? "cursor-not-allowed" : ""}`}
                  style={{ backgroundColor: settings[item.key] && !isUnavailable ? "#4edea3" : "var(--app-card2)" }}>
                  <div className="size-4 rounded-full absolute top-1 transition-all duration-200"
                    style={{
                      backgroundColor: settings[item.key] && !isUnavailable ? "#003824" : "#64748b",
                      left: settings[item.key] && !isUnavailable ? "28px" : "4px",
                    }} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
