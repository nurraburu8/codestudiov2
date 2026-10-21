/**
 * Astro Content Collections — schema con Zod.
 * Cada archivo en src/content/trabajos/*.md se valida contra este schema.
 * Decap CMS edita los mismos archivos desde /admin.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const trabajos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/trabajos' }),
  schema: z.object({
    client: z.string(),
    type: z.string(),
    category: z.enum(['Shows', 'Campañas', 'Fotografía']),
    year: z.number().int().min(2000).max(2100),
    location: z.string(),
    /** Path absoluto desde public/ (ej: "/videos/foo.mp4"). Fallback si no hay cloudinaryId */
    video: z.string(),
    /** Public ID del video en Cloudinary (ej: "codestudio/fiesta-cerveza"). Si está, se usa delivery optimizado */
    cloudinaryId: z.string().optional().nullable(),
    /** Imagen cover opcional. Si está vacío, se usa el placeholder de paleta */
    cover: z.string().optional().nullable(),
    /** Frase corta destacada (aparece en la página de detalle) */
    tagline: z.string(),
    /** Orden de aparición en galerías (menor = primero) */
    order: z.number().int().default(99),
    /** Si false, el trabajo no se muestra ni se indexa */
    publish: z.boolean().default(true),
    /** Si true, aparece en el slideshow del home. Por defecto false. */
    featured: z.boolean().default(false),
    /** Si true, aparece en la grilla "Proyectos destacados" del home. Por defecto false. */
    highlight: z.boolean().default(false),
    credits: z
      .array(
        z.object({
          role: z.string(),
          name: z.string(),
        })
      )
      .default([]),
    stats: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      )
      .default([]),
    /**
     * Material extra del trabajo (fotos y videos) que se muestra en /work/<slug>
     * debajo del video principal. Todo vive en Cloudinary; lo sube
     * scripts/upload-drive.mjs o se carga a mano desde el CMS.
     */
    gallery: z
      .array(
        z.object({
          kind: z.enum(['foto', 'video']),
          cloudinaryId: z.string(),
          caption: z.string().optional().nullable(),
        })
      )
      .default([]),
  }),
});

export const collections = { trabajos };
