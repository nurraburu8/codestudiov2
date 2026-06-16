/**
 * Helpers para leer la colección de trabajos.
 * Centralizan la lógica de filtrado/ordenado y aplican el filtro `publish`.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { cldVideoUrl, cldVideoPoster } from '@lib/cloudinary';

export type TrabajoEntry = CollectionEntry<'trabajos'>;
export type TrabajoCategory = 'Shows' | 'Campañas';

const FALLBACK_POSTER = '/hero-poster.jpg';

/**
 * Sirve la versión WebP del poster si existe (generada por gen:webp).
 * El atributo `poster=""` del <video> acepta solo una URL — no soporta
 * <picture> fallback. WebP tiene 97%+ soporte en browsers modernos; el
 * resto ve fondo negro hasta que arranca el video (degradación aceptable).
 */
function preferWebp(path: string): string {
  return path.replace(/\.(jpe?g|png)$/i, '.webp');
}

/**
 * Para el hero slideshow: siempre usa el clip local corto (~10s, muted autoplay).
 * Ignoramos cloudinaryId aquí a propósito — el hero nunca debe bufferar el video
 * completo, que puede pesar cientos de MB.
 */
export function resolveHeroVideo(data: TrabajoEntry['data']): { src: string; poster: string } {
  return { src: data.video, poster: preferWebp(data.cover ?? FALLBACK_POSTER) };
}

/**
 * Para la página de detalle (/work/[id]): usa Cloudinary si está disponible,
 * con fallback al clip local. El usuario ya eligió ver ese trabajo, así que
 * el video completo tiene sentido acá.
 */
export function resolveVideo(data: TrabajoEntry['data']): { src: string; poster: string } {
  if (data.cloudinaryId) {
    const src = cldVideoUrl(data.cloudinaryId);
    const poster = cldVideoPoster(data.cloudinaryId);
    if (src) return { src, poster: poster ?? preferWebp(data.cover ?? FALLBACK_POSTER) };
  }
  return { src: data.video, poster: preferWebp(data.cover ?? FALLBACK_POSTER) };
}

/** Ordena por `order` ascendente; los que tienen el mismo orden quedan por año desc. */
function sortTrabajos(a: TrabajoEntry, b: TrabajoEntry): number {
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;
  return b.data.year - a.data.year;
}

/** Todos los trabajos publicados, ordenados. */
export async function getAllTrabajos(): Promise<TrabajoEntry[]> {
  const all = await getCollection('trabajos', ({ data }) => data.publish !== false);
  return all.sort(sortTrabajos);
}

/** Trabajos destacados que aparecen en el hero del home. */
export async function getFeaturedTrabajos(): Promise<TrabajoEntry[]> {
  const all = await getAllTrabajos();
  return all.filter((w) => w.data.featured === true);
}

/** Filtrados por categoría (o todos). */
export async function getTrabajosByCategory(
  category: TrabajoCategory | 'all'
): Promise<TrabajoEntry[]> {
  const all = await getAllTrabajos();
  if (category === 'all') return all;
  return all.filter((w) => w.data.category === category);
}

/** Un trabajo por su slug (id de archivo sin extensión). */
export async function getTrabajoBySlug(slug: string): Promise<TrabajoEntry | undefined> {
  const all = await getAllTrabajos();
  return all.find((w) => w.id === slug);
}
