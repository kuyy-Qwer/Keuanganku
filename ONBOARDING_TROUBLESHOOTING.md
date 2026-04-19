# Troubleshooting: Onboarding Tidak Muncul

## Masalah
Tampilan onboarding tidak muncul saat membuka aplikasi, langsung redirect ke halaman login atau dashboard.

## Penyebab
Flag `onboarding_completed` tersimpan di localStorage browser, sehingga aplikasi menganggap onboarding sudah selesai.

## Solusi

### Opsi 1: Menggunakan Browser Console (Recommended)

1. Buka aplikasi di browser
2. Tekan `F12` atau `Ctrl+Shift+I` (Windows/Linux) atau `Cmd+Option+I` (Mac) untuk membuka Developer Tools
3. Pilih tab **Console**
4. Ketik salah satu command berikut:

#### Cek Status Onboarding
```javascript
onboardingDebug.check()
```
Ini akan menampilkan status semua flag onboarding.

#### Reset Onboarding (Mulai dari Awal)
```javascript
onboardingDebug.reset()
```
Setelah menjalankan command ini:
- Reload halaman (`F5` atau `Ctrl+R`)
- Navigate ke `/` atau klik logo untuk memulai onboarding

#### Force Complete Onboarding (Skip Onboarding)
```javascript
onboardingDebug.forceComplete()
```
Gunakan ini jika ingin langsung masuk ke aplikasi tanpa onboarding.

### Opsi 2: Manual via localStorage

1. Buka Developer Tools (`F12`)
2. Pilih tab **Application** (Chrome) atau **Storage** (Firefox)
3. Di sidebar kiri, pilih **Local Storage** → pilih domain aplikasi
4. Hapus key-key berikut:
   - `onboarding_completed`
   - `onboarding_step`
   - `onboarding_terms_accepted`
   - `onboarding_tour_pending`
   - `wallet_setup`
5. Reload halaman

### Opsi 3: Clear All Data (Nuclear Option)

⚠️ **Warning**: Ini akan menghapus SEMUA data aplikasi!

1. Buka Developer Tools (`F12`)
2. Pilih tab **Application** (Chrome) atau **Storage** (Firefox)
3. Klik kanan pada domain di **Local Storage**
4. Pilih **Clear**
5. Reload halaman

## Verifikasi

Setelah reset, cek apakah onboarding muncul dengan:
1. Navigate ke `/` atau root URL
2. Seharusnya muncul **SplashIntroPage** dengan animasi logo dan progress bar
3. Setelah 5 detik, otomatis redirect ke `/onboarding/welcome`

## Flow Onboarding yang Benar

1. **Splash** (`/` atau `/onboarding/splash`) - 5 detik auto-redirect
2. **Welcome** (`/onboarding/welcome`) - Terms & Conditions
3. **Profile** (`/onboarding/profile`) - Setup profil user
4. **Wallet** (`/onboarding/wallet`) - Setup dompet/bank
5. **Tutorial** (`/onboarding/tutorial`) - Guided tour

## Debug Commands Reference

```javascript
// Check current onboarding status
onboardingDebug.check()

// Reset onboarding to start fresh
onboardingDebug.reset()

// Force mark onboarding as completed
onboardingDebug.forceComplete()
```

## Perubahan yang Dilakukan

### 1. `OnboardingWrapper.tsx`
- Menambahkan validasi lebih ketat untuk `onboarding_completed`
- Sekarang cek semua requirements: `termsAccepted`, `hasProfile`, `walletSetup`
- Auto-reset flag jika requirements tidak terpenuhi

### 2. `onboardingDebug.ts` (New File)
- Utility functions untuk debugging
- Exposed ke `window.onboardingDebug` untuk akses via console
- Functions: `check()`, `reset()`, `forceComplete()`

### 3. `App.tsx`
- Import debug tools agar tersedia di console

## Testing

Untuk testing onboarding flow:

```javascript
// 1. Reset onboarding
onboardingDebug.reset()

// 2. Reload page
location.reload()

// 3. Navigate to root
location.href = '/'

// 4. Check status at any time
onboardingDebug.check()
```

## Catatan untuk Developer

- Debug tools hanya tersedia di development mode
- Untuk production, pertimbangkan menambahkan feature flag atau admin panel
- Jangan expose debug tools di production build
