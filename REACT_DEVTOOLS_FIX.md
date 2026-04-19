# Fix: React DevTools Script Error

## 🔍 Masalah

Muncul script tag dengan URL invalid di HTML:
```html
<script src="http://undefined:8097"></script>
```

Ini menyebabkan error karena browser mencoba load script dari URL yang tidak valid.

## 🎯 Penyebab

React DevTools global (`npm install -g react-devtools`) mencoba inject script ke aplikasi, tapi konfigurasi tidak lengkap atau environment variable tidak terset dengan benar.

---

## ✅ Solusi

### **Opsi 1: Uninstall React DevTools Global (Recommended)**

React DevTools sebaiknya digunakan sebagai **browser extension**, bukan global package.

```bash
# Uninstall react-devtools global
npm uninstall -g react-devtools

# Restart Vite server
npm run dev

# Hard reload browser
Ctrl + Shift + R
```

**Kemudian install React DevTools sebagai browser extension:**

- **Chrome/Edge/Brave:** https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
- **Firefox:** https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

### **Opsi 2: Konfigurasi React DevTools dengan Benar**

Jika Anda ingin tetap menggunakan standalone react-devtools:

**1. Set Environment Variable:**

**Windows (PowerShell):**
```powershell
$env:REACT_DEVTOOLS_HOST = "localhost"
npm run dev
```

**Windows (CMD):**
```cmd
set REACT_DEVTOOLS_HOST=localhost
npm run dev
```

**Mac/Linux:**
```bash
export REACT_DEVTOOLS_HOST=localhost
npm run dev
```

**2. Atau tambahkan di `.env.local`:**

```env
REACT_DEVTOOLS_HOST=localhost
```

**3. Jalankan react-devtools di terminal terpisah:**
```bash
react-devtools
```

**4. Restart Vite server:**
```bash
npm run dev
```

### **Opsi 3: Disable React DevTools Injection**

Jika Anda tidak memerlukan react-devtools, disable injection-nya:

**Tambahkan di `vite.config.ts`:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })'
  }
})
```

**Restart server:**
```bash
npm run dev
```

---

## 🔧 Troubleshooting

### Error Masih Muncul Setelah Uninstall

**1. Clear npm cache:**
```bash
npm cache clean --force
```

**2. Restart terminal/IDE:**
- Close semua terminal
- Close VS Code atau IDE
- Buka kembali dan jalankan `npm run dev`

**3. Hard reload browser:**
```
Ctrl + Shift + R
```

### Script Tag Masih Muncul di HTML

**1. Cek apakah ada code yang inject script:**

Buka DevTools → Elements tab, cari script tag tersebut, klik kanan → "Break on" → "Subtree modifications"

Ini akan menunjukkan kode mana yang menambahkan script tersebut.

**2. Cek index.html:**

Pastikan tidak ada script tag manual yang mengarah ke react-devtools:

```html
<!-- ❌ Hapus jika ada -->
<script src="http://localhost:8097"></script>
```

**3. Clear browser cache:**
```
Ctrl + Shift + Delete
Clear "Cached images and files"
```

---

## 🎯 Recommended Setup

### **Development Setup yang Benar:**

1. **Uninstall global react-devtools:**
   ```bash
   npm uninstall -g react-devtools
   ```

2. **Install React DevTools browser extension:**
   - Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
   - Firefox: https://addons.mozilla.org/firefox/addon/react-devtools/

3. **Restart Vite server:**
   ```bash
   npm run dev
   ```

4. **Hard reload browser:**
   ```
   Ctrl + Shift + R
   ```

5. **Verify:**
   - Buka DevTools (F12)
   - Lihat tab baru: "⚛️ Components" dan "⚛️ Profiler"
   - Tidak ada error di console tentang script 8097

---

## 💡 Mengapa Browser Extension Lebih Baik?

### **Browser Extension:**
- ✅ Tidak perlu konfigurasi
- ✅ Tidak inject script ke aplikasi
- ✅ Bekerja otomatis untuk semua React apps
- ✅ Tidak ada port conflict
- ✅ Update otomatis via browser

### **Global Package:**
- ❌ Perlu konfigurasi environment variable
- ❌ Inject script ke aplikasi
- ❌ Perlu jalankan server terpisah
- ❌ Bisa conflict dengan port lain
- ❌ Perlu update manual

---

## 🚀 Quick Fix (Tercepat)

```bash
# 1. Uninstall global package
npm uninstall -g react-devtools

# 2. Restart Vite
npm run dev

# 3. Hard reload browser
# Ctrl + Shift + R

# 4. Install browser extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
```

---

## 📋 Verification Checklist

Setelah fix, pastikan:

- [ ] Tidak ada error di console tentang script 8097
- [ ] Tidak ada script tag dengan `src="http://undefined:8097"` di HTML
- [ ] Aplikasi load dengan normal
- [ ] React DevTools extension terinstall di browser
- [ ] Tab "⚛️ Components" muncul di DevTools

---

## 🔍 Debug Commands

### Check jika react-devtools masih terinstall:
```bash
npm list -g react-devtools
```

### Check environment variables:
```bash
# Windows (PowerShell)
Get-ChildItem Env: | Where-Object {$_.Name -like "*REACT*"}

# Mac/Linux
env | grep REACT
```

### Check Vite config:
```bash
cat vite.config.ts
```

---

## ✨ Expected Result

Setelah fix:
- ✅ Aplikasi load tanpa error
- ✅ Tidak ada script tag invalid di HTML
- ✅ React DevTools berfungsi via browser extension
- ✅ Console bersih dari error
- ✅ Development workflow lancar

---

**Recommended: Gunakan browser extension, bukan global package!** 🎯
