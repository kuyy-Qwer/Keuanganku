import { useEffect, useRef } from 'react';
import { sendFinancialNotification } from '../../lib/pusherNotifications';
import { getSettings } from '../store/database';

export interface ReminderSchedule {
  id: string;
  title: string;
  message: string;
  time: string; // Format: "HH:MM" (24-hour)
  days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  enabled: boolean;
  lastSent?: string; // ISO timestamp
}

const defaultReminders: ReminderSchedule[] = [
  {
    id: 'morning-reminder',
    title: '🌅 Pagi yang Produktif',
    message: 'Selamat pagi! Jangan lupa catat transaksi hari ini. Mulai hari dengan mencatat pengeluaran pertama.',
    time: '08:00',
    days: [1, 2, 3, 4, 5], // Senin-Jumat
    enabled: true
  },
  {
    id: 'evening-reminder',
    title: '🌙 Review Harian',
    message: 'Sudahkah Anda mencatat semua transaksi hari ini? Review keuangan harian membantu menjaga disiplin.',
    time: '20:00',
    days: [1, 2, 3, 4, 5], // Senin-Jumat
    enabled: true
  },
  {
    id: 'weekend-reminder',
    title: '📊 Akhir Pekan',
    message: 'Waktu yang tepat untuk review mingguan. Cek progress tabungan dan rencana keuangan Anda.',
    time: '10:00',
    days: [6], // Sabtu
    enabled: true
  },
  {
    id: 'monthly-review',
    title: '📈 Review Bulanan',
    message: 'Akhir bulan! Waktunya evaluasi pencapaian finansial bulan ini dan rencanakan bulan depan.',
    time: '09:00',
    days: [], // Akan di-set berdasarkan tanggal
    enabled: true
  }
];

function useReminderScheduler() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<Date>(new Date());

  const checkAndSendReminders = async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const currentDate = now.getDate();
    
    // Cek settings user
    const settings = getSettings();
    if (!settings.notifications?.reminders) {
      return;
    }

    // Ambil reminders dari settings atau gunakan default
    const userReminders = settings.reminders || defaultReminders;

    for (const reminder of userReminders) {
      if (!reminder.enabled) continue;

      // Parse waktu reminder
      const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);
      
      // Cek apakah waktu sudah sesuai
      const isTimeMatch = 
        currentHour === reminderHour && 
        currentMinute === reminderMinute;
      
      if (!isTimeMatch) continue;

      // Cek hari (khusus monthly review cek tanggal)
      if (reminder.id === 'monthly-review') {
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        if (currentDate !== lastDayOfMonth) continue;
      } else {
        // Cek hari dalam seminggu
        if (!reminder.days.includes(currentDay)) continue;
      }

      // Cek apakah sudah dikirim hari ini
      const today = now.toDateString();
      if (reminder.lastSent && new Date(reminder.lastSent).toDateString() === today) {
        continue;
      }

      // Kirim notifikasi
      try {
        await sendFinancialNotification(
          reminder.title,
          reminder.message,
          `reminder-${reminder.id}`,
          {
            type: 'reminder',
            reminderId: reminder.id,
            scheduledTime: reminder.time
          }
        );

        // Update lastSent (ini hanya di memory, perlu disimpan ke database jika ingin persist)
        reminder.lastSent = now.toISOString();
        
        console.log(`Reminder "${reminder.id}" sent at ${now.toLocaleTimeString()}`);
      } catch (error) {
        console.error(`Failed to send reminder "${reminder.id}":`, error);
      }
    }

    lastCheckRef.current = now;
  };

  useEffect(() => {
    // Check setiap menit
    intervalRef.current = setInterval(checkAndSendReminders, 60 * 1000);
    
    // Check sekali saat mount
    checkAndSendReminders();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // Export fungsi untuk manual trigger jika diperlukan
    triggerReminderCheck: checkAndSendReminders
  };
}

export default useReminderScheduler;