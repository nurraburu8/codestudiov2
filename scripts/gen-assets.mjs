/**
 * Genera favicons, apple-touch-icon, PWA icons y la imagen Open Graph
 * a partir de los logos de marca. Reproducible: re-correr si cambia el logo.
 *
 *   node scripts/gen-assets.mjs
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const BLACK = '#000000';
const ORANGE = '#FD752B';
const MARK = 'public/logo2.png'; // marca bracket (blanca, transparente)
const WORDMARK = 'public/logo.png'; // "code STUDIO" completo (blanco, transparente)

mkdirSync('public/og', { recursive: true });

/** Cuadrado de fondo (negro) con esquinas redondeadas, como buffer PNG. */
function roundedSquare(size, radius, color) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${color}"/>
  </svg>`;
  return Buffer.from(svg);
}

/** Ícono: marca blanca centrada sobre cuadrado negro redondeado. */
async function makeIcon(size, outfile, { rounded = true, padding = 0.22 } = {}) {
  const radius = rounded ? Math.round(size * 0.22) : 0;
  const markSize = Math.round(size * (1 - padding * 2));
  const mark = await sharp(MARK)
    .resize(markSize, markSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp(roundedSquare(size, radius, BLACK))
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(outfile);
  console.log('✓', outfile, `${size}x${size}`);
}

// ── Favicons PNG ──────────────────────────────────────────────
await makeIcon(32, 'public/favicon-32.png');
await makeIcon(48, 'public/favicon-48.png');
await makeIcon(180, 'public/apple-touch-icon.png');
await makeIcon(192, 'public/android-chrome-192x192.png', { rounded: false });
await makeIcon(512, 'public/android-chrome-512x512.png', { rounded: false });

// ── favicon.svg (vector: cuadrado negro + marca rasterizada embebida) ──
// La marca se embebe en base64 para mantener fidelidad exacta al logo.
const markB64 = (
  await sharp(MARK)
    .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
).toString('base64');

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#000000"/>
  <image x="96" y="96" width="320" height="320" href="data:image/png;base64,${markB64}"/>
</svg>`;
const { writeFileSync } = await import('node:fs');
writeFileSync('public/favicon.svg', faviconSvg);
console.log('✓ public/favicon.svg');

// ── Open Graph image (1200x630) ──────────────────────────────
// Fondo negro + wordmark centrado + línea naranja + tagline.
const OG_W = 1200;
const OG_H = 630;

const wordmark = await sharp(WORDMARK)
  .resize(620, 290, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

const ogOverlay = `<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${OG_W}" height="${OG_H}" fill="#060606"/>
  <rect x="0" y="0" width="${OG_W}" height="8" fill="${ORANGE}"/>
  <text x="${OG_W / 2}" y="430" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="26"
        letter-spacing="8" fill="${ORANGE}" font-weight="600">
    PRODUCTORA AUDIOVISUAL · URUGUAY
  </text>
  <text x="${OG_W / 2}" y="478" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="20"
        letter-spacing="4" fill="#9a9a9a" font-style="italic">
    For those who create endlessly
  </text>
</svg>`;

await sharp(Buffer.from(ogOverlay))
  .composite([{ input: wordmark, top: 150, left: Math.round((OG_W - 620) / 2) }])
  .jpeg({ quality: 88 })
  .toFile('public/og/default.jpg');
console.log('✓ public/og/default.jpg', `${OG_W}x${OG_H}`);
