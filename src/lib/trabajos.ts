/**
 * Helpers para leer la colección de trabajos.
 * Centralizan la lógica de filtrado/ordenado y aplican el filtro `publish`.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { cldVideoUrl, cldVideoPoster } from '@lib/cloudinary';

export type TrabajoEntry = CollectionEntry<'trabajos'>;
export type TrabajoCategory = 'Shows & Fiestas' | 'Marcas' | 'Eventos';

const FALLBACK_POSTER = '/hero-poster.jpg';

/**
 * Resuelve la URL de video y poster de un trabajo.
 *   - Si tiene cloudinaryId: usa Cloudinary (con poster generado del frame 0).
 *   - Si no: usa el video local + el cover específico del trabajo (data.cover).
 *   - Fallback final: hero-poster genérico.
 *
 * El poster específico es importante para el LCP: cuando el slide carga,
 * el usuario ve el frame de ESE trabajo, no una imagen genérica.
 */
export function resolveVideo(data: TrabajoEntry['data']): { src: string; poster: string } {
  if (data.cloudinaryId) {
    const src = cldVideoUrl(data.cloudinaryId);
    const poster = cldVideoPoster(data.cloudinaryId);
    if (src) return { src, poster: poster ?? data.cover ?? FALLBACK_POSTER };
  }
  return { src: data.video, poster: data.cover ?? FALLBACK_POSTER };
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
