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
│   └── lib/             # Helpers (cloudinary, etc) — TODO
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
| Email del dominio | Google Workspace (existente) | — |
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

### DNS

El dominio `codestudio.com.uy` está registrado en **Antel** (nameservers `ns1.anteldata.com.uy`).
Para activar Cloudflare Pages con dominio personalizado:

1. Migrar nameservers a Cloudflare (panel Antel)
2. Copiar los MX records de Google Workspace a Cloudflare DNS **antes** del switch para no romper el email
3. Configurar custom domain en Cloudflare Pages

---

## Edición de contenido (para el cliente)

El sitio usa **Astro Content Collections** para los trabajos. Cada trabajo es un archivo markdown en [src/content/trabajos/](src/content/trabajos/) con frontmatter validado contra el schema de [src/content.config.ts](src/content.config.ts).

### Panel CMS visual (Decap)

Una vez configurado el OAuth (ver más abajo), el cliente entra a:

- **URL:** `https://codestudio.com.uy/admin`
- **Login:** GitHub OAuth

Desde ahí puede crear/editar/borrar trabajos, subir imágenes, sin tocar código. Cada cambio crea un commit en el repo y Cloudflare Pages re-deploya solo (1-2 min).

### Setup pendiente del CMS (post-deploy)

El panel necesita un OAuth provider para autenticarse contra GitHub. Pasos:

1. **GitHub** → Settings → Developer settings → OAuth Apps → New OAuth App
   - Homepage URL: `https://codestudio.com.uy`
   - Authorization callback URL: `https://<TU-WORKER>.workers.dev/auth/callback`
2. Desplegar un Cloudflare Worker como proxy OAuth (ver [decap-cms-cloudflare-pages-auth](https://github.com/i40west/netlify-cms-oauth) o similar).
3. Editar [public/admin/config.yml](public/admin/config.yml):
   - `repo`: `usuario/codestudio`
   - `base_url`: URL del Worker

---

## Estructura de contenido

```
src/content/trabajos/
├── fiesta-cerveza-26.md
├── antel-fibra.md
├── ntvg.md
└── ...
```

Cada archivo tiene la forma:

```yaml
---
client: NOMBRE CLIENTE
type: AFTERMOVIE | COMERCIAL | VIDEOCLIP | ...
category: Shows & Fiestas | Marcas | Eventos
year: 2026
location: Ciudad, País
video: /videos/archivo.mp4
cover: null  # o /uploads/cover.jpg
tagline: Frase corta destacada
order: 1     # menor = primero
publish: true
credits:
  - { role: Dirección, name: Valentí Prieto }
  - { role: Edición,   name: Mateo R. Murias }
stats:
  - { label: Asistentes, value: 80K+ }
---

Texto largo del proyecto en markdown.
Separar párrafos con línea en blanco.
```

---

## Tag de backup

El estado HTML puro previo a esta migración queda preservado en:

- **Tag git:** `v1-html-puro`
- **Carpeta:** `legacy/`

Para volver al sitio anterior:

```bash
git checkout v1-html-puro
```

---

## Soporte

Cualquier consulta técnica: revisar `legacy/` para ver implementaciones previas, o el archivo `checklist-pre-deploy.html` para tareas pendientes.
