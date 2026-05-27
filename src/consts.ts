/**
 * Constantes globales del sitio.
 * Centralizar acá toda info que se repite (SEO, redes, contacto).
 */

export const SITE = {
  name: 'Code Studio',
  shortName: 'CodeStudio',
  url: 'https://codestudio.com.uy',
  defaultLocale: 'es_UY',
  tagline: 'For those who create endlessly',
  description:
    'Productora audiovisual uruguaya. Filmamos shows, marcas y eventos desde la historia.',
} as const;

export const CONTACT = {
  email: 'hola@codestudio.com.uy',
  country: 'Uruguay',
} as const;

export const SOCIAL = {
  instagram: 'https://www.instagram.com/codestudio.uy/',
  linkedin: 'https://www.linkedin.com/company/codestudiouy/',
  vimeo: 'https://vimeo.com/user208872375',
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
      'Productora audiovisual uruguaya. Filmamos shows, marcas y eventos desde la historia. Trabajamos con Mercado Libre, Vans, Itaú, Monster y más.',
    keywords: ['productora audiovisual uruguay', 'video uruguay', 'comerciales', 'aftermovies'],
  },
  shows: {
    title: 'Shows y Fiestas · Aftermovies y videoclips · Code Studio',
    description:
      'Aftermovies, videoclips y registros audiovisuales para shows en vivo y fiestas en Uruguay. Trabajos con Fito Páez, Monster Energy y más.',
    keywords: ['aftermovie uruguay', 'videoclip', 'video shows en vivo', 'productora fiestas'],
  },
  marcas: {
    title: 'Marcas · Producción audiovisual publicitaria · Code Studio',
    description:
      'Comerciales, branded content y campañas audiovisuales para marcas en Uruguay. Mercado Libre, CIF, Sedal, Vans, Volvo, Itaú y más.',
    keywords: ['comerciales uruguay', 'branded content', 'publicidad audiovisual', 'spots tv'],
  },
  eventos: {
    title: 'Eventos · Cobertura audiovisual corporativa · Code Studio',
    description:
      'Cobertura audiovisual de eventos corporativos, lanzamientos y experiencias en Uruguay. Producción de video profesional para tu evento.',
    keywords: ['cobertura eventos uruguay', 'video corporativo', 'lanzamientos'],
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
 * Se incrusta una vez en el Layout base.
 */
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  alternateName: SITE.shortName,
  url: SITE.url,
  logo: `${SITE.url}/logo.png`,
  description: SITE.description,
  email: CONTACT.email,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'UY',
  },
  sameAs: [SOCIAL.instagram, SOCIAL.linkedin, SOCIAL.vimeo],
} as const;
