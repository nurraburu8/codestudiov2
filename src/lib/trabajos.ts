/**
 * Helpers para leer la colección de trabajos.
 * Centralizan la lógica de filtrado/ordenado y aplican el filtro `publish`.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type TrabajoEntry = CollectionEntry<'trabajos'>;
export type TrabajoCategory = 'Shows & Fiestas' | 'Marcas' | 'Eventos';

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
