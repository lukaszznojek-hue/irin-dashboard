/* utils.js - pure helpers, brak dependencji */

const WOJEWODZTWA_KOLEJNOSC = [
  'swietokrzyskie','pomorskie','zachodniopomorskie','kujawsko-pomorskie',
  'wielkopolskie','slaskie','dolnoslaskie','malopolskie','mazowieckie',
  'lubelskie','lubuskie','lodzkie','opolskie','podkarpackie','podlaskie','warminsko-mazurskie'
];

const VOIVODESHIP_LABELS = {
  'dolnoslaskie':'Dolnośląskie','kujawsko-pomorskie':'Kujawsko-pomorskie',
  'lubelskie':'Lubelskie','lubuskie':'Lubuskie','lodzkie':'Łódzkie',
  'malopolskie':'Małopolskie','mazowieckie':'Mazowieckie','opolskie':'Opolskie',
  'podkarpackie':'Podkarpackie','podlaskie':'Podlaskie','pomorskie':'Pomorskie',
  'slaskie':'Śląskie','swietokrzyskie':'Świętokrzyskie',
  'warminsko-mazurskie':'Warmińsko-mazurskie','wielkopolskie':'Wielkopolskie',
  'zachodniopomorskie':'Zachodniopomorskie'
};

const TIER_LABELS = {'1a':'Pełne dane','1b':'Dane podstawowe','2':'Skeleton'};
const TIER_COLORS = {'1a':'#2D7A3E','1b':'#D17A00','2':'#999'};

const AKCJA_LABELS = {
  aktywny: 'AKTYWNY',
  monitor: 'MONITORUJ',
  zadzwon: 'ZADZWOŃ',
  zakonczony: 'ZAKOŃCZONY'
};

function formatKwota(num) {
  if (!num || num === 0) return '';
  return num.toLocaleString('pl-PL') + ' zł';
}

function fmtDateShort(d) {
  if (!d || isNaN(d)) return '—';
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateDDMM(s) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

function katLabel(k) {
  const m = {
    ai: 'AI / Cyfrowe',
    edukacja: 'Edukacja spec.',
    biznes: 'Biznes',
    soft_skills: 'Soft skills',
    regulacje: 'Regulacje',
    ai_regulacje: 'AI + regulacje'
  };
  return m[k] || k || '—';
}

function getTier(voiv) {
  const m = (typeof DASHBOARD_DATA !== 'undefined') ? DASHBOARD_DATA.meta?.tier_pokrycia : null;
  if (!m) return '2';
  if (m.tier_1a?.includes(voiv)) return '1a';
  if (m.tier_1b?.includes(voiv)) return '1b';
  return '2';
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escapeAttr(s) {
  return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// fallback dla starych danych: urgency -> akcja_status
function mapUrgencyToAkcja(card) {
  if (card.akcja_status) return card.akcja_status;
  const u = card.urgency, s = card.kfs_status, w = card.has_warning;
  if (['krytyczny','pilny','trwa'].includes(u)) return 'aktywny';
  if (u === 'nadchodzi') return 'monitor';
  if (u === 'zakonczony' && s === 'ZAKONCZONY') return 'zakonczony';
  return 'zadzwon';
}

// "P3" / "Akademia X" -> klikalne nawigacje (interpolateLinks)
function interpolateLinks(text) {
  if (!text) return '';
  let out = escapeHtml(text);
  out = out.replace(/\b(P[1-7])\b/g, '<a class="link-prior" onclick="goToSlownik(\'$1\')">$1</a>');
  out = out.replace(/\bAkademia (HR|Sprzedaży|Lidera|OZE|Managera|Zarządzania|4\.0|Biznesu)\b/g,
    '<a class="link-akad" onclick="goToSzkolenia(\'$1\')">Akademia $1</a>');
  return out;
}
