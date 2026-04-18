import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../../store/database';
import { sendFinancialNotification } from '../../../lib/pusherNotifications';

const DAYS = [
  { id: 0, label: 'Minggu' },
  { id: 1, label: 'Senin' },
  { id: 2, label: 'Selasa' },
  { id: 3, label: 'Rabu' },
  { id: 4, label: 'Kamis' },
  { id: 5, label: 'Jumat' },
  { id: 6, label: 'Sabtu' },
];

const defaultReminders = [
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

export default function ReminderSettingsPage() {
  const [settings, setSettings] = useState(getSettings());
  const [reminders, setReminders] = useState(defaultReminders);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Load reminders from settings
  useEffect(() => {
    if (settings.reminders && settings.reminders.length > 0) {
      setReminders(settings.reminders);
    }
  }, [settings]);

  const handleToggleReminder = (id: string) => {
    const updatedReminders = reminders.map(reminder => 
      reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
    );
    setReminders(updatedReminders);
    saveReminders(updatedReminders);
  };

  const handleTimeChange = (id: string, newTime: string) => {
    const updatedReminders = reminders.map(reminder => 
      reminder.id === id ? { ...reminder, time: newTime } : reminder
    );
    setReminders(updatedReminders);
    saveReminders(updatedReminders);
  };

  const handleDaysChange = (id: string, dayId: number) => {
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === id) {
        const currentDays = [...reminder.days];
        if (currentDays.includes(dayId)) {
          // Remove day
          return { ...reminder, days: currentDays.filter(d => d !== dayId) };
        } else {
          // Add day
          return { ...reminder, days: [...currentDays, dayId] };
        }
      }
      return reminder;
    });
    setReminders(updatedReminders);
    saveReminders(updatedReminders);
  };

  const saveReminders = (updatedReminders: typeof reminders) => {
    const updatedSettings = {
      ...settings,
      reminders: updatedReminders
    };
    saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const testReminder = async (reminder: typeof reminders[0]) => {
    setLoading(true);
    setTestResult(`Mengirim test reminder: ${reminder.title}`);
    
    try {
      const success = await sendFinancialNotification(
        `[TEST] ${reminder.title}`,
        reminder.message,
        `test-${reminder.id}`,
        {
          type: 'reminder-test',
          reminderId: reminder.id,
          scheduledTime: reminder.time
        }
      );
      
      if (success) {
        setTestResult(`✅ Test reminder "${reminder.title}" berhasil dikirim!`);
      } else {
        setTestResult(`❌ Gagal mengirim test reminder "${reminder.title}"`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addCustomReminder = () => {
    const newId = `custom-${Date.now()}`;
    const newReminder = {
      id: newId,
      title: 'Pengingat Baru',
      message: 'Deskripsi pengingat Anda',
      time: '09:00',
      days: [1, 2, 3, 4, 5], // Senin-Jumat default
      enabled: true
    };
    
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    saveReminders(updatedReminders);
    setEditingId(newId);
  };

  const deleteReminder = (id: string) => {
    if (id.startsWith('custom-')) {
      const updatedReminders = reminders.filter(r => r.id !== id);
      setReminders(updatedReminders);
      saveReminders(updatedReminders);
    }
  };

  const updateReminderField = (id: string, field: 'title' | 'message', value: string) => {
    const updatedReminders = reminders.map(reminder => 
      reminder.id === id ? { ...reminder, [field]: value } : reminder
    );
    setReminders(updatedReminders);
  };

  const saveReminderEdit = (id: string) => {
    setEditingId(null);
    saveReminders(reminders);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Pengingat</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">📋 Tentang Pengingat</h2>
        <p className="text-gray-700">
          Pengingat otomatis akan mengirim notifikasi ke perangkat Anda sesuai jadwal yang ditentukan.
          Pastikan notifikasi browser diaktifkan untuk menerima pengingat.
        </p>
        <div className="mt-2 text-sm text-gray-600">
          <p><strong>Status:</strong> {settings.notifications.reminders ? '✅ Aktif' : '❌ Nonaktif'}</p>
          <p><strong>Device ID:</strong> {localStorage.getItem('pusher_device_id') || 'Belum terdaftar'}</p>
        </div>
      </div>

      {testResult && (
        <div className={`mb-4 p-3 rounded ${testResult.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {testResult}
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Jadwal Pengingat</h2>
          <button
            onClick={addCustomReminder}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Tambah Pengingat
          </button>
        </div>

        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={() => handleToggleReminder(reminder.id)}
                    className="mr-3 h-5 w-5"
                  />
                  {editingId === reminder.id ? (
                    <input
                      type="text"
                      value={reminder.title}
                      onChange={(e) => updateReminderField(reminder.id, 'title', e.target.value)}
                      className="text-lg font-semibold border rounded px-2 py-1 w-full"
                      onBlur={() => saveReminderEdit(reminder.id)}
                      onKeyPress={(e) => e.key === 'Enter' && saveReminderEdit(reminder.id)}
                    />
                  ) : (
                    <h3 
                      className="text-lg font-semibold cursor-pointer"
                      onClick={() => setEditingId(reminder.id)}
                    >
                      {reminder.title}
                    </h3>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => testReminder(reminder)}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm disabled:opacity-50"
                  >
                    Test
                  </button>
                  {reminder.id.startsWith('custom-') && (
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              {editingId === reminder.id ? (
                <textarea
                  value={reminder.message}
                  onChange={(e) => updateReminderField(reminder.id, 'message', e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-3"
                  rows={2}
                  onBlur={() => saveReminderEdit(reminder.id)}
                />
              ) : (
                <p 
                  className="text-gray-600 mb-3 cursor-pointer"
                  onClick={() => setEditingId(reminder.id)}
                >
                  {reminder.message}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu
                  </label>
                  <input
                    type="time"
                    value={reminder.time}
                    onChange={(e) => handleTimeChange(reminder.id, e.target.value)}
                    className="border rounded px-3 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hari
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {DAYS.map(day => (
                      <button
                        key={day.id}
                        onClick={() => handleDaysChange(reminder.id, day.id)}
                        className={`px-2 py-1 text-xs rounded ${reminder.days.includes(day.id) 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.label.charAt(0)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {reminder.days.length === 0 
                      ? 'Berdasarkan tanggal (akhir bulan)' 
                      : reminder.days.map(d => DAYS.find(day => day.id === d)?.label).join(', ')
                    }
                  </div>
                </div>

                <div className="ml-auto text-sm text-gray-500">
                  {reminder.lastSent && (
                    <div>
                      Terakhir dikirim: {new Date(reminder.lastSent).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Tips Penggunaan</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Pastikan browser mengizinkan notifikasi</li>
          <li>Pengingat hanya bekerja saat aplikasi sedang berjalan di background</li>
          <li>Gunakan "Test" untuk memastikan notifikasi berfungsi</li>
          <li>Atur waktu yang sesuai dengan rutinitas Anda</li>
          <li>Review bulanan otomatis dikirim di akhir bulan</li>
        </ul>
      </div>
    </div>
  );
}