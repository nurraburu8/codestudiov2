/**
 * Sube los videos locales (public/videos/*.mp4) a Cloudinary y reporta
 * el public_id de cada uno para pegar en el frontmatter de los trabajos.
 *
 * Requiere en .env:
 *   PUBLIC_CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET   ← completá este (es secreto, no se commitea)
 *
 * Uso:
 *   npm run upload:cloudinary
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { v2 as cloudinary } from 'cloudinary';

// Node 20.6+/22+: carga .env sin dependencias
try {
  process.loadEnvFile('.env');
} catch {
  console.warn('No se pudo cargar .env automáticamente — usando process.env existente.');
}

const { PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error(
    '\n✗ Faltan credenciales. Completá en .env:\n' +
      '  PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET\n' +
      '  (api_key y api_secret están en tu Dashboard de Cloudinary → Settings → API Keys)\n'
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const VIDEOS_DIR = 'public/videos';
const FOLDER = 'codestudio'; // carpeta dentro de Cloudinary

const files = readdirSync(VIDEOS_DIR).filter((f) => /\.(mp4|webm|mov)$/i.test(f));

if (files.length === 0) {
  console.log('No hay videos en public/videos/.');
  process.exit(0);
}

console.log(`\nSubiendo ${files.length} video(s) a Cloudinary (carpeta "${FOLDER}")...\n`);

const results = [];
for (const file of files) {
  const path = join(VIDEOS_DIR, file);
  const publicId = `${FOLDER}/${file.replace(/\.[^.]+$/, '')}`;
  process.stdout.write(`  ↑ ${file} ... `);
  try {
    const res = await cloudinary.uploader.upload(path, {
      resource_type: 'video',
      public_id: publicId,
      overwrite: true,
      // genera versiones adaptativas para streaming
      eager: [{ streaming_profile: 'hd', format: 'm3u8' }],
      eager_async: true,
    });
    console.log('OK');
    results.push({ file, publicId: res.public_id, bytes: res.bytes, duration: res.duration });
  } catch (err) {
    console.log('ERROR');
    console.error(`    ${err.message}`);
  }
}

console.log('\n── public_id de cada video (pegá en cloudinaryId del frontmatter) ──\n');
for (const r of results) {
  console.log(`  ${r.file}`);
  console.log(`    cloudinaryId: ${r.publicId}`);
  console.log(`    (${(r.bytes / 1024 / 1024).toFixed(1)}MB, ${r.duration?.toFixed(0) ?? '?'}s)\n`);
}

console.log(
  'Listo. Editá cada src/content/trabajos/*.md y agregá la línea:\n' +
    '  cloudinaryId: codestudio/<nombre-del-video>\n' +
    'El sitio va a servir el video optimizado automáticamente.\n'
);
