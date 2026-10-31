/**
 * Sube el material del Drive del cliente (fotos + videos por proyecto) a
 * Cloudinary y escribe `fullVideo`, `photos` y `videos` de cada trabajo.
 *
 * - Lee el mapeo archivo → trabajo de scripts/drive-manifest.mjs.
 * - Los archivos viven en fotos_videos/drive/ (ignorado por git), con la
 *   misma estructura de carpetas que el Drive.
 * - Detecta duplicados por contenido (sha1): si el mismo archivo aparece en
 *   dos carpetas, se sube una sola vez y se reutiliza el public_id.
 * - No resube lo que ya existe en Cloudinary (chequea por public_id).
 * - Fotos: se achican a 2560px / JPG q82 con sharp (el free tier de
 *   Cloudinary no acepta imágenes > 10MB).
 * - Videos: > 95MB se comprimen con ffmpeg a ~85MB (límite free = 100MB).
 *
 * Requiere en .env: PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * Uso:
 *   node scripts/upload-drive.mjs              <- todo el manifest
 *   node scripts/upload-drive.mjs antel,cif    <- solo esos slugs (match parcial)
 *   node scripts/upload-drive.mjs --dry-run    <- muestra qué haría, sin subir ni escribir
 */
import { readFileSync, writeFileSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { DRIVE_DIR, MANIFEST } from './drive-manifest.mjs';

try {
  process.loadEnvFile('.env');
} catch {
  console.warn('No se pudo cargar .env — usando process.env existente.');
}

const { PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('\n Faltan credenciales de Cloudinary en .env\n');
  process.exit(1);
}

cloudinary.config({
  cloud_name: PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const DRY = process.argv.includes('--dry-run');
const filterTerms = (process.argv.slice(2).find((a) => !a.startsWith('--')) ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const MAX_VIDEO_BYTES = 95 * 1024 * 1024;
const TARGET_MB = 85;
const IMG_MAX_PX = 2560;

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sha1(path) {
  return createHash('sha1').update(readFileSync(path)).digest('hex');
}

function isVideo(file) {
  return /\.(mp4|mov|m4v|webm)$/i.test(file) || !/\.[a-z0-9]{2,4}$/i.test(file);
}

async function existsInCloudinary(publicId, resourceType) {
  try {
    await cloudinary.api.resource(publicId, { resource_type: resourceType });
    return true;
  } catch {
    return false;
  }
}

function compressVideo(input, output) {
  const out = execFileSync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', input]);
  const duration = parseFloat(JSON.parse(out.toString()).format.duration);
  const targetBits = TARGET_MB * 1024 * 1024 * 8;
  const videoBitrate = Math.max(300_000, Math.floor((targetBits - 128_000 * duration) / duration));
  execFileSync('ffmpeg', [
    '-i', input,
    '-c:v', 'libx264',
    '-b:v', String(videoBitrate),
    '-maxrate', String(Math.floor(videoBitrate * 1.5)),
    '-bufsize', String(Math.floor(videoBitrate * 3)),
    '-c:a', 'aac', '-b:a', '128k',
    // Respeta verticales: limita el lado corto a 1080.
    '-vf', "scale='if(gt(iw,ih),-2,min(1080,iw))':'if(gt(iw,ih),min(1080,ih),-2)'",
    '-movflags', '+faststart',
    '-y', output,
  ], { stdio: 'pipe' });
}

/** Sube un archivo (si hace falta) y devuelve su public_id. */
async function upload(file, publicId) {
  const video = isVideo(file);
  const resourceType = video ? 'video' : 'image';
  if (await existsInCloudinary(publicId, resourceType)) return { publicId, status: 'ya estaba' };
  if (DRY) return { publicId, status: 'se subiría' };

  let uploadPath = file;
  let temp = null;
  try {
    if (video && statSync(file).size > MAX_VIDEO_BYTES) {
      temp = join(tmpdir(), `cld-${randomUUID()}.mp4`);
      compressVideo(file, temp);
      uploadPath = temp;
    } else if (!video) {
      temp = join(tmpdir(), `cld-${randomUUID()}.jpg`);
      await sharp(file)
        .rotate()
        .resize(IMG_MAX_PX, IMG_MAX_PX, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(temp);
      uploadPath = temp;
    }
    const res = await cloudinary.uploader.upload(uploadPath, {
      resource_type: resourceType,
      public_id: publicId,
      overwrite: false,
    });
    return { publicId: res.public_id, status: `subido (${(res.bytes / 1e6).toFixed(1)}MB)` };
  } finally {
    if (temp) try { unlinkSync(temp); } catch {}
  }
}

const CLD = `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}`;
const cldUrl = (kind, id) =>
  kind === 'video' ? `${CLD}/video/upload/${id}.mp4` : `${CLD}/image/upload/${id}.jpg`;

/**
 * Escribe en el frontmatter del trabajo lo que defina el manifest: `cover` y
 * `fullVideo` si hay, y `photos` / `videos` solo si el manifest tiene esas
 * listas (así una entrada con solo portada no borra la galería existente).
 */
function writeFrontmatter(slug, { coverId, mainId, gallery, lists }) {
  const path = join('src/content/trabajos', `${slug}.md`);
  // En Windows git puede dejar CRLF: normalizamos para que las regex de abajo matcheen.
  const src = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const end = src.indexOf('\n---', 4);
  let fm = src.slice(0, end);
  const body = src.slice(end);

  const setLine = (key, value) => {
    const re = new RegExp(`\\n${key}:.*`);
    const line = `\n${key}: ${value}`;
    fm = re.test(fm) ? fm.replace(re, line) : fm + line;
  };
  if (coverId) setLine('cover', cldUrl('foto', coverId));
  if (mainId) setLine('fullVideo', cldUrl('video', mainId));
  if (!lists) {
    writeFileSync(path, fm + body);
    return;
  }

  // Saca los bloques `photos:` / `videos:` previos (la key + sus líneas indentadas).
  fm = fm.replace(/\n(?:photos|videos):(?: \[\])?(?:\n(?: {2}|- ).*)*/g, '').replace(/\n+$/, '');
  const photos = gallery.filter((g) => g.kind === 'foto');
  const videos = gallery.filter((g) => g.kind === 'video');
  const quote = (s) => `'${(s ?? '').replace(/'/g, "''")}'`;
  fm += '\nphotos:' + (photos.length
    ? photos.map((g) => `\n  - ${cldUrl('foto', g.cloudinaryId)}`).join('')
    : ' []');
  fm += '\nvideos:' + (videos.length
    ? videos.map((g) => `\n  - src: ${cldUrl('video', g.cloudinaryId)}\n    caption: ${quote(g.caption)}`).join('')
    : ' []');
  writeFileSync(path, fm + body);
}

const seen = new Map(); // sha1 → public_id
const idOwner = new Map(); // public_id → sha1 (nombres distintos pueden dar el mismo slug)

/** Si el public_id ya lo usa otro archivo (distinto contenido), le agrega -2, -3… */
async function uniqueId(publicId, hash) {
  let id = publicId;
  for (let n = 2; ; n++) {
    const owner = idOwner.get(id);
    if (owner === hash) return id;
    if (!owner) {
      idOwner.set(id, hash);
      return id;
    }
    id = `${publicId}-${n}`;
  }
}
const entries = Object.entries(MANIFEST).filter(
  ([slug]) => filterTerms.length === 0 || filterTerms.some((t) => slug.includes(t))
);

for (const [slug, cfg] of entries) {
  console.log(`\n■ ${slug}`);
  const items = [
    ...(cfg.cover ? [{ file: cfg.cover, cover: true }] : []),
    ...(cfg.main ? [{ file: cfg.main, main: true, publicId: cfg.mainPublicId }] : []),
    ...(cfg.videos ?? []).map((v) => (typeof v === 'string' ? { file: v } : v)),
    ...(cfg.photos ?? []).map((f) => ({ file: f })),
  ];

  let mainId = null;
  let coverId = null;
  const gallery = [];
  for (const item of items) {
    // Los nombres del Drive pueden venir con tildes en NFD o NFC.
    const file = [item.file, item.file.normalize('NFD'), item.file.normalize('NFC')]
      .map((f) => join(DRIVE_DIR, f))
      .find((f) => existsSync(f));
    if (!file) {
      console.log(`  ! falta ${item.file}`);
      continue;
    }
    const kind = isVideo(file) ? 'video' : 'foto';
    const hash = sha1(file);
    const base = item.file.split('/').pop().replace(/\.[^.]+$/, '');
    let publicId = item.publicId ?? `codestudio/trabajos/${slug}/${slugify(base)}`;
    let status;
    if (seen.has(hash)) {
      publicId = seen.get(hash);
      status = 'duplicado (reutiliza)';
    } else {
      publicId = await uniqueId(publicId, hash);
      try {
        ({ publicId, status } = await upload(file, publicId));
      } catch (err) {
        console.log(`  ✗ ${item.file}: ${err?.message ?? JSON.stringify(err)}`);
        continue;
      }
      seen.set(hash, publicId);
    }
    console.log(`  ${item.cover ? '▣' : item.main ? '★' : '·'} ${item.file} → ${publicId} [${status}]`);
    if (item.cover) coverId = publicId;
    else if (item.main) mainId = publicId;
    else if (!gallery.some((g) => g.cloudinaryId === publicId))
      gallery.push({ kind, cloudinaryId: publicId, caption: item.caption });
  }

  const lists = Boolean(cfg.photos || cfg.videos);
  if (!DRY) writeFrontmatter(slug, { coverId, mainId, gallery, lists });
}

console.log(DRY ? '\n(dry-run: no se subió ni escribió nada)\n' : '\nListo.\n');
