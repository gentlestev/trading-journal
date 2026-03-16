// ============================================================
// FSH Empire — UI: Clock, toast, modal helpers
// ============================================================

export function startClock() {
  setInterval(() => {
    const el = document.getElementById('liveTime');
    if (el) el.textContent = new Date().toUTCString().slice(17, 25) + ' UTC';
  }, 1000);
}

export function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => { t.className = 'toast'; }, 3200);
}

export function openDerivModal() {
  const modal = document.getElementById('connectModal');
  if (modal) modal.classList.add('open');
  const { derivToken } = window._app || {};
  if (derivToken) {
    const inp = document.getElementById('derivTokenInput');
    if (inp) inp.value = derivToken;
  }
}

export function closeDerivModal() {
  const modal = document.getElementById('connectModal');
  if (modal) modal.classList.remove('open');
}
