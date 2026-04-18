// Vercel Serverless Function untuk mengirim notifikasi Pusher Beams
// Endpoint: /api/send-notification

import https from 'https';

export default async function handler(req, res) {
  // Hanya izinkan POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { instanceId, secretKey } = getPusherCredentials();
    const { interests, title, body, data } = req.body;

    // Validasi input
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ error: 'Interests array required' });
    }

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body required' });
    }

    const postData = JSON.stringify({
      interests,
      web: {
        notification: {
          title,
          body,
          icon: data?.icon || 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4b0.png',
          data: data || {}
        }
      }
    });

    const options = {
      hostname: `${instanceId}.pushnotifications.pusher.com`,
      path: `/publish_api/v1/instances/${instanceId}/publishes`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    // Kirim request ke Pusher API
    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            body: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });

    if (result.statusCode === 200) {
      return res.status(200).json({ 
        success: true, 
        message: 'Notification sent successfully',
        response: JSON.parse(result.body)
      });
    } else {
      return res.status(result.statusCode).json({ 
        success: false, 
        error: 'Failed to send notification',
        details: result.body 
      });
    }

  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

function getPusherCredentials() {
  const instanceId = process.env.PUSHER_INSTANCE_ID;
  const secretKey = process.env.PUSHER_SECRET_KEY;

  if (!instanceId || !secretKey) {
    throw new Error('Pusher credentials not configured in environment variables');
  }

  return { instanceId, secretKey };
}