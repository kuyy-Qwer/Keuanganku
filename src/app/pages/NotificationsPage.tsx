import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { 
  getNotifHistory, markNotifAsRead, markAllNotifsAsRead, clearNotifHistory,
  type NotifHistoryItem
} from "../store/database";
import { useLang, t } from "../i18n";
import { format } from "date-fns";

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  income: { icon: "💚", color: "#4edea3" },
  expense: { icon: "💸", color: "#ff6b6b" },
  saving: { icon: "🏦", color: "#60a5fa" },
  achievement: { icon: "🏆", color: "#fbbf24" },
  alert: { icon: "⚠️", color: "#fb923c" },
  reminder: { icon: "🔔", color: "#a78bfa" },
  debt: { icon: "✅", color: "#86efac" },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const [notifications, setNotifications] = useState<NotifHistoryItem[]>([]);

  useEffect(() => {
    setNotifications(getNotifHistory());
  }, []);

  const handleMarkAsRead = (id: string) => {
    markNotifAsRead(id);
    setNotifications(getNotifHistory());
    window.dispatchEvent(new CustomEvent("luminary_notif_count"));
  };

  const handleMarkAllAsRead = () => {
    markAllNotifsAsRead();
    setNotifications(getNotifHistory());
    window.dispatchEvent(new CustomEvent("luminary_notif_count"));
  };

  const handleClear = () => {
    clearNotifHistory();
    setNotifications([]);
    window.dispatchEvent(new CustomEvent("luminary_notif_count"));
  };

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return lang === "id"
      ? format(date, "dd MMM yyyy, HH:mm")
      : format(date, "MMM dd yyyy, HH:mm");
  };

  const L = (id: string, en: string) => lang === "en" ? en : id;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="w-full min-h-screen app-bg flex justify-center pb-32">
      <div className="w-full max-w-[390px] relative">
        {/* Header */}
        <div className="sticky top-0 z-[100] backdrop-blur-xl flex items-center justify-between px-5 pt-10 pb-4"
          style={{ backgroundColor: "var(--app-nav-bg)", borderBottom: "1px solid var(--app-border)" }}>
          <button onClick={() => navigate(-1)} className="clickable">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px]" style={{ color: "var(--app-text)" }}>
            {L("Riwayat Notifikasi", "Notifications")}
          </h1>
          <div className="w-6" />
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--app-border)" }}>
            <button 
              onClick={handleMarkAllAsRead}
              className="text-[12px] font-bold text-[#4edea3] clickable"
            >
              {L("Tandai Semua Dibaca", "Mark All Read")}
            </button>
            <button 
              onClick={handleClear}
              className="text-[12px] font-bold text-[#ef4444] clickable"
            >
              {L("Hapus Semua", "Clear All")}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-5 py-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-[48px] block mb-4">🔔</span>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]" style={{ color: "var(--app-text)" }}>
                {L("Belum Ada Notifikasi", "No Notifications Yet")}
              </p>
              <p className="text-[12px] mt-2" style={{ color: "var(--app-text2)" }}>
                {L("Notifikasi akan muncul di sini", "Notifications will appear here")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.reminder;
                const isUnread = !notif.isRead;
                return (
                  <div 
                    key={notif.id}
                    onClick={() => isUnread && handleMarkAsRead(notif.id)}
                    className={`rounded-[16px] p-4 border transition-all duration-200 ${isUnread ? 'hover:scale-[0.98]' : ''} cursor-pointer`}
                    style={{ 
                      backgroundColor: "var(--app-card)", 
                      borderColor: isUnread ? cfg.color + "40" : "var(--app-border)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="size-10 rounded-[12px] flex items-center justify-center shrink-0 text-[18px]"
                        style={{ backgroundColor: cfg.color + "20" }}
                      >
                        {notif.emoji || cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] truncate" style={{ color: "var(--app-text)" }}>
                            {notif.title}
                          </p>
                          {isUnread && (
                            <span className="size-2 rounded-full bg-[#4edea3]" />
                          )}
                        </div>
                        <p className="text-[11px] mt-1 line-clamp-2" style={{ color: "var(--app-text2)" }}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] mt-2" style={{ color: "var(--app-text2)" }}>
                          {formatDateTime(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}