// FSH Empire — Page: Analysis per firm + All firms
function renderFirmAnalysis(firm,firmName){
  const container=document.getElementById(firm+'-analysis');
  const trades=allTrades.filter(t=>t.account_provider===firmName);
  if(!trades.length){
    container.innerHTML=`<div class="panel"><div class="panel-body"><div class="loading-state">No trades for ${firmName} yet.</div></div></div>`;
    return;
  }
  // Instrument win rate
  const byInst={};
  trades.forEach(t=>{
    if(!byInst[t.instrument])byInst[t.instrument]={w:0,l:0};
    if(t.result==='Win')byInst[t.instrument].w++;
    else if(t.result==='Loss')byInst[t.instrument].l++;
  });
  const instRows=Object.entries(byInst).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)).map(([inst,d])=>{
    const total=d.w+d.l;const wr=total?(d.w/total*100).toFixed(0):0;
    return`<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--accent);">${inst}</span><span style="font-family:var(--font-mono);font-size:0.72rem;">${wr}% (${d.w}W/${d.l}L)</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${wr}%;background:${wr>=50?'var(--green)':'var(--red)'}"></div></div></div>`;
  }).join('');
  // Monthly
  const byMonth={};
  trades.forEach(t=>{
    const m=t.date?t.date.slice(0,7):'Unknown';
    if(!byMonth[m])byMonth[m]={pnl:0,w:0,l:0};
    byMonth[m].pnl+=parseFloat(t.profit_loss||0);
    if(t.result==='Win')byMonth[m].w++;else if(t.result==='Loss')byMonth[m].l++;
  });
  const monthRows=Object.entries(byMonth).sort().reverse().map(([m,d])=>{
    const pc=d.pnl>=0?'stat-green':'stat-red';
    return`<tr><td>${m}</td><td class="${pc}" style="font-weight:600;">${d.pnl>=0?'+':''}$${d.pnl.toFixed(2)}</td><td>${d.w}</td><td>${d.l}</td><td>${d.w+d.l?(d.w/(d.w+d.l)*100).toFixed(0):0}%</td></tr>`;
  }).join('');
  container.innerHTML=`
    <div class="two-col">
      <div class="panel"><div class="panel-header"><span class="panel-title">WIN RATE BY INSTRUMENT</span></div><div class="panel-body">${instRows||'<div class="loading-state">No data</div>'}</div></div>
      <div class="panel"><div class="panel-header"><span class="panel-title">EMOTION ANALYSIS</span></div><div class="panel-body" id="${firm}-emotionAnalysis"><div class="loading-state">Loading...</div></div></div>
    </div>
    <div class="panel" style="margin-top:18px;">
      <div class="panel-header"><span class="panel-title">MONTHLY PERFORMANCE</span></div>
      <div style="overflow-x:auto;"><table class="trades-table"><thead><tr><th>Month</th><th>P&L</th><th>Wins</th><th>Losses</th><th>Win Rate</th></tr></thead><tbody>${monthRows}</tbody></table></div>
    </div>`;
  loadFirmEmotionAnalysis(firm,firmName);
}

function renderAllAnalysis(){
  // Instrument win rate across all trades
  const byInst={};
  allTrades.forEach(t=>{
    if(!byInst[t.instrument])byInst[t.instrument]={w:0,l:0};
    if(t.result==='Win')byInst[t.instrument].w++;
    else if(t.result==='Loss')byInst[t.instrument].l++;
  });
  const instRows=Object.entries(byInst).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)).slice(0,10).map(([inst,d])=>{
    const total=d.w+d.l;const wr=total?(d.w/total*100).toFixed(0):0;
    return`<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--accent);">${inst}</span><span style="font-family:var(--font-mono);font-size:0.72rem;">${wr}%</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${wr}%;background:${wr>=50?'var(--green)':'var(--red)'}"></div></div></div>`;
  }).join('');
  const aiEl=document.getElementById('allInstrumentAnalysis');
  if(aiEl)aiEl.innerHTML=instRows||'<div class="loading-state">No data</div>';
  // Monthly
  const byMonth={};
  allTrades.forEach(t=>{
    const m=t.date?t.date.slice(0,7):'Unknown';
    if(!byMonth[m])byMonth[m]={pnl:0,w:0,l:0};
    byMonth[m].pnl+=parseFloat(t.profit_loss||0);
    if(t.result==='Win')byMonth[m].w++;else if(t.result==='Loss')byMonth[m].l++;
  });
  const monthRows=Object.entries(byMonth).sort().reverse().map(([m,d])=>{
    const pc=d.pnl>=0?'stat-green':'stat-red';
    return`<tr><td>${m}</td><td class="${pc}">${d.pnl>=0?'+':''}$${d.pnl.toFixed(2)}</td><td>${d.w}</td><td>${d.l}</td><td>${d.w+d.l?(d.w/(d.w+d.l)*100).toFixed(0):0}%</td></tr>`;
  }).join('');
  const amEl=document.getElementById('allMonthlyAnalysis');
  if(amEl)amEl.innerHTML=monthRows?`<table class="trades-table"><thead><tr><th>Month</th><th>P&L</th><th>Wins</th><th>Losses</th><th>Win Rate</th></tr></thead><tbody>${monthRows}</tbody></table>`:'<div class="loading-state">No data</div>';
  // All stats grid
  const wins=allTrades.filter(t=>t.result==='Win');
  const losses=allTrades.filter(t=>t.result==='Loss');
  const totalPnl=allTrades.reduce((s,t)=>s+parseFloat(t.profit_loss||0),0);
  const wr=allTrades.length?(wins.length/allTrades.length*100).toFixed(1):0;
  const grossWin=wins.reduce((s,t)=>s+parseFloat(t.profit_loss||0),0);
  const grossLoss=Math.abs(losses.reduce((s,t)=>s+parseFloat(t.profit_loss||0),0));
  const pf=grossLoss>0?(grossWin/grossLoss).toFixed(2):'∞';
  const sg=document.getElementById('allStatsGrid');
  if(sg)sg.innerHTML=`
    <div class="stat-card"><div class="stat-label">Total Net P&L</div><div class="stat-value ${totalPnl>=0?'stat-green':'stat-red'}">${totalPnl>=0?'+':''}$${totalPnl.toFixed(2)}</div><div class="stat-sub">All firms combined</div></div>
    <div class="stat-card"><div class="stat-label">Win Rate</div><div class="stat-value stat-green">${wr}%</div><div class="stat-sub">${allTrades.length} total trades</div></div>
    <div class="stat-card"><div class="stat-label">Profit Factor</div><div class="stat-value stat-yellow">${pf}</div><div class="stat-sub">All firms</div></div>
    <div class="stat-card"><div class="stat-label">Total Wins</div><div class="stat-value stat-green">${wins.length}</div><div class="stat-sub">${losses.length} losses</div></div>`;
}

// ── FIRM-SPECIFIC UPLOAD HANDLERS ──
const firmParsedTrades={};
