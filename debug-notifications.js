// Debug script untuk mendiagnosa masalah Pusher Beams
// Jalankan di browser console: copy-paste script ini ke console browser

console.log('=== DEBUG NOTIFIKASI PUSHER BEAMS ===');

// 1. Cek Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Worker registrations:', registrations);
    registrations.forEach(registration => {
      console.log('SW URL:', registration.scope);
      console.log('SW active:', registration.active);
    });
  });
} else {
  console.log('❌ Service Worker tidak didukung browser ini');
}

// 2. Cek Notification Permission
if ('Notification' in window) {
  console.log('Notification permission:', Notification.permission);
  if (Notification.permission === 'granted') {
    console.log('✅ Notifikasi diizinkan');
    
    // Test local notification
    new Notification('Test Notifikasi', {
      body: 'Ini adalah test notifikasi lokal',
      icon: 'https://via.placeholder.com/64x64.png'
    });
  } else if (Notification.permission === 'denied') {
    console.log('❌ Notifikasi ditolak - reset permission di browser settings');
  } else {
    console.log('⏳ Notifikasi pending - muncul prompt');
  }
} else {
  console.log('❌ Notification API tidak didukung');
}

// 3. Cek Pusher Beams Device ID
const deviceId = localStorage.getItem('beams-device-id');
console.log('Beams Device ID:', deviceId);

// 4. Cek Push Manager
if ('PushManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    return registration.pushManager.getSubscription();
  }).then(subscription => {
    console.log('Push subscription:', subscription);
  });
} else {
  console.log('❌ Push Manager tidak didukung');
}

// 5. Test manual notification subscription
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(registration => {
    console.log('✅ Service Worker terdaftar:', registration);
    
    // Kirim message ke service worker
    registration.active?.postMessage({
      type: 'DEBUG_TEST',
      data: 'Test dari debug script'
    });
  }).catch(err => {
    console.error('❌ Service Worker registration error:', err);
  });
}

console.log('=== END DEBUG ===');
