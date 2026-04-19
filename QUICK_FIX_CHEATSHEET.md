# 🚀 Quick Fix Cheatsheet

## Masalah: Layar Kosong / Error Import / Onboarding Tidak Muncul

---

## ⚡ SOLUSI TERCEPAT (Coba Urut!)

### 1️⃣ **Hard Reload Browser**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 2️⃣ **Restart Vite Server**
```bash
# Terminal: Ctrl + C untuk stop
npm run dev
# Hard reload browser lagi
```

### 3️⃣ **Reset Onboarding (Console)**
```javascript
onboardingDebug.reset()
location.reload()
```

### 4️⃣ **Navigate ke Debug Page**
```javascript
window.location.href = '/debug/onboarding'
```

### 5️⃣ **Clear Cache**
```
Chrome: Ctrl + Shift + Delete
Pilih "Cached images and files"
Clear data
```

---

## 🔧 Console Commands

```javascript
// Check onboarding status
onboardingDebug.check()

// Reset onboarding
onboardingDebug.reset()

// Force complete onboarding
onboardingDebug.forceComplete()

// Clear all localStorage
localStorage.clear()

// Navigate to debug page
window.location.href = '/debug/onboarding'

// Reload page
location.reload()
```

---

## 🐛 Debugging Checklist

- [ ] Buka Console (F12)
- [ ] Cek error merah
- [ ] Copy error messages
- [ ] Hard reload (Ctrl+Shift+R)
- [ ] Restart dev server
- [ ] Clear browser cache
- [ ] Try incognito mode
- [ ] Check terminal for errors

---

## 📍 Useful URLs

```
Debug Page:     /debug/onboarding
Onboarding:     /
App:            /app
Login:          /login
```

---

## 🔥 Nuclear Option (Reset Everything)

```bash
# Stop server (Ctrl + C)
rm -rf node_modules/.vite
npm run dev
```

```javascript
// In browser console
localStorage.clear()
location.reload()
```

---

## 📞 Report Bug With:

1. ✅ Error messages from console
2. ✅ Browser & version
3. ✅ URL when error occurred
4. ✅ Screenshot
5. ✅ Steps to reproduce

---

## 💡 Pro Tips

- Keep DevTools open during development
- Enable "Disable cache" in DevTools settings
- Use incognito for clean testing
- Hard reload after big changes
- Restart server after npm install

---

## 🎯 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `does not provide an export` | Hard reload + Restart server |
| `failed to connect to websocket` | Restart Vite server |
| `No routes matched location` | Navigate to `/debug/onboarding` |
| Blank screen | Check console, try hard reload |
| Onboarding not showing | `onboardingDebug.reset()` |
| `script src="http://undefined:8097"` | Uninstall global react-devtools |

---

## 🚨 Emergency Recovery

```javascript
// Paste in console
localStorage.removeItem('onboarding_completed');
localStorage.removeItem('onboarding_step');
localStorage.removeItem('onboarding_terms_accepted');
location.href = '/';
```

---

## 🔧 React DevTools Script Error Fix

```bash
# Uninstall global react-devtools
npm uninstall -g react-devtools

# Restart Vite
npm run dev

# Hard reload browser
Ctrl + Shift + R

# Install browser extension instead:
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
```

---

**Print this page and keep it handy!** 📄
