#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────
 * Generador de clips de hero + posters
 * ─────────────────────────────────────────────────────────────
 *
 * Toma los videos source desde `source-videos/` y genera para cada uno:
 *   - Un clip de 10s, 1280×720, H.264, sin audio (~3-5MB)
 *       → public/videos/clips/<slug>.mp4
 *   - Un poster JPEG del frame del medio del clip
 *       → public/videos/posters/<slug>.jpg
 *
 * Workflow completo:
 *   1. Descargá los MP4 originales del Drive a `./source-videos/`
 *      (esta carpeta está en .gitignore, no se sube al repo)
 *   2. Si querés ajustar desde qué segundo se corta cada uno,
 *      editá `scripts/clips-config.mjs`
 *   3. Corré: `npm run gen:clips`
 *   4. Los clips y posters quedan listos en public/videos/
 *
 * Flags:
 *   --dry-run          → muestra qué se procesaría sin generar nada
 *   --only=<slug>      → procesa solo ese slug (útil para iterar uno)
 *   --force            → re-genera aunque ya exista el output (default: skipea
 *                        si el output es más nuevo que el source)
 *
 * Requisitos:
 *   - ffmpeg en el PATH
 *     Windows: winget install Gyan.FFmpeg
 *     Mac:     brew install ffmpeg
 *     Linux:   apt install ffmpeg
 * ─────────────────────────────────────────────────────────────
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIPS_CONFIG, DEFAULTS, PATHS } from './clips-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, PATHS.source);
const OUT_CLIP = join(ROOT, PATHS.clips);
const OUT_POSTER = join(ROOT, PATHS.posters);

// ── Args ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const onlyArg = args.find((a) => a.startsWith('--only='));
const onlySlug = onlyArg?.split('=')[1];

// ── Helpers ──────────────────────────────────────────────────
const fmtMB = (bytes) => (bytes / 1024 / 1024).toFixed(1) + ' MB';
const fmtSec = (ms) => (ms / 1000).toFixed(1) + 's';

function checkFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
  } catch {
    console.error('❌ ffmpeg no está instalado o no está en el PATH.');
    console.error('   Windows:  winget install Gyan.FFmpeg');
    console.error('   Mac:      brew install ffmpeg');
    console.error('   Linux:    apt install ffmpeg');
    process.exit(1);
  }
}

function quote(p) {
  return `"${p}"`;
}

function outputIsFresh(srcPath, outPath) {
  if (!existsSync(outPath)) return false;
  return statSync(outPath).mtimeMs > statSync(srcPath).mtimeMs;
}

// ── Main ─────────────────────────────────────────────────────
checkFfmpeg();

if (!existsSync(SRC)) {
  console.error(`❌ Carpeta source no existe: ${SRC}`);
  console.error('   Creala y poné ahí los MP4 originales del cliente.');
  process.exit(1);
}

mkdirSync(OUT_CLIP, { recursive: true });
mkdirSync(OUT_POSTER, { recursive: true });

// Mapeo NFC → nombre real en disco. Drive a veces baja archivos con
// nombres en NFD (caracteres Ñ descompuestos como N + tilde combinante)
// y existsSync no matchea contra config si esta está en NFC. Normalizamos
// ambos lados para que el lookup funcione sin importar la forma.
const sourceFiles = readdirSync(SRC);
const filesByNFC = new Map(sourceFiles.map((f) => [f.normalize('NFC'), f]));

