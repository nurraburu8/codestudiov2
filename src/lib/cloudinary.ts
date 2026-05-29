/**
 * Helpers para construir URLs de Cloudinary.
 * Optimización automática: f_auto (WebP/AVIF según browser) + q_auto (calidad adaptativa).
 *
 * Si no hay cloud_name configurado, las funciones devuelven null y los
 * componentes hacen fallback a los assets locales en /public.
 */

// cloud_name es público (va en las URLs de delivery). Default al real;
// se puede override con PUBLIC_CLOUDINARY_CLOUD_NAME si hiciera falta.
const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvdrfqhpy';

export const cloudinaryEnabled = Boolean(CLOUD_NAME);

const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

/** URL de video optimizado (mp4 con f_auto/q_auto). */
export function cldVideoUrl(publicId: string): string | null {
  if (!CLOUD_NAME || !publicId) return null;
  return `${BASE}/video/upload/f_auto,q_auto/${publicId}.mp4`;
}

/** Poster (primer frame) de un video, como JPG optimizado. */
export function cldVideoPoster(publicId: string, width = 1280): string | null {
  if (!CLOUD_NAME || !publicId) return null;
  return `${BASE}/video/upload/so_0,f_auto,q_auto,w_${width}/${publicId}.jpg`;
}

interface ImageOpts {
  width?: number;
  height?: number;
  /** 'fill' recorta al tamaño, 'limit' no agranda, etc */
  crop?: 'fill' | 'limit' | 'fit' | 'scale';
}

/** URL de imagen optimizada. */
export function cldImageUrl(publicId: string, opts: ImageOpts = {}): string | null {
  if (!CLOUD_NAME || !publicId) return null;
  const t = ['f_auto', 'q_auto'];
  if (opts.width) t.push(`w_${opts.width}`);
  if (opts.height) t.push(`h_${opts.height}`);
  if (opts.crop) t.push(`c_${opts.crop}`);
  return `${BASE}/image/upload/${t.join(',')}/${publicId}`;
}
