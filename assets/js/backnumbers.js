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

function archiveMeta(campaign) {
  if (Array.isArray(campaign.archiveMeta) && campaign.archiveMeta.length) {
    return campaign.archiveMeta;
  }

  const s = stats(campaign.items || []);
  const unit = campaign.unit || '本';
  const price = s.priceMin !== null && s.priceMax !== null ? `${yen(s.priceMin)}〜${yen(s.priceMax)}` : '価格未定';
  return [`${s.total}${unit}`, price];
}

async function initArchive() {
  try {
    const response = await fetch(dataPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const campaigns = [...data.campaigns].sort((a, b) => String(b.sortKey || b.period).localeCompare(String(a.sortKey || a.period)));

    archiveEl.innerHTML = campaigns.map((campaign) => {
      const href = `${rootPath}campaigns/${campaign.id}/`;
      const label = campaign.archiveLabel || (campaign.isCurrent ? '最新企画' : 'バックナンバー');
      const meta = archiveMeta(campaign).map((item) => `<span>${escapeHtml(item)}</span>`).join('');
      const thumb = campaign.image ? `<div class="archive-card__thumb"><img src="${rootPath}${escapeHtml(campaign.image)}" alt="${escapeHtml(campaign.title)}" loading="lazy"></div>` : '';
      return `
        <a class="archive-card" href="${href}">
          ${thumb}
          <div class="archive-card__body">
            <p class="archive-card__period">${escapeHtml(campaign.period)} / ${escapeHtml(label)}</p>
            <h3>${escapeHtml(campaign.title)}</h3>
            <p>${escapeHtml(campaign.subtitle || campaign.lead)}</p>
            <div class="archive-card__meta">${meta}</div>
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
