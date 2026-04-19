import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { getUser } from "../store/database";
import { useLang, t } from "../i18n";

const AVATAR_KEY = "luminary_avatar";

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
  const fileRef = useRef<HTMLInputElement>(null);
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
      setUserAvatar(localStorage.getItem(AVATAR_KEY) || "");
    };
    refresh();
    window.addEventListener("luminary_data_change", refresh);
    return () => window.removeEventListener("luminary_data_change", refresh);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setUserAvatar(result);
      localStorage.setItem(AVATAR_KEY, result);
      window.dispatchEvent(new CustomEvent("luminary_data_change", { detail: { key: AVATAR_KEY } }));
    };
    reader.readAsDataURL(file);
  };

  const initials = userName
    ? userName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "👤";

  const L = (val: string, en: string) => lang === "en" ? en : val;

  return (
    <div className="w-full min-h-screen flex justify-center pb-32 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-10">
        <h1 id="tour-account-header" className="font-['Plus_Jakarta_Sans'] font-extrabold text-[24px] mb-6"
          style={{ color: "var(--app-text)" }}>{t("account", lang)}</h1>

        {/* Profile Card dengan foto yang bisa diklik */}
        <div id="tour-account-profile" className="mb-8">
          <SettingsSection title={L("PROFIL", "PROFILE")}>
            <div className="flex items-center gap-4 p-4">
              {/* Avatar — klik untuk ganti foto */}
              <div className="relative shrink-0">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="relative size-[72px] rounded-[20px] border-2 overflow-hidden flex items-center justify-center transition-all active:scale-95 group"
                  style={{ backgroundColor: "rgba(78,222,163,0.1)", borderColor: "rgba(78,222,163,0.3)" }}
                  title={L("Ganti foto profil", "Change profile photo")}
                >
                  {userAvatar ? (
                    <img src={userAvatar} alt="avatar" className="size-full object-cover" />
                  ) : (
                    <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[24px] text-[#4edea3]">
                      {initials}
                    </span>
                  )}
                  {/* Overlay saat hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  </div>
                </button>
                {/* Camera badge */}
                <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-[#4edea3] flex items-center justify-center shadow-md pointer-events-none">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#003824" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  </svg>
                </div>
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

              <div className="flex-1 min-w-0">
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] truncate"
                  style={{ color: "var(--app-text)" }}>{userName || "User"}</p>
                <p className="font-['Inter'] text-[12px] truncate"
                  style={{ color: "var(--app-text2)" }}>{userEmail || userPhone || L("Belum diisi", "Not set")}</p>
                <p className="font-['Inter'] text-[10px] mt-1" style={{ color: "#4edea3" }}>
                  {L("Tap foto untuk ganti", "Tap photo to change")}
                </p>
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
