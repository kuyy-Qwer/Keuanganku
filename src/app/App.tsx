import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect, useRef, useState, useCallback } from "react";
import { getSettings, getAchievements, computeGuardianAnalysis } from "./store/database";
import { dispatchNotif } from "./lib/notify";
import NotificationToast from "./components/NotificationToast";
import SplashScreen from "./components/SplashScreen";
import PWAInstallModal from "./components/PWAInstallModal";
import usePusherBeams from "../hooks/usePusherBeams";
import useReminderScheduler from "./hooks/useReminderScheduler";
import usePWAInstall from "./hooks/usePWAInstall";
import { Analytics } from "@vercel/analytics/react";

function useApplySettings() {
  useEffect(() => {
    const apply = () => {
      const s = getSettings();
      const root = document.documentElement;

      if (s.theme === "light") {
        root.setAttribute("data-theme", "light");
        root.style.setProperty("--app-bg",      "#f8fafc");   // putih bersih
        root.style.setProperty("--app-card",    "#ffffff");
        root.style.setProperty("--app-card2",   "#f1f5f9");   // abu-abu muda
        root.style.setProperty("--app-text",    "#1f2937");   // abu tua gelap
        root.style.setProperty("--app-text2",   "#6b7280");   // abu medium
        root.style.setProperty("--app-border",  "rgba(0,0,0,0.1)");
        root.style.setProperty("--app-nav-bg",  "rgba(248,250,252,0.95)");
      } else {        root.setAttribute("data-theme", "dark");
        root.style.setProperty("--app-bg", "#0b1326");
        root.style.setProperty("--app-card", "#131b2e");
        root.style.setProperty("--app-card2", "#1a2740");
        root.style.setProperty("--app-text", "#dae2fd");
        root.style.setProperty("--app-text2", "#94a3b8");
        root.style.setProperty("--app-border", "rgba(255,255,255,0.05)");
        root.style.setProperty("--app-nav-bg", "rgba(11,19,38,0.95)");
      }

      root.setAttribute("lang", s.language || "id");
    };

    apply();
    window.addEventListener("luminary_data_change", apply);
    return () => window.removeEventListener("luminary_data_change", apply);
  }, []);
}

/** Deteksi achievement yang baru unlock dan kirim notifikasi */
function useAchievementWatcher() {
  const prevUnlocked = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Inisialisasi state awal tanpa trigger notif
    const initial = getAchievements().filter(a => a.isUnlocked).map(a => a.id);
    prevUnlocked.current = new Set(initial);

    const check = () => {
      const current = getAchievements();
      current.forEach(a => {
        if (a.isUnlocked && !prevUnlocked.current.has(a.id)) {
          prevUnlocked.current.add(a.id);
          dispatchNotif({
            type: "achievement",
            title: `Penghargaan Baru: ${a.title}`,
            message: a.description,
            emoji: a.emoji,
          });
        }
      });
    };

    window.addEventListener("luminary_data_change", check);
    return () => window.removeEventListener("luminary_data_change", check);
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

/** Pengingat Backup Bulanan — notifikasi di akhir bulan */
function useBackupReminderWatcher() {
  useEffect(() => {
    const check = () => {
      const settings = getSettings();
      if (!settings.notifications.reminders) return;

      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const isLastDay = now.getDate() === lastDayOfMonth;

      if (!isLastDay) return;

      const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
      const lastNotified = localStorage.getItem("luminary_backup_reminder");
      if (lastNotified === monthKey) return;

      localStorage.setItem("luminary_backup_reminder", monthKey);

      dispatchNotif({
        type: "reminder",
        title: "📦 Waktunya Backup Data!",
        message: "Akhir bulan ini adalah waktu yang tepat untuk mencadangkan data Anda. Jaga keamanan informasi keuangan Anda.",
        emoji: "💾",
      });
    };

    // Cek saat mount dan setiap hari
    check();
    const interval = setInterval(check, 24 * 60 * 60 * 1000); // setiap 24 jam
    return () => clearInterval(interval);
  }, []);
}

// Register service worker untuk notifikasi push
function useServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);
}

// Hook untuk menampilkan modal install PWA setelah tutorial
function usePWAInstallPrompt() {
  const { isInstallable, isStandalone } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [hasShownInstallPrompt, setHasShownInstallPrompt] = useState(false);

  useEffect(() => {
    // Cek jika tutorial sudah selesai (simpan di localStorage)
    const tutorialCompleted = localStorage.getItem('tutorial_completed') === 'true';
    
    // Tampilkan modal jika:
    // 1. Tutorial sudah selesai
    // 2. Belum pernah ditampilkan
    // 3. Bisa diinstall (bukan PWA standalone)
    // 4. Bukan di iOS (karena iOS selalu bisa add to homescreen)
    if (tutorialCompleted && 
        !hasShownInstallPrompt && 
        isInstallable && 
        !isStandalone) {
      // Tunggu 2 detik setelah tutorial selesai
      const timer = setTimeout(() => {
        setShowInstallModal(true);
        setHasShownInstallPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isStandalone, hasShownInstallPrompt]);

  return {
    showInstallModal,
    setShowInstallModal
  };
}

export default function App() {
  useApplySettings();
  useAchievementWatcher();
  useGuardianWatcher();
  useBackupReminderWatcher();
  useServiceWorkerRegistration();
  
  // Splash screen — tampil setiap kali app dibuka
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  // Initialize reminder scheduler untuk pengingat pencatatan
  useReminderScheduler();
  
  // Initialize Pusher Beams untuk notifikasi real-time
  const { isSupported, isSubscribed, error, deviceId } = usePusherBeams();
  
  // PWA install modal
  const { showInstallModal, setShowInstallModal } = usePWAInstallPrompt();
  const { showInstallPrompt } = usePWAInstall();

  useEffect(() => {
    if (isSupported && isSubscribed) {
      console.log('Pusher Beams aktif - notifikasi real-time siap');
      console.log('Device ID:', deviceId);
    }
    if (error) {
      console.error('Pusher Beams error:', error);
    }
  }, [isSupported, isSubscribed, error, deviceId]);

  const handleInstallPWA = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      // Optional: Track installation success
      localStorage.setItem('pwa_installed', 'true');
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <NotificationToast />
      <PWAInstallModal 
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstall={handleInstallPWA}
      />
      <RouterProvider router={router} />
      <Analytics />
    </>
  );
}
