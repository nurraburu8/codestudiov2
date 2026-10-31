# Code Studio

Sitio oficial de **Code Studio** — productora audiovisual uruguaya.

Construido con [Astro 5](https://astro.build/) · Hosting en [Cloudflare Pages](https://pages.cloudflare.com/) · Media en [Cloudinary](https://cloudinary.com/) · CMS visual con [Sveltia CMS](https://sveltiacms.app/).

---

## Requisitos

- **Node.js** v20 o superior (recomendado v22+)
- **npm** v10+

```bash
node -v   # debe ser >= 20
npm -v
```

---

## Setup local

```bash
# 1. Clonar el repo
git clone <repo-url>
cd codestudio

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables
cp .env.example .env
# Editar .env con los valores reales (Cloudinary, Web3Forms, etc)

# 4. Arrancar servidor de desarrollo
npm run dev
# → abre http://localhost:4321
```

---

## Comandos disponibles

| Comando             | Qué hace                                         |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Arranca dev server en `localhost:4321` con HMR   |
| `npm run build`     | Build de producción a `dist/`                    |
| `npm run preview`   | Preview del build de producción local            |
| `npm run check`     | Type check + diagnostics de Astro                |

---

## Estructura del proyecto

```
codestudio/
├── public/              # Assets estáticos servidos tal cual (favicon, robots, manifest)
├── src/
│   ├── components/      # Componentes Astro reutilizables (Header, Footer, etc)
│   ├── layouts/         # Layouts base (Layout.astro con SEO)
│   ├── pages/           # Cada archivo = una ruta (index.astro, contacto.astro, etc)
│   ├── styles/          # CSS global y design tokens
│   ├── consts.ts        # Constantes globales (SEO, redes, contacto)
│   └── lib/             # Helpers (cloudinary, etc)
├── legacy/              # Sitio HTML puro previo (referencia, NO se deploya)
├── astro.config.mjs     # Config de Astro
├── tsconfig.json        # Config TypeScript con alias @/, @components/, etc
└── .env                 # Variables de entorno (NO commitear)
```

---

## Stack y servicios

| Capa | Herramienta | Free tier |
|------|-------------|-----------|
| Framework | Astro 5 | Gratis |
| Hosting | Cloudflare Pages | Bandwidth ilimitado |
| Media (img/video) | Cloudinary | 25GB storage + 25GB BW |
| CMS | Sveltia CMS | Gratis |
| Formulario | Web3Forms | 250 envíos/mes |
| Analytics | Cloudflare Web Analytics | Gratis sin cookies |
| Email del dominio | Google Workspace | — |
| Monitoring | UptimeRobot | 50 monitors |

---

## Deploy a producción

Configurar Cloudflare Pages apuntando a este repo:

- **Framework preset:** Astro
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 20
- **Variables de entorno:** copiar las de `.env.example` desde el panel de Cloudflare

El deploy es automático con cada push a `main`.

---

## CMS visual (Sveltia)

El panel está en `/admin` ([Sveltia CMS](https://sveltiacms.app/), config en [public/admin/config.yml](public/admin/config.yml)). Cada cambio genera un commit en `main` y el GitHub Action re-deploya (1-2 min). Login con GitHub vía el worker en [oauth-worker/](oauth-worker/).

- **Trabajos**: se listan agrupados por sección. El botón **Reordenar** permite arrastrarlos dentro de cada sección; guarda el campo `order`, que es el orden de cada página (`/shows`, `/campanas`, `/fotografia`).
- **Archivado**: un trabajo archivado no se muestra ni se publica su página, pero el archivo queda. Filtro "Archivados" en el listado.
- **Pantalla principal**: [src/content/inicio.json](src/content/inicio.json) define el slideshow y la grilla "Proyectos destacados" del inicio, en orden (listas arrastrables en el CMS). Un trabajo del slideshow sin clip se saltea.
- **Archivos**: portada, video completo, fotos/videos adicionales y clip del slideshow se suben a Cloudinary desde el CMS (cada persona entra con su usuario de Cloudinary la primera vez) o se pega el link. El CMS guarda la URL completa.

---

## Estructura de contenido

Cada trabajo es un archivo markdown en [src/content/trabajos/](src/content/trabajos/), validado por [src/content.config.ts](src/content.config.ts):

```yaml
---
client: NOMBRE CLIENTE
type: AFTERMOVIE | COMERCIAL | ...
category: Shows | Campañas | Fotografía
year: 2026
location: Ciudad, País
tagline: Frase corta destacada
archived: false
cover: https://res.cloudinary.com/.../portada.jpg        # opcional; si falta, cuadro del video completo
fullVideo: https://res.cloudinary.com/.../video.mp4      # video de la página del trabajo
video: /videos/clips/slug.mp4                            # clip corto del slideshow (opcional)
photos:
  - https://res.cloudinary.com/.../foto-1.jpg
videos:
  - { src: https://res.cloudinary.com/.../reel.mp4, caption: Reel en vivo }
order: 1
credits: []
stats:
  - { label: Año, value: '2026' }
---

Texto largo del proyecto en markdown.
```

Los campos de media aceptan URL de Cloudinary, public_id o path local de `/public` ([src/lib/cloudinary.ts](src/lib/cloudinary.ts) resuelve los tres).

### Carga masiva desde un Drive

1. Bajar el Drive a `fotos_videos/drive/` respetando las carpetas (ignorado por git).
2. Mapear archivos → trabajo en [scripts/drive-manifest.mjs](scripts/drive-manifest.mjs).
3. `node scripts/upload-drive.mjs` (o `--dry-run`, o filtrar por slug: `node scripts/upload-drive.mjs antel,cif`).

El script achica las fotos, comprime los videos de más de 95MB, no sube dos veces el mismo archivo (compara por contenido) y reescribe `fullVideo`, `photos` y `videos` del trabajo según el manifest (pisa lo que se haya cambiado a mano en esas listas).

---

## Tag de backup

El estado HTML puro previo a esta migración queda preservado en:

- **Tag git:** `v1-html-puro`
- **Carpeta:** `legacy/`
