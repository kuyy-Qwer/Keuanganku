import { useEffect, useState, useRef } from "react";
import type { NotifPayload } from "../lib/notify";
import {
  playIncomeSound, playExpenseSound, playSavingSound,
  playAchievementSound, playAlertSound, playReminderSound, playDebtPaidSound,
} from "../lib/sounds";
import { getSettings, addNotifToHistory, getUnreadNotifCount } from "../store/database";

const DISMISS_MS = 5000;
const ACHIEVEMENT_MS = 7000;

const TYPE_CONFIG: Record<string, {
  gradient: string;
  border: string;
  icon: string;
  progressColor: string;
  glow: string;
}> = {
  income:      { gradient: "linear-gradient(135deg,#0a2318,#0d2b1f)", border: "rgba(78,222,163,0.35)",  icon: "💚", progressColor: "#4edea3", glow: "rgba(78,222,163,0.15)" },
  expense:     { gradient: "linear-gradient(135deg,#2b0f0f,#1a0a0a)", border: "rgba(255,107,107,0.35)", icon: "💸", progressColor: "#ff6b6b", glow: "rgba(255,107,107,0.15)" },
  saving:      { gradient: "linear-gradient(135deg,#0a1a2b,#0d1f33)", border: "rgba(96,165,250,0.35)",  icon: "🏦", progressColor: "#60a5fa", glow: "rgba(96,165,250,0.15)" },
  achievement: { gradient: "linear-gradient(135deg,#2b1f08,#1a1305)", border: "rgba(251,191,36,0.45)",  icon: "🏆", progressColor: "#fbbf24", glow: "rgba(251,191,36,0.2)"  },
  alert:       { gradient: "linear-gradient(135deg,#2b1508,#1a0e05)", border: "rgba(251,146,60,0.35)",  icon: "⚠️", progressColor: "#fb923c", glow: "rgba(251,146,60,0.15)" },
  reminder:    { gradient: "linear-gradient(135deg,#150f2b,#0e0a1a)", border: "rgba(167,139,250,0.35)", icon: "🔔", progressColor: "#a78bfa", glow: "rgba(167,139,250,0.15)" },
  debt:        { gradient: "linear-gradient(135deg,#0a1f0a,#081508)", border: "rgba(134,239,172,0.35)", icon: "✅", progressColor: "#86efac", glow: "rgba(134,239,172,0.15)" },
};

interface ToastItem extends NotifPayload {
  state: "entering" | "visible" | "leaving";
  dismissAt: number;
  duration: number;
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const cfg = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.reminder;
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const remainingRef = useRef(toast.duration);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    const tick = () => {
      if (!pausedRef.current) {
        const now = Date.now();
        const elapsed = now - lastTickRef.current;
        lastTickRef.current = now;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        setProgress((remainingRef.current / toast.duration) * 100);
        if (remainingRef.current <= 0) {
          onDismiss();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const isEntering = toast.state === "entering";
  const isLeaving = toast.state === "leaving";

  return (
    <div
      onMouseEnter={() => { pausedRef.current = true; lastTickRef.current = Date.now(); }}
      onMouseLeave={() => { pausedRef.current = false; lastTickRef.current = Date.now(); }}
      className="relative w-full overflow-hidden rounded-[20px] border shadow-2xl transition-all duration-300 ease-out"
      style={{
        background: cfg.gradient,
        borderColor: cfg.border,
        boxShadow: `0 8px 32px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
        opacity: isLeaving ? 0 : isEntering ? 0 : 1,
        transform: isLeaving
          ? "translateY(-12px) scale(0.95)"
          : isEntering
          ? "translateY(-8px) scale(0.97)"
          : "translateY(0) scale(1)",
      }}
    >
      {/* Glow blob */}
      <div className="absolute top-0 right-0 size-20 rounded-full blur-[30px] pointer-events-none"
        style={{ backgroundColor: cfg.glow }} />

      {/* Content */}
      <div className="relative flex items-start gap-3 px-4 pt-4 pb-3">
        {/* Icon */}
        <div className="size-9 rounded-[12px] flex items-center justify-center shrink-0 text-[18px]"
          style={{ backgroundColor: `${cfg.glow}`, border: `1px solid ${cfg.border}` }}>
          {toast.emoji ?? cfg.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-['Plus_Jakarta_Sans'] font-black text-[13px] text-white leading-tight truncate">
            {toast.title}
          </p>
          <p className="font-['Inter'] text-[11px] text-[#94a3b8] mt-0.5 leading-snug line-clamp-2">
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={e => { e.stopPropagation(); onDismiss(); }}
          className="shrink-0 size-6 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 mt-0.5"
          style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] w-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-none"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${cfg.progressColor}99, ${cfg.progressColor})`,
          }}
        />
      </div>
    </div>
  );
}

export default function NotificationToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = (id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, state: "leaving" as const } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const payload = (e as CustomEvent<NotifPayload>).detail;
      const settings = getSettings();
      const notifs = settings.notifications;

      const allowed =
        (payload.type === "income" || payload.type === "expense") ? notifs.transactions :
        payload.type === "alert" ? notifs.security :
        payload.type === "reminder" ? notifs.reminders :
        payload.type === "achievement" ? true :
        payload.type === "saving" ? notifs.reminders :
        payload.type === "debt" ? notifs.transactions :
        true;

      if (!allowed) return;

      // Save to history
      addNotifToHistory({
        type: payload.type,
        title: payload.title,
        message: payload.message,
        emoji: payload.emoji,
      });

      // Dispatch custom event to update unread count
      window.dispatchEvent(new CustomEvent("luminary_notif_count"));

      // Play sound
      if (payload.type === "income") playIncomeSound();
      else if (payload.type === "expense") playExpenseSound();
      else if (payload.type === "saving") playSavingSound();
      else if (payload.type === "achievement") playAchievementSound();
      else if (payload.type === "alert") playAlertSound();
      else if (payload.type === "reminder") playReminderSound();
      else if (payload.type === "debt") playDebtPaidSound();

      const duration = payload.type === "achievement" ? ACHIEVEMENT_MS : DISMISS_MS;
      const item: ToastItem = {
        ...payload,
        state: "entering",
        dismissAt: Date.now() + duration,
        duration,
      };

      setToasts(prev => [...prev.slice(-3), item]);

      // Trigger entering → visible transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setToasts(prev => prev.map(t => t.id === item.id ? { ...t, state: "visible" } : t));
        });
      });
    };

    window.addEventListener("luminary_notif", handler);
    return () => window.removeEventListener("luminary_notif", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-safe-top left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2.5 w-[340px] pointer-events-none px-1"
      style={{ top: "max(16px, env(safe-area-inset-top, 16px))" }}>
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} onDismiss={() => dismiss(toast.id)} />
        </div>
      ))}
    </div>
  );
}
