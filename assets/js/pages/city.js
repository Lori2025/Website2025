// /assets/js/pages/city.js
// Shared logic for /cities/<slug>/ pages

(async function initCityPage() {
  const slug = getSlugFromPath();
  if (!slug) return renderError('City not found in URL.');

  // Load data
  const [citiesData, buildersData, communitiesData] = await Promise.all([
    fetch('/data/cities.json').then(r => r.json()).catch(() => ({ cities: [] })),
    fetch('/data/builders.json').then(r => r.json()).catch(() => ({ builders: [] })),
    fetch('/data/communities.json').then(r => r.json()).catch(() => ({ communities: [] })),
  ]);

  const cities = citiesData.cities || [];
  const builders = buildersData.builders || [];
  const communities = communitiesData.communities || [];

  const city = cities.find(c => c.slug === slug);
  if (!city) return renderError('City not found in data.');

  const cityCommunities = communities.filter(c => c.cityId === city.id);
  const builderIds = Array.from(new Set(cityCommunities.map(c => c.builderId)));
  const buildersInCity = builders.filter(b => builderIds.includes(b.id));

  renderHero(city);
  renderStats(city, cityCommunities);
  renderCommunities(cityCommunities, builders);
  renderBuilders(buildersInCity);
  renderFAQ(city);
  renderMap(cityCommunities);

  enhanceSubnav();
})();

function getSlugFromPath() {
  const parts = location.pathname.split('/').filter(Boolean);
  const i = parts.indexOf('cities');
  return (i >= 0 && parts[i + 1]) ? parts[i + 1] : null;
}

function renderError(msg) {
  const mount = document.getElementById('city-hero');
  if (mount) mount.innerHTML = `<div class="container"><div class="card">${msg}</div></div>`;
}

function renderHero(city) {
  const hero = document.getElementById('city-hero');
  if (!hero) return;
  const bg = city.heroImage || '/assets/images/cities/placeholder.webp';
  const tags = city.tags && city.tags.length ? city.tags : [];
  hero.innerHTML = `
    <div class="city-hero__bg" style="background-image:url('${bg}')"></div>
    <div class="container city-hero__inner">
      <div class="city-hero__copy">
        <h1>${city.name}</h1>
        ${city.tagline ? `<p class="section__sub">${city.tagline}</p>` : ``}
        ${tags.length ? `<div class="chip-row">${tags.slice(0,5).map(t => `<span class="chip">${t}</span>`).join('')}</div>` : ``}
      </div>
    </div>
  `;
}

function renderStats(city, cityCommunities) {
  const mount = document.getElementById('city-stats');
  if (!mount) return;
  const buildersCount = city.buildersCount ?? new Set(cityCommunities.map(c => c.builderId)).size ?? '-';
  const communitiesCount = city.communitiesCount ?? cityCommunities.length ?? '-';
  const price = city.priceRange ?? '—';
  const pop = city.stats?.population ? city.stats.population.toLocaleString() : '—';

  mount.innerHTML = `
    <div class="container">
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
        <div class="stat card"><div class="stat__label">Builders</div><div class="stat__value">${buildersCount}</div></div>
        <div class="stat card"><div class="stat__label">Communities</div><div class="stat__value">${communitiesCount}</div></div>
        <div class="stat card"><div class="stat__label">Price Range</div><div class="stat__value">${price}</div></div>
        <div class="stat card"><div class="stat__label">Population</div><div class="stat__value">${pop}</div></div>
      </div>
    </div>
  `;
}

function renderCommunities(list, builders) {
  const mount = document.getElementById('city-communities');
  if (!mount) return;
  if (!list.length) {
    mount.innerHTML = `<div class="container"><div class="card">No communities listed yet.</div></div>`;
    return;
  }
  const nameOf = id => builders.find(b => b.id === id)?.name || 'Builder';
  const groups = {};
  for (const c of list) (groups[c.builderId] ||= []).push(c);

  const sections = Object.keys(groups).map(bid => {
    const rows = groups[bid].map(c => {
      const status = c.status ? `<span class="pill">${c.status}</span>` : '';
      return `
        <a class="row-card" href="/communities/template.html#id=${c.id}">
          <div class="row-card__body">
            <div class="row-card__title">${c.name}</div>
            <div class="row-card__meta">${nameOf(bid)} ${status}</div>
          </div>
          <div class="row-card__cta">View →</div>
        </a>`;
    }).join('');
    return `
      <div class="container" style="margin-bottom:22px;">
        <h2 class="section__title" style="margin-bottom:12px;">${nameOf(bid)}</h2>
        <div class="stack">${rows}</div>
      </div>`;
  }).join('');

  mount.innerHTML = sections;
}

function renderBuilders(builders) {
  const mount = document.getElementById('city-builders');
  if (!mount) return;
  if (!builders.length) {
    mount.innerHTML = `<div class="container"><div class="card">No builder info yet.</div></div>`;
    return;
  }
  const logos = builders.map(b => `
    <div class="card" style="padding:12px;display:flex;align-items:center;justify-content:center;">
      <img src="${b.logo || '/assets/images/builders/placeholder.webp'}" alt="${b.name}">
    </div>`).join('');
  mount.innerHTML = `
    <div class="container">
      <h2 class="section__title">Builders you’ll see in this city</h2>
      <div class="logo-row">${logos}</div>
    </div>`;
}

function renderFAQ(city) {
  const mount = document.getElementById('city-faq');
  if (!mount) return;
  const faqs = [
    { q: `Can I use FHA or VA loans in ${city.name}?`, a: 'Yes—most builders here accept government-backed financing.' },
    { q: 'Are there down-payment assistance programs?', a: 'Often yes, especially for first-time buyers in Tulare County.' },
    { q: 'How soon can I move in?', a: 'Inventory homes may be move-in ready within 30 days; new builds vary by phase.' }
  ];
  mount.innerHTML = `
    <div class="container">
      <h2 class="section__title">FAQ</h2>
      <div class="faq">
        ${faqs.map(f => `
          <details class="faq__item">
            <summary>${f.q}</summary>
            <div class="faq__a">${f.a}</div>
          </details>`).join('')}
      </div>
    </div>`;
}

function renderMap(communities) {
  const mapEl = document.getElementById('city-map');
  const fallback = document.getElementById('map-fallback');
  if (!mapEl) return;
  if (!window.L) { if (fallback) fallback.hidden = false; return; }

  const center = [36.21, -119.34];
  const map = L.map(mapEl, { scrollWheelZoom: false }).setView(center, 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  communities.forEach(c => {
    if (typeof c.lat !== 'number' || typeof c.lng !== 'number') return;
    L.marker([c.lat, c.lng]).addTo(map).bindPopup(`<strong>${c.name}</strong><br>${c.status || ''}`);
  });
}

function enhanceSubnav() {
  const nav = document.getElementById('city-subnav');
  if (!nav) return;
  const top = nav.offsetTop;
  window.addEventListener('scroll', () => {
    if (window.scrollY > top) nav.classList.add('is-sticky');
    else nav.classList.remove('is-sticky');
  });
}
