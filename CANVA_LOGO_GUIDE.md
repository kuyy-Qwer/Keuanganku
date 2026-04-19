# 🎨 Panduan Download Logo dari Canva untuk PWA

## 📐 Ukuran Logo yang Harus Didownload:

### 🥇 PRIORITAS UTAMA (Wajib):
1. **512x512 PNG** - Master icon untuk PWA
2. **192x192 PNG** - Android Chrome icon
3. **180x180 PNG** - iOS Apple Touch Icon
4. **32x32 PNG** - Favicon browser
5. **16x16 PNG** - Favicon kecil

### 🥈 PRIORITAS KEDUA (Recommended):
6. **384x384 PNG** - Android Chrome large
7. **152x152 PNG** - iOS Safari
8. **144x144 PNG** - Windows Tile
9. **128x128 PNG** - Android Chrome
10. **96x96 PNG** - Android Chrome
11. **72x72 PNG** - Android Chrome

### 📋 Format Download dari Canva:

#### Opsi 1: SVG (TERBAIK)
```
Format: SVG
Ukuran: 512x512 (atau any size, karena SVG scalable)
Background: Transparan
Quality: Vector (highest)
```

#### Opsi 2: PNG (Alternatif)
```
Format: PNG
Background: Transparan
Quality: Highest/300 DPI
Ukuran: Download semua ukuran di atas
```

## 🎯 Langkah-langkah Download dari Canva:

### 1. Buka Design Logo di Canva
### 2. Klik "Share" → "Download"
### 3. Pilih Format:
   - **SVG** (jika tersedia) - RECOMMENDED
   - **PNG** dengan background transparan

### 4. Untuk PNG, download ukuran:
   - 512x512 (WAJIB)
   - 192x192 (WAJIB) 
   - 180x180 (WAJIB)
   - 32x32 (WAJIB)
   - 16x16 (WAJIB)

### 5. Rename Files:
```
logo-512x512.png
logo-192x192.png
logo-180x180.png (rename ke apple-touch-icon.png)
logo-32x32.png (rename ke favicon-32x32.png)
logo-16x16.png (rename ke favicon-16x16.png)
```

## 🚀 Setelah Download:

1. **Upload ke folder `public/`** di project Anda
2. **Saya akan update** semua konfigurasi manifest.json dan HTML
3. **Generate favicon.ico** dari PNG 32x32
4. **Test PWA** di mobile device

## 💡 Tips Canva:

### Untuk Logo PWA yang Baik:
- ✅ **Square ratio** (1:1) - Wajib untuk icon
- ✅ **Simple design** - Terlihat jelas di ukuran kecil
- ✅ **High contrast** - Background gelap/terang yang kontras
- ✅ **No text** - Atau text yang sangat besar dan bold
- ✅ **Centered design** - Tidak terpotong saat di-crop

### Background:
- **Transparan** - Untuk fleksibilitas
- **Solid color** - Jika perlu background

## 📱 Ukuran Minimum yang WAJIB:
Jika hanya bisa download beberapa, prioritaskan:
1. **512x512** - Master icon
2. **192x192** - Android
3. **180x180** - iOS  
4. **32x32** - Favicon

Sisanya bisa saya generate dari yang 512x512.