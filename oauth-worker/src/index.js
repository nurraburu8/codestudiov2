/**
 * Proxy OAuth para Decap CMS ↔ GitHub.
 *
 * Flujo:
 *   /auth     → redirige a GitHub authorize (con state aleatorio)
 *   /callback → recibe ?code de GitHub, lo canjea por access_token,
 *               y devuelve un HTML que postMessage al window opener
 *               (que es el panel /admin de Decap).
 *
 * Secrets requeridos (wrangler secret put):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';

function renderCallback(status, token, provider) {
  const payload = JSON.stringify({ token, provider: provider || 'github' });
  // Decap escucha mensajes con el formato: "authorization:<provider>:<status>:<json>"
  const message = `authorization:${provider || 'github'}:${status}:${payload}`;
  return `<!doctype html><html><body><script>
    (function () {
      function send() {
        if (!window.opener) return;
        window.opener.postMessage(${JSON.stringify(message)}, '*');
      }
      window.addEventListener('message', function (e) {
        if (e.data === 'authorizing:github') send();
      }, false);
      send();
    })();
  </script>Autenticado. Podés cerrar esta ventana.</body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;

    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${origin}/callback`,
        scope: 'repo,user',
      });
      return Response.redirect(`${AUTHORIZE_URL}?${params}`, 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response(renderCallback('error', 'missing_code'), {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 400,
        });
      }
      const tokenRes = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenRes.json();
      if (!data.access_token) {
        return new Response(renderCallback('error', data.error || 'no_token'), {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 401,
        });
      }
      return new Response(renderCallback('success', data.access_token, 'github'), {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('codestudio-oauth: endpoints /auth y /callback', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  },
};
