import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLang, t } from '../../i18n';
import { dispatchNotif } from '../../lib/notify';

interface ReminderSettings {
  dailyReminder: boolean;
  reminderTimes: string[];
  monthlyBackup: boolean;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  dailyReminder: true,
  reminderTimes: ["12:00", "18:00"],
  monthlyBackup: true
};

export default function ReminderSettingsPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;
  
  const [localSettings, setLocalSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);

  const handleToggleDaily = () => {
    const updated = { ...localSettings, dailyReminder: !localSettings.dailyReminder };
    setLocalSettings(updated);
    localStorage.setItem("luminary_reminder_settings", JSON.stringify(updated));
  };

  const handleToggleMonthly = () => {
    const updated = { ...localSettings, monthlyBackup: !localSettings.monthlyBackup };
    setLocalSettings(updated);
    localStorage.setItem("luminary_reminder_settings", JSON.stringify(updated));
  };

  const handleTimeChange = (index: number, newTime: string) => {
    const newTimes = [...localSettings.reminderTimes];
    newTimes[index] = newTime;
    const updated = { ...localSettings, reminderTimes: newTimes };
    setLocalSettings(updated);
    localStorage.setItem("luminary_reminder_settings", JSON.stringify(updated));
  };

  const addTimeSlot = () => {
    if (localSettings.reminderTimes.length < 5) {
      const updated = { 
        ...localSettings, 
        reminderTimes: [...localSettings.reminderTimes, "09:00"] 
      };
      setLocalSettings(updated);
      localStorage.setItem("luminary_reminder_settings", JSON.stringify(updated));
    }
  };

  const removeTimeSlot = (index: number) => {
    if (localSettings.reminderTimes.length > 1) {
      const newTimes = localSettings.reminderTimes.filter((_, i) => i !== index);
      const updated = { ...localSettings, reminderTimes: newTimes };
      setLocalSettings(updated);
      localStorage.setItem("luminary_reminder_settings", JSON.stringify(updated));
    }
  };

  // Check if user has transactions today
  const hasTodayTransaction = () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const transactions = JSON.parse(localStorage.getItem("luminary_transactions") || "[]");
      return transactions.some((tx: any) => tx.date.startsWith(today));
    } catch {
      return false;
    }
  };

  const triggerBackupNow = () => {
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
    const notification = {
      id: crypto.randomUUID(),
      type: "reminder",
      title: msg.title,
      message: msg.message,
      emoji: "📦"
    };
    
    dispatchNotif(notification);
    console.log('📦 Manual backup triggered');
  };

  return (
    <div className="w-full min-h-screen app-bg flex justify-center pb-32">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <button onClick={() => navigate(-1)} className="p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7 7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px]" style={{ color: "var(--app-text)" }}>
            {L("Pengaturan Pengingat", "Reminder Settings")}
          </h1>
        </div>

        <div className="px-5 space-y-4">
          {/* Status Hari Ini */}
          <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--app-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[14px]" style={{ color: "var(--app-text)" }}>
                {L("Status Hari Ini", "Today's Status")}
              </h2>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                hasTodayTransaction() 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {hasTodayTransaction() 
                  ? L("✅ Sudah Dicatat", "✅ Recorded")
                  : L("⏰ Belum Dicatat", "⏳ Not Recorded")
                }
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--app-text2)" }}>
              {hasTodayTransaction() 
                ? L("Bagus! Anda sudah mencatat transaksi hari ini.", "Great! You've recorded transactions today.")
                : L("Anda belum mencatat transaksi hari ini. Akan ada pengingat di jadwal yang ditentukan.", "You haven't recorded transactions today. Reminders will be sent at scheduled times.")
              }
            </p>
          </div>

          {/* Pengingat Harian */}
          <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--app-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[14px]" style={{ color: "var(--app-text)" }}>
                {L("Pengingat Harian", "Daily Reminder")}
              </h2>
              <button
                onClick={handleToggleDaily}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.dailyReminder ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.dailyReminder ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-sm mb-3" style={{ color: "var(--app-text2)" }}>
              {L("Aktifkan pengingat untuk mencatat transaksi setiap hari.", "Enable reminders to record transactions daily.")}
            </p>
            
            {/* Jadwal Waktu */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm mb-2" style={{ color: "var(--app-text)" }}>
                {L("Jadwal Pengingat", "Reminder Schedule")}
              </h3>
              {localSettings.reminderTimes.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm"
                    style={{ 
                      backgroundColor: "var(--app-card2)", 
                      color: "var(--app-text)",
                      border: `1px solid var(--app-border)`
                    }}
                  />
                  {localSettings.reminderTimes.length > 1 && (
                    <button
                      onClick={() => removeTimeSlot(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              
              {localSettings.reminderTimes.length < 5 && (
                <button
                  onClick={addTimeSlot}
                  className="w-full px-3 py-2 rounded-lg text-sm font-medium text-green-600 border border-green-600 hover:bg-green-50"
                >
                  + {L("Tambah Waktu", "Add Time")}
                </button>
              )}
            </div>
          </div>

          {/* Backup Bulanan */}
          <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--app-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[14px]" style={{ color: "var(--app-text)" }}>
                {L("Backup Bulanan", "Monthly Backup")}
              </h2>
              <button
                onClick={handleToggleMonthly}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.monthlyBackup ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.monthlyBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-sm mb-3" style={{ color: "var(--app-text2)" }}>
              {L("Pengingat otomatis untuk backup data di akhir bulan.", "Automatic reminder for data backup at end of month.")}
            </p>
            
            <button
              onClick={triggerBackupNow}
              className="w-full px-4 py-3 rounded-xl font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              📦 {L("Backup Sekarang", "Backup Now")}
            </button>
          </div>

          {/* Info */}
          <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--app-card2)" }}>
            <h3 className="font-medium text-sm mb-2" style={{ color: "var(--app-text)" }}>
              {L("📝 Informasi Pengingat", "📝 Reminder Information")}
            </h3>
            <ul className="text-sm space-y-1" style={{ color: "var(--app-text2)" }}>
              <li>• {L("Pengingat akan dikirim via Pusher Beams", "Reminders will be sent via Pusher Beams")}</li>
              <li>• {L("Hanya jika izin notifikasi diberikan", "Only if notification permission is granted")}</li>
              <li>• {L("Tidak akan mengganggu jika sudah ada transaksi", "Won't disturb if transactions already recorded")}</li>
              <li>• {L("Backup bulanan di hari terakhir setiap bulan", "Monthly backup on last day of each month")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
