/**
 * Global notification event bus.
 * Komponen manapun bisa dispatch notifikasi, NotificationToast akan menampilkannya.
 */

export type NotifType = "income" | "expense" | "saving" | "achievement" | "alert" | "reminder" | "debt";

export interface NotifPayload {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  emoji?: string;
}

import { shouldUsePusherBeams } from "./notificationFilter";

export async function dispatchNotif(payload: Omit<NotifPayload, "id">) {
  const event = new CustomEvent<NotifPayload>("luminary_notif", {
    detail: { ...payload, id: crypto.randomUUID() },
  });
  window.dispatchEvent(event);
  
  // Play sound based on notification type
  if (payload.type === "alert") {
    try {
      const { playAlertSound } = await import("./sounds");
      playAlertSound();
    } catch {
      // ignore sound failures
    }
  } else if (payload.type === "achievement") {
    try {
      const { playIncomeSound } = await import("./sounds");
      playIncomeSound();
    } catch {
      // ignore sound failures
    }
  } else if (payload.type === "reminder") {
    try {
      const { playAlertSound } = await import("./sounds");
      playAlertSound();
    } catch {
      // ignore sound failures
    }
  } else {
    try {
      const { playExpenseSound } = await import("./sounds");
      playExpenseSound();
    } catch {
      // ignore sound failures
    }
  }
  
  // Kirim via Pusher Beams hanya untuk notifikasi penting
  if (shouldUsePusherBeams(payload as NotifPayload)) {
    sendPusherBeamsNotification(payload as NotifPayload);
  }
}

// Fungsi untuk kirim notifikasi via Pusher Beams (melalui Vercel API)
async function sendPusherBeamsNotification(data: NotifPayload) {
  try {
    if (!navigator.onLine || Notification.permission !== 'granted') return;

    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        body: data.message,
        emoji: data.emoji ?? '🔔',
        interest: 'financial-alerts',
        tag: `luminary-${data.type}-${Date.now()}`,
      }),
    });
  } catch {
    // Gagal kirim push tidak boleh crash app
  }
}

/**
 * CRUD success feedback (per request): alert "berhasil" + sound.
 * Gunakan ini untuk aksi create/update/save.
 */
export async function crudSuccess() {
  try {
    const { playSuccessSound } = await import("./sounds");
    playSuccessSound();
  } catch {
    // ignore sound failures
  }
  try {
    window.alert("berhasil");
  } catch {
    // ignore alert failures
  }
}

/**
 * CRUD delete success feedback: alert "berhasil" + delete sound.
 */
export async function crudDeleteSuccess() {
  try {
    const { playDeleteSound } = await import("./sounds");
    playDeleteSound();
  } catch {
    // ignore sound failures
  }
  try {
    window.alert("berhasil");
  } catch {
    // ignore alert failures
  }
}
