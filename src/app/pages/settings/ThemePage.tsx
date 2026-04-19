import { useNavigate } from "react-router";
import { useState } from "react";
import { getSettings, saveSettings } from "../../store/database";
import { useLang, t } from "../../i18n";
const themes = [
  {
    id: "dark",
    nameKey: "darkTheme" as const,
    descKey: "darkThemeDesc" as const,
    preview: "🌙",
    bg: "#0b1326",
    card: "#131b2e",
    text: "#dae2fd",
  },
  {
    id: "light",
    nameKey: "lightTheme" as const,
    descKey: "lightThemeDesc" as const,
    preview: "☀️",
    bg: "#f0faf6",
    card: "#ffffff",
    text: "#0d2b1f",
  },
];

export default function ThemePage() {
  const navigate = useNavigate();
  const lang = useLang();
  const [selected, setSelected] = useState(getSettings().theme || "dark");

  const handleSelect = (id: string) => {
    setSelected(id);
    saveSettings({ theme: id });
  };

  const current = themes.find(th => th.id === selected) ?? themes[0];

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
            {t("themeTitle", lang)}
          </h1>
        </div>

        <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
          {t("themeDesc", lang)}
        </p>

        <div className="space-y-3">
          {themes.map(theme => (
            <button key={theme.id} onClick={() => handleSelect(theme.id)}
              className="w-full rounded-[20px] p-5 flex items-center gap-4 active:scale-[0.98] transition-all"
              style={{
                backgroundColor: "var(--app-card)",
                border: selected === theme.id ? "2px solid #4edea3" : "2px solid var(--app-border)",
                boxShadow: selected === theme.id ? "0 0 20px rgba(78,222,163,0.15)" : "none",
              }}>
              {/* Mini preview */}
              <div className="size-[60px] rounded-[14px] overflow-hidden shrink-0 flex flex-col border"
                style={{ backgroundColor: theme.bg, borderColor: "rgba(0,0,0,0.1)" }}>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[24px]">{theme.preview}</span>
                </div>
                <div className="h-2.5 mx-2 mb-2 rounded-full" style={{ backgroundColor: theme.card, border: "1px solid rgba(0,0,0,0.08)" }} />
              </div>

              <div className="flex-1 text-left">
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]"
                  style={{ color: "var(--app-text)" }}>
                  {t(theme.nameKey, lang)}
                </p>
                <p className="font-['Inter'] text-[12px] mt-0.5"
                  style={{ color: "var(--app-text2)" }}>
                  {t(theme.descKey, lang)}
                </p>
              </div>

              <div className="size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{ borderColor: selected === theme.id ? "#4edea3" : "#2d3449" }}>
                {selected === theme.id && <div className="size-2.5 rounded-full bg-[#4edea3]" />}
              </div>
            </button>
          ))}
        </div>

        {/* Active indicator */}
        <div className="rounded-[14px] p-4 flex items-center gap-3"
          style={{ backgroundColor: "rgba(78,222,163,0.06)", border: "1px solid rgba(78,222,163,0.15)" }}>
          <span className="text-[18px]">{current.preview}</span>
          <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
            {t("activeTheme", lang)}: <span className="text-[#4edea3] font-semibold">{t(current.nameKey, lang)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
