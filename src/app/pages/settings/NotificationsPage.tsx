import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { getSettings, saveSettings, type AppSettings } from "../../store/database";
import { useLang, t } from "../../i18n";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const [settings, setSettings] = useState<AppSettings["notifications"]>(getSettings().notifications);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [requestingPermission, setRequestingPermission] = useState(false);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) return;
    setRequestingPermission(true);
    try {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
    } finally {
      setRequestingPermission(false);
    }
  };

  const items: { key: keyof AppSettings["notifications"]; label: string; desc: string; icon: string }[] = [
    { key: "transactions", label: t("notifTransactions", lang), desc: t("notifTransactionsDesc", lang), icon: "💸" },
    { key: "security",     label: t("notifSecurity", lang),     desc: t("notifSecurityDesc", lang),     icon: "🔐" },
    { key: "reminders",    label: t("notifReminders", lang),    desc: t("notifRemindersDesc", lang),    icon: "⏰" },
    { key: "promotions",   label: t("notifPromotions", lang),   desc: t("notifPromotionsDesc", lang),   icon: "🎁" },
    { key: "updates",      label: t("notifUpdates", lang),      desc: t("notifUpdatesDesc", lang),      icon: "📱" },
  ];

  const toggle = (key: keyof AppSettings["notifications"]) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveSettings({ notifications: updated });
  };

  const enabledCount = Object.values(settings).filter(Boolean).length;

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
            {t("notificationsTitle", lang)}
          </h1>
        </div>

        {/* Status izin notifikasi browser */}
        <div className="rounded-[18px] p-4 border"
          style={{
            backgroundColor: notifPermission === 'granted'
              ? "rgba(78,222,163,0.06)"
              : notifPermission === 'denied'
              ? "rgba(255,180,171,0.06)"
              : "rgba(251,191,36,0.06)",
            borderColor: notifPermission === 'granted'
              ? "rgba(78,222,163,0.2)"
              : notifPermission === 'denied'
              ? "rgba(255,180,171,0.2)"
              : "rgba(251,191,36,0.2)",
          }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[22px]">
                {notifPermission === 'granted' ? '🔔' : notifPermission === 'denied' ? '🔕' : '🔔'}
              </span>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px]" style={{ color: "var(--app-text)" }}>
                  {L("Izin Notifikasi Browser", "Browser Notification Permission")}
                </p>
                <p className="font-['Inter'] text-[11px] mt-0.5" style={{
                  color: notifPermission === 'granted' ? "#4edea3"
                    : notifPermission === 'denied' ? "var(--app-danger)"
                    : "#fbbf24"
                }}>
                  {notifPermission === 'granted'
                    ? L("✓ Diizinkan — notifikasi push aktif", "✓ Granted — push notifications active")
                    : notifPermission === 'denied'
                    ? L("✗ Ditolak — aktifkan di pengaturan browser", "✗ Denied — enable in browser settings")
                    : L("Belum diizinkan — tap untuk mengaktifkan", "Not granted — tap to enable")}
                </p>
              </div>
            </div>
            {notifPermission === 'default' && (
              <button
                onClick={handleRequestPermission}
                disabled={requestingPermission}
                className="shrink-0 rounded-[12px] px-3 py-2 font-['Plus_Jakarta_Sans'] font-bold text-[11px] transition-all active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#4edea3,#00b4a2)", color: "#003824" }}>
                {requestingPermission ? L("...", "...") : L("Izinkan", "Allow")}
              </button>
            )}
            {notifPermission === 'denied' && (
              <button
                onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                className="shrink-0 rounded-[12px] px-3 py-2 font-['Plus_Jakarta_Sans'] font-bold text-[11px] transition-all active:scale-95"
                style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)", border: "1px solid var(--app-border)" }}>
                {L("Pengaturan", "Settings")}
              </button>
            )}
          </div>

          {notifPermission === 'denied' && (
            <div className="mt-3 rounded-[12px] p-3" style={{ backgroundColor: "var(--app-card2)" }}>
              <p className="font-['Inter'] text-[11px] leading-relaxed" style={{ color: "var(--app-text2)" }}>
                💡 {L(
                  "Untuk mengaktifkan: buka Pengaturan Browser → Privasi & Keamanan → Notifikasi → cari URL aplikasi ini → ubah ke 'Izinkan'.",
                  "To enable: open Browser Settings → Privacy & Security → Notifications → find this app's URL → change to 'Allow'."
                )}
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="rounded-[14px] p-4 flex items-center justify-between border border-[rgba(78,222,163,0.15)]"
          style={{ backgroundColor: "rgba(78,222,163,0.06)" }}>
          <div className="flex items-center gap-3">
            <span className="text-[20px]">🔔</span>
            <p className="font-['Inter'] text-[13px]" style={{ color: "var(--app-text2)" }}>
              <span className="text-[#4edea3] font-semibold">{enabledCount}</span> {L("dari", "of")} {items.length} {t("notifActive", lang)}
            </p>
          </div>
          <button onClick={() => {
            const allOn = enabledCount === items.length;
            const updated = Object.fromEntries(items.map(i => [i.key, !allOn])) as AppSettings["notifications"];
            setSettings(updated);
            saveSettings({ notifications: updated });
          }} className="font-['Inter'] font-semibold text-[12px] text-[#4edea3]">
            {enabledCount === items.length ? t("disableAll", lang) : t("enableAll", lang)}
          </button>
        </div>

        <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: "var(--app-card)" }}>
          {items.map((item, i) => (
            <div key={item.key}
              className={`flex items-center justify-between p-5 ${i > 0 ? "border-t" : ""}`}
              style={{ borderColor: "var(--app-border)" }}>
              <div className="flex items-center gap-4 flex-1 mr-4">
                <div className="size-[38px] rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--app-card2)" }}>
                  <span className="text-[16px]">{item.icon}</span>
                </div>
                <div>
                  <p className="font-['Inter'] font-medium text-[15px]" style={{ color: "var(--app-text)" }}>{item.label}</p>
                  <p className="font-['Inter'] text-[11px] mt-0.5" style={{ color: "var(--app-text2)" }}>{item.desc}</p>
                </div>
              </div>
              <button onClick={() => toggle(item.key)}
                className="w-[48px] h-[24px] rounded-full transition-all duration-200 relative shrink-0"
                style={{ backgroundColor: settings[item.key] ? "#4edea3" : "var(--app-card2)" }}>
                <div className="size-4 rounded-full absolute top-1 transition-all duration-200"
                  style={{ backgroundColor: settings[item.key] ? "#003824" : "#64748b", left: settings[item.key] ? "28px" : "4px" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Cara kerja notifikasi */}
        <div className="rounded-[18px] p-4 border" style={{ backgroundColor: "var(--app-card)", borderColor: "var(--app-border)" }}>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] uppercase tracking-wider mb-3" style={{ color: "var(--app-text2)" }}>
            {L("Cara Kerja Notifikasi", "How Notifications Work")}
          </p>
          <div className="space-y-2">
            {[
              { icon: "📱", text: L("Notifikasi in-app: muncul sebagai toast di dalam aplikasi saat kamu sedang menggunakannya.", "In-app: appears as toast inside the app while you're using it.") },
              { icon: "🔔", text: L("Notifikasi push: muncul di HP meski aplikasi ditutup — butuh izin browser & install sebagai PWA.", "Push: appears on your phone even when app is closed — requires browser permission & PWA install.") },
              { icon: "⚡", text: L("Achievement, peringatan keuangan, dan pengingat dikirim via Pusher Beams ke semua device yang terdaftar.", "Achievements, financial alerts, and reminders are sent via Pusher Beams to all registered devices.") },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-[14px] shrink-0 mt-0.5">{item.icon}</span>
                <p className="font-['Inter'] text-[11px] leading-relaxed" style={{ color: "var(--app-text2)" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
