/**
 * Helpers para leer la colección de trabajos.
 * Centralizan la lógica de filtrado/ordenado y dejan afuera los archivados.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
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

const publicFileExists = (path: string) => existsSync(join(process.cwd(), 'public', path));

/** Proporción de las tarjetas de trabajo (horizontales). */
export const CARD_ASPECT = '16:10';
const CARD_WIDTHS = [640, 960, 1400];

/**
 * Imagen de la tarjeta (horizontal 16:10), con srcset.
 * - Portada en Cloudinary: se recorta a 16:10 con encuadre automático
 *   (las portadas que mandó el cliente son verticales).
 * - Sin portada: un cuadro del video completo, si está en Cloudinary.
 * - Portada local (posters de los clips, ya horizontales): tal cual.
 */
export function resolveCardImage(data: TrabajoData): { src: string; srcset?: string } | null {
  const fromCld = (value: string, kind: 'image' | 'video') => {
    const url = (w: number) =>
      kind === 'image'
        ? cldImageUrl(value, { crop: 'fill', aspect: CARD_ASPECT, gravity: 'auto', width: w })!
        : cldVideoPoster(value, w)!;
    return { src: url(960), srcset: CARD_WIDTHS.map((w) => `${url(w)} ${w}w`).join(', ') };
  };
  if (data.cover) return cldPublicId(data.cover) ? fromCld(data.cover, 'image') : { src: preferWebp(data.cover) };
  if (data.fullVideo && cldPublicId(data.fullVideo)) return fromCld(data.fullVideo, 'video');
  return null;
}

/**
 * Para el hero slideshow: siempre el clip corto (muted autoplay), nunca el
 * video completo.
 * - src: versión horizontal (desktop).
 * - srcVertical: recorte 3:4 para celulares parados, si existe
 *   (gen:clips genera <slug>-v.mp4; en Cloudinary se recorta al vuelo).
 * - poster: primer cuadro del clip, así no hay salto al arrancar. La portada
 *   del trabajo es vertical (para las tarjetas) y no sirve acá.
 */
export function resolveHeroVideo(data: TrabajoData): {
  src: string;
  srcVertical: string | null;
  poster: string;
} {
  if (data.video.startsWith('/')) {
    const vertical = data.video.replace(/\.mp4$/i, '-v.mp4');
    const poster = data.video.replace('/videos/clips/', '/videos/posters/').replace(/\.mp4$/i, '.jpg');
    return {
      src: data.video,
      srcVertical: publicFileExists(vertical) ? vertical : null,
      poster: publicFileExists(poster) ? preferWebp(poster) : (resolveCover(data) ?? FALLBACK_POSTER),
    };
  }
  return {
    src: cldVideoUrl(data.video, 'q_auto,w_1280,ac_none') ?? '',
    srcVertical: cldPublicId(data.video)
      ? cldVideoUrl(data.video, 'q_auto,c_fill,ar_3:4,h_1080,g_center,ac_none')
      : null,
    poster: cldVideoPoster(data.video) ?? resolveCover(data) ?? FALLBACK_POSTER,
  };
}

/** Para la página de detalle (/work/[id]): el video completo. */
export function resolveVideo(data: TrabajoData): { src: string; poster: string } {
  const src = cldVideoUrl(data.fullVideo) ?? '';
  // El player es 16:9: una portada de Cloudinary (suelen ser verticales) se
  // recorta a esa proporción con encuadre automático.
  const poster =
    (data.cover && cldPublicId(data.cover)
      ? cldImageUrl(data.cover, { crop: 'fill', aspect: '16:9', gravity: 'auto', width: 1600 })
      : resolveCover(data)) ?? FALLBACK_POSTER;
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
