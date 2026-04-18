/**
 * Vercel Serverless Function — /api/push
 * Menerima request dari frontend dan mengirim push notification
 * via Pusher Beams ke semua subscriber 'financial-alerts'.
 *
 * Environment variables yang dibutuhkan di Vercel:
 *   PUSHER_INSTANCE_ID   — Instance ID dari Pusher Beams dashboard
 *   PUSHER_SECRET_KEY    — Secret Key dari Pusher Beams dashboard (JANGAN di frontend)
 */

export default async function handler(req, res) {
  // Hanya terima POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const instanceId = process.env.PUSHER_INSTANCE_ID;
  const secretKey = process.env.PUSHER_SECRET_KEY;

  if (!instanceId || !secretKey) {
    console.error("Missing Pusher env vars");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const { title, body, emoji, interest = "financial-alerts", tag } = req.body ?? {};

  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required" });
  }

  // Sanitize inputs
  const safeTitle = String(title).slice(0, 100);
  const safeBody = String(body).slice(0, 300);
  const safeTag = tag ? String(tag).slice(0, 50) : `luminary-${Date.now()}`;
  const safeInterest = String(interest).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50) || "financial-alerts";

  const pusherPayload = {
    interests: [safeInterest],
    web: {
      notification: {
        title: safeTitle,
        body: safeBody,
        icon: "/icon-192.png",
        tag: safeTag,
        requireInteraction: false,
        data: { emoji: emoji ?? "🔔" },
      },
    },
  };

  try {
    const response = await fetch(
      `https://${instanceId}.pushnotifications.pusher.com/publish_api/v1/instances/${instanceId}/publishes/interests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify(pusherPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pusher API error:", response.status, errorText);
      return res.status(502).json({ error: "Failed to send push notification" });
    }

    const result = await response.json();
    return res.status(200).json({ success: true, publishId: result.publishId });
  } catch (err) {
    console.error("Push notification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
