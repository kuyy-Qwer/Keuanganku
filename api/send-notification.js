/**
 * Vercel Serverless Function — /api/send-notification
 * Alias untuk /api/push — menerima format yang sama.
 * Dipertahankan untuk backward compatibility.
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const instanceId = process.env.PUSHER_INSTANCE_ID;
  const secretKey = process.env.PUSHER_SECRET_KEY;

  if (!instanceId || !secretKey) {
    console.error("Missing Pusher env vars");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Support kedua format: {title, body, interests} atau {title, body, interest}
  const body = req.body ?? {};
  const title = body.title;
  const bodyText = body.body;
  const emoji = body.emoji ?? "🔔";
  const interests = Array.isArray(body.interests)
    ? body.interests
    : [body.interest ?? "financial-alerts"];
  const tag = body.tag ?? `luminary-${Date.now()}`;

  if (!title || !bodyText) {
    return res.status(400).json({ error: "title and body are required" });
  }

  const safeTitle = String(title).slice(0, 100);
  const safeBody = String(bodyText).slice(0, 300);
  const safeTag = String(tag).slice(0, 50);
  const safeInterests = interests
    .map(i => String(i).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50))
    .filter(Boolean);

  if (safeInterests.length === 0) {
    return res.status(400).json({ error: "No valid interests provided" });
  }

  const pusherPayload = {
    interests: safeInterests,
    web: {
      notification: {
        title: safeTitle,
        body: safeBody,
        icon: "/icon.svg",
        tag: safeTag,
        requireInteraction: false,
        data: { emoji },
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
      return res.status(502).json({ error: "Failed to send push notification", details: errorText });
    }

    const result = await response.json();
    return res.status(200).json({ success: true, publishId: result.publishId });
  } catch (err) {
    console.error("Push notification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
