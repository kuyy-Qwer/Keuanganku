
# Luminary - Aplikasi Keuangan Pribadi

Aplikasi keuangan pribadi dengan fitur pencatatan, analisis, dan pengingat untuk membantu mengelola keuangan dengan lebih baik.

## Fitur Utama
- Pencatatan transaksi keuangan
- Analisis pengeluaran dan pemasukan
- Sistem pencapaian (achievements)
- Pengingat dan notifikasi
- Mode perlindungan (Guardian Mode)
- Backup data otomatis
- PWA (Progressive Web App) support

## Teknologi
- React 18 + TypeScript
- Vite sebagai build tool
- Tailwind CSS untuk styling
- Vercel Analytics untuk tracking
- Pusher Beams untuk notifikasi push
- Service Worker untuk offline capability

## Menjalankan Aplikasi

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

## Deployment ke Vercel

Aplikasi ini sudah dikonfigurasi untuk deployment otomatis ke Vercel melalui GitHub.

### Langkah-langkah Deployment:

1. **Pastikan kode sudah di-push ke GitHub**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Hubungkan repository ke Vercel**
   - Login ke [Vercel](https://vercel.com)
   - Klik "New Project"
   - Pilih repository GitHub Anda
   - Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`

3. **Konfigurasi Environment Variables**
   Di dashboard Vercel, tambahkan environment variables:
   - `PUSHER_INSTANCE_ID` - Instance ID Pusher Beams
   - `PUSHER_SECRET_KEY` - Secret key Pusher Beams

4. **Analytics**
   Vercel Analytics sudah terintegrasi dan akan otomatis aktif setelah deployment.

### Environment Variables
Buat file `.env.local` di root project dengan konten:
```env
VITE_PUSHER_INSTANCE_ID=your_instance_id
PUSHER_INSTANCE_ID=your_instance_id
PUSHER_SECRET_KEY=your_secret_key
```

**Catatan:** File `.env.local` tidak akan di-commit ke Git (sudah di-exclude di `.gitignore`).

## Analytics

Komponen `<Analytics />` dari `@vercel/analytics/next` sudah ditambahkan ke aplikasi. Analytics akan otomatis:
- Melacak page views
- Melacak custom events
- Menyediakan insights pengguna
- Bekerja tanpa konfigurasi tambahan setelah deployment ke Vercel

## Struktur Project
```
src/
├── app/                    # Komponen utama aplikasi
│   ├── components/         # Komponen reusable
│   ├── pages/             # Halaman aplikasi
│   ├── layouts/           # Layout templates
│   ├── lib/               # Utility functions
│   └── store/             # State management
├── styles/                # Global styles
└── hooks/                 # Custom React hooks
```

## License
Proprietary
  