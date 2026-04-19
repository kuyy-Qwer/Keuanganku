import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect, useRef } from "react";
import { getSettings, getAchievements, computeGuardianAnalysis } from "./store/database";
import { dispatchNotif } from "./lib/notify";
import NotificationToast from "./components/NotificationToast";
import usePusherBeams from "../hooks/usePusherBeams.ts";
import useReminderScheduler from "./hooks/useReminderScheduler";
import usePWAInstall from "./hooks/usePWAInstall";
import { Analytics } from "@vercel/analytics/react";
// Import debug tools for development
import "./utils/onboardingDebug";

function useApplySettings() {
  useEffect(() => {
    const apply = () => {
      const s = getSettings();
      const root = document.documentElement;

      if (s.theme === "light") {
        root.setAttribute("data-theme", "light");
        root.style.setProperty("--app-bg",           "#f8fafc");
        root.style.setProperty("--app-card",          "#ffffff");
        root.style.setProperty("--app-card2",         "#f0fdf4");
        root.style.setProperty("--app-text",          "#1f2937");
        root.style.setProperty("--app-text2",         "#6b7280");
        root.style.setProperty("--app-border",        "rgba(0, 180, 162, 0.1)");
        root.style.setProperty("--app-nav-bg",        "rgba(248,250,252,0.95)");
        root.style.setProperty("--app-input-bg",      "#f0fdf4");
        root.style.setProperty("--app-keypad-bg",     "#f0fdf4");
        root.style.setProperty("--app-keypad-border", "rgba(0,180,162,0.12)");
        root.style.setProperty("--app-pin-dot-empty", "#d1fae5");
        root.style.setProperty("--app-pin-dot-filled","#10b981");
        root.style.setProperty("--app-danger",        "#dc2626");
        root.style.setProperty("--app-danger-bg",     "rgba(220,38,38,0.06)");
        root.style.setProperty("--app-danger-border", "rgba(220,38,38,0.2)");
      } else {
        root.setAttribute("data-theme", "dark");
        root.style.setProperty("--app-bg",           "#0b1326");
        root.style.setProperty("--app-card",          "#131b2e");
        root.style.setProperty("--app-card2",         "#1a2740");
        root.style.setProperty("--app-text",          "#dae2fd");
        root.style.setProperty("--app-text2",         "#94a3b8");
        root.style.setProperty("--app-border",        "rgba(78, 222, 163, 0.15)");
        root.style.setProperty("--app-nav-bg",        "rgba(11,19,38,0.95)");
        root.style.setProperty("--app-input-bg",      "#1a2740");
        root.style.setProperty("--app-keypad-bg",     "#131b2e");
        root.style.setProperty("--app-keypad-border", "rgba(255,255,255,0.04)");
        root.style.setProperty("--app-pin-dot-empty", "#2d3449");
        root.style.setProperty("--app-pin-dot-filled","#4edea3");
        root.style.setProperty("--app-danger",        "#ffb4ab");
        root.style.setProperty("--app-danger-bg",     "rgba(255,180,171,0.08)");
        root.style.setProperty("--app-danger-border", "rgba(255,180,171,0.15)");
      }

      root.setAttribute("lang", s.language || "id");
    };

    apply();
    window.addEventListener("luminary_data_change", apply);
    return () => window.removeEventListener("luminary_data_change", apply);
  }, []);
}

/** Deteksi achievement yang baru unlock dan kirim notifikasi — dengan queue agar tidak beruntun */
function useAchievementWatcher() {
  const prevUnlocked = useRef<Set<string>>(new Set());
  const queueRef = useRef<Array<{ title: string; description: string; emoji: string }>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushQueue = () => {
    if (queueRef.current.length === 0) return;
    const next = queueRef.current.shift()!;
    dispatchNotif({
      type: "achievement",
      title: `🏆 ${next.title}`,
      message: next.description,
      emoji: next.emoji,
    });
    // Kirim notif berikutnya setelah 8 detik (lebih dari durasi toast achievement 7 detik)
    if (queueRef.current.length > 0) {
      timerRef.current = setTimeout(flushQueue, 8000);
    }
  };

  useEffect(() => {
    // Inisialisasi state awal tanpa trigger notif
    const initial = getAchievements().filter(a => a.isUnlocked).map(a => a.id);
    prevUnlocked.current = new Set(initial);

    const check = () => {
      const current = getAchievements();
      const newlyUnlocked: typeof current = [];
      current.forEach(a => {
        if (a.isUnlocked && !prevUnlocked.current.has(a.id)) {
          prevUnlocked.current.add(a.id);
          newlyUnlocked.push(a);
        }
      });

      if (newlyUnlocked.length === 0) return;

      // Tambahkan ke queue
      newlyUnlocked.forEach(a => {
        queueRef.current.push({ title: a.title, description: a.description, emoji: a.emoji });
      });

      // Mulai flush jika belum ada timer aktif
      if (!timerRef.current) {
        flushQueue();
      }
    };

    window.addEventListener("luminary_data_change", check);
    return () => {
      window.removeEventListener("luminary_data_change", check);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}

/** Waspada Tanggal Tua — cek Guardian setiap kali data berubah */
function useGuardianWatcher() {
  const lastWarned = useRef<string | null>(null);

  useEffect(() => {
    const check = () => {
      const settings = getSettings();
      if (!settings.notifications.reminders) return;

      const g = computeGuardianAnalysis();
      if (!g.isProtectionMode || !g.warningMessage) return;

      // Hanya kirim notif sekali per hari per kategori terboros
      const key = `${g.topBorosCategory}_${new Date().toDateString()}`;
      if (lastWarned.current === key) return;
      lastWarned.current = key;

      dispatchNotif({
        type: "alert",
        title: "⚠️ Waspada Tanggal Tua",
        message: g.warningMessage,
        emoji: "🛡️",
      });
    };

    window.addEventListener("luminary_data_change", check);
    return () => window.removeEventListener("luminary_data_change", check);
  }, []);
}

/** Pengingat Backup Bulanan — sudah dihandle oleh useReminderScheduler */
// function useBackupReminderWatcher() { ... }

// Register service worker untuk notifikasi push
function useServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Di development: unregister semua service worker agar tidak interferensi HMR
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.log('Service Worker unregistered (dev mode)');
        }
      });
      return;
    }

    // Di production: register service worker
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }, []);
}

// Hook untuk menampilkan modal install PWA setelah tutorial — tidak digunakan lagi
// function usePWAInstallPrompt() { ... }

export default function App() {
  useApplySettings();
  useAchievementWatcher();
  useGuardianWatcher();
  useServiceWorkerRegistration();

  // Initialize reminder scheduler untuk pengingat pencatatan
  useReminderScheduler();
  
  // Initialize Pusher Beams untuk notifikasi real-time
  const { isSupported, isSubscribed, error, deviceId } = usePusherBeams();
  
  // PWA install (button is on HomePage)
  usePWAInstall();

  useEffect(() => {
    if (isSupported && isSubscribed) {
      console.log('Pusher Beams aktif - notifikasi real-time siap');
      console.log('Device ID:', deviceId);
    }
    if (error) {
      console.error('Pusher Beams error:', error);
    }
  }, [isSupported, isSubscribed, error, deviceId]);

  return (
    <>
      <NotificationToast />
      <RouterProvider router={router} />
      <Analytics />
    </>
  );
}
