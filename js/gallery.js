/* Code Studio — Gallery renderer
   Renders work cards into [data-gallery="<category>" | "all"].
   Cards link to work.html?id=<work.id>. */

(function(){
  'use strict';

  if (!window.WORKS) return;

  const bracket = `<svg viewBox="0 0 40 40"><path d="M4 36 L4 12 C4 7.6 7.6 4 12 4 L36 4"/></svg>`;
  const ph = `<svg class="ph" viewBox="0 0 40 40"><path d="M4 36 L4 12 C4 7.6 7.6 4 12 4 L36 4"/><path d="M36 4 L36 28 C36 32.4 32.4 36 28 36 L4 36"/></svg>`;

  /* Designed cover placeholders — each work gets a unique
     gradient based on its position. When a real "cover" image is
     provided via the work object it overrides the placeholder. */
  const PALETTES = [
    ['#3a1a08', '#0c0502'],   // amber
    ['#3a0a14', '#0c0205'],   // crimson
    ['#1f0a3a', '#06020c'],   // violet
    ['#0a1a3a', '#02050c'],   // navy
    ['#0a3a2a', '#02080a'],   // emerald
    ['#3a2a0a', '#0c0802'],   // gold
    ['#0a3a3a', '#02080a'],   // teal
    ['#3a0a30', '#0c0208']    // magenta
  ];

  function placeholderHTML(w, idx){
    const [a, b] = PALETTES[idx % PALETTES.length];
    const bg = `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
    return `
      <div class="cm-placeholder" style="background:${bg};">
        <div class="pl-glow"></div>
        <span class="pl-type">${w.type}</span>
        <span class="pl-client">${w.client}</span>
      </div>`;
  }

  function cardHTML(w, idx){
    const num = String(idx + 1).padStart(2, '0');
    const media = w.cover
      ? `<img src="${w.cover}" alt="${w.client}" loading="lazy"/>`
      : placeholderHTML(w, idx);
    return `
      <a class="cd" href="work.html?id=${w.id}">
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
              <div class="ccat">${w.category}</div>
              <h3 class="cnm">${w.client}</h3>
            </div>
            <span class="cyr">${w.year}</span>
          </div>
        </div>
      </a>`;
  }

  document.querySelectorAll('[data-gallery]').forEach(node => {
    const filter = node.dataset.gallery;
    const limit  = node.dataset.limit ? parseInt(node.dataset.limit, 10) : null;
    let items = window.WORKS;
    if (filter && filter !== 'all') {
      items = items.filter(w => w.category === filter);
    }
    if (limit) items = items.slice(0, limit);
    node.innerHTML = items.map((w, i) => cardHTML(w, i)).join('');

    // update count label if present
    const countEl = document.querySelector(node.dataset.countTarget);
    if (countEl) countEl.textContent = String(items.length).padStart(2, '0') + ' proyectos';

    // subtle 3D tilt following the cursor
    node.querySelectorAll('.cd').forEach(card => attachCardBehaviour(card));
  });

  function attachCardBehaviour(card){
    const ci = card.querySelector('.ci');
    if (!ci) return;

    // disable tilt on coarse pointers (touch) AND on small viewports
    // (devtools mobile preview / actual phones). Re-checked on resize.
    const isSmall = () => (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      || window.innerWidth <= 820;
    if (isSmall()) return;

    const MAX = 3;   // very subtle — 3° max
    let raf = null;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    function loop(){
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      ci.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      if (Math.abs(tx - cx) > 0.04 || Math.abs(ty - cy) > 0.04) {
        raf = requestAnimationFrame(loop);
      } else {
        if (Math.abs(tx) < 0.04 && Math.abs(ty) < 0.04) ci.style.transform = '';
        raf = null;
      }
    }

    card.addEventListener('mousemove', (e) => {
      if (isSmall()) return;       // re-check on the fly (resize/devtools)
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      tx = (px - 0.5) * MAX * 2;
      ty = (py - 0.5) * -MAX * 2;
      card.classList.add('tilt-active');
      if (!raf) raf = requestAnimationFrame(loop);
    });

    card.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      card.classList.remove('tilt-active');
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }
})();
