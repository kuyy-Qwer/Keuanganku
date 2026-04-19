#!/usr/bin/env node

/**
 * Script untuk generate icon PNG dari SVG
 * Memerlukan sharp package: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Ukuran icon yang diperlukan untuk PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

async function generateIcons() {
  try {
    // Import sharp dynamically
    const sharp = await import('sharp');
    
    const svgPath = path.join(__dirname, '../public/icon-app.svg');
    const publicDir = path.join(__dirname, '../public');
    
    if (!fs.existsSync(svgPath)) {
      console.error('SVG file not found:', svgPath);
      return;
    }
    
    const svgBuffer = fs.readFileSync(svgPath);
    
    console.log('🎨 Generating PNG icons from SVG...');
    
    for (const icon of iconSizes) {
      const outputPath = path.join(publicDir, icon.name);
      
      await sharp.default(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);
        
      console.log(`✅ Generated: ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    console.log('🎉 All icons generated successfully!');
    
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.log('📦 Sharp package not found. Installing...');
      console.log('Run: npm install sharp');
      console.log('Then run this script again.');
    } else {
      console.error('Error generating icons:', error);
    }
  }
}

generateIcons();