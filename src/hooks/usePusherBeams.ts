import { useEffect, useState } from 'react';
import * as PusherPushNotifications from '@pusher/push-notifications-web';

let beamsClientSingleton: any = null;
let initPromise: Promise<any> | null = null;

const initBeams = async (): Promise<any> => {
  if (beamsClientSingleton) return beamsClientSingleton;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!(PusherPushNotifications as any)?.Client) throw new Error('Pusher library not available');
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Push not supported');

    const instanceId = import.meta.env.VITE_PUSHER_INSTANCE_ID;
    if (!instanceId) throw new Error('VITE_PUSHER_INSTANCE_ID not set');

    // Minta izin notifikasi dulu sebelum inisialisasi Pusher
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    } else if (Notification.permission === 'denied') {
      throw new Error('Notification permission denied');
    }

    const client = new (PusherPushNotifications as any).Client({ instanceId });

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
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    // Update permission status
    if (typeof Notification !== 'undefined') {
      setPermissionStatus(Notification.permission);
    }

    initBeams()
      .then(async (client) => {
        setIsSupported(true);
        setIsSubscribed(true);
        setPermissionStatus('granted');
        const id = await client.getDeviceId();
        setDeviceId(id);
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to initialize Pusher Beams');
        setIsSupported(false);
        setIsSubscribed(false);
      });
  }, []);

  return { isSupported, isSubscribed, error, deviceId, permissionStatus };
};

export default usePusherBeams;
