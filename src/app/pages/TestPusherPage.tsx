import { useState, useEffect } from 'react';
import usePusherBeams from '../../hooks/usePusherBeams';
import { sendFinancialNotification } from '../../lib/pusherNotifications';

export default function TestPusherPage() {
  const { isSupported, isSubscribed, error, deviceId } = usePusherBeams();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testNotification = async () => {
    setLoading(true);
    setTestResult('Mengirim notifikasi test...');
    
    try {
      const success = await sendFinancialNotification(
        '💰 Test Notifikasi Keuangan',
        'Ini adalah notifikasi test dari Pusher Beams. Fitur pengingat berfungsi dengan baik!',
        'test-user',
        { test: true, timestamp: new Date().toISOString() }
      );
      
      if (success) {
        setTestResult('✅ Notifikasi berhasil dikirim! Cek notifikasi di browser Anda.');
      } else {
        setTestResult('❌ Gagal mengirim notifikasi. Cek console untuk error.');
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testReminder = async () => {
    setLoading(true);
    setTestResult('Mengirim pengingat transaksi...');
    
    try {
      const success = await sendFinancialNotification(
        '⏰ Pengingat Transaksi',
        'Jangan lupa catat transaksi hari ini! Konsistensi adalah kunci kesuksesan finansial.',
        'reminder-user',
        { 
          type: 'reminder',
          category: 'daily-reminder',
          priority: 'medium' 
        }
      );
      
      if (success) {
        setTestResult('✅ Pengingat berhasil dikirim!');
      } else {
        setTestResult('❌ Gagal mengirim pengingat.');
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Pusher Beams Notifications</h1>
      
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Status Pusher Beams</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isSupported ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Push Notifications Supported: {isSupported ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isSubscribed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>Subscribed: {isSubscribed ? '✅ Yes' : '⏳ Waiting...'}</span>
          </div>
          {deviceId && (
            <div className="text-sm text-gray-600">
              Device ID: <code className="bg-gray-100 px-2 py-1 rounded">{deviceId}</code>
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Test Notifikasi</h2>
        <div className="space-y-4">
          <button
            onClick={testNotification}
            disabled={loading || !isSupported}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengirim...' : 'Kirim Notifikasi Test'}
          </button>
          
          <button
            onClick={testReminder}
            disabled={loading || !isSupported}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengirim...' : 'Kirim Pengingat'}
          </button>
        </div>
        
        {testResult && (
          <div className={`mt-4 p-3 rounded ${testResult.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {testResult}
          </div>
        )}
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instruksi Testing</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Pastikan browser mengizinkan notifikasi (biasanya popup akan muncul)</li>
          <li>Klik "Kirim Notifikasi Test" untuk mengirim notifikasi pertama</li>
          <li>Cek apakah notifikasi muncul di sistem operasi Anda</li>
          <li>Klik "Kirim Pengingat" untuk menguji fitur pengingat</li>
          <li>Jika tidak muncul, cek browser console (F12) untuk error</li>
        </ol>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong> Notifikasi hanya akan muncul jika:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Browser mendukung Push API</li>
            <li>Anda mengizinkan notifikasi</li>
            <li>Service worker terdaftar dengan benar</li>
            <li>Environment variables Pusher sudah dikonfigurasi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}