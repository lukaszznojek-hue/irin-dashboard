/* kalkulator.js - mini-kalkulator dofinansowania w zakładce Szkolenia */

const PROCENTY = {
  mikro:   {kfs: 1.00, bur: 0.80, efs: 0.85, wlasne: 0},
  male:    {kfs: 0.80, bur: 0.70, efs: 0.80, wlasne: 0},
  srednie: {kfs: 0.80, bur: 0.50, efs: 0.70, wlasne: 0},
  duze:    {kfs: 0.50, bur: 0.50, efs: 0.50, wlasne: 0},
};

const LIMIT_KFS = 24000;

function obliczDofinansowanie() {
  const rozmiar = document.getElementById('kalk-rozmiar').value;
  const filar = document.getElementById('kalk-filar').value;
  const szkolId = document.getElementById('kalk-szkolenie').value;
  if (!DASHBOARD_DATA.szkolenia?.uslugi) return;
  const szkol = DASHBOARD_DATA.szkolenia.uslugi.find(s => s.id_bur === szkolId);
  if (!szkol) return;
  const cena = szkol.cena_brutto;
  const proc = PROCENTY[rozmiar][filar];
  let dofin = cena * proc;
  let info = '';
  if (filar === 'kfs' && dofin > LIMIT_KFS) {
    info = 'Uwaga: limit KFS ' + LIMIT_KFS.toLocaleString('pl-PL') + ' zł/pracownik. Klient dopłaca różnicę.';
    dofin = LIMIT_KFS;
  }
  const klient = cena - dofin;
  document.getElementById('kalk-cena').textContent = cena.toLocaleString('pl-PL') + ' zł';
  document.getElementById('kalk-klient').textContent = klient.toLocaleString('pl-PL') + ' zł';
  document.getElementById('kalk-dofin').textContent = dofin.toLocaleString('pl-PL') + ' zł (' + Math.round(proc * 100) + '%)';
  document.getElementById('kalk-info').textContent = info;
}

function initKalkulator() {
  const sel = document.getElementById('kalk-szkolenie');
  if (!sel || !DASHBOARD_DATA.szkolenia?.uslugi) return;
  sel.innerHTML = '';
  DASHBOARD_DATA.szkolenia.uslugi.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id_bur;
    opt.textContent = s.tytul.length > 60 ? s.tytul.slice(0, 57) + '...' : s.tytul;
    sel.appendChild(opt);
  });
  ['kalk-rozmiar', 'kalk-filar', 'kalk-szkolenie'].forEach(id =>
    document.getElementById(id).addEventListener('change', obliczDofinansowanie)
  );
  obliczDofinansowanie();
}
