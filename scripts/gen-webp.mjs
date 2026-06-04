/**
 * Convierte imágenes raster a WebP para reducir bytes.
 *   - public/logos/*.png → .webp (mantiene PNG para <picture> fallback)
 *   - public/videos/posters/*.jpg → .webp (reemplaza uso directo)
 *
 * Reproducible: re-correr cuando se agregue un logo o poster nuevo.
 *
 *   npm run gen:webp
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const TARGETS = [
  { dir: 'public/logos', exts: ['.png'], quality: 90 },
  { dir: 'public/videos/posters', exts: ['.jpg', '.jpeg'], quality: 78 },
  { dir: 'public', exts: ['.jpg'], quality: 80, only: ['hero-poster.jpg'] },
];

let totalBefore = 0;
let totalAfter = 0;
let count = 0;

for (const t of TARGETS) {
  if (!existsSync(t.dir)) continue;
  console.log(`\n── ${t.dir} ──`);
  const files = readdirSync(t.dir)
    .filter((f) => t.exts.includes(parse(f).ext.toLowerCase()))
    .filter((f) => !t.only || t.only.includes(f));
  for (const f of files) {
    const src = join(t.dir, f);
    const out = join(t.dir, parse(f).name + '.webp');
    const before = statSync(src).size;
    await sharp(src)
      .webp({ quality: t.quality, effort: 6 })
      .toFile(out);
    const after = statSync(out).size;
    totalBefore += before;
    totalAfter += after;
    count++;
    const pct = Math.round((1 - after / before) * 100);
    console.log(
      `  ${parse(f).name.padEnd(36)} ${(before / 1024).toFixed(0).padStart(4)}KB → ${(after / 1024).toFixed(0).padStart(4)}KB  -${pct}%`
    );
  }
}

console.log(
  `\n✓ ${count} archivos convertidos: ${(totalBefore / 1024).toFixed(0)}KB → ${(totalAfter / 1024).toFixed(0)}KB (-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`
);
