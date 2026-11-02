/**
 * Constantes globales del sitio.
 * Centralizar acá toda info que se repite (SEO, redes, contacto).
 */

/**
 * URL canónica del sitio.
 *   - PREVIEW (ahora): default a la URL temporal del Worker.
 *   - PRODUCCIÓN: al lanzar, cambiar este default a 'https://codestudio.com.uy'
 *     (o setear PUBLIC_SITE_URL si la plataforma lo permite).
 * El Layout pone noindex automático mientras el host sea workers.dev/pages.dev.
 */
export const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL || 'https://codestudiov2.urraburunicolas.workers.dev';

/**
 * Web3Forms access key (público: va en el frontend del form).
 * Default al real; override con PUBLIC_WEB3FORMS_ACCESS_KEY si hiciera falta.
 */
export const WEB3FORMS_ACCESS_KEY =
  import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY || '40797790-1f95-43df-8f99-20af221163be';

/**
 * Token de Cloudflare Web Analytics (público).
 * Se obtiene en Cloudflare → Analytics → Web Analytics → Add a site.
 * Si está vacío, el snippet no se inyecta.
 */
export const CF_ANALYTICS_TOKEN = import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN || '';

export const SITE = {
  name: 'Code Studio',
  shortName: 'CodeStudio',
  url: SITE_URL,
  defaultLocale: 'es_UY',
  tagline: 'For those who create endlessly',
  description:
    'Productora audiovisual uruguaya. Filmamos shows, marcas y eventos desde la historia.',
} as const;

export const CONTACT = {
  email: 'hola@codestudio.com.uy',
  /**
   * WhatsApp en formato internacional, solo dígitos (ej: 59899123456).
   * Vacío = no se muestra el botón de WhatsApp en los llamados a la acción.
   */
  whatsapp: (import.meta.env.PUBLIC_WHATSAPP || '').replace(/\D/g, ''),
  country: 'Uruguay',
} as const;

export const SOCIAL = {
  instagram: 'https://www.instagram.com/codestudio.uy/',
  linkedin: 'https://www.linkedin.com/company/codestudiouy/',
} as const;

/**
 * Imagen Open Graph por defecto (1200x630px).
 * Se sirve desde public/og/default.jpg.
 * Cada pagina puede override con su propia og:image.
 */
export const DEFAULT_OG_IMAGE = '/og/default.jpg';

/**
 * Textos SEO por pagina. Cada uno respeta los limites de Google:
 *  - title: 50-60 caracteres (se trunca despues)
 *  - description: 140-160 caracteres
 *  - keywords: orientativas (Google ya no las usa, pero ayudan a estructurar copy)
 */
export const PAGES_SEO = {
  home: {
    title: 'Code Studio · Productora audiovisual en Uruguay',
    description:
      'Productora audiovisual uruguaya. Filmamos shows, marcas y eventos desde la historia. Trabajamos con Antel, Mercado Libre, Vans, Fito Páez y más.',
    keywords: ['productora audiovisual uruguay', 'video uruguay', 'comerciales', 'aftermovies'],
  },
  shows: {
    title: 'Shows & Fiestas · Aftermovies y coberturas · Code Studio',
    description:
      'Aftermovies, coberturas en vivo y registros audiovisuales para shows, fiestas y festivales en Uruguay. Cuarteto de Nos, Fiesta de la Cerveza, NTVG y más.',
    keywords: ['aftermovie uruguay', 'cobertura festival uruguay', 'video shows en vivo', 'productora fiestas'],
  },
  campanas: {
    title: 'Eventos & Campañas · Producción audiovisual · Code Studio',
    description:
      'Comerciales, branded content y cobertura de eventos para marcas en Uruguay. Antel, Vans, CIF, Intendencia de Canelones, Speed y más.',
    keywords: ['comerciales uruguay', 'branded content', 'cobertura de eventos', 'publicidad audiovisual'],
  },
  fotografia: {
    title: 'Fotografía Producto · Code Studio · Productora audiovisual',
    description:
      'Fotografía de producto para gastronomía y marcas en Uruguay. Dakota, Panda Bar, Wine Secret, Ranch Café y Naru Sushi.',
    keywords: ['fotografia de producto uruguay', 'fotografia gastronomica', 'foto producto montevideo'],
  },
  nosotros: {
    title: 'Nosotros · Code Studio · Productora audiovisual Uruguay',
    description:
      'Code Studio es una productora audiovisual que trabaja desde la historia. Equipo, manifiesto y filosofía detrás de cada proyecto.',
    keywords: ['equipo code studio', 'productora audiovisual', 'manifesto'],
  },
  contacto: {
    title: 'Contacto · Code Studio · Productora audiovisual',
    description:
      'Hablemos. Productora audiovisual en Uruguay especializada en marcas, shows y eventos. Conectá con nosotros para tu próximo proyecto.',
    keywords: ['contacto productora', 'presupuesto video', 'cotizar produccion audiovisual'],
  },
} as const;

export type PageKey = keyof typeof PAGES_SEO;

/**
 * Schema.org Organization — JSON-LD que Google usa para rich results.
 * Se construye con la URL base real (puede ser .pages.dev en preview
 * o el dominio final en producción).
 */
export function buildOrganizationSchema(baseUrl: string) {
  const url = baseUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    alternateName: SITE.shortName,
    url,
    logo: `${url}/logo.png`,
    description: SITE.description,
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UY',
    },
    sameAs: [SOCIAL.instagram, SOCIAL.linkedin],
  };
}
