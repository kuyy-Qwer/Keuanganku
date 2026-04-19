# Solusi: Layar Kosong / #root Kosong

## 🔍 Diagnosis Masalah

Berdasarkan analisis, ada beberapa kemungkinan penyebab layar kosong:

1. **Runtime Error** - Error saat aplikasi berjalan yang menyebabkan crash
2. **Router Configuration** - Route tidak ditemukan atau salah konfigurasi
3. **Onboarding Logic** - Logika onboarding yang conflict
4. **Import Error** - Module atau component gagal di-import

## ✅ Perbaikan yang Sudah Dilakukan

### 1. **Error Boundary Component**
- Menambahkan `ErrorBoundary` untuk menangkap error React
- Jika ada error, akan muncul halaman error yang informatif
- Menyediakan tombol quick fix untuk recovery

### 2. **Perbaikan OnboardingWrapper**
- Menghapus duplikasi logika yang bisa menyebabkan error
- Menyederhanakan pengecekan onboarding completion
- Menambahkan logging untuk debugging

### 3. **Safe Main.tsx**
- Menambahkan null check untuk root element
- Wrap App dengan ErrorBoundary
- Error message yang jelas jika root element tidak ditemukan

### 4. **Debug Tools Enhancement**
- Menambahkan try-catch di onboardingDebug
- Mencegah crash jika ada error saat load debug tools

## 🚀 Langkah-langkah Troubleshooting

### Langkah 1: Buka Browser Console (WAJIB!)

**Chrome/Edge/Brave:**
```
Tekan F12 atau Ctrl+Shift+I
Pilih tab "Console"
```

**Firefox:**
```
Tekan F12 atau Ctrl+Shift+K
```

**Safari:**
```
Cmd+Option+C
```

### Langkah 2: Cari Error Messages

Lihat di console apakah ada pesan error **MERAH** seperti:
```
❌ Uncaught TypeError: ...
❌ Uncaught ReferenceError: ...
❌ Error: No routes matched location "/"
❌ Failed to load resource: 404
```

**PENTING:** Copy semua error message yang muncul!

### Langkah 3: Coba Quick Fixes

#### Fix 1: Reset Onboarding via Console
```javascript
// Paste di console dan tekan Enter
onboardingDebug.reset()
location.reload()
```

#### Fix 2: Clear localStorage
```javascript
// Paste di console dan tekan Enter
localStorage.clear()
location.reload()
```

#### Fix 3: Force Navigate ke Debug Page
```javascript
// Paste di console dan tekan Enter
window.location.href = '/debug/onboarding'
```

#### Fix 4: Hard Reload
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Langkah 4: Gunakan Debug Page

Jika console accessible, navigate ke:
```
/debug/onboarding
```

Di halaman ini Anda bisa:
- ✅ Check status onboarding
- ✅ Reset onboarding dengan 1 klik
- ✅ Force complete onboarding
- ✅ Navigate ke berbagai halaman

## 🎯 Skenario Spesifik

### Skenario A: Layar Putih/Hitam Kosong, Tidak Ada Error
**Kemungkinan:** CSS issue atau loading state stuck

**Solusi:**
1. Buka DevTools → Elements tab
2. Cek apakah ada element di dalam `<div id="root">`
3. Jika ada tapi tidak terlihat, cek CSS (opacity, display, visibility)
4. Coba disable custom CSS di DevTools

### Skenario B: Error Boundary Muncul
**Kemungkinan:** Ada runtime error di component

**Solusi:**
1. Baca error message di error boundary
2. Klik tombol "Reset Onboarding & Reload"
3. Jika masih error, klik "Buka Debug Tools"
4. Copy error message dan stack trace

### Skenario C: Console Penuh Error Merah
**Kemungkinan:** Import error atau module not found

**Solusi:**
1. Copy semua error messages
2. Cek apakah ada pattern (misalnya semua error dari file yang sama)
3. Coba rebuild aplikasi:
   ```bash
   npm run build
   # atau
   npm run dev
   ```

