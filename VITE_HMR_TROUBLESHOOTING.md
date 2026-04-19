# Troubleshooting: Vite HMR & Browser Cache Issues

## 🔍 Masalah yang Terjadi

### Error Message:
```
[vite] failed to connect to websocket
does not provide an export named 'userHasPin'
```

### Penyebab:
1. **Vite WebSocket Terputus** - HMR (Hot Module Replacement) tidak berfungsi
2. **Browser Cache Stale** - Browser masih menggunakan versi lama dari file
3. **Kode sudah benar** - Tapi browser belum mendapat update terbaru

---

## ✅ Solusi Lengkap (Ikuti Urutan!)

### **Step 1: Restart Vite Dev Server** ⭐

```bash
# 1. Stop server yang sedang berjalan
# Tekan Ctrl + C di terminal

# 2. Jalankan ulang
npm run dev

# 3. Perhatikan port yang digunakan
# Biasanya: http://localhost:5173
# Jika port berubah (5174, 5175, dll), gunakan port baru tersebut
```

**Cek Output Terminal:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### **Step 2: Hard Reload Browser** ⭐⭐⭐

**PENTING:** Ini adalah langkah PALING PENTING!

#### Windows/Linux:
```
Ctrl + F5
atau
Ctrl + Shift + R
```

#### Mac:
```
Cmd + Shift + R
```

#### Manual (Jika shortcut tidak bekerja):
1. Buka DevTools (F12)
2. Klik kanan pada tombol reload di browser
3. Pilih **"Empty Cache and Hard Reload"** atau **"Hard Reload"**

### **Step 3: Clear Browser Cache (Jika Hard Reload Tidak Cukup)**

#### Chrome/Edge/Brave:
1. Tekan `Ctrl + Shift + Delete` (Windows) atau `Cmd + Shift + Delete` (Mac)
2. Pilih **"Cached images and files"**
3. Time range: **"Last hour"** atau **"All time"**
4. Klik **"Clear data"**

#### Firefox:
1. Tekan `Ctrl + Shift + Delete`
2. Pilih **"Cache"**
3. Klik **"Clear Now"**

### **Step 4: Verifikasi Import Statement**

Pastikan import menggunakan **named export** dengan kurung kurawal:

```typescript
// ✅ BENAR - Named export
import { userHasPin, isAuthenticated } from '../lib/authGuard';

// ❌ SALAH - Default import
import userHasPin from '../lib/authGuard';
```

### **Step 5: Cek Console untuk Konfirmasi**

Setelah hard reload, buka console (F12) dan cek:
- ✅ Tidak ada error merah tentang "does not provide an export"
- ✅ Tidak ada error "failed to connect to websocket"
- ✅ Aplikasi mulai render

---

## 🔧 Troubleshooting Lanjutan

### Masalah: Vite WebSocket Terus Gagal

#### Penyebab Umum:
1. **Port 5173 sudah digunakan** oleh aplikasi lain
2. **Firewall** memblokir WebSocket
3. **Proxy/VPN** interfere dengan koneksi
4. **Antivirus** memblokir koneksi lokal

#### Solusi:

**A. Gunakan Port Lain:**
```bash
# Edit package.json atau jalankan dengan flag
npm run dev -- --port 5174
```

**B. Cek Port yang Digunakan:**
```bash
# Windows
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :5173
```

**C. Kill Process di Port 5173:**
```bash
# Windows (ganti PID dengan nomor dari netstat)
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

**D. Disable Firewall Sementara:**
- Windows: Settings → Windows Security → Firewall → Turn off (sementara)
- Mac: System Preferences → Security & Privacy → Firewall → Turn off (sementara)

### Masalah: Hard Reload Tidak Membantu

#### Solusi: Disable Cache di DevTools

1. Buka DevTools (F12)
2. Buka Settings (F1 atau klik ⚙️)
3. Cari **"Disable cache (while DevTools is open)"**
4. ✅ Centang opsi tersebut
5. **Biarkan DevTools tetap terbuka** saat development

### Masalah: Import Error Masih Muncul

#### Cek File authGuard.ts:

```typescript
// Pastikan export menggunakan 'export' keyword
export function userHasPin(): boolean {
  const user = getUser();
  return !!(user.pin && user.pin.trim() !== "");
}

