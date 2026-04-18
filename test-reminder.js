// Test script untuk mengirim reminder melalui API
// Jalankan dengan: node test-reminder.js

const fetch = require('node-fetch');

async function testReminder() {
  console.log('Mengirim test reminder...');
  
  try {
    const response = await fetch('http://localhost:5173/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interests: ['financial-alerts', 'test-user'],
        title: '⏰ Test Pengingat',
        body: 'Ini adalah test pengingat dari sistem. Fitur pengingat berfungsi dengan baik!',
        data: {
          type: 'test-reminder',
          timestamp: new Date().toISOString(),
          priority: 'high'
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', result.message);
      console.log('Response:', JSON.stringify(result.response, null, 2));
    } else {
      console.log('❌ Error:', result.error);
      console.log('Details:', result.details);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Test dengan interval berbeda
async function testMultipleReminders() {
  console.log('\n=== Testing Multiple Reminders ===\n');
  
  const reminders = [
    {
      name: 'Morning Reminder',
      title: '🌅 Selamat Pagi',
      body: 'Jangan lupa catat transaksi hari ini!'
    },
    {
      name: 'Evening Reminder', 
      title: '🌙 Review Harian',
      body: 'Sudahkah Anda mencatat semua transaksi hari ini?'
    },
    {
      name: 'Weekly Reminder',
      title: '📊 Review Mingguan',
      body: 'Waktunya review progress keuangan minggu ini!'
    }
  ];

  for (const reminder of reminders) {
    console.log(`Testing: ${reminder.name}`);
    
    try {
      const response = await fetch('http://localhost:5173/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: ['financial-alerts'],
          title: reminder.title,
          body: reminder.body,
          data: { type: 'test', name: reminder.name }
        })
      });

      const result = await response.json();
      console.log(response.ok ? '✅ Success' : '❌ Failed');
      console.log('---');
      
      // Delay antara test
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

// Jalankan test
if (require.main === module) {
  testReminder().then(() => {
    console.log('\nTest completed.');
  });
}

module.exports = { testReminder, testMultipleReminders };