// /assets/js/pages/city.js
// Reused by ALL /cities/<slug>/index.html pages

(async function initCityPage() {
  const slug = getCitySlug();
  if (!slug) {
    console.error('City slug not found in URL.');
    renderError('City not found.');
    return;
  }

  // Load datasets
  const [citiesData, buildersData, communitiesData] = await Promise.all([
    fetch('/data/cities.json').then(r => r.json()).catch(() => ({ cities: [] })),
    fetch('/data/builders.json').then(r => r.json()).catch(() => ({ builders: [] })),
    fetch('/data/communities.json').then(r => r.json()).catch(() => ({ communities: [] })),
  ]);

  const cities = citiesData.cities || [];
  const builders = buildersData.builders || [];
  const communities = communitiesData.communities || [];

  const city = cities.find(c => c.slug === slug);
  if (!city) {
    renderError('City not found in data.');
    return;
  }

  // Filter communities by city
  const cityCommunities = communities.filter(c => c.cityId === city.id);

  // Group communities by builderId
  const byBuilder = cityCommunities.reduce((acc, c) => {
    (acc[c.builderId] ||= []).push(c);
    return acc;
  }, {});

  renderHero(city);
  renderQuickStats(city, cityCommunities);
  renderCommunities(byBuilder, builders);
})();

function getCitySlug() {
  // Robustly find the slug after the 'cities' segment, works for GH Pages too
  const segments = location.pathname.split('/').filter(Boolean);
  const i = segments.indexOf('cities');
  if (i >= 0 && i + 1 < segments.length) return segments[i + 1];
  // Fallback to query param
  return new URLSearchParams(location.search).get('slug');
}

function el(id) { return document.getElementById(id); }

function renderError(msg) {
  const mount = el('city-root');
  if (mount) mount.innerHTML = `<div class="card">${msg}</div>`;
}

function renderHero(city) {
  const img = city.heroImage || '/assets/images/cities/placeholder.webp';
  el('city-hero').innerHTML = `
    <div class="container" style="padding:28px 0;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center;">
        <div>
          <h1 style="margin:0 0 6px;">${city.name}</h1>
          ${city.tagline ? `<p class="section__sub" style="margin:0;">${city.tagline}</p>` : ''}
        </div>
        <div>
          <img src="${img}" alt="${city.name}" style="width:100%;max-height:260px;object-fit:cover;border-radius:14px;border:1px solid var(--stroke);">
        </div>
      </div>
    </div>`;
}

function renderQuickStats(city, cityCommunities) {
  const bCount = city.buildersCount ?? '-';
  const cCount = city.communitiesCount ?? cityCommunities.length ?? '-';
  const price = city.priceRange ?? '-';

  el('city-stats').innerHTML = `
    <div class="container">
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        <div class="card"><div><strong>Builders</strong><div style="font-size:22px;font-weight:800;">${bCount}</div></div></div>
        <div class="card"><div><strong>Communities</strong><div style="font-size:22px;font-weight:800;">${cCount}</div></div></div>
        <div class="card"><div><strong>Price Range</strong><div style="font-size:22px;font-weight:800;">${price}</div></div></div>
      </div>
    </div>`;
}

function renderCommunities(byBuilder, builders) {
  const mount = el('city-communities');
  const builderName = id => (builders.find(b => b.id === id)?.name) || 'Builder';

  const sections = Object.keys(byBuilder).sort().map(bId => {
    const list = byBuilder[bId]
      .map(c => communityRow(c, builderName(bId)))
      .join('');
    return `
      <section class="section" style="padding-top:28px;">
        <div class="container">
          <h2 class="section__title" style="margin-bottom:12px;">${builderName(bId)}</h2>
          <div class="stack">${list}</div>
        </div>
      </section>`;
  }).join('');

  mount.innerHTML = sections || `<div class="container"><div class="card">No communities listed yet.</div></div>`;
}

function communityRow(c, builderName) {
  const status = c.status ? `<span class="pill">${c.status}</span>` : '';
  return `
    <a class="row-card" href="/communities/template.html#id=${c.id}">
      <div class="row-card__body">
        <div class="row-card__title">${c.name}</div>
        <div class="row-card__meta">${builderName} ${status}</div>
      </div>
      <div class="row-card__cta">View →</div>
    </a>`;
}