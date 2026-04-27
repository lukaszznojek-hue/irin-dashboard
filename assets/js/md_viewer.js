/* md_viewer.js - modal MD viewer (uzywa marked.js z lib/) */

const GITHUB_REPO_PATH = 'lukaszznojek-hue/irin-dashboard';

async function openMdModal(filePath, title) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    const html = (typeof marked !== 'undefined') ? marked.parse(md) : `<pre>${escapeHtml(md)}</pre>`;

    const modal = document.createElement('div');
    modal.className = 'md-modal-overlay';
    modal.innerHTML = `
      <div class="md-modal" onclick="event.stopPropagation()">
        <div class="md-modal-header">
          <h3>${escapeHtml(title)}</h3>
          <div class="md-modal-actions">
            <button onclick="copyMdContent(this)" class="btn-copy">Skopiuj</button>
            <a href="https://github.com/${GITHUB_REPO_PATH}/edit/main/${filePath}"
               target="_blank" rel="noopener" class="btn-edit">Edytuj na GitHub</a>
            <button onclick="closeMdModal(this)" class="btn-close" aria-label="Zamknij">✕</button>
          </div>
        </div>
        <div class="md-modal-body" data-raw="${encodeURIComponent(md)}">${html}</div>
      </div>`;
    modal.onclick = (e) => { if (e.target === modal) closeMdModal(modal.querySelector('.btn-close')); };
    document.body.appendChild(modal);
    document.addEventListener('keydown', escMdHandler);
  } catch (e) {
    console.error('MD modal error:', e);
    alert('Nie udało się otworzyć pliku: ' + e.message);
  }
}

function escMdHandler(e) {
  if (e.key === 'Escape') {
    const m = document.querySelector('.md-modal-overlay');
    if (m) closeMdModal(m.querySelector('.btn-close'));
  }
}

function closeMdModal(el) {
  const modal = el.closest('.md-modal-overlay');
  if (modal) modal.remove();
  document.removeEventListener('keydown', escMdHandler);
}

function copyMdContent(btn) {
  const body = btn.closest('.md-modal').querySelector('.md-modal-body');
  const raw = decodeURIComponent(body.dataset.raw || '');
  if (!navigator.clipboard) {
    btn.textContent = 'Brak clipboard API';
    return;
  }
  navigator.clipboard.writeText(raw).then(() => {
    btn.textContent = 'Skopiowano ✓';
    setTimeout(() => { btn.textContent = 'Skopiuj'; }, 1500);
  }).catch(() => {
    btn.textContent = 'Błąd kopiowania';
  });
}
