#!/usr/bin/env node

/**
 * Script untuk generate placeholder PNG icons
 * Menggunakan SVG to PNG conversion sederhana
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ukuran icon yang diperlukan untuk PWA
const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

function generatePlaceholderSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <!-- Background gelap dengan sudut tumpul -->
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.2)}" fill="#0b1326"/>
  
  <!-- Glow background -->
  <circle cx="${size/2}" cy="${size * 0.43}" r="${size * 0.35}" fill="url(#bgGlow)" opacity="0.3"/>

  <!-- Panah hijau melengkung -->
  <path d="M ${size * 0.17} ${size * 0.67} Q ${size/2} ${size * 0.92} ${size * 0.83} ${size * 0.67}" 
        stroke="#22c55e" stroke-width="${size * 0.066}" fill="none" stroke-linecap="round"/>
  <polygon points="${size * 0.83},${size * 0.61} ${size * 0.89},${size * 0.70} ${size * 0.77},${size * 0.71}" fill="#22c55e"/>

  <!-- Uang hijau -->
  <rect x="${size * 0.25}" y="${size * 0.46}" width="${size * 0.27}" height="${size * 0.17}" rx="${size * 0.02}" 
        fill="#15803d" transform="rotate(-8,${size * 0.39},${size * 0.55})"/>
  <rect x="${size * 0.26}" y="${size * 0.47}" width="${size * 0.27}" height="${size * 0.17}" rx="${size * 0.02}" 
        fill="#16a34a" transform="rotate(-3,${size * 0.40},${size * 0.56})"/>
  <rect x="${size * 0.27}" y="${size * 0.48}" width="${size * 0.27}" height="${size * 0.17}" rx="${size * 0.02}" fill="#4ade80"/>
  
  <!-- Simbol dollar -->
  <circle cx="${size * 0.40}" cy="${size * 0.57}" r="${size * 0.04}" fill="#15803d" opacity="0.75"/>
  <text x="${size * 0.40}" y="${size * 0.58}" text-anchor="middle" font-size="${size * 0.043}" 
        font-weight="bold" fill="white" font-family="Arial">$</text>

  <!-- Bar chart biru -->
  <rect x="${size * 0.45}" y="${size * 0.38}" width="${size * 0.08}" height="${size * 0.25}" rx="${size * 0.018}" fill="url(#b1)"/>
  <rect x="${size * 0.54}" y="${size * 0.29}" width="${size * 0.08}" height="${size * 0.34}" rx="${size * 0.018}" fill="url(#b2)"/>
  <rect x="${size * 0.64}" y="${size * 0.20}" width="${size * 0.08}" height="${size * 0.43}" rx="${size * 0.018}" fill="url(#b3)"/>

  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#4edea3"/>
      <stop offset="100%" style="stop-color:transparent"/>
    </radialGradient>
    <linearGradient id="b1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#60a5fa"/>
      <stop offset="100%" style="stop-color:#1d4ed8"/>
    </linearGradient>
    <linearGradient id="b2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#93c5fd"/>
      <stop offset="100%" style="stop-color:#2563eb"/>
    </linearGradient>
    <linearGradient id="b3" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#bfdbfe"/>
      <stop offset="100%" style="stop-color:#3b82f6"/>
    </linearGradient>
  </defs>
</svg>`;
}

function generatePlaceholderIcons() {
  const publicDir = path.join(__dirname, '../public');
  
  console.log('🎨 Generating placeholder PNG icons...');
  console.log('📝 Note: These are SVG files with .png extension for testing purposes');
  console.log('📝 For production, use proper PNG conversion tools');
  
  for (const icon of iconSizes) {
    const svgContent = generatePlaceholderSVG(icon.size);
    const outputPath = path.join(publicDir, icon.name);
    
    // Generate SVG with PNG extension for testing
    fs.writeFileSync(outputPath.replace('.png', '.svg'), svgContent);
    
    console.log(`✅ Generated: ${icon.name.replace('.png', '.svg')} (${icon.size}x${icon.size})`);
  }
  
  console.log('');
  console.log('🎉 Placeholder icons generated successfully!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Install sharp: npm install sharp');
  console.log('2. Run: npm run generate-icons');
  console.log('3. Or use online tool: https://favicon.io/favicon-converter/');
  console.log('4. Or open: scripts/generate-icons-canvas.html in browser');
}

generatePlaceholderIcons();