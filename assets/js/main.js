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
  campaignPeriod: document.querySelector('#campaignPeriod'),
  heroTitle: document.querySelector('#heroTitle'),
  heroLead: document.querySelector('#heroLead'),
  backnumberButton: document.querySelector('#backnumberButton'),
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
      item.group,
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
  const items = campaign.items || [];
  const years = items.map((item) => Number(item.distilledYear)).filter(Number.isFinite);
  const prices = items.map((item) => Number(item.price)).filter(Number.isFinite);
  const stockCount = items.filter((item) => item.stock).length;
  const tastingCount = items.filter((item) => item.tasting).length;

  if (els.metricTotal) els.metricTotal.textContent = items.length;
  if (els.metricStock) els.metricStock.textContent = stockCount;
  if (els.metricTasting) els.metricTasting.textContent = tastingCount;
  if (els.oldestYear) els.oldestYear.textContent = years.length ? Math.min(...years) : '—';
  if (els.newestYear) els.newestYear.textContent = years.length ? Math.max(...years) : '—';
  if (els.priceRange) els.priceRange.textContent = prices.length ? `${yen(Math.min(...prices))} – ${yen(Math.max(...prices))}` : '—';
  if (els.campaignTitle) els.campaignTitle.textContent = campaign.title;
  if (els.campaignLead) els.campaignLead.textContent = campaign.lead;
  if (els.campaignPeriod) els.campaignPeriod.textContent = campaign.period || 'Campaign';
  if (els.heroTitle) els.heroTitle.textContent = campaign.title;
  if (els.heroLead) els.heroLead.textContent = campaign.subtitle || campaign.lead;
  document.title = `M's Tasting Room｜${campaign.title}`;
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

function selectCampaign(campaigns) {
  const campaignId = document.body.dataset.campaignId;
  if (campaignId) {
    const campaign = campaigns.find((entry) => entry.id === campaignId);
    if (campaign) return campaign;
  }
  return campaigns.find((entry) => entry.isCurrent) || campaigns[0];
}

async function init() {
  try {
    const dataPath = document.body.dataset.dataPath || 'data/campaigns.json';
    const response = await fetch(dataPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const campaign = selectCampaign(data.campaigns);
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
