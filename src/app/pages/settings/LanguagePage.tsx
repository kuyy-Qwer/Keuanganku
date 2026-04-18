import { useNavigate } from "react-router";
import { useState } from "react";
import { getSettings, saveSettings } from "../../store/database";
import { useLang, t } from "../../i18n";

const languages = [
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩", native: "Indonesia" },
  { code: "en", name: "English", flag: "🇬🇧", native: "English" },
];

export default function LanguagePage() {
  const navigate = useNavigate();
  const lang = useLang();
  const [selected, setSelected] = useState(getSettings().language || "id");

  const handleSelect = (code: string) => {
    setSelected(code);
    saveSettings({ language: code });
    // Force immediate re-read by all listeners
    window.dispatchEvent(new CustomEvent("luminary_data_change", { detail: { key: "luminary_settings" } }));
  };

  const current = languages.find(l => l.code === selected) ?? languages[0];

  return (
    <div className="w-full min-h-screen flex justify-center pb-28 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/app/account")}
            className="p-2 rounded-full transition-colors"
            style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2}
              stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]"
            style={{ color: "var(--app-text)" }}>
            {t("languageTitle", lang)}
          </h1>
        </div>

        {/* Current badge */}
        <div className="rounded-[14px] p-4 flex items-center gap-3"
          style={{ backgroundColor: "rgba(78,222,163,0.06)", border: "1px solid rgba(78,222,163,0.15)" }}>
          <span className="text-[26px]">{current.flag}</span>
          <div>
            <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
              {t("activeLanguage", lang)}
            </p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-[#4edea3]">
              {current.name}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: "var(--app-card)" }}>
          {languages.map((l, i) => (
            <button key={l.code} onClick={() => handleSelect(l.code)}
              className="flex items-center justify-between p-5 w-full transition-colors"
              style={{
                borderTop: i > 0 ? "1px solid var(--app-border)" : "none",
              }}>
              <div className="flex items-center gap-4">
                <span className="text-[28px]">{l.flag}</span>
                <div className="text-left">
                  <p className="font-['Inter'] font-semibold text-[15px]"
                    style={{ color: "var(--app-text)" }}>{l.name}</p>
                  <p className="font-['Inter'] text-[11px]"
                    style={{ color: "var(--app-text2)" }}>{l.native}</p>
                </div>
              </div>
              <div className="size-5 rounded-full border-2 flex items-center justify-center transition-all"
                style={{ borderColor: selected === l.code ? "#4edea3" : "#2d3449" }}>
                {selected === l.code && <div className="size-2.5 rounded-full bg-[#4edea3]" />}
              </div>
            </button>
          ))}
        </div>

        <p className="font-['Inter'] text-[12px] text-center" style={{ color: "var(--app-text2)" }}>
          {t("languageNote", lang)}
        </p>
      </div>
    </div>
  );
}