### Skenario D: "No routes matched location"
**Kemungkinan:** Router configuration issue

**Solusi:**
1. Navigate manual ke `/debug/onboarding`
2. Atau via console:
   ```javascript
   window.location.href = '/debug/onboarding'
   ```
3. Dari debug page, gunakan navigation buttons

## 📋 Checklist Debugging

Sebelum melaporkan bug, pastikan sudah mencoba:

- [ ] Buka browser console dan cek error messages
- [ ] Copy semua error messages (jika ada)
- [ ] Coba reset onboarding via console
- [ ] Coba clear localStorage
- [ ] Coba hard reload (Ctrl+Shift+R)
- [ ] Coba di incognito/private mode
- [ ] Coba di browser lain
- [ ] Coba navigate ke `/debug/onboarding`
- [ ] Screenshot error boundary (jika muncul)
- [ ] Catat URL saat error terjadi

## 🛠️ Advanced Debugging

### Check Network Requests
1. Buka DevTools → Network tab
2. Reload page
3. Lihat apakah ada request yang failed (merah)
4. Klik request yang failed untuk detail

### Check React DevTools
1. Install React DevTools extension
2. Buka DevTools → Components tab
3. Lihat component tree
4. Cek apakah ada component yang tidak render

### Check localStorage
1. DevTools → Application tab (Chrome) atau Storage tab (Firefox)
2. Expand "Local Storage"
3. Lihat semua keys dan values
4. Cek apakah ada value yang aneh/corrupt

### Manual localStorage Reset
```javascript
// Via console
const keysToRemove = [
  'onboarding_completed',
  'onboarding_step',
  'onboarding_terms_accepted',
  'onboarding_tour_pending',
  'wallet_setup'
];
keysToRemove.forEach(key => localStorage.removeItem(key));
location.reload();
```

## 📞 Melaporkan Bug

Jika semua solusi di atas tidak berhasil, laporkan bug dengan informasi:

### Informasi Wajib:
1. **Error Messages** (copy dari console)
2. **Browser & Version** (Chrome 120, Firefox 121, dll)
3. **URL saat error** (/, /app, /onboarding, dll)
4. **Screenshot** (error boundary atau layar kosong)
5. **Langkah reproduce** (apa yang dilakukan sebelum error)

### Informasi Tambahan:
- Operating System (Windows 11, macOS 14, dll)
- Device (Desktop, Mobile, Tablet)
- Network tab screenshot (jika ada failed requests)
- localStorage dump (via `onboardingDebug.check()`)

## 🎓 Penjelasan Teknis

### Mengapa Layar Bisa Kosong?

1. **React Render Error:**
   - Component throw error saat render
   - Error tidak tertangkap → React stop rendering
   - Result: `#root` tetap kosong

2. **Router No Match:**
   - URL tidak match dengan route manapun
   - Router tidak render component apapun
   - Result: Layar kosong

3. **Conditional Render Return Null:**
   - Component return `null` karena kondisi tertentu
   - Misalnya: `if (loading) return null;` stuck di loading
   - Result: Tidak ada yang di-render

4. **Import/Module Error:**
   - Import path salah atau module tidak ada
   - JavaScript error sebelum render
   - Result: Aplikasi crash sebelum render

### Error Boundary

Error Boundary adalah React component yang:
- Menangkap error di child components
- Mencegah entire app crash
- Menampilkan fallback UI
- Memberikan opsi recovery

Sekarang aplikasi sudah dilindungi dengan Error Boundary, jadi jika ada error, Anda akan melihat halaman error yang informatif, bukan layar kosong.

## ✨ Kesimpulan

Dengan perbaikan yang sudah dilakukan:
1. ✅ Error akan tertangkap dan ditampilkan dengan jelas
2. ✅ User bisa recovery dengan tombol quick fix
3. ✅ Debug tools tersedia untuk troubleshooting
4. ✅ Logging lebih detail untuk tracking issue

**Next Step:** Buka aplikasi, buka console, dan lihat apakah ada error messages. Jika ada, copy dan laporkan!
