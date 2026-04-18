import { useState, useEffect } from 'react';

interface UsePWAInstallReturn {
  isInstallable: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  deferredPrompt: any;
  showInstallPrompt: () => Promise<boolean>;
}

export default function usePWAInstall(): UsePWAInstallReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Deteksi iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Deteksi jika sudah diinstall sebagai PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isInStandaloneMode);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Untuk iOS, kita anggap selalu installable karena bisa add to homescreen
    if (isIOSDevice && !isInStandaloneMode) {
      setIsInstallable(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          return true;
        } else {
          console.log('User dismissed the install prompt');
          return false;
        }
      } catch (error) {
        console.error('Error showing install prompt:', error);
        return false;
      }
    }
    
    // Untuk iOS, kita hanya bisa show instructions
    return false;
  };

  return {
    isInstallable,
    isIOS,
    isStandalone,
    deferredPrompt,
    showInstallPrompt
  };
}