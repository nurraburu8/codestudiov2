/**
 * ─────────────────────────────────────────────────────────────
 * Config para la generación de clips del hero del index.
 * ─────────────────────────────────────────────────────────────
 *
 * Cada entrada del map mapea un archivo MP4 source (que vos descargás a
 * `source-videos/`) a un slug + el segundo desde el que se corta el clip.
 *
 * El slug determina el nombre final:
 *   - public/videos/clips/<slug>.mp4
 *   - public/videos/posters/<slug>.jpg
 *
 * Para iterar rápido: cambiá el `startSec` y volvé a correr `npm run gen:clips`
 * (procesa todo en ~1-3 min según la PC).
 *
 * Si querés probar SOLO un video puntual:
 *   npm run gen:clips -- --only=vans-nacho
 *
 * Si querés ver qué se haría sin generar nada:
 *   npm run gen:clips -- --dry-run
 * ─────────────────────────────────────────────────────────────
 */

export const CLIPS_CONFIG = {
  // archivo en source-videos/                     → slug              | start
  'VANS X NACHO_3.mp4':                            { slug: 'vans-nacho',         startSec: 15 },
  'SUEÑO CELESTE_VF.mp4':                          { slug: 'sueno-celeste',           startSec: 20 },
  'SUEÑO CELESTE Vcode.mp4':                       { slug: 'sueno-celeste-code',      startSec: 5  },
  'FDLC 2026 After.mp4':                           { slug: 'fdlc-2026',               startSec: 20 },
  'FDLC 2025 16_9 .mp4':                           { slug: 'fiesta-de-la-cerveza-2025', startSec: 25 },
  'Cuarteto de Nos Colonia - Sin Placa.mp4':       { slug: 'cuarteto-de-nos',         startSec: 12 },
  'AftermoviePuntaTech26_fINAL.mp4':               { slug: 'punta-tech-2026',         startSec: 15 },
  'AftermovieCopaRdlP26.mp4':                      { slug: 'copa-rdlp-2026',          startSec: 15 },
  'Aftermovie-CSB26.mp4':                          { slug: 'canelones-suena-bien-26', startSec: 15 },
  'AFTERMOVIE LA BAJADA_5.mp4':                    { slug: 'la-bajada-2025',          startSec: 20 },
};

/**
 * Defaults aplicados a TODOS los clips.
 *
 * - width × height: 1280×720 standard para autoplay de hero.
 * - duration: 10s.
 * - crf: 24 = sweet spot calidad/peso para web (~3-4MB por clip).
 * - preset: slow = mejor compresión sin perder calidad.
 */
export const DEFAULTS = {
  width: 1280,
  height: 720,
  duration: 10,
  crf: 24,
  preset: 'slow',
  posterQuality: 3,
};

export const PATHS = {
  source: 'source-videos',
  clips: 'public/videos/clips',
  posters: 'public/videos/posters',
};
