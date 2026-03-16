// ============================================================
// FSH Empire — Component: Header (app bar + main nav + sub-nav)
// ============================================================

import { FIRMS } from '../js/app.js';

export function renderHeader() {
  const el = document.getElementById('appHeader');
  if (!el) return;

  el.innerHTML = `
    <header>
      <div class="logo">FSH EMPIRE</div>
      <div class="header-right">
        <div class="live-badge">
          <div class="live-dot"></div>
          <span id="liveTime">--:--:-- UTC</span>
        </div>
        <span id="derivStatus" class="deriv-status disconnected">DERIV OFF</span>
        <button class="btn btn-outline btn-sm" onclick="openDerivModal()">⚡ DERIV</button>
        <div class="user-pill">
          <div class="user-avatar" id="userAvatar">?</div>
          <span class="user-email" id="userEmail">—</span>
        </div>
        <button class="btn btn-danger btn-sm" onclick="doLogout()">LOGOUT</button>
      </div>
    </header>

    <!-- MAIN NAV -->
    <div class="nav-tabs" id="mainNav">
      <div class="tab active" onclick="switchMainTab(this,'deriv')">Deriv</div>
      <div class="tab" onclick="switchMainTab(this,'ftmo')">FTMO</div>
      <div class="tab" onclick="switchMainTab(this,'the5ers')">The5ers</div>
      <div class="tab" onclick="switchMainTab(this,'other')">Other</div>
      <div class="tab" onclick="switchMainTab(this,'alltrades')">📊 All Trades</div>
      <div class="tab" onclick="switchMainTab(this,'help')">❓ Help</div>
    </div>

    <!-- SUB-NAV (shown when a firm tab is active) -->
    <div class="nav-tabs sub-nav" id="subNav">
      <div class="sub-tab active" onclick="switchSubTab(this,'overview')">📊 Overview</div>
      <div class="sub-tab" onclick="switchSubTab(this,'upload')">⬆ Upload Trades</div>
      <div class="sub-tab" onclick="switchSubTab(this,'history')">📋 Trade History</div>
      <div class="sub-tab" onclick="switchSubTab(this,'journal')">📝 Journal</div>
      <div class="sub-tab" onclick="switchSubTab(this,'analysis')">📈 Analysis</div>
    </div>
  `;
}

export function updateUserDisplay(user) {
  const emailEl  = document.getElementById('userEmail');
  const avatarEl = document.getElementById('userAvatar');
  if (emailEl)  emailEl.textContent  = user.email || '—';
  if (avatarEl) avatarEl.textContent = (user.email || '?')[0].toUpperCase();
}
