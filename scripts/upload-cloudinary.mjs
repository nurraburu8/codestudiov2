/**
 * Sube videos desde source-videos/ a Cloudinary.
 * - Archivos <= 95MB: sube directo.
 * - Archivos > 95MB: comprime con ffmpeg a ~85MB antes de subir
 *   (limite free tier de Cloudinary = 100MB).
 *
 * Requiere en .env:
 *   PUBLIC_CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * Uso:
 *   npm run upload:cloudinary          <- todos los videos de source-videos/
 *   node scripts/upload-cloudinary.mjs sueno  <- filtro por nombre (sin acentos)
 */
import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';

try {
  process.loadEnvFile('.env');
} catch {
  console.warn('No se pudo cargar .env — usando process.env existente.');
}

const { PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error(
    '\n Faltan credenciales en .env:\n' +
      '  PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET\n'
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER = 'codestudio';
const DEFAULT_DIR = 'source-videos';
const MAX_BYTES = 95 * 1024 * 1024; // 95MB — por encima comprime antes de subir
const TARGET_MB = 85; // objetivo de compresion (da margen al limite de 100MB)

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeForSearch(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Devuelve la duracion en segundos usando ffprobe. */
function getDuration(filePath) {
  const out = execFileSync('ffprobe', [
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    filePath,
  ]);
  const data = JSON.parse(out.toString());
  return parseFloat(data.format.duration);
}

/**
 * Comprime el video con H.264 apuntando a TARGET_MB.
 * Calcula el bitrate de video necesario segun la duracion.
 */
function compress(inputPath, outputPath, durationSec) {
  const targetBits = TARGET_MB * 1024 * 1024 * 8;
  const audioBits = 128_000 * durationSec;
  const videoBitrate = Math.max(300_000, Math.floor((targetBits - audioBits) / durationSec));
  const maxrate = Math.floor(videoBitrate * 1.5);
  const bufsize = Math.floor(videoBitrate * 3);

  execFileSync('ffmpeg', [
    '-i', inputPath,
    '-c:v', 'libx264',
    '-b:v', String(videoBitrate),
    '-maxrate', String(maxrate),
    '-bufsize', String(bufsize),
    '-c:a', 'aac', '-b:a', '128k',
    '-vf', "scale=-2:'min(1080,ih)'",
    '-movflags', '+faststart',
    '-y',
    outputPath,
  ], { stdio: 'pipe' });
}

// Filtro opcional: un termino o varios separados por coma (logica OR)
// Ej: "csb,copa,puntatech"
const filterArg = process.argv[2];
const filterTerms = filterArg
  ? filterArg.split(',').map((s) => normalizeForSearch(s.trim())).filter(Boolean)
  : [];

const allFiles = readdirSync(DEFAULT_DIR).filter((f) => /\.(mp4|webm|mov)$/i.test(f));
const filesToUpload = allFiles
  .filter((f) => {
    if (filterTerms.length === 0) return true;
    const normalized = normalizeForSearch(f);
    return filterTerms.some((term) => normalized.includes(term));
  })
  .map((name) => ({ dir: DEFAULT_DIR, name }));

if (filesToUpload.length === 0) {
  console.log('No hay videos para subir (filtro: ' + (filter || 'ninguno') + ').');
  process.exit(0);
}

console.log(`\nSubiendo ${filesToUpload.length} video(s) a Cloudinary (carpeta "${FOLDER}")...\n`);

const results = [];
for (const { dir, name } of filesToUpload) {
  const filePath = join(dir, name);
  const publicId = `${FOLDER}/${slugify(name.replace(/\.[^.]+$/, ''))}`;
  const sizeMb = (statSync(filePath).size / 1024 / 1024).toFixed(0);

  process.stdout.write(`  ^ ${name} (${sizeMb}MB)\n     -> ${publicId} ... `);

  let uploadPath = filePath;
  let tempFile = null;

  // Comprimir si supera el limite del free tier
  if (statSync(filePath).size > MAX_BYTES) {
    process.stdout.write(`comprimiendo a ~${TARGET_MB}MB... `);
    try {
      const duration = getDuration(filePath);
      tempFile = join(tmpdir(), `cld-${randomUUID()}.mp4`);
      compress(filePath, tempFile, duration);
      const compressedMb = (statSync(tempFile).size / 1024 / 1024).toFixed(1);
      process.stdout.write(`${compressedMb}MB... `);
      uploadPath = tempFile;
    } catch (compressErr) {
      console.log('ERROR al comprimir');
      console.error('    ' + compressErr.message);
      continue;
    }
  }

  try {
    const res = await cloudinary.uploader.upload(uploadPath, {
      resource_type: 'video',
      public_id: publicId,
      overwrite: true,
    });
    const mb = (res.bytes / 1024 / 1024).toFixed(1);
    const dur = res.duration?.toFixed(0) ?? '?';
    console.log(`OK  (${mb}MB subidos, ${dur}s)`);
    results.push({ name, publicId: res.public_id, bytes: res.bytes, duration: res.duration });
  } catch (err) {
    console.log('ERROR al subir');
    console.error('    ' + (err?.message ?? JSON.stringify(err)));
  } finally {
    if (tempFile) {
      try { unlinkSync(tempFile); } catch {}
    }
  }
}

console.log('\n-- cloudinaryId resultantes --\n');
for (const r of results) {
  const mb = (r.bytes / 1024 / 1024).toFixed(1);
  console.log(`  ${r.name}`);
  console.log(`    cloudinaryId: ${r.publicId}  (${mb}MB, ${r.duration?.toFixed(0) ?? '?'}s)\n`);
}
