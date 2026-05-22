/* Code Studio — Nav behaviour
   Hide nav on scroll-down, show on scroll-up.
   Hamburger toggle for mobile menu. */

(function(){
  'use strict';

  // hide on scroll-down, show on scroll-up + add background fill once scrolled
  const nav = document.querySelector('.nav');
  if (nav) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('hide', y > lastY && y > 100);
      nav.classList.toggle('scrolled', y > 50);
      lastY = y;
    }, { passive: true });
  }

  // hamburger toggle + close button injected into the menu overlay
  const ham = document.querySelector('.ham');
  const mob = document.querySelector('.mob-menu');
  if (ham && mob) {
    // Inject the close button if not already present in the markup
    if (!mob.querySelector('.mob-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'mob-close';
      closeBtn.setAttribute('aria-label', 'Cerrar menú');
      closeBtn.setAttribute('type', 'button');
      closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
      mob.appendChild(closeBtn);
    }

    const closeMenu = () => {
      ham.classList.remove('open');
      mob.classList.remove('open');
    };
    const openMenu = () => {
      ham.classList.add('open');
      mob.classList.add('open');
    };

    ham.addEventListener('click', () => {
      mob.classList.contains('open') ? closeMenu() : openMenu();
    });

    mob.querySelector('.mob-close').addEventListener('click', closeMenu);

    // Clicking a link still closes the menu (and lets the browser navigate)
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // ESC also closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mob.classList.contains('open')) closeMenu();
    });
  }
})();