// Bukan export default
// ❌ export default function userHasPin() { ... }
```

#### Cek Import di AuthGuard.tsx:

```typescript
// Pastikan menggunakan kurung kurawal
import { isAuthenticated, refreshActivity, destroySession, userHasPin } from "../lib/authGuard";
```

---

## 🚀 Quick Fix Commands

### Reset Lengkap (Nuclear Option):

```bash
# 1. Stop dev server (Ctrl + C)

# 2. Clear node_modules dan reinstall
rm -rf node_modules
npm install

# 3. Clear Vite cache
rm -rf node_modules/.vite

# 4. Restart dev server
npm run dev

# 5. Hard reload browser (Ctrl + Shift + R)
```

### Alternatif: Build Production untuk Test

```bash
# Build production
npm run build

# Preview production build
npm run preview

# Buka di browser (biasanya port 4173)
```

---

## 📋 Checklist Debugging

Jika masih ada masalah, cek satu per satu:

- [ ] Dev server berjalan tanpa error
- [ ] Port yang benar (cek terminal output)
- [ ] WebSocket connected (tidak ada error di console)
- [ ] Hard reload sudah dilakukan (Ctrl + Shift + R)
- [ ] Cache browser sudah di-clear
- [ ] DevTools "Disable cache" sudah diaktifkan
- [ ] Import statement menggunakan kurung kurawal `{ }`
- [ ] Export di authGuard.ts menggunakan `export function`
- [ ] Tidak ada typo di nama fungsi
- [ ] File sudah di-save di editor

---

## 🎯 Workflow Development yang Benar

Untuk menghindari masalah ini di masa depan:

### 1. **Selalu Cek Terminal**
```
✅ VITE ready
✅ No errors
✅ Port number jelas
```

### 2. **Enable "Disable Cache" di DevTools**
- Buka DevTools (F12)
- Settings → Disable cache
- Biarkan DevTools terbuka saat development

### 3. **Gunakan Incognito untuk Testing**
- Incognito tidak punya cache
- Extension tidak aktif
- Fresh state setiap kali

### 4. **Hard Reload Setelah Perubahan Besar**
- Setelah menambah export baru
- Setelah mengubah import path
- Setelah install package baru

### 5. **Restart Dev Server Secara Berkala**
- Setelah install package
- Setelah perubahan config (vite.config, tsconfig)
- Jika HMR terasa lambat/stuck

---

## 🔍 Cara Cek HMR Berfungsi

### Test HMR:
1. Buka file component (misalnya HomePage.tsx)
2. Ubah text di component
3. Save file
4. **Jangan reload browser**
5. Lihat apakah perubahan muncul otomatis

**Jika HMR bekerja:**
- ✅ Perubahan muncul dalam 1-2 detik
- ✅ Tidak perlu reload manual
- ✅ State component tetap terjaga

**Jika HMR tidak bekerja:**
- ❌ Perubahan tidak muncul
- ❌ Harus reload manual
- ❌ Console error "failed to connect to websocket"

---

## 💡 Tips Pro

### 1. **Gunakan Vite Inspector**
```bash
npm install -D vite-plugin-inspect
```

Tambah di `vite.config.ts`:
```typescript
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    react(),
    Inspect() // http://localhost:5173/__inspect/
  ]
})
```

### 2. **Monitor Network di DevTools**
- Tab Network → Filter: WS (WebSocket)
- Lihat apakah WebSocket connection established
- Status harus: **101 Switching Protocols**

### 3. **Gunakan Vite Debug Mode**
```bash
DEBUG=vite:* npm run dev
```

### 4. **Check Vite Config**
Pastikan `vite.config.ts` tidak memblokir HMR:
```typescript
export default defineConfig({
  server: {
    hmr: true, // Pastikan true
    port: 5173,
  }
})
```

---

## ✨ Kesimpulan

**Masalah Anda:**
- ✅ Kode sudah benar
- ❌ Browser masih pakai cache lama
- ❌ Vite HMR terputus

**Solusi:**
1. Restart Vite dev server
2. Hard reload browser (Ctrl + Shift + R)
3. Clear cache jika perlu
4. Enable "Disable cache" di DevTools

**Setelah ini, aplikasi seharusnya berjalan normal!** 🚀
