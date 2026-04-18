# Panduan Deployment Aplikasi Keuangan ke Vercel

## Status Saat Ini
✅ **Komponen Analytics sudah ditambahkan** ke `src/app/App.tsx`
✅ **Konfigurasi Vercel** sudah ada di `vercel.json`
✅ **Repository GitHub** sudah terhubung: `https://github.com/kuyy-Qwer/Keuanganku.git`
✅ **Perubahan sudah di-push** ke GitHub

## Langkah-langkah Deployment ke Vercel

### 1. Login ke Vercel
- Buka [https://vercel.com](https://vercel.com)
- Login dengan akun GitHub Anda

### 2. Import Repository
- Klik "New Project"
- Pilih repository "Keuanganku" dari daftar
- Vercel akan otomatis mendeteksi:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Konfigurasi dari `vercel.json`

### 3. Konfigurasi Environment Variables
Di dashboard Vercel, tambahkan environment variables berikut:

```
PUSHER_INSTANCE_ID=f4ff5c69-2f44-49aa-824d-a26b518ae780
PUSHER_SECRET_KEY=15EB83C90E60FC69F627D5FEDD064478929EA1CA5FC4E7714A690A0192BDA334
```

**Catatan:** Ganti dengan credentials Pusher Beams Anda sendiri jika diperlukan.

### 4. Deploy
- Klik "Deploy"
- Vercel akan otomatis:
  - Clone repository
  - Install dependencies
  - Build aplikasi
  - Deploy ke production

### 5. Verifikasi Analytics
Setelah deployment selesai:
1. Buka aplikasi yang sudah di-deploy
2. Analytics akan otomatis aktif
3. Anda bisa melihat data analytics di dashboard Vercel

## Fitur Analytics yang Aktif

### Otomatis Terpasang:
- ✅ **Page Views** - Melacak setiap kunjungan halaman
- ✅ **Custom Events** - Siap untuk event tracking kustom
- ✅ **Performance Metrics** - Mengukur performa aplikasi
- ✅ **User Analytics** - Insights tentang pengguna

### Cara Menggunakan Analytics Events (Opsional):
```typescript
// Contoh: Track custom event
import { track } from '@vercel/analytics';

// Di dalam komponen Anda
track('transaction_added', { category: 'expense', amount: 100000 });
```

## Monitoring Deployment

### Dashboard Vercel:
- **Analytics Tab**: Lihat page views, performance metrics
- **Speed Insights**: Monitor performa aplikasi
- **Logs**: Debug jika ada masalah

### GitHub Integration:
- Setiap push ke `main` branch akan trigger deployment otomatis
- Deployment preview untuk setiap pull request

## Troubleshooting

### Jika Analytics Tidak Muncul:
1. Pastikan aplikasi di-deploy ke Vercel (bukan hosting lain)
2. Cek console browser untuk error
3. Verifikasi komponen `<Analytics />` ada di `App.tsx`

### Jika Build Gagal:
1. Cek logs deployment di dashboard Vercel
2. Verifikasi `package.json` dependencies
3. Pastikan Node.js version compatible

## Link Penting
- **Repository GitHub**: https://github.com/kuyy-Qwer/Keuanganku.git
- **Dashboard Vercel**: https://vercel.com/dashboard
- **Vercel Analytics Docs**: https://vercel.com/docs/analytics

---

**Status Terakhir:** ✅ Semua perubahan sudah di-push ke GitHub dan siap untuk deployment ke Vercel.