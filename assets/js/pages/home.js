// Everything inline for the homepage only (no shared components).
(async function initHome() {
  // Fetch data (fake for now)
  const [citiesData, buildersData, communitiesData] = await Promise.all([
    fetch('/data/cities.json').then(r => r.json()).catch(() => ({ cities: [] })),
    fetch('/data/builders.json').then(r => r.json()).catch(() => ({ builders: [] })),
    fetch('/data/communities.json').then(r => r.json()).catch(() => ({ communities: [] })),
  ]);

  const cities = citiesData.cities || [];
  const builders = buildersData.builders || [];
  const communities = communitiesData.communities || [];

  renderCities(cities);
  renderBuilderLogos(builders);
  renderMap(communities);
})();

function renderCities(cities) {
  const grid = document.getElementById('cities-grid');
  if (!grid) return;
  if (!cities.length) {
    grid.innerHTML = '<div class="card">No cities loaded yet.</div>';
    return;
  }
  grid.innerHTML = cities.map(c => `
    <a class="city-card" href="/cities/${c.slug}/">
      <img src="${c.heroImage || '/assets/images/cities/placeholder.webp'}" alt="${c.name}">
      <div class="city-card__body">
        <span class="city-card__name">${c.name}</span>
        <span class="city-card__meta">View communities →</span>
      </div>
    </a>
  `).join('');
}

function renderBuilderLogos(builders) {
  const row = document.getElementById('builder-logos');
  if (!row) return;
  if (!builders.length) {
    row.innerHTML = '<div class="card">No builders yet.</div>';
    return;
  }
  row.innerHTML = builders.map(b => `
    <div class="card" style="padding:12px; display:flex; align-items:center; justify-content:center;">
      <img src="${b.logo || '/assets/images/builders/placeholder.webp'}" alt="${b.name}">
    </div>
  `).join('');
}

function renderMap(communities) {
  const mapEl = document.getElementById('map');
  const fallback = document.getElementById('map-fallback');
  if (!mapEl) return;

  if (!window.L) {
    fallback.hidden = false;
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