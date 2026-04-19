# 🔥 Force Refresh Fix - Export Error

## Error yang Terjadi:
```
Uncaught SyntaxError: The requested module '/src/app/lib/authGuard.ts' 
does not provide an export named 'userHasPin'
```

## Penyebab:
Browser masih menggunakan **cache lama** dari file authGuard.ts yang belum memiliki fungsi `userHasPin()`.

---

## ✅ SOLUSI (Ikuti Urutan!)

### **Step 1: Stop Vite Server**
```bash
# Di terminal, tekan Ctrl + C untuk stop server
```

### **Step 2: Clear Vite Cache**

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force node_modules\.vite
```

**Windows (CMD):**
```cmd
rmdir /s /q node_modules\.vite
```

**Mac/Linux:**
```bash
rm -rf node_modules/.vite
```

**Manual:**
- Buka folder `node_modules`
- Hapus folder `.vite`

### **Step 3: Clear Browser Cache**

**Chrome/Edge:**
1. Tekan `Ctrl + Shift + Delete`
2. Pilih **"Cached images and files"**
3. Time range: **"All time"**
4. Klik **"Clear data"**

**Atau gunakan DevTools:**
1. Buka DevTools (F12)
2. Klik kanan tombol reload
3. Pilih **"Empty Cache and Hard Reload"**

### **Step 4: Restart Vite Server**
```bash
npm run dev
```

### **Step 5: Hard Reload Browser**
```
Ctrl + Shift + R
```

### **Step 6: Verify di Console**
```javascript
// Paste di console untuk verify
import('/src/app/lib/authGuard.ts').then(module => {
  console.log('Exports:', Object.keys(module));
  console.log('userHasPin exists:', typeof module.userHasPin);
});
```

---

## 🚀 Nuclear Option (Jika Masih Gagal)

### **Full Clean & Rebuild:**

```bash
# 1. Stop server (Ctrl + C)

# 2. Remove node_modules dan cache
rm -rf node_modules
rm -rf node_modules/.vite
rm -rf dist

# 3. Clear npm cache
npm cache clean --force

# 4. Reinstall dependencies
npm install

# 5. Start dev server
npm run dev
```

### **Browser:**
```
1. Close semua tab aplikasi
2. Clear browser cache (Ctrl + Shift + Delete)
3. Restart browser
4. Buka aplikasi di tab baru
5. Hard reload (Ctrl + Shift + R)
```

---

## 🔧 Enable "Disable Cache" di DevTools

Untuk mencegah masalah ini di masa depan:

1. Buka DevTools (F12)
2. Klik ⚙️ (Settings) atau tekan F1
3. Cari **"Disable cache (while DevTools is open)"**
4. ✅ Centang opsi tersebut
5. **Biarkan DevTools tetap terbuka** saat development

---

## 📋 Verification Checklist

Setelah fix, pastikan:

- [ ] Vite server running tanpa error
- [ ] Console tidak ada error "does not provide an export"
- [ ] Console tidak ada error WebSocket (atau bisa diabaikan)
- [ ] Aplikasi mulai render (tidak blank)
- [ ] Bisa navigate ke halaman

---

## 💡 Troubleshooting

### Masalah: Error Masih Muncul

**Coba ini:**
```bash
# 1. Stop server
Ctrl + C

# 2. Kill semua process Node.js
# Windows:
taskkill /F /IM node.exe

# Mac/Linux:
killall node

# 3. Clear everything
rm -rf node_modules/.vite
rm -rf dist

# 4. Restart
npm run dev
```

### Masalah: WebSocket Failed

WebSocket error bisa diabaikan untuk sementara, tapi untuk fix:

**Opsi 1: Gunakan port lain**
```bash
npm run dev -- --port 5174
```

**Opsi 2: Disable HMR sementara**

Edit `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    hmr: false // Disable HMR sementara
  }
})
```

---

## ✨ Expected Result

Setelah fix:
- ✅ Console bersih dari error export
- ✅ Aplikasi render dengan benar
- ✅ Bisa navigate ke halaman
- ✅ Onboarding muncul (jika sudah di-reset)

---

## 🎯 Quick Commands

```bash
# Full reset
rm -rf node_modules/.vite && npm run dev

# Clear cache + restart
npm cache clean --force && npm run dev

# Kill node + restart
taskkill /F /IM node.exe && npm run dev
```

```javascript
// Browser console - verify export
import('/src/app/lib/authGuard.ts').then(m => console.log(Object.keys(m)));

// Reset onboarding
localStorage.clear(); location.reload();
```
