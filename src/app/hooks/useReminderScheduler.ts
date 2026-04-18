// Hook untuk mengelola pengingat pencatatan dan backup otomatis
import { useEffect, useState } from 'react';
import { dispatchNotif } from '../lib/notify';
import type { NotifPayload } from '../lib/notify';

interface ReminderSettings {
  dailyReminder: boolean;
  reminderTimes: string[]; // ["12:00", "18:00"]
  monthlyBackup: boolean;
  lastDailyReminder: string; // YYYY-MM-DD
  lastMonthlyBackup: string; // YYYY-MM
}

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  dailyReminder: true,
  reminderTimes: ["12:00", "18:00"],
  monthlyBackup: true,
  lastDailyReminder: "",
  lastMonthlyBackup: ""
};

function getReminderSettings(): ReminderSettings {
  try {
    const saved = localStorage.getItem("luminary_reminder_settings");
    return saved ? { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_REMINDER_SETTINGS;
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
}

function saveReminderSettings(settings: Partial<ReminderSettings>) {
  const current = getReminderSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem("luminary_reminder_settings", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("luminary_reminder_settings_change"));
}

// Cek apakah user sudah mencatat transaksi hari ini
function hasTodayTransaction(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const transactions = JSON.parse(localStorage.getItem("luminary_transactions") || "[]");
    return transactions.some((tx: any) => tx.date.startsWith(today));
  } catch {
    return false;
  }
}

// Cek apakah sudah saatnya pengingat
function shouldSendDailyReminder(): boolean {
  const settings = getReminderSettings();
  if (!settings.dailyReminder) return false;
  
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // Cek apakah sudah dikirim hari ini
  if (settings.lastDailyReminder === today) return false;
  
  // Cek apakah waktu sekarang sesuai dengan jadwal
  return settings.reminderTimes.includes(currentTime);
}

// Cek apakah hari ini adalah hari terakhir bulan
function shouldSendMonthlyBackup(): boolean {
  const settings = getReminderSettings();
  if (!settings.monthlyBackup) return false;
  
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const isLastDay = now.getDate() === lastDayOfMonth;
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  
  return isLastDay && settings.lastMonthlyBackup !== monthKey;
}

// Buat notifikasi pengingat pencatatan
function createDailyReminderNotification(): NotifPayload {
  const lang = localStorage.getItem("luminary_language") || "id";
  
  const messages = {
    id: {
      title: "📝 Pengingat Pencatatan",
      message: "Jangan lupa catat transaksi keuangan Anda hari ini. Catatan yang teratur membantu mengelola keuangan dengan lebih baik."
    },
    en: {
      title: "📝 Transaction Reminder", 
      message: "Don't forget to record your financial transactions today. Regular logging helps manage your finances better."
    }
  };
  
  const msg = messages[lang as keyof typeof messages] || messages.id;
  
  return {
    id: crypto.randomUUID(),
    type: "reminder",
    title: msg.title,
    message: msg.message,
    emoji: "📝"
  };
}

// Buat notifikasi backup bulanan
function createMonthlyBackupNotification(): NotifPayload {
  const lang = localStorage.getItem("luminary_language") || "id";
  
  const messages = {
    id: {
      title: "📦 Waktunya Backup Data Bulanan!",
      message: "Akhir bulan telah tiba. Luangkan waktu sejenak untuk backup data keuangan Anda. Data yang aman adalah aset berharga."
    },
    en: {
      title: "📦 Monthly Backup Time!",
      message: "The end of month has arrived. Take a moment to backup your financial data. Safe data is a valuable asset."
    }
  };
  
  const msg = messages[lang as keyof typeof messages] || messages.id;
  
  return {
    id: crypto.randomUUID(),
    type: "reminder",
    title: msg.title,
    message: msg.message,
    emoji: "📦"
  };
}

export default function useReminderScheduler() {
  const [settings, setSettings] = useState<ReminderSettings>(getReminderSettings());

  // Update state saat settings berubah
  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(getReminderSettings());
    };
    
    window.addEventListener('luminary_reminder_settings_change', handleSettingsChange);
    return () => window.removeEventListener('luminary_reminder_settings_change', handleSettingsChange);
  }, []);

  // Main scheduler logic
  useEffect(() => {
    const checkReminders = () => {
      // Cek pengingat pencatatan harian
      if (shouldSendDailyReminder() && !hasTodayTransaction()) {
        const notification = createDailyReminderNotification();
        dispatchNotif(notification);
        
        // Update last reminder date
        const today = new Date().toISOString().slice(0, 10);
        saveReminderSettings({ lastDailyReminder: today });
        
        console.log('📝 Daily reminder sent:', notification.title);
      }
      
      // Cek notifikasi backup bulanan
      if (shouldSendMonthlyBackup()) {
        const notification = createMonthlyBackupNotification();
        dispatchNotif(notification);
        
        // Update last backup month
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
        saveReminderSettings({ lastMonthlyBackup: monthKey });
        
        console.log('📦 Monthly backup reminder sent:', notification.title);
      }
    };

    // Cek setiap menit
    const interval = setInterval(checkReminders, 60000); // 1 menit
    
    // Cek saat mount
    checkReminders();
    
    return () => clearInterval(interval);
  }, [settings]);

  // Fungsi untuk update settings
  const updateSettings = (newSettings: Partial<ReminderSettings>) => {
    saveReminderSettings(newSettings);
  };

  // Fungsi untuk backup langsung
  const triggerBackupNow = () => {
    const notification = createMonthlyBackupNotification();
    dispatchNotif(notification);
    console.log('📦 Manual backup triggered');
  };

  return {
    settings,
    updateSettings,
    triggerBackupNow,
    hasTodayTransaction: hasTodayTransaction()
  };
}
