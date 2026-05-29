import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URL canónica del sitio. Orden de prioridad:
//   1. PUBLIC_SITE_URL  → setear a https://codestudio.com.uy SOLO en el deploy final
//   2. CF_PAGES_URL     → Cloudflare lo inyecta solo (ej: https://codestudiov2.pages.dev)
//   3. fallback local de desarrollo
const SITE_URL =
  process.env.PUBLIC_SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4321';

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
