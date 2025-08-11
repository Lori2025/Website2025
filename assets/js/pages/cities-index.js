// Cities index: fetch cities.json and render cards linking to /cities/<slug>/
(async function initCitiesIndex(){
  const grid = document.getElementById('cities-grid');
  if (!grid) return;

  let data;
  try {
    const res = await fetch('/data/cities.json');
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
    const img = c.heroImage || '/assets/images/cities/placeholder.webp';
    return `
      <a class="city-card" href="/cities/${c.slug}/">
        <img src="${img}" alt="${c.name}">
        <div class="city-card__body">
          <span class="city-card__name">${c.name}</span>
          <span class="city-card__meta">View communities →</span>
        </div>
      </a>`;
  }).join('');
})();