function resolveSource(configFilename) {
  const nfc = configFilename.normalize('NFC');
  return filesByNFC.get(nfc) ?? null; // nombre real con la encoding correcta
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Hero clip generator — Code Studio');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`source:  ${PATHS.source}/`);
console.log(`output:  ${PATHS.clips}/  +  ${PATHS.posters}/`);
console.log(`target:  ${DEFAULTS.width}×${DEFAULTS.height}, CRF ${DEFAULTS.crf}, preset ${DEFAULTS.preset}, no audio`);
if (dryRun) console.log('mode:    🔵 DRY RUN (no se genera nada)');
if (force) console.log('mode:    ⚡ FORCE (re-genera todo)');
if (onlySlug) console.log(`only:    ${onlySlug}`);
console.log('');

const vfChain = [
  `scale=${DEFAULTS.width}:${DEFAULTS.height}:force_original_aspect_ratio=decrease`,
  `pad=${DEFAULTS.width}:${DEFAULTS.height}:-1:-1:black`,
].join(',');

let stats = { ok: 0, skipped: 0, missing: 0, failed: 0, totalBytes: 0 };
const startTime = Date.now();

for (const [filename, config] of Object.entries(CLIPS_CONFIG)) {
  if (onlySlug && config.slug !== onlySlug) continue;

  const realFilename = resolveSource(filename);
  const srcPath = realFilename ? join(SRC, realFilename) : join(SRC, filename);
  const slug = config.slug;
  const startSec = config.startSec ?? 10;
  const duration = config.duration ?? DEFAULTS.duration;
  const crf = config.crf ?? DEFAULTS.crf;
  const preset = config.preset ?? DEFAULTS.preset;
  const posterSec = startSec + duration / 2;

  const clipPath = join(OUT_CLIP, `${slug}.mp4`);
  const posterPath = join(OUT_POSTER, `${slug}.jpg`);

  console.log(`▸ ${filename}`);
  console.log(`  slug=${slug}  start=${startSec}s  dur=${duration}s  crf=${crf}`);

  if (!existsSync(srcPath)) {
    console.log(`  ⚠️  source no encontrado — skip\n`);
    stats.missing++;
    continue;
  }

  if (!force && outputIsFresh(srcPath, clipPath) && outputIsFresh(srcPath, posterPath)) {
    console.log(`  ⏭  outputs ya están al día — skip (usá --force para re-generar)\n`);
    stats.skipped++;
    continue;
  }

  if (dryRun) {
    console.log(`  → dry-run, no se hace nada\n`);
    continue;
  }

  const clipCmd = [
    'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
    '-ss', String(startSec),
    '-i', quote(srcPath),
    '-t', String(duration),
    '-vf', quote(vfChain),
    '-c:v', 'libx264',
    '-preset', preset,
    '-crf', String(crf),
    '-profile:v', 'main',
    '-level', '4.0',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',
    '-f', 'mp4',
    quote(clipPath),
  ].join(' ');

  const posterCmd = [
    'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
    '-ss', String(posterSec),
    '-i', quote(srcPath),
    '-vframes', '1',
    '-vf', quote(vfChain),
    '-q:v', String(DEFAULTS.posterQuality),
    quote(posterPath),
  ].join(' ');

  // Clip
  try {
    process.stdout.write('  → clip   ');
    const t = Date.now();
    execSync(clipCmd, { stdio: 'pipe' });
    const sz = statSync(clipPath).size;
    stats.totalBytes += sz;
    console.log(`✓ ${fmtMB(sz)}  (${fmtSec(Date.now() - t)})`);
  } catch (e) {
    console.log(`✗ FALLÓ`);
    console.error(`  ${e.message?.split('\n')[0] || e}`);
    stats.failed++;
    console.log('');
    continue;
  }

  // Poster
  try {
    process.stdout.write('  → poster ');
    const t = Date.now();
    execSync(posterCmd, { stdio: 'pipe' });
    const sz = statSync(posterPath).size;
    console.log(`✓ ${fmtMB(sz)}  (${fmtSec(Date.now() - t)})`);
  } catch (e) {
    console.log(`✗ FALLÓ`);
    console.error(`  ${e.message?.split('\n')[0] || e}`);
    stats.failed++;
    console.log('');
    continue;
  }

  stats.ok++;
  console.log('');
}

const elapsed = Date.now() - startTime;
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Listo en ${fmtSec(elapsed)}`);
console.log(`  ✓ generados:   ${stats.ok}`);
if (stats.skipped) console.log(`  ⏭  skipped:    ${stats.skipped}`);
if (stats.missing) console.log(`  ⚠️  missing:    ${stats.missing}`);
if (stats.failed)  console.log(`  ✗ fallidos:   ${stats.failed}`);
if (stats.ok)      console.log(`  total clips:  ${fmtMB(stats.totalBytes)}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
