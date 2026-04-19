# Panduan Melihat Error di Browser Console

## Langkah-langkah Membuka Console

### Chrome / Edge / Brave
1. Tekan `F12` atau `Ctrl + Shift + I` (Windows/Linux)
2. Atau `Cmd + Option + I` (Mac)
3. Pilih tab **Console**

### Firefox
1. Tekan `F12` atau `Ctrl + Shift + K` (Windows/Linux)
2. Atau `Cmd + Option + K` (Mac)
3. Tab Console akan terbuka

### Safari
1. Aktifkan Developer Menu: Safari → Preferences → Advanced → Show Develop menu
2. Tekan `Cmd + Option + C`
3. Tab Console akan terbuka

## Apa yang Harus Dicari

### 1. Error Messages (Merah)
Cari pesan error berwarna **merah** seperti:
```
❌ Uncaught ReferenceError: ... is not defined
❌ Uncaught TypeError: Cannot read property '...' of undefined
❌ Error: No routes matched location "/"
❌ Failed to load resource: the server responded with a status of 404
```

### 2. Warning Messages (Kuning)
Pesan warning berwarna **kuning** biasanya tidak fatal tapi bisa memberi petunjuk:
```
⚠️ Warning: ...
```

### 3. Console Logs (Biru/Putih)
Log dari aplikasi yang membantu debugging:
```
[OnboardingWrapper] location: /
[OnboardingWrapper] onboardingCompleted: true
```

## Contoh Error Umum dan Solusinya

### Error 1: "Cannot read property of undefined"
```
Uncaught TypeError: Cannot read property 'fullName' of undefined
```
**Penyebab:** Mencoba akses property dari object yang undefined
**Solusi:** Reset onboarding atau clear localStorage

### Error 2: "No routes matched location"
```
Error: No routes matched location "/"
```
**Penyebab:** Router tidak menemukan route yang cocok
**Solusi:** Periksa file routes.tsx atau navigate ke `/debug/onboarding`

### Error 3: "Failed to load resource: 404"
```
Failed to load resource: the server responded with a status of 404 (Not Found)
```
**Penyebab:** File tidak ditemukan (biasanya asset atau module)
**Solusi:** Periksa import path atau rebuild aplikasi

### Error 4: "Module not found"
```
Error: Cannot find module './SomeComponent'
```
**Penyebab:** Import path salah atau file tidak ada
**Solusi:** Periksa nama file dan path import

## Cara Copy Error untuk Debugging

1. Klik kanan pada error message di console
2. Pilih **"Copy message"** atau **"Copy stack trace"**
3. Paste ke text editor atau share untuk debugging

## Quick Fixes via Console

### Reset Onboarding
```javascript
localStorage.removeItem('onboarding_completed');
localStorage.removeItem('onboarding_step');
localStorage.removeItem('onboarding_terms_accepted');
location.reload();
```

### Clear All localStorage
```javascript
localStorage.clear();
location.reload();
```

### Check Onboarding Status
```javascript
onboardingDebug.check()
```

### Force Navigate
```javascript
window.location.href = '/debug/onboarding'
```

## Error Boundary

Jika aplikasi crash, Anda akan melihat halaman error dengan:
- ⚠️ Error message
- 🔄 Tombol "Reload Aplikasi"
- 🔧 Tombol "Reset Onboarding & Reload"
- 🛠️ Tombol "Buka Debug Tools"

Gunakan tombol-tombol tersebut untuk recovery.

## Tips Debugging

1. **Reload dengan Clear Cache:**
   - Chrome: `Ctrl + Shift + R` atau `Cmd + Shift + R`
   - Ini akan reload tanpa cache

2. **Incognito/Private Mode:**
   - Test di incognito untuk memastikan bukan masalah cache/extension

3. **Check Network Tab:**
   - Buka tab **Network** di DevTools
   - Reload page
   - Lihat apakah ada file yang gagal load (status merah)

4. **Disable Extensions:**
   - Extension browser bisa interfere dengan aplikasi
   - Test dengan extension disabled

## Informasi yang Berguna untuk Debugging

Jika menemukan error, catat informasi berikut:
- ✅ Pesan error lengkap (copy dari console)
- ✅ URL saat error terjadi
- ✅ Langkah-langkah untuk reproduce error
- ✅ Browser dan versi (Chrome 120, Firefox 121, dll)
- ✅ Screenshot error boundary (jika muncul)

## Kontak Support

Jika masih mengalami masalah setelah mencoba solusi di atas:
1. Copy semua error dari console
2. Screenshot halaman error
3. Buka issue di repository atau hubungi developer
