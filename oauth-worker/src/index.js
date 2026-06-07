/**
 * Proxy OAuth para Sveltia CMS / Decap CMS ↔ GitHub.
 * Compatible con el formato de mensaje de sveltia-cms y netlify-auth-providers.
 *
 * Secrets requeridos (wrangler secret put):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL     = 'https://github.com/login/oauth/access_token';

function renderCallback(status, token) {
  const payload = JSON.stringify({ token, provider: 'github' });
  const message  = `authorization:github:${status}:${payload}`;
  return `<!doctype html><html><head><meta charset="utf-8"></head><body>
<script>
(function () {
  var msg = ${JSON.stringify(message)};
  // Sveltia CMS escucha el evento message directamente sin ping previo.
  // Intentamos enviar inmediatamente y reintentamos por si hay race condition.
  function send() {
    if (!window.opener) return false;
    window.opener.postMessage(msg, '*');
    return true;
  }
  if (!send()) {
    var t = 0;
    var iv = setInterval(function () {
      if (send() || ++t > 20) {
        clearInterval(iv);
        setTimeout(function () { window.close(); }, 500);
      }
    }, 150);
  } else {
    setTimeout(function () { window.close(); }, 500);
  }
})();
</script>
<p style="font-family:sans-serif;padding:2rem">Autenticado. Cerrando...</p>
</body></html>`;
}

export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;

    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id:    env.GITHUB_CLIENT_ID,
        redirect_uri: `${origin}/callback`,
        scope:        'repo,user',
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
        method:  'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body:    JSON.stringify({
          client_id:     env.GITHUB_CLIENT_ID,
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
      return new Response(renderCallback('success', data.access_token), {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('codestudio-oauth worker OK', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  },
};
