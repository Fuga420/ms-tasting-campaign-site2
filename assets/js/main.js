const state = {
  items: [],
  filtered: [],
};

const els = {
  tableBody: document.querySelector('#tableBody'),
  cardList: document.querySelector('#cardList'),
  searchInput: document.querySelector('#searchInput'),
  yearFilter: document.querySelector('#yearFilter'),
  stockFilter: document.querySelector('#stockFilter'),
  tastingFilter: document.querySelector('#tastingFilter'),
  sortSelect: document.querySelector('#sortSelect'),
  resultCount: document.querySelector('#resultCount'),
  emptyMessage: document.querySelector('#emptyMessage'),
  metricTotal: document.querySelector('#metricTotal'),
  metricStock: document.querySelector('#metricStock'),
  metricTasting: document.querySelector('#metricTasting'),
  oldestYear: document.querySelector('#oldestYear'),
  newestYear: document.querySelector('#newestYear'),
  priceRange: document.querySelector('#priceRange'),
  campaignTitle: document.querySelector('#campaignTitle'),
  campaignLead: document.querySelector('#campaignLead'),
};

const formatter = new Intl.NumberFormat('ja-JP');

function yen(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return `¥${formatter.format(num)}`;
}

function yesNoBadge(value, yesText, noText) {
  return `<span class="badge ${value ? 'ok' : 'no'}">${value ? yesText : noText}</span>`;
}

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/\s+/g, '');
}

function applyFilters() {
  const q = normalize(els.searchInput.value);
  const decade = els.yearFilter.value;
  const stock = els.stockFilter.value;
  const tasting = els.tastingFilter.value;

  state.filtered = state.items.filter((item) => {
    const haystack = normalize([
      item.distilledYear,
      item.bottlingSeries,
      item.distillery,
      item.age,
      item.price,
    ].join(' '));

    const matchesSearch = !q || haystack.includes(q);
    const year = Number(item.distilledYear);
    const matchesYear = decade === 'all' || (year >= Number(decade) && year <= Number(decade) + 9);
    const matchesStock = stock === 'all' || String(item.stock) === stock;
    const matchesTasting = tasting === 'all' || String(item.tasting) === tasting;

    return matchesSearch && matchesYear && matchesStock && matchesTasting;
  });

  applySort();
  render();
}

function applySort() {
  const sort = els.sortSelect.value;
  const numeric = (item, key) => {
    const value = Number(item[key]);
    return Number.isFinite(value) ? value : -Infinity;
  };

  state.filtered.sort((a, b) => {
    if (sort === 'year-desc') return numeric(b, 'distilledYear') - numeric(a, 'distilledYear');
    if (sort === 'price-asc') return numeric(a, 'price') - numeric(b, 'price');
    if (sort === 'price-desc') return numeric(b, 'price') - numeric(a, 'price');
    if (sort === 'age-desc') return numeric(b, 'age') - numeric(a, 'age');
    return numeric(a, 'distilledYear') - numeric(b, 'distilledYear');
  });
}

function render() {
  els.resultCount.textContent = state.filtered.length;
  els.emptyMessage.hidden = state.filtered.length !== 0;

  els.tableBody.innerHTML = state.filtered.map((item) => `
    <tr>
      <td class="year-cell">${item.distilledYear}</td>
      <td class="series-cell">${escapeHtml(item.bottlingSeries)}</td>
      <td class="distillery-cell">${escapeHtml(item.distillery)}</td>
      <td>${item.age ? `${item.age}年` : '—'}</td>
      <td class="price-cell">${yen(item.price)}</td>
      <td>${yesNoBadge(item.stock, '在庫あり', '在庫なし')}</td>
      <td>${yesNoBadge(item.tasting, '試飲可', '試飲不可')}</td>
    </tr>
  `).join('');

  els.cardList.innerHTML = state.filtered.map((item) => `
    <article class="bottle-card">
      <div class="bottle-card__top">
        <span class="bottle-card__year">${item.distilledYear}</span>
        <strong>${yen(item.price)}</strong>
      </div>
      <h3>${escapeHtml(item.distillery)}</h3>
      <p>${escapeHtml(item.bottlingSeries)}</p>
      <div class="bottle-card__meta">
        <span class="badge ok">${item.age ? `${item.age}年` : '年数 —'}</span>
        ${yesNoBadge(item.stock, '在庫あり', '在庫なし')}
        ${yesNoBadge(item.tasting, '試飲可', '試飲不可')}
      </div>
    </article>
  `).join('');
}

function renderStats(campaign) {
  const items = campaign.items;
  const years = items.map((item) => Number(item.distilledYear)).filter(Number.isFinite);
  const prices = items.map((item) => Number(item.price)).filter(Number.isFinite);
  const stockCount = items.filter((item) => item.stock).length;
  const tastingCount = items.filter((item) => item.tasting).length;

  els.metricTotal.textContent = items.length;
  els.metricStock.textContent = stockCount;
  els.metricTasting.textContent = tastingCount;
  els.oldestYear.textContent = Math.min(...years);
  els.newestYear.textContent = Math.max(...years);
  els.priceRange.textContent = `${yen(Math.min(...prices))} – ${yen(Math.max(...prices))}`;
  els.campaignTitle.textContent = campaign.title;
  els.campaignLead.textContent = campaign.lead;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));
}

function bindEvents() {
  [els.searchInput, els.yearFilter, els.stockFilter, els.tastingFilter, els.sortSelect].forEach((el) => {
    el.addEventListener('input', applyFilters);
    el.addEventListener('change', applyFilters);
  });
}

async function init() {
  try {
    const response = await fetch('data/campaigns.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const campaign = data.campaigns.find((entry) => entry.isCurrent) || data.campaigns[0];
    state.items = campaign.items;
    state.filtered = [...state.items];
    renderStats(campaign);
    bindEvents();
    applyFilters();
  } catch (error) {
    console.error(error);
    els.emptyMessage.hidden = false;
    els.emptyMessage.textContent = 'データを読み込めませんでした。ローカル確認時は簡易サーバーで開いてください。';
  }
}

init();
