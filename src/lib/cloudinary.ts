/**
 * Helpers para construir URLs de Cloudinary.
 * Optimización automática: f_auto (WebP/AVIF según browser) + q_auto (calidad adaptativa).
 *
 * Todas las funciones aceptan:
 *   - una URL completa de Cloudinary (lo que guarda el CMS al subir un archivo),
 *     con o sin transformaciones / versión: se extrae el public_id;
 *   - un public_id (ej: "codestudio/trabajos/antel-summit/foto-1");
 *   - cualquier otra URL o path local, que se devuelve tal cual.
 */

// cloud_name es público (va en las URLs de delivery). Default al real;
// se puede override con PUBLIC_CLOUDINARY_CLOUD_NAME si hiciera falta.
const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvdrfqhpy';

const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

// Un segmento de transformación: "f_auto,q_auto", "w_900", "c_fill,g_auto"…
const TRANSFORM = /^[a-z]{1,4}_[^/]+$/;

/**
 * Devuelve el public_id (sin extensión) si el valor es de nuestro Cloudinary,
 * o null si es otra cosa (path local, URL externa, vacío).
 */
export function cldPublicId(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (v.startsWith('/')) return null; // path local de /public
  if (!/^https?:\/\//.test(v)) return v.replace(/\.[a-z0-9]{2,5}$/i, ''); // ya es un public_id

  const m = v.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(?:image|video)\/upload\/(.+)$/);
  if (!m || m[1] !== CLOUD_NAME) return null;
  const parts = m[2]!.split('?')[0]!.split('/');
  while (parts.length > 1 && TRANSFORM.test(parts[0]!)) parts.shift();
  if (parts.length > 1 && /^v\d+$/.test(parts[0]!)) parts.shift();
  return decodeURIComponent(parts.join('/')).replace(/\.[a-z0-9]{2,5}$/i, '');
}

/** URL de video optimizado (mp4 con q_auto). Paths locales/URLs externas pasan tal cual. */
export function cldVideoUrl(value: string, transforms = 'q_auto'): string | null {
  if (!value) return null;
  const id = cldPublicId(value);
  if (!id) return value;
  return `${BASE}/video/upload/${transforms}/${id}.mp4`;
}

/** Poster (primer frame) de un video de Cloudinary, como JPG optimizado. */
export function cldVideoPoster(value: string, width = 1280): string | null {
  const id = cldPublicId(value);
  if (!id) return null;
  return `${BASE}/video/upload/so_0,f_auto,q_auto,w_${width}/${id}.jpg`;
}

interface ImageOpts {
  width?: number;
  height?: number;
  /** 'fill' recorta al tamaño, 'limit' no agranda, etc */
  crop?: 'fill' | 'limit' | 'fit' | 'scale';
}

/** URL de imagen optimizada. Paths locales/URLs externas pasan tal cual. */
export function cldImageUrl(value: string, opts: ImageOpts = {}): string | null {
  if (!value) return null;
  const id = cldPublicId(value);
  if (!id) return value;
  const t = ['f_auto', 'q_auto'];
  if (opts.width) t.push(`w_${opts.width}`);
  if (opts.height) t.push(`h_${opts.height}`);
  if (opts.crop) t.push(`c_${opts.crop}`);
  return `${BASE}/image/upload/${t.join(',')}/${id}`;
}
