// Sistem pengingat pencatatan dan backup otomatis
import type { NotifPayload } from './notify';

export interface ReminderSettings {
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

export function getReminderSettings(): ReminderSettings {
  try {
    const saved = localStorage.getItem("luminary_reminder_settings");
    return saved ? { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_REMINDER_SETTINGS;
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export function saveReminderSettings(settings: Partial<ReminderSettings>) {
  const current = getReminderSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem("luminary_reminder_settings", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("luminary_reminder_settings_change"));
}

// Cek apakah user sudah mencatat transaksi hari ini
export function hasTodayTransaction(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const transactions = getTransactions();
  return transactions.some((tx: Transaction) => tx.date.startsWith(today));
}

// Cek apakah sudah saatnya pengingat
export function shouldSendDailyReminder(): boolean {
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
export function shouldSendMonthlyBackup(): boolean {
  const settings = getReminderSettings();
  if (!settings.monthlyBackup) return false;
  
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const isLastDay = now.getDate() === lastDayOfMonth;
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  
  return isLastDay && settings.lastMonthlyBackup !== monthKey;
}

// Buat notifikasi pengingat pencatatan
export function createDailyReminderNotification(): NotifPayload {
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
export function createMonthlyBackupNotification(): NotifPayload {
  const lang = localStorage.getItem("luminary_language") || "id";
  
  const messages = {
    id: {
      title: "📦 Waktunya Backup Data Bulanan!",
      message: "Akhir bulan telah tiba. Luangkan waktu sejenak untuk backup data keuangan Anda. Data yang aman adalah aset berharga."
    },
    en: {
      title: "📦 Monthly Backup Time!",
      message: "The end of the month has arrived. Take a moment to backup your financial data. Safe data is a valuable asset."
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

// Helper untuk import getTransactions
interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: string;
  category: string;
  description?: string;
}

function getTransactions(): Transaction[] {
  try {
    return JSON.parse(localStorage.getItem("luminary_transactions") || "[]");
  } catch {
    return [];
  }
}
