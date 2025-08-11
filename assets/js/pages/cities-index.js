// Cities index: fetch cities.json and render detailed cards
(async function initCitiesIndex(){
  const grid = document.getElementById('cities-grid');
  if (!grid) return;

  let data;
  try {
    const res = await fetch('/data/cities.json', { cache: 'no-cache' });
    data = await res.json();
  } catch (e) {
    grid.innerHTML = '<div class="card">Failed to load cities. Please try again later.</div>';
    return;
  }

  const cities = (data && data.cities) ? data.cities : [];
  if (!cities.length){
    grid.innerHTML = '<div class="card">No cities available yet.</div>';
    return;
  }

  grid.innerHTML = cities.map(c => {
    const img = c.thumb || c.heroImage || '/assets/images/cities/placeholder.webp';
    const tagline = c.tagline || '';
    const builders = (c.buildersCount ?? '') !== '' ? `<strong>Builders:</strong> ${c.buildersCount}` : '';
    const communities = (c.communitiesCount ?? '') !== '' ? `<strong>Communities:</strong> ${c.communitiesCount}` : '';
    const price = c.priceRange ? `<strong>Price Range:</strong> ${c.priceRange}` : '';

    return `
      <a class="city-card city-card--wide" href="/cities/${c.slug}/" aria-label="${c.name}: ${tagline}">
        <div class="city-card__media">
          <img src="${img}" alt="${c.name}">
        </div>
        <div class="city-card__body">
          <h3 class="city-card__name">${c.name}</h3>
          ${tagline ? `<div class="city-card__tagline">${tagline}</div>` : ''}
          <div class="city-card__stats">
            ${builders ? `<div>${builders}</div>` : ''}
            ${communities ? `<div>${communities}</div>` : ''}
            ${price ? `<div>${price}</div>` : ''}
          </div>
        </div>
      </a>`;
  }).join('');
})();
