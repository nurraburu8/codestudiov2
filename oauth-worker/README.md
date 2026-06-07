# OAuth Proxy — Decap CMS ↔ GitHub

Worker independiente que resuelve el flujo OAuth para que el cliente loguee en `/admin` con su cuenta de GitHub.

## 1. Crear OAuth App en GitHub

GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**

- **Application name**: Code Studio CMS
- **Homepage URL**: `https://codestudiov2.urraburunicolas.workers.dev` (o el dominio final cuando se lance)
- **Authorization callback URL**: `https://codestudio-oauth.urraburunicolas.workers.dev/callback`

Anotar **Client ID** y generar un **Client Secret**.

## 2. Deploy del worker

Desde esta carpeta (`oauth-worker/`):

```bash
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID       # pegar el Client ID
npx wrangler secret put GITHUB_CLIENT_SECRET   # pegar el Client Secret
npx wrangler deploy
```

El worker queda en `https://codestudio-oauth.urraburunicolas.workers.dev` — esa URL ya está hardcoded en `public/admin/config.yml`.

## 3. Dar acceso al cliente

El cliente loguea con GitHub. Para que pueda editar, tiene que ser colaborador del repo `balurra/codestudiov2` (GitHub → repo → Settings → Collaborators → Add).

## 4. Probar

Abrir `/admin` en el sitio deployado → Login with GitHub → autorizar → debería entrar al panel.
