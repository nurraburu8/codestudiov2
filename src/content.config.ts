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
    category: z.enum(['Shows & Fiestas', 'Marcas', 'Eventos']),
    year: z.number().int().min(2000).max(2100),
    location: z.string(),
    /** Path absoluto desde public/ (ej: "/videos/foo.mp4") o URL Cloudinary */
    video: z.string(),
    /** Imagen cover opcional. Si está vacío, se usa el placeholder de paleta */
    cover: z.string().optional().nullable(),
    /** Frase corta destacada (aparece en la página de detalle) */
    tagline: z.string(),
    /** Orden de aparición en galerías (menor = primero) */
    order: z.number().int().default(99),
    /** Si false, el trabajo no se muestra ni se indexa */
    publish: z.boolean().default(true),
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
  }),
});

export const collections = { trabajos };
