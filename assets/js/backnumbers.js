const archiveEl = document.querySelector('#campaignArchive');
const emptyEl = document.querySelector('#archiveEmpty');
const dataPath = document.body.dataset.dataPath || '../data/campaigns.json';
const rootPath = document.body.dataset.rootPath || '../';

const formatter = new Intl.NumberFormat('ja-JP');

function yen(value) {
  const num = Number(value);
  return Number.isFinite(num) ? `¥${formatter.format(num)}` : '—';
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

function stats(items) {
  const prices = items.map((item) => Number(item.price)).filter(Number.isFinite);
  return {
    total: items.length,
    tasting: items.filter((item) => item.tasting).length,
    priceMin: prices.length ? Math.min(...prices) : null,
    priceMax: prices.length ? Math.max(...prices) : null,
  };
}

async function initArchive() {
  try {
    const response = await fetch(dataPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const campaigns = [...data.campaigns].sort((a, b) => String(b.period).localeCompare(String(a.period)));

    archiveEl.innerHTML = campaigns.map((campaign) => {
      const s = stats(campaign.items || []);
      const href = `${rootPath}campaigns/${campaign.id}/`;
      const label = campaign.isCurrent ? '最新企画' : 'バックナンバー';
      return `
        <a class="archive-card" href="${href}">
          <p class="archive-card__period">${escapeHtml(campaign.period)} / ${label}</p>
          <h3>${escapeHtml(campaign.title)}</h3>
          <p>${escapeHtml(campaign.subtitle || campaign.lead)}</p>
          <div class="archive-card__meta">
            <span>${s.total}本</span>
            <span>試飲可 ${s.tasting}本</span>
            <span>${yen(s.priceMin)}〜${yen(s.priceMax)}</span>
          </div>
        </a>
      `;
    }).join('');
  } catch (error) {
    console.error(error);
    emptyEl.hidden = false;
    emptyEl.textContent = 'バックナンバーを読み込めませんでした。';
  }
}

initArchive();
