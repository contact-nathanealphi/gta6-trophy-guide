// GTA VI trophy guide & tracker: a checklist that stays in this browser
// (localStorage), with filters, a spoiler setting, export/import, and a
// roadmap. It loads one local file, data/trophies.json, and nothing else.
const EARNED_KEY = 'gta6-trophy-guide-earned-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler-v1';

const list = document.getElementById('list');
const searchBox = document.getElementById('search');
const kindBox = document.getElementById('kind');
const gradeBox = document.getElementById('grade');
const missableBox = document.getElementById('missableOnly');
const hideEarnedBox = document.getElementById('hideEarned');
const spoilerBox = document.getElementById('spoiler');

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const totalPoints = trophies.reduce((sum, t) => sum + (t.points || 0), 0);

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
let spoiler = localStorage.getItem(SPOILER_KEY) === '1';
spoilerBox.checked = spoiler;

// A trophy's rarity in plain words, from its Exophase earn rate.
function rarityLabel(rate) {
  if (rate <= 0) return 'Untouched';
  if (rate < 0.1) return 'Ultra rare';
  if (rate < 1) return 'Very rare';
  if (rate < 10) return 'Rare';
  if (rate < 50) return 'Uncommon';
  return 'Common';
}

function rarityText(rate) {
  if (rate <= 0) return '0.00% earned';
  return `${rate.toFixed(2)}% earned`;
}

// Story trophies stay hidden while the spoiler setting is on and the
// trophy is not earned yet: name, description and guide all stay secret.
function isHidden(t) {
  return spoiler && t.kind === 'story' && !earned.has(t.id);
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function visible(t) {
  if (kindBox.value !== 'all' && t.kind !== kindBox.value) return false;
  if (gradeBox.value !== 'all' && t.grade !== gradeBox.value) return false;
  if (missableBox.checked && !t.missable) return false;
  if (hideEarnedBox.checked && earned.has(t.id)) return false;
  const q = searchBox.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
  return true;
}

function gradeBadge(t) {
  const span = document.createElement('span');
  span.className = `badge grade-${t.grade}`;
  span.textContent = t.grade;
  return span;
}

function kindTag(t) {
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = t.kind;
  return span;
}

function renderCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.id) ? ' earned' : '');
  card.dataset.id = String(t.id);

  const head = document.createElement('div');
  head.className = 'card-head';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveEarned();
    render();
  });
  head.append(box);

  const title = document.createElement('div');
  title.className = 'card-title';
  const name = document.createElement('h3');
  name.textContent = isHidden(t) ? '???' : t.name;
  title.append(name);
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.append(gradeBadge(t), ' ', kindTag(t), ' ');
  const rarity = document.createElement('span');
  rarity.className = 'rarity';
  rarity.textContent = `${rarityLabel(t.rarity)} · ${rarityText(t.rarity)}`;
  meta.append(rarity);
  if (t.missable) {
    const warn = document.createElement('span');
    warn.className = 'warn';
    warn.textContent = ' ⚠ Possibly missable';
    meta.append(warn);
  }
  if (t.secret) {
    const sec = document.createElement('span');
    sec.className = 'tag secret';
    sec.textContent = 'secret';
    meta.append(' ', sec);
  }
  const pts = document.createElement('span');
  pts.className = 'points';
  pts.textContent = ` ${t.points} pts`;
  meta.append(pts);
  title.append(meta);
  head.append(title);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'detail-toggle';
  toggle.textContent = card.classList.contains('open') ? 'Hide guide −' : 'Guide +';
  toggle.addEventListener('click', () => {
    card.classList.toggle('open');
    toggle.textContent = card.classList.contains('open') ? 'Hide guide −' : 'Guide +';
  });
  head.append(toggle);
  card.append(head);

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = isHidden(t) ? 'Hidden by the spoiler setting — earn this trophy to reveal it.' : t.description;
  card.append(desc);

  const detail = document.createElement('div');
  detail.className = 'detail';
  if (isHidden(t)) {
    const p = document.createElement('p');
    p.textContent = 'Guide hidden until earned (spoiler setting).';
    detail.append(p);
  } else {
    const how = document.createElement('p');
    how.innerHTML = `<b>How to get it:</b> `;
    how.append(document.createTextNode(t.guide));
    const src = document.createElement('p');
    src.className = 'source';
    src.textContent = `Source: ${t.source}`;
    detail.append(how, src);
  }
  card.append(detail);
  return card;
}

function renderProgress() {
  const n = earned.size;
  const pts = trophies.filter((t) => earned.has(t.id)).reduce((s, t) => s + (t.points || 0), 0);
  document.getElementById('earnedCount').textContent = String(n);
  document.getElementById('barFill').style.width = `${(n / trophies.length) * 100}%`;
  document.getElementById('progressText').textContent =
    `${Math.round((n / trophies.length) * 100)}% · ${pts} of ${totalPoints} points`;
  const earnedRates = trophies.filter((t) => earned.has(t.id));
  const rarest = earnedRates.length
    ? earnedRates.reduce((a, b) => (a.rarity <= b.rarity ? a : b))
    : null;
  document.getElementById('rarestText').textContent = rarest
    ? `Rarest earned: ${rarest.name} (${rarityText(rarest.rarity)})`
    : 'Nothing earned yet — the story trophies come first.';
}

function render() {
  renderProgress();
  const shown = trophies.filter(visible);
  list.replaceChildren();
  for (const t of shown) list.append(renderCard(t));
  document.getElementById('countLine').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies` +
    (spoiler ? ' · story spoilers hidden' : '');
}

// Open one trophy's guide from a ?detail=<id> link (used by screenshots).
function openFromQuery() {
  const q = new URLSearchParams(location.search);
  if (q.get('spoiler') === '1') {
    spoiler = true;
    spoilerBox.checked = true;
    saveSpoiler();
  }
  if (q.get('kind')) kindBox.value = q.get('kind');
  if (q.get('grade')) gradeBox.value = q.get('grade');
  if (q.get('missable') === '1') missableBox.checked = true;
  const detail = Number(q.get('detail'));
  if (detail) {
    render();
    const card = list.querySelector(`[data-id="${detail}"]`);
    if (card) {
      card.classList.add('open');
      card.querySelector('.detail-toggle').textContent = 'Hide guide −';
      card.scrollIntoView({ block: 'center' });
    }
    return;
  }
  if (location.hash === '#roadmap') {
    render();
    document.getElementById('roadmap').scrollIntoView();
    return;
  }
  render();
}

for (const el of [searchBox, kindBox, gradeBox, missableBox, hideEarnedBox]) {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
}
spoilerBox.addEventListener('change', () => {
  spoiler = spoilerBox.checked;
  saveSpoiler();
  render();
});

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: data.game, earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    const valid = new Set(trophies.map((t) => t.id));
    const next = new Set((ids ?? []).filter((id) => valid.has(id)));
    earned = next;
    saveEarned();
    render();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveEarned();
    render();
  }
});

openFromQuery();
