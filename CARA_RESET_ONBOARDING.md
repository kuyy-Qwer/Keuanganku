# Cara Reset Onboarding

## Masalah
Tampilan onboarding tidak muncul karena flag `onboarding_completed` sudah tersimpan di browser.

## Solusi Cepat

### Metode 1: Halaman Debug (Paling Mudah) ⭐

1. Buka browser dan navigate ke: **`/debug/onboarding`**
2. Klik tombol **"Reset Onboarding"**
3. Klik tombol **"Go to Onboarding (/)"**
4. Onboarding akan muncul!

### Metode 2: Browser Console

1. Tekan `F12` untuk membuka Developer Tools
2. Pilih tab **Console**
3. Ketik: `onboardingDebug.reset()`
4. Tekan Enter
5. Reload halaman (`F5`)
6. Navigate ke `/`

### Metode 3: Manual (localStorage)

1. Tekan `F12` untuk membuka Developer Tools
2. Pilih tab **Application** (Chrome) atau **Storage** (Firefox)
3. Klik **Local Storage** → pilih domain aplikasi
4. Hapus key: `onboarding_completed`
5. Reload halaman

## Verifikasi

Setelah reset, buka `/` dan Anda akan melihat:
- ✅ Splash screen dengan logo dan animasi
- ✅ Auto-redirect ke welcome page setelah 5 detik
- ✅ Flow onboarding lengkap: Welcome → Profile → Wallet → Tutorial

## Tools Debug

Akses halaman debug di: **`/debug/onboarding`**

Fitur yang tersedia:
- 📊 Check Status - Lihat status onboarding saat ini
- 🔄 Reset Onboarding - Mulai dari awal
- ⚡ Force Complete - Skip onboarding
- 🧭 Navigation - Quick links ke onboarding/app

## Console Commands

```javascript
// Cek status
onboardingDebug.check()

// Reset onboarding
onboardingDebug.reset()

// Force complete (skip)
onboardingDebug.forceComplete()
```

## Catatan

- Reset onboarding **TIDAK** menghapus data user (profile, transaksi, dll)
- Hanya menghapus flag onboarding saja
- Aman untuk testing dan development
