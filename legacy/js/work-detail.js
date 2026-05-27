/* Code Studio — Work detail page
   Reads ?id=<work-id> from the URL, looks the work up in window.WORKS,
   and populates the page. Renders 3 related works at the bottom. */

(function(){
  'use strict';

  function $(sel){ return document.querySelector(sel); }

  function render(){
    const params = new URLSearchParams(location.search);
    const id = (params.get('id') || '').trim();
    const w = (window.getWork && window.getWork(id)) || window.WORKS[0];

    if (!w) {
      document.body.innerHTML = '<p style="padding:120px 5vw;color:#888">Trabajo no encontrado.</p>';
      return;
    }

    /* Debug: surface the actual id we resolved so it's easy to confirm
       different works render different data. Remove later if not needed. */
    console.info('[work-detail] resolved id =', w.id, 'requested =', id);

    document.title = `${w.client} — Code Studio`;
    $('#workCat').textContent     = w.category;
    $('#workYear').textContent    = w.year;
    $('#workLoc').textContent     = w.location;
    $('#workType').textContent    = w.type;
    $('#workClient').textContent  = w.client;
    $('#workTagline').textContent = w.tagline ? `“${w.tagline}”` : '';

    // video
    const v = $('#workVideo');
    if (v) {
      v.pause();
      v.removeAttribute('src');
      v.load();
      v.src = w.video;
      v.load();
    }

    // description
    $('#workDesc').innerHTML = (w.description || []).map(p => `<p>${p}</p>`).join('');

    // stats
    $('#workStats').innerHTML = (w.stats || []).map(s =>
      `<div class="stat-card"><div class="v">${s.v}</div><div class="k">${s.k}</div></div>`
    ).join('');

    // credits
    $('#workCredits').innerHTML = Object.entries(w.credits || {}).map(([k, val]) =>
      `<div class="credit-row"><span class="k">${k}</span><span class="v">${val}</span></div>`
    ).join('');

    // related: render 3 other works directly (don't rely on gallery.js modifying global state)
    const rel = $('#relatedGrid');
    if (rel) {
      const others = window.WORKS.filter(x => x.id !== w.id).slice(0, 3);
      const bracket = '<svg viewBox="0 0 40 40"><path d="M4 36 L4 12 C4 7.6 7.6 4 12 4 L36 4"/></svg>';
      const ph = '<svg class="ph" viewBox="0 0 40 40"><path d="M4 36 L4 12 C4 7.6 7.6 4 12 4 L36 4"/><path d="M36 4 L36 28 C36 32.4 32.4 36 28 36 L4 36"/></svg>';
      const palettes = [
        ['#3a1a08','#0c0502'],['#3a0a14','#0c0205'],['#1f0a3a','#06020c'],
        ['#0a1a3a','#02050c'],['#0a3a2a','#02080a'],['#3a2a0a','#0c0802'],
        ['#0a3a3a','#02080a'],['#3a0a30','#0c0208']
      ];
      const placeholder = (o, i) => {
        const [a,b] = palettes[i % palettes.length];
        return `<div class="cm-placeholder" style="background:linear-gradient(135deg, ${a} 0%, ${b} 100%);">
          <div class="pl-glow"></div>
          <span class="pl-type">${o.type}</span>
          <span class="pl-client">${o.client}</span>
        </div>`;
      };
      rel.innerHTML = others.map((o, i) => {
        const num = String(i + 1).padStart(2, '0');
        const media = o.cover
          ? `<img src="${o.cover}" alt="${o.client}" loading="lazy"/>`
          : placeholder(o, i);
        return `
          <a class="cd" href="work.html?id=${o.id}">
            <div class="ci">
              <div class="cm">
                ${ph}
                ${media}
                <div class="cov"></div>
                <span class="cnum">${num}</span>
                <div class="cvw">VER</div>
                <div class="cb tl">${bracket}</div>
                <div class="cb tr">${bracket}</div>
                <div class="cb br">${bracket}</div>
                <div class="cb bl">${bracket}</div>
              </div>
              <div class="cinf">
                <div>
                  <div class="ccat">${o.category}</div>
                  <h3 class="cnm">${o.client}</h3>
                </div>
                <span class="cyr">${o.year}</span>
              </div>
            </div>
          </a>`;
      }).join('');
    }
  }

  // run on initial load AND on back/forward bfcache restores
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
  window.addEventListener('pageshow', (e) => { if (e.persisted) render(); });
})();
