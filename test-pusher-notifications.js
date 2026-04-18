// Test script untuk mengirim notifikasi Pusher Beams
// Jalankan dengan: node test-pusher-notifications.cjs

import https from 'https';

const instanceId = 'f4ff5c69-2f44-49aa-824d-a26b518ae780';
const beamsToken = '15EB83C90E60FC69F627D5FEDD064478929EA1CA5FC4E7714A690A0192BDA334';

const options = {
  hostname: 'f4ff5c69-2f44-49aa-824d-a26b518ae780.pushnotifications.pusher.com',
  path: '/publish_api/v1/instances/' + instanceId + '/publishes',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + beamsToken,
    'Content-Type': 'application/json'
  }
};

const postData = JSON.stringify({
  interests: ['financial-alerts'],
  web: {
    notification: {
      title: '💰 Notifikasi Keuangan',
      body: 'Test notifikasi Pusher Beams untuk aplikasi keuangan Anda',
      icon: 'https://example.com/icon.png',
      data: {
        type: 'financial_alert',
        message: 'Sistem keuangan Anda siap digunakan!'
      }
    }
  }
});

console.log('Mengirim notifikasi test ke Pusher Beams...');
console.log('Instance ID:', instanceId);
console.log('Request body:', postData);

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response:', res.statusCode);
    console.log('Response body:', data);
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();
