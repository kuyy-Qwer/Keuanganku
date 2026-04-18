import { useEffect, useState } from 'react';
import * as PusherPushNotifications from '@pusher/push-notifications-web';

// Singleton — satu instance untuk seluruh lifetime app
let beamsClientSingleton = null;
let initPromise = null;

const initBeams = async () => {
  if (beamsClientSingleton) return beamsClientSingleton;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!PusherPushNotifications?.Client) throw new Error('Pusher library not available');
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Push not supported');

    const client = new PusherPushNotifications.Client({
      instanceId: import.meta.env.VITE_PUSHER_INSTANCE_ID,
    });

    await client.start();
    await client.addDeviceInterest('financial-alerts');

    beamsClientSingleton = client;
    return client;
  })();

  return initPromise;
};

const usePusherBeams = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    initBeams()
      .then(async (client) => {
        setIsSupported(true);
        setIsSubscribed(true);
        const id = await client.getDeviceId();
        setDeviceId(id);
      })
      .catch((err) => {
        setError(err.message || 'Failed to initialize Pusher Beams');
        setIsSupported(false);
        setIsSubscribed(false);
      });

    // TIDAK memanggil stop() saat unmount — biarkan service worker tetap aktif
    // agar notifikasi background tetap diterima meski app tidak terbuka
  }, []);

  return { isSupported, isSubscribed, error, deviceId };
};

export default usePusherBeams;
