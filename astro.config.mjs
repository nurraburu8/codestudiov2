import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URL canónica del sitio.
//   - PREVIEW (ahora): default a la URL temporal del Worker.
//   - PRODUCCIÓN: al lanzar, cambiar este default a 'https://codestudio.com.uy'.
// Mantener sincronizado con SITE_URL en src/consts.ts.
// El Layout pone noindex automático mientras el host sea workers.dev/pages.dev.
const SITE_URL =
  process.env.PUBLIC_SITE_URL || 'https://codestudiov2.urraburunicolas.workers.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
