# Code Studio

Sitio oficial de **Code Studio** — productora audiovisual uruguaya.

Construido con [Astro 5](https://astro.build/) · Hosting en [Cloudflare Pages](https://pages.cloudflare.com/) · Media en [Cloudinary](https://cloudinary.com/) · CMS visual con [Decap CMS](https://decapcms.org/).

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
| CMS | Decap CMS | Gratis |
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

## CMS visual (Decap)

El panel CMS está en `https://codestudio.com.uy/admin` y permite crear/editar/borrar trabajos sin tocar código. Cada cambio genera un commit en el repo y Cloudflare Pages re-deploya automáticamente (1-2 min).

Autenticación vía GitHub OAuth usando el worker en [oauth-worker/](oauth-worker/).

---

## Estructura de contenido

Cada trabajo es un archivo markdown en [src/content/trabajos/](src/content/trabajos/) con frontmatter validado:

```yaml
---
client: NOMBRE CLIENTE
type: AFTERMOVIE | COMERCIAL | VIDEOCLIP | ...
category: Shows | Campañas
year: 2026
location: Ciudad, País
video: /videos/archivo.mp4
cover: null
tagline: Frase corta destacada
order: 1
publish: true
credits:
  - { role: Dirección, name: Valentí Prieto }
stats:
  - { label: Asistentes, value: 80K+ }
---

Texto largo del proyecto en markdown.
```

---

## Tag de backup

El estado HTML puro previo a esta migración queda preservado en:

- **Tag git:** `v1-html-puro`
- **Carpeta:** `legacy/`
