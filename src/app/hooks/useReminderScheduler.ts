/**
 * useReminderScheduler
 * 
 * Jadwal notifikasi:
 * 1. Peringatan pencatatan jam 12:00 siang — setiap hari
 * 2. Peringatan pencatatan setelah maghrib ~18:30 — setiap hari
 * 3. Notifikasi backup — sesuai tanggal yang dipilih user
 * 
 * Cara kerja:
 * - Saat app dibuka, hitung berapa milidetik sampai waktu berikutnya
 * - Set setTimeout untuk trigger notifikasi tepat waktu
 * - Gunakan Notification API langsung (bukan Pusher) agar tidak broadcast ke semua user
 * - Simpan lastSent di localStorage agar tidak kirim dua kali sehari
 */

import { useEffect, useRef } from 'react';
import { getSettings, getBackupSettings, saveBackupSettings, generateBackupFilename, exportAllData } from '../store/database';

// ── Helpers ────────────────────────────────────────────────────────

/** Kirim notifikasi browser langsung (tidak via Pusher) */
function sendLocalNotification(title: string, body: string, icon = '/icon.svg', tag?: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  try {
    // Coba via service worker dulu (lebih reliable di mobile)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body,
          icon,
          badge: '/icon.svg',
          tag: tag ?? `luminary-${Date.now()}`,
          vibrate: [200, 100, 200],
          data: { url: '/app' },
        });
      }).catch(() => {
        // Fallback ke Notification API biasa
        new Notification(title, { body, icon, tag });
      });
    } else {
      new Notification(title, { body, icon, tag });
    }
  } catch {
    // Ignore — notifikasi tidak kritis
  }
}

/** Hitung milidetik sampai jam HH:MM hari ini atau besok */
function msUntilTime(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);

  // Jika sudah lewat hari ini, jadwalkan besok
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

/** Cek apakah sudah kirim notifikasi hari ini untuk key tertentu */
function alreadySentToday(key: string): boolean {
  const last = localStorage.getItem(`luminary_notif_sent_${key}`);
  if (!last) return false;
  return new Date(last).toDateString() === new Date().toDateString();
}

/** Tandai notifikasi sudah dikirim hari ini */
function markSentToday(key: string) {
  localStorage.setItem(`luminary_notif_sent_${key}`, new Date().toISOString());
}

// ── Hook utama ─────────────────────────────────────────────────────

function useReminderScheduler() {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  const scheduleAll = () => {
    clearAllTimers();

    const settings = getSettings();
    if (!settings.notifications?.reminders) return;

    // ── 1. Peringatan pencatatan jam 12:00 siang ──────────────────
    const msToNoon = msUntilTime(12, 0);
    const noonTimer = setTimeout(() => {
      if (!alreadySentToday('noon_reminder')) {
        sendLocalNotification(
          '☀️ Pengingat Pencatatan Siang',
          'Sudah catat pengeluaran pagi ini? Jangan sampai lupa — catat sekarang sebelum terlupa!',
          '/icon-192.png',
          'luminary-noon-reminder'
        );
        markSentToday('noon_reminder');
      }
      // Jadwalkan ulang untuk besok
      scheduleAll();
    }, msToNoon);
    timersRef.current.push(noonTimer);

    // ── 2. Peringatan pencatatan setelah maghrib 18:30 ────────────
    const msToMaghrib = msUntilTime(18, 30);
    const maghribTimer = setTimeout(() => {
      if (!alreadySentToday('maghrib_reminder')) {
        sendLocalNotification(
          '🌅 Pengingat Pencatatan Sore',
          'Waktunya review transaksi hari ini! Catat semua pengeluaran sebelum malam agar laporan keuanganmu akurat.',
          '/icon-192.png',
          'luminary-maghrib-reminder'
        );
        markSentToday('maghrib_reminder');
      }
      // Jadwalkan ulang untuk besok
      scheduleAll();
    }, msToMaghrib);
    timersRef.current.push(maghribTimer);

    // ── 3. Notifikasi backup sesuai tanggal pilihan user ──────────
    const backupSettings = getBackupSettings();
    if (backupSettings.autoBackupEnabled) {
      const now = new Date();
      const today = now.getDate();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const targetDay = backupSettings.autoBackupDay === 0 ? lastDayOfMonth : backupSettings.autoBackupDay;

      if (today === targetDay && !alreadySentToday('backup_reminder')) {
        // Kirim notifikasi backup hari ini jam 09:00
        const msTo9am = msUntilTime(9, 0);
        const backupTimer = setTimeout(() => {
          if (!alreadySentToday('backup_reminder')) {
            sendLocalNotification(
              '💾 Waktunya Backup Data!',
              `Hari ini adalah jadwal backup bulananmu (tgl ${targetDay}). Buka halaman Backup untuk mengunduh cadangan data.`,
              '/icon-192.png',
              'luminary-backup-reminder'
            );
            markSentToday('backup_reminder');
          }
        }, msTo9am);
        timersRef.current.push(backupTimer);
      }
    }
  };

  useEffect(() => {
    // Jadwalkan saat mount
    scheduleAll();

    // Re-jadwalkan saat settings berubah
    const handleChange = () => scheduleAll();
    window.addEventListener('luminary_data_change', handleChange);

    return () => {
      clearAllTimers();
      window.removeEventListener('luminary_data_change', handleChange);
    };
  }, []);

  return {};
}

export default useReminderScheduler;
