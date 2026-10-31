/**
 * Astro Content Collections — schema con Zod.
 * Cada archivo en src/content/trabajos/*.md se valida contra este schema.
 * Sveltia CMS edita los mismos archivos desde /admin (ver public/admin/config.yml).
 *
 * Los campos de media aceptan una URL completa de Cloudinary (lo que guarda el
 * CMS al subir), un public_id de Cloudinary o un path local de /public.
 * src/lib/cloudinary.ts resuelve cualquiera de las tres formas.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Campo de media opcional: el CMS puede escribir '' o null cuando está vacío. */
const media = z.string().nullish().transform((v) => v ?? '');

const trabajos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/trabajos' }),
  schema: z.object({
    client: z.string(),
    type: z.string(),
    category: z.enum(['Shows', 'Campañas', 'Fotografía']),
    year: z.number().int().min(2000).max(2100),
    location: z.string().nullish().transform((v) => v ?? ''),
    /** Clip corto y mudo para el slideshow del inicio. */
    video: media,
    /** Video completo que se ve en /work/<slug>. */
    fullVideo: media,
    /** Imagen de portada (tarjeta y poster). Si falta, se usa un cuadro del video completo. */
    cover: media,
    /** Frase corta destacada (aparece en la página de detalle) */
    tagline: z.string().nullish().transform((v) => v ?? ''),
    /** Orden dentro de su sección (lo escribe el modo "Reordenar" del CMS). Menor = primero. */
    order: z.number().int().default(99),
    /** Archivado: no se muestra ni se publica su página, pero no se borra. */
    archived: z.boolean().default(false),
    credits: z
      .array(z.object({ role: z.string(), name: z.string() }))
      .nullish()
      .transform((v) => v ?? []),
    stats: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .nullish()
      .transform((v) => v ?? []),
    /** Fotos adicionales que se muestran en /work/<slug>. */
    photos: z
      .array(z.string())
      .nullish()
      .transform((v) => (v ?? []).filter(Boolean)),
    /** Videos adicionales que se muestran en /work/<slug>. */
    videos: z
      .array(z.object({ src: z.string(), caption: z.string().nullish() }))
      .nullish()
      .transform((v) => (v ?? []).filter((x) => x.src)),
  }),
});

export const collections = { trabajos };
