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
  // ── Hero: intros que armó el cliente (Drive → PROYECTOS PRINCIPALES INICIO).
  //    Van enteros ('full'): el slideshow espera a que termine cada uno.
  'intro-csb.mp4':                                 { slug: 'canelones-suena-bien-26', startSec: 0, duration: 'full' },
  'intro-vans.mp4':                                { slug: 'vans-x-harlem-2025',      startSec: 0, duration: 'full' },
  'intro-antel.mp4':                               { slug: 'antel-summit',            startSec: 0, duration: 'full' },
  'intro-fito.mp4':                                { slug: 'gira-fito-paez',          startSec: 0, duration: 'full' },
  'intro-puntatech.mp4':                           { slug: 'punta-tech-26',           startSec: 0, duration: 'full' },
  'intro-copatoyota.mp4':                          { slug: 'copa-rdlp-2026',          startSec: 0, duration: 'full' },
  'SUEÑO CELESTE Vcode.mp4':                       { slug: 'sueno-celeste-code',      startSec: 5  },
  // ── Hero con sources previos (clips ya generados, se skipean) ────────
  'VANS X NACHO_3.mp4':                            { slug: 'vans-nacho',              startSec: 15 },
  'FDLC 2026 After.mp4':                           { slug: 'fdlc-2026',               startSec: 20 },
  'FDLC 2025 16_9 .mp4':                           { slug: 'fiesta-de-la-cerveza-2025', startSec: 25 },
  'Cuarteto de Nos Colonia - Sin Placa.mp4':       { slug: 'cuarteto-de-nos',         startSec: 12 },
  'AFTERMOVIE LA BAJADA_5.mp4':                    { slug: 'la-bajada-2025',          startSec: 20 },
};

/**
 * Defaults aplicados a TODOS los clips.
 *
 * - width × height: 1280×720 para el hero en desktop.
 * - duration: 10s (o 'full' por clip para usar el archivo entero).
 * - crf 26 + maxrate 2.5 Mbps: ~2-3.5MB por clip de 10s. Con CRF 24 sin techo
 *   los planos con mucho movimiento pasaban 5 Mbps sin diferencia visible
 *   detrás del oscurecido del hero.
 * - vfVertical: recorte central 3:4 a 1080 de alto para celulares parados
 *   (<slug>-v.mp4). maxrateVertical: techo para esa versión.
 * - preset: slow = mejor compresión sin perder calidad.
 */
export const DEFAULTS = {
  width: 1280,
  height: 720,
  duration: 10,
  crf: 26,
  maxrate: '2500k',
  vfVertical: 'crop=ih*3/4:ih,scale=810:1080',
  maxrateVertical: '2000k',
  preset: 'slow',
  posterQuality: 3,
};

export const PATHS = {
  source: 'source-videos',
  clips: 'public/videos/clips',
  posters: 'public/videos/posters',
};
