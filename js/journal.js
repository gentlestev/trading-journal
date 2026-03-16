// ── FSH Empire · JOURNAL ──

function selectFirmEmotion(btn,firm,emotion){
  const container=btn.closest('.emotion-grid');
  container.querySelectorAll('.emotion-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  firmEmotions[firm]=emotion;
}

async function saveFirmJournal(firm,firmName){
  if(!currentUser){showToast('Sign in first',true);return;}
  const date=document.getElementById(firm+'-jDate').value;
  const instrument=document.getElementById(firm+'-jInstrument').value;
  const result=document.getElementById(firm+'-jResult').value;
  const emotion=firmEmotions[firm]||'';
  const reasoning=document.getElementById(firm+'-jReasoning').value;
  const went_well=document.getElementById(firm+'-jWell').value;
  const improve=document.getElementById(firm+'-jImprove').value;
  if(!date||!instrument||!result){showToast('Date, instrument and result are required',true);return;}
  const{error}=await sb.from('journal_entries').insert({user_id:currentUser.id,date,instrument,result,emotion,reasoning,went_well,improve,account_provider:firmName});
  if(error){showToast('Error: '+error.message,true);return;}
  showToast('Journal entry saved!');
  document.getElementById(firm+'-jReasoning').value='';
  document.getElementById(firm+'-jWell').value='';
  document.getElementById(firm+'-jImprove').value='';
  firmEmotions[firm]='';
  document.querySelectorAll('#firm-'+firm+' .emotion-btn').forEach(b=>b.classList.remove('selected'));
  loadFirmJournalEntries(firm,firmName);
}

async function loadFirmJournalEntries(firm,firmName){
  if(!currentUser)return;
  const{data}=await sb.from('journal_entries').select('*').eq('user_id',currentUser.id).eq('account_provider',firmName).order('date',{ascending:false});
  const container=document.getElementById(firm+'-journalEntries');
  if(!container)return;
  if(!data||!data.length){container.innerHTML='<div class="no-entries">No entries for '+firmName+' yet.</div>';return;}
  container.innerHTML=data.map(e=>`
    <div class="journal-entry-card">
      <div class="entry-meta">
        <div><div class="entry-date">${e.date}</div><div class="entry-instrument">${e.instrument}</div></div>
        <div style="text-align:right;"><span class="badge ${e.result==='Win'?'badge-win':e.result==='Loss'?'badge-loss':'badge-be'}">${e.result}</span>${e.emotion?`<div style="margin-top:4px;" class="entry-emotion">${e.emotion}</div>`:''}</div>
      </div>
      ${e.reasoning?`<div class="entry-section"><div class="entry-section-label">Why I Entered</div><div class="entry-text">${e.reasoning}</div></div>`:''}
      ${e.went_well?`<div class="entry-section"><div class="entry-section-label">What Went Well</div><div class="entry-text">${e.went_well}</div></div>`:''}
      ${e.improve?`<div class="entry-section"><div class="entry-section-label">What To Improve</div><div class="entry-text">${e.improve}</div></div>`:''}
    </div>`).join('');
}

async function loadFirmEmotionAnalysis(firm,firmName){
  if(!currentUser)return;
  const{data}=await sb.from('journal_entries').select('emotion,result').eq('user_id',currentUser.id).eq('account_provider',firmName);
  const container=document.getElementById(firm+'-emotionAnalysis');
  if(!container)return;
  if(!data||!data.length){container.innerHTML='<div class="loading-state">No journal entries yet</div>';return;}
  const byEmotion={};
  data.forEach(e=>{
    if(!e.emotion)return;
    if(!byEmotion[e.emotion])byEmotion[e.emotion]={w:0,total:0};
    byEmotion[e.emotion].total++;
    if(e.result==='Win')byEmotion[e.emotion].w++;
  });
  container.innerHTML=Object.entries(byEmotion).map(([em,d])=>{
    const wr=(d.w/d.total*100).toFixed(0);
    return`<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--accent);">${em}</span><span style="font-family:var(--font-mono);font-size:0.72rem;">${wr}% win (${d.total} entries)</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${wr}%;background:${wr>=50?'var(--green)':'var(--red)'}"></div></div></div>`;
  }).join('');
}
