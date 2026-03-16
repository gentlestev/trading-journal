// ============================================================
// FSH Empire — Page: Analysis
// ============================================================

import { allTrades } from '../js/app.js';
import { loadFirmEmotionAnalysis } from '../js/journal.js';

export function renderFirmAnalysis(firm,firmName){
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
