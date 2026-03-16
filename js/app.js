// ============================================================
// FSH Empire — App: Central state, bootstrap, router
// ============================================================

import { renderHeader, updateUserDisplay } from '../components/header.js';
import { renderAuth }                      from '../components/auth.js';
import { startClock, showToast, openDerivModal, closeDerivModal } from './ui.js';
import { populateCountries }              from './auth.js';
import { switchMainTab, switchSubTab }    from './nav.js';

// ── Supabase client ──
export const SUPABASE_URL = 'https://obliysgyuizoyxkevqxv.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibGl5c2d5dWl6b3l4a2V2cXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzkzMjQsImV4cCI6MjA4OTI1NTMyNH0.x5G8rtTC8xisZAcQ7d251kYbATp8ihBARd02Mb_4Vyo';
export const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Global mutable state ──
export let allTrades       = [];
export let currentUser     = null;
export let derivWS         = null;
export let derivToken      = '';
export let selectedEmotion = '';
export let activeFirm      = 'deriv';
export let activeSubTab    = 'overview';

export const FIRMS = { deriv:'Deriv', ftmo:'FTMO', the5ers:'The5ers', other:'Other' };

// ── State setters ──
export function setAllTrades(t)    { allTrades    = t; }
export function setCurrentUser(u)  { currentUser  = u; }
export function setDerivWS(ws)     { derivWS      = ws; }
export function setDerivToken(t)   { derivToken   = t; }
export function setActiveFirm(f)   { activeFirm   = f; }
export function setActiveSubTab(s) { activeSubTab = s; }

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', async () => {
  renderAuth();
  renderHeader();
  startClock();
  populateCountries();

  // Handle email confirmation redirect
  const hash  = window.location.hash;
  const query = window.location.search;
  if (hash.includes('access_token') || query.includes('access_token') ||
      hash.includes('type=signup')   || query.includes('type=signup')) {
    const { data } = await sb.auth.getSession();
    if (data?.session) {
      window.history.replaceState({}, document.title, window.location.pathname);
      onLoginInternal(data.session.user);
      showToast('✅ Email confirmed! Welcome to FSH Empire!');
      return;
    }
  }

  const { data: { session } } = await sb.auth.getSession();
  if (session) onLoginInternal(session.user);

  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN')  onLoginInternal(session.user);
    if (event === 'SIGNED_OUT') onLogoutInternal();
  });
});

// ── Auth transitions ──
async function onLoginInternal(user) {
  setCurrentUser(user);
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appScreen').style.display  = 'block';
  updateUserDisplay(user);

  const savedToken = localStorage.getItem('dt_' + user.id);
  if (savedToken) {
    const { connectDeriv } = await import('./deriv.js');
    setDerivToken(savedToken);
    connectDeriv(true);
  }

  const { loadTradesFromSupabase } = await import('./data.js');
  await loadTradesFromSupabase();

  const firstTab = document.querySelector('#mainNav .tab');
  if (firstTab) switchMainTab(firstTab, 'deriv');
}

function onLogoutInternal() {
  setCurrentUser(null);
  setAllTrades([]);
  document.getElementById('appScreen').style.display  = 'none';
  document.getElementById('authScreen').style.display = 'flex';
}

// ── Expose to window for HTML onclick handlers ──
import * as authModule    from './auth.js';
import * as derivModule   from './deriv.js';
import * as dataModule    from './data.js';
import * as uploadModule  from './upload.js';
import * as journalModule from './journal.js';

window.showToast           = showToast;
window.openDerivModal      = openDerivModal;
window.closeDerivModal     = closeDerivModal;
window.switchMainTab       = switchMainTab;
window.switchSubTab        = switchSubTab;
window.doLogin             = authModule.doLogin;
window.doRegister          = authModule.doRegister;
window.doLogout            = async () => { if (derivWS) derivWS.close(); await sb.auth.signOut(); };
window.signInWithGoogle    = authModule.signInWithGoogle;
window.forgotPassword      = authModule.forgotPassword;
window.switchAuthTab       = authModule.switchAuthTab;
window.regNextStep         = authModule.regNextStep;
window.regPrevStep         = authModule.regPrevStep;
window.validateEmail       = authModule.validateEmail;
window.validatePhone       = authModule.validatePhone;
window.validatePostal      = authModule.validatePostal;
window.validateAddress     = authModule.validateAddress;
window.onCountryChange     = authModule.onCountryChange;
window.onStateChange       = authModule.onStateChange;
window.showCongratsScreen  = authModule.showCongratsScreen;
window.closeCongratsScreen = authModule.closeCongratsScreen;
window.connectDeriv        = derivModule.connectDeriv;
window.syncTrades          = derivModule.syncTrades;
window.setDerivStatus      = derivModule.setDerivStatus;
window.deleteTrade         = dataModule.deleteTrade;
window.deleteAllTrades     = dataModule.deleteAllTrades;
window.renderAllTradesTable= dataModule.renderAllTradesTable;
window.saveFirmTrades      = uploadModule.saveFirmTrades;
window.deleteFirmTrades    = uploadModule.deleteFirmTrades;
window.handleFirmCSVFiles  = uploadModule.handleFirmCSVFiles;
window.handleFirmImgFiles  = uploadModule.handleFirmImgFiles;
window.handleFirmCSVDrop   = uploadModule.handleFirmCSVDrop;
window.handleFirmImgDrop   = uploadModule.handleFirmImgDrop;
window.parseFirmPaste      = uploadModule.parseFirmPaste;
window.saveFirmJournal     = journalModule.saveFirmJournal;
window.selectFirmEmotion   = journalModule.selectFirmEmotion;
