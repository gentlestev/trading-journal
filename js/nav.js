// ── FSH Empire · NAV ──

function switchMainTab(el,name){
  document.querySelectorAll('#mainNav .tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  activeFirm=name;
  // Show/hide sub-nav
  const subNav=document.getElementById('subNav');
  const isFirm=FIRMS[name]!==undefined;
  subNav.style.display=isFirm?'flex':'none';
  // Show/hide firm containers
  document.querySelectorAll('.firm-container').forEach(c=>c.style.display='none');
  document.getElementById('firm-'+name).style.display='block';
  if(isFirm){
    // Reset to overview sub-tab
    activeSubTab='overview';
    document.querySelectorAll('#subNav .sub-tab').forEach(t=>t.classList.remove('active'));
    document.querySelector('#subNav .sub-tab').classList.add('active');
    renderSubPage(name,'overview');
  }
  if(name==='alltrades'){renderAllTradesTable();renderAllAnalysis();}
}

function switchSubTab(el,sub){
  document.querySelectorAll('#subNav .sub-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  activeSubTab=sub;
  renderSubPage(activeFirm,sub);
}

function renderSubPage(firm,sub){
  // Hide all sub-pages for this firm
  document.querySelectorAll('#firm-'+firm+' .sub-page').forEach(p=>p.style.display='none');
  const el=document.getElementById(firm+'-'+sub);
  if(el) el.style.display='block';
  const firmName=FIRMS[firm];
  if(!firmName)return;
  if(sub==='overview') renderFirmOverview(firm,firmName);
  if(sub==='upload')   renderFirmUpload(firm,firmName);
  if(sub==='history')  renderFirmHistory(firm,firmName);
  if(sub==='journal')  renderFirmJournal(firm,firmName);
  if(sub==='analysis') renderFirmAnalysis(firm,firmName);
}
