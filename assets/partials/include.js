(async () => {
  // Helper to fetch a partial and inject into mount
  async function inject(mountId, url) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) {
        console.error(`Include 404: ${url}`);
        return;
      }
      mount.innerHTML = await res.text();
    } catch (e) {
      console.error(`Include failed for ${url}`, e);
    }
  }

  // Inject header & footer from /assets/partials/
  await inject('header-placeholder', '/assets/partials/header.html');
  await inject('footer-placeholder', '/assets/partials/footer.html');

  // After footer is injected, set the year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Highlight active link after header is injected
  const path = location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('#main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href === path) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();