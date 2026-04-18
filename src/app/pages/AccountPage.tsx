import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { getUser, getSettings } from "../store/database";
import { useLang, t } from "../i18n";

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[11px] tracking-[2px] uppercase mb-3 px-1"
        style={{ color: "var(--app-text2)" }}>{title}</p>
      <div className="rounded-[24px] border overflow-hidden"
        style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>{children}</div>
    </div>
  );
}

function SettingsButton({ icon, label, onClick, divider }: { icon: any, label: string, onClick: () => void, divider?: boolean }) {
  return (
    <>
      <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/5 active:scale-[0.98] transition-all group">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl flex items-center justify-center text-[18px] group-hover:scale-110 transition-transform"
            style={{ backgroundColor: "var(--app-card2)" }}>{icon}</div>
          <span className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]"
            style={{ color: "var(--app-text)" }}>{label}</span>
        </div>
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24"
          stroke="var(--app-text2)" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {divider && <div className="mx-4 h-[1px]" style={{ backgroundColor: "var(--app-border)" }} />}
    </>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    const refresh = () => {
      const u = getUser();
      setUserName(u.fullName);
      setUserEmail(u.email);
      setUserPhone(u.phone);
      setUserAvatar(localStorage.getItem("luminary_avatar") || "");
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  const L = (val: string, en: string) => lang === "en" ? en : val;

  return (
    <div className="w-full min-h-screen flex justify-center pb-32 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-10">
        <h1 id="tour-account-header" className="font-['Plus_Jakarta_Sans'] font-extrabold text-[24px] mb-6"
          style={{ color: "var(--app-text)" }}>{t("account", lang)}</h1>

        <div id="tour-account-profile">
        <SettingsSection title={L("PROFIL", "PROFILE")}>
          <div className="flex items-center gap-4 p-4">
            <div className="size-16 rounded-[20px] border border-[#4edea3]/20 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: "rgba(78,222,163,0.1)" }}>
              {userAvatar ? <img src={userAvatar} className="size-full object-cover" /> : <span className="text-[24px]">👤</span>}
            </div>
            <div>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[16px]"
                style={{ color: "var(--app-text)" }}>{userName || "User"}</p>
              <p className="font-['Inter'] text-[12px]"
                style={{ color: "var(--app-text2)" }}>{userEmail || userPhone || L("Belum diisi", "Not set")}</p>
            </div>
          </div>
        </SettingsSection>
        </div>

        <SettingsSection title={t("accountSection", lang)}>
          <SettingsButton icon="👤" label={t("personalInfo", lang)} onClick={() => navigate("/app/settings/personal")} />
          <SettingsButton icon="🏅" label={L("Pencapaian & Badge", "Achievements & Badges")} onClick={() => navigate("/app/achievements")} divider />
          <SettingsButton icon="📅" label={L("Kalender Belanja", "Spending Calendar")} onClick={() => navigate("/app/calendar")} divider />
          <SettingsButton icon="🏷️" label={t("manageCategories", lang)} onClick={() => navigate("/app/settings/categories")} divider />
          <SettingsButton icon="💾" label={L("Backup & Restore", "Backup & Restore")} onClick={() => navigate("/app/backup")} divider />
          <SettingsButton icon="📈" label={L("Insights", "Insights")} onClick={() => navigate("/app/insights")} divider />
          <SettingsButton icon="🏦" label={L("Aset Saya", "My Assets")} onClick={() => navigate("/app/assets")} divider />
          <SettingsButton icon="💳" label={L("Simulasi Bank", "Bank Simulation")} onClick={() => navigate("/app/bank-simulation")} divider />
          <SettingsButton icon="⚖️" label={L("Discipline Master", "Discipline Master")} onClick={() => navigate("/app/discipline")} divider />
        </SettingsSection>

        <SettingsSection title={t("securitySection", lang)}>
          <SettingsButton icon="🔒" label={t("changePin", lang)} onClick={() => navigate("/app/settings/pin")} />
          <SettingsButton icon="👁️" label={t("privacy", lang)} onClick={() => navigate("/app/settings/privacy")} divider />
        </SettingsSection>

        <SettingsSection title={t("preferencesSection", lang)}>
          <SettingsButton icon="🔔" label={t("notifications", lang)} onClick={() => navigate("/app/settings/notifications")} />
          <SettingsButton icon="🌐" label={t("language", lang)} onClick={() => navigate("/app/settings/language")} divider />
          <SettingsButton icon="🎨" label={t("theme", lang)} onClick={() => navigate("/app/settings/theme")} divider />
        </SettingsSection>

        <SettingsSection title={L("BANTUAN", "SUPPORT")}>
          <SettingsButton icon="❓" label={L("Pusat Bantuan", "Help Center")} onClick={() => navigate("/app/settings/help")} />
          <SettingsButton icon="📋" label={L("Syarat & Ketentuan", "Terms of Service")} onClick={() => navigate("/app/settings/terms")} divider />
        </SettingsSection>
      </div>
    </div>
  );
}
