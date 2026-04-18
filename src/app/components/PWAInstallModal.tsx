import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export default function PWAInstallModal({ isOpen, onClose, onInstall }: PWAInstallModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Deteksi iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Deteksi jika sudah diinstall sebagai PWA
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show install prompt for Android/Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        onInstall();
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Show iOS installation instructions
      onInstall();
    }
    
    onClose();
  };

  if (!isOpen || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📱 Install Aplikasi</h2>
            <p className="text-gray-600 mt-1">Instal Keuanganku di perangkat Anda</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Akses Lebih Cepat</h3>
                <p className="text-sm text-gray-600">Buka langsung dari home screen</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Work Offline</h3>
                <p className="text-sm text-gray-600">Tetap bisa catat transaksi tanpa internet</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <span className="text-2xl">🔔</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notifikasi Real-time</h3>
                <p className="text-sm text-gray-600">Dapatkan pengingat transaksi langsung</p>
              </div>
            </div>
          </div>

          {isIOS ? (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">📲 Cara Install di iPhone/iPad:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-yellow-700">
                <li>Tap ikon <strong>Share</strong> di browser</li>
                <li>Scroll dan pilih <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong> di pojok kanan atas</li>
                <li>Selesai! Aplikasi akan muncul di home screen</li>
              </ol>
            </div>
          ) : (
            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🤖 Cara Install di Android:</h4>
              <p className="text-sm text-blue-700">
                Klik tombol "Install" di bawah, lalu ikuti instruksi di browser Anda.
                Aplikasi akan otomatis terinstall di perangkat.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {isIOS ? 'Tampilkan Petunjuk Install' : 'Install Aplikasi'}
            </button>
            
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Nanti Saja
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-2">
              Aplikasi gratis, tidak memerlukan download dari app store
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="rounded-b-2xl border-t bg-gray-50 p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Aman & Terenkripsi</span>
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Tanpa Iklan</span>
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">100% Gratis</span>
          </div>
        </div>
      </div>
    </div>
  );
}