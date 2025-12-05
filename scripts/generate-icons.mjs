import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from SVG...\n');
  
  const svgPath = join(publicDir, 'icon.svg');
  const svgBuffer = readFileSync(svgPath);
  
  for (const { name, size } of sizes) {
    const outputPath = join(publicDir, name);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`  ✅ ${name} (${size}x${size})`);
  }
  
  // Generate favicon.ico (multi-size)
  const faviconSvgPath = join(publicDir, 'favicon.svg');
  const faviconSvg = readFileSync(faviconSvgPath);
  
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon-32x32.png'));
  
  console.log('  ✅ favicon-32x32.png (32x32)');
  
  await sharp(faviconSvg)
    .resize(16, 16)
    .png()
    .toFile(join(publicDir, 'favicon-16x16.png'));
  
  console.log('  ✅ favicon-16x16.png (16x16)');
  
  console.log('\n✨ All icons generated successfully!');
}

generateIcons().catch(console.error);
