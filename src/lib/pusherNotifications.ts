// Utility untuk mengirim notifikasi melalui Pusher Beams API

export interface NotificationData {
  title: string;
  body: string;
  interests: string[];
  data?: {
    type?: string;
    [key: string]: any;
  };
}

export async function sendPusherNotification(notification: NotificationData): Promise<boolean> {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send notification:', error);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Contoh penggunaan:
// await sendPusherNotification({
//   title: '💰 Transaksi Baru',
//   body: 'Anda menerima transfer Rp 500.000',
//   interests: ['financial-alerts', 'user-123'],
//   data: {
//     type: 'transaction',
//     amount: 500000,
//     sender: 'John Doe'
//   }
// });

// Helper untuk notifikasi keuangan umum
export async function sendFinancialNotification(
  title: string, 
  body: string, 
  userId?: string,
  additionalData?: Record<string, any>
): Promise<boolean> {
  const interests = ['financial-alerts'];
  if (userId) {
    interests.push(`user-${userId}`);
  }

  return sendPusherNotification({
    title,
    body,
    interests,
    data: {
      type: 'financial',
      timestamp: new Date().toISOString(),
      ...additionalData
    }
  });
}