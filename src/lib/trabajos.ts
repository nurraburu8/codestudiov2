/**
 * Helpers para leer la colección de trabajos.
 * Centralizan la lógica de filtrado/ordenado y dejan afuera los archivados.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { cldImageUrl, cldPublicId, cldVideoUrl, cldVideoPoster } from '@lib/cloudinary';
// Orden de la pantalla principal: lo edita el cliente desde el CMS
// ("Pantalla principal"), arrastrando trabajos en cada lista.
import inicio from '../content/inicio.json';

export type TrabajoEntry = CollectionEntry<'trabajos'>;
export type TrabajoData = TrabajoEntry['data'];
export type TrabajoCategory = 'Shows' | 'Campañas' | 'Fotografía';

/**
 * Las claves de `category` quedan cortas y estables (no rompen el contenido
 * ya cargado ni las URLs); acá viven los nombres que ve el visitante.
 */
export const CATEGORY_LABELS: Record<TrabajoCategory, string> = {
  Shows: 'Shows & Fiestas',
  Campañas: 'Eventos & Campañas',
  Fotografía: 'Fotografía Producto',
};

export const CATEGORY_SLUGS: Record<TrabajoCategory, string> = {
  Shows: 'shows',
  Campañas: 'campanas',
  Fotografía: 'fotografia',
};

const FALLBACK_POSTER = '/hero-poster.jpg';

/**
 * Sirve la versión WebP de un poster local si existe (generada por gen:webp).
 * El atributo `poster=""` del <video> acepta solo una URL — no soporta
 * <picture> fallback. Las imágenes de Cloudinary ya salen con f_auto.
 */
function preferWebp(path: string): string {
  return path.startsWith('/') ? path.replace(/\.(jpe?g|png)$/i, '.webp') : path;
}

/**
 * Imagen de portada del trabajo, al ancho pedido.
 * Si no cargaron portada, usa un cuadro del video completo (si está en Cloudinary).
 */
export function resolveCover(data: TrabajoData, width = 1280): string | null {
  if (data.cover) {
    return cldPublicId(data.cover)
      ? cldImageUrl(data.cover, { width, crop: 'limit' })
      : preferWebp(data.cover);
  }
  return data.fullVideo ? cldVideoPoster(data.fullVideo, width) : null;
}

/**
 * Para el hero slideshow: siempre el clip corto (~10s, muted autoplay).
 * Nunca el video completo, que puede pesar cientos de MB. Si el clip está en
 * Cloudinary se pide achicado y sin audio.
 */
export function resolveHeroVideo(data: TrabajoData): { src: string; poster: string } {
  const src = cldVideoUrl(data.video, 'q_auto,w_1280,ac_none') ?? '';
  const poster = resolveCover(data) ?? cldVideoPoster(data.video) ?? FALLBACK_POSTER;
  return { src, poster };
}

/** Para la página de detalle (/work/[id]): el video completo. */
export function resolveVideo(data: TrabajoData): { src: string; poster: string } {
  const src = cldVideoUrl(data.fullVideo) ?? '';
  const poster = resolveCover(data) ?? FALLBACK_POSTER;
  return { src, poster };
}

/** Ordena por `order` ascendente; los que tienen el mismo orden quedan por año desc. */
function sortTrabajos(a: TrabajoEntry, b: TrabajoEntry): number {
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;
  return b.data.year - a.data.year;
}

/** Todos los trabajos no archivados, ordenados. */
export async function getAllTrabajos(): Promise<TrabajoEntry[]> {
  const all = await getCollection('trabajos', ({ data }) => !data.archived);
  return all.sort(sortTrabajos);
}

/** Trabajos de una lista de la pantalla principal, en el orden del CMS. */
async function getInicioList(slugs: string[]): Promise<TrabajoEntry[]> {
  const all = await getAllTrabajos();
  const byId = new Map(all.map((w) => [w.id, w]));
  return slugs.map((s) => byId.get(s)).filter((w): w is TrabajoEntry => Boolean(w));
}

/** Trabajos del slideshow del inicio. Se saltean los que no tienen clip. */
export async function getFeaturedTrabajos(): Promise<TrabajoEntry[]> {
  const list = await getInicioList(inicio.slideshow ?? []);
  return list.filter((w) => w.data.video);
}

/** Trabajos de la grilla "Proyectos destacados" del inicio. */
export async function getHighlightTrabajos(): Promise<TrabajoEntry[]> {
  return getInicioList(inicio.destacados ?? []);
}

/** Filtrados por categoría (o todos). */
export async function getTrabajosByCategory(
  category: TrabajoCategory | 'all'
): Promise<TrabajoEntry[]> {
  const all = await getAllTrabajos();
  if (category === 'all') return all;
  return all.filter((w) => w.data.category === category);
}
