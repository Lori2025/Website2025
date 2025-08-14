// /assets/js/pages/home.js (v3) — robust image fallbacks, no inline onerror

(async function initHome() {
  const [citiesData, buildersData, communitiesData] = await Promise.all([
    fetch('/data/cities.json').then(r => r.json()).catch(() => ({ cities: [] })),
    fetch('/data/builders.json').then(r => r.json()).catch(() => ({ builders: [] })),
    fetch('/data/communities.json').then(r => r.json()).catch(() => ({ communities: [] })),
  ]);

  const cities = citiesData.cities || [];
  const builders = buildersData.builders || [];
  const communities = communitiesData.communities || [];

  renderCities(cities.slice(0, 6));
  renderBuilderStrip(builders.slice(0, 6));
  renderMap(communities);
  attachImgFallbacks();
})();

function mount(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// Small embedded SVG placeholders (data URLs)
const CITY_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'>
     <rect width='100%' height='100%' fill='#0f1117'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
           fill='#9aa3af' font-family='sans-serif' font-size='14'>No image</text>
   </svg>`
);
const LOGO_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='60'>
     <rect width='100%' height='100%' fill='#0f1117'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
           fill='#9aa3af' font-family='sans-serif' font-size='12'>No logo</text>
   </svg>`
);

function renderCities(cities) {
  const grid = document.getElementById('cities-grid');
  if (!grid) return;
  grid.innerHTML = cities.map(c => {
    const img = c.heroImage || '/assets/images/cities/placeholder.webp';
    return `
      <a class="city-card" href="/cities/${c.slug}/">
        <img data-src="${img}" alt="${c.name}">
        <div class="city-card__body">
          <span class="city-card__name">${c.name}</span>
          <span class="city-card__meta">View communities →</span>
        </div>
      </a>
    `;
  }).join('');
}

function renderBuilderStrip(builders) {
  const row = document.getElementById('builder-logos');
  if (!row) return;
  row.innerHTML = builders.map(b => {
    const src = b.logo || '/assets/images/builders/placeholder.webp';
    return `
      <div class="card" style="padding:12px; display:flex; align-items:center; justify-content:center;">
        <img data-src="${src}" alt="${b.name}">
      </div>
    `;
  }).join('');
}

function attachImgFallbacks() {
  // Apply after DOM for sections is rendered
  const imgs = document.querySelectorAll('img[data-src]');
  imgs.forEach(img => {
    const isLogo = img.closest('#builder-logos') !== null;
    const placeholder = isLogo ? LOGO_PLACEHOLDER : CITY_PLACEHOLDER;
    img.addEventListener('error', () => {
      img.src = placeholder;
    }, { once: true });
    img.src = img.getAttribute('data-src');
  });
}

function renderMap(communities) {
  const mapEl = document.getElementById('map');
  const fallback = document.getElementById('map-fallback');
  if (!mapEl) return;

  if (!window.L) {
    if (fallback) fallback.hidden = false;
    return;
  }

  const map = L.map(mapEl, { scrollWheelZoom: false }).setView([36.21, -119.34], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  communities.forEach(c => {
    if (typeof c.lat !== 'number' || typeof c.lng !== 'number') return;
    const m = L.marker([c.lat, c.lng]).addTo(map);
    m.bindPopup(`<strong>${c.name}</strong><br>${c.status || ''}`);
  });
}
