// ============================================================
// FSH Empire — Page: Overview
// ============================================================

import { allTrades, FIRMS } from '../js/app.js';
import { drawFirmCharts } from './charts.js';

export function renderFirmOverview(firm,firmName){
  const container=document.getElementById(firm+'-overview');
  const trades=allTrades.filter(t=>t.account_provider===firmName);
  const wins=trades.filter(t=>t.result==='Win');
  const losses=trades.filter(t=>t.result==='Loss');
  const totalPnl=trades.reduce((s,t)=>s+parseFloat(t.profit_loss||0),0);
  const winRate=trades.length?(wins.length/trades.length*100).toFixed(1):0;
  const grossWin=wins.reduce((s,t)=>s+parseFloat(t.profit_loss||0),0);
  const grossLoss=Math.abs(losses.reduce((s,t)=>s+parseFloat(t.profit_loss||0),0));
  const pf=grossLoss>0?(grossWin/grossLoss).toFixed(2):'∞';
  const avgWin=wins.length?(grossWin/wins.length).toFixed(2):'0.00';
  const avgLoss=losses.length?(grossLoss/losses.length).toFixed(2):'0.00';
  const bestTrade=trades.length?Math.max(...trades.map(t=>parseFloat(t.profit_loss||0))):0;
  const worstTrade=trades.length?Math.min(...trades.map(t=>parseFloat(t.profit_loss||0))):0;
  // Avg RRR
  const avgRRR=(avgLoss>0?(avgWin/avgLoss).toFixed(2):'—');
  // Expectancy per trade
  const expectancy=trades.length?((grossWin-grossLoss)/trades.length).toFixed(2):0;
  // Risk limits
  const limits={Deriv:{daily:500,overall:1000,target:1000,base:10000},FTMO:{daily:500,overall:1000,target:1000,base:10000},'The5ers':{daily:400,overall:800,target:800,base:8000},Other:{daily:500,overall:1000,target:1000,base:10000}};
  const L=limits[firmName]||limits['Other'];
  const totalLoss=Math.abs(Math.min(0,totalPnl));
  const overallPct=Math.min(100,totalLoss/L.overall*100);
  const profitPct=Math.min(100,Math.max(0,totalPnl)/L.target*100);

  if(!trades.length){
    container.innerHTML=`<div class="panel"><div class="panel-body"><div class="loading-state" style="padding:60px;">No trades for ${firmName} yet.<br><br><button class="btn btn-primary" onclick="switchSubTab(document.querySelectorAll('#subNav .sub-tab')[1],'upload')" style="margin-top:14px;width:auto;padding:10px 24px;">⬆ Upload Trades</button></div></div></div>`;
    return;
  }

  // Daily P&L map
  const byDay={};
  trades.forEach(t=>{
    if(!t.date)return;
    if(!byDay[t.date])byDay[t.date]={pnl:0,w:0,l:0};
    byDay[t.date].pnl+=parseFloat(t.profit_loss||0);
    if(t.result==='Win')byDay[t.date].w++;else if(t.result==='Loss')byDay[t.date].l++;
  });
  const dayEntries=Object.entries(byDay).sort((a,b)=>a[0].localeCompare(b[0]));

  // Monthly P&L map
  const byMonth={};
  trades.forEach(t=>{
    const m=t.date?t.date.slice(0,7):'?';
    if(!byMonth[m])byMonth[m]={pnl:0,w:0,l:0};
    byMonth[m].pnl+=parseFloat(t.profit_loss||0);
    if(t.result==='Win')byMonth[m].w++;else if(t.result==='Loss')byMonth[m].l++;
  });
  const monthEntries=Object.entries(byMonth).sort((a,b)=>a[0].localeCompare(b[0]));

  // Instrument breakdown
  const byInst={};
  trades.forEach(t=>{
    if(!byInst[t.instrument])byInst[t.instrument]={pnl:0,count:0};
    byInst[t.instrument].pnl+=parseFloat(t.profit_loss||0);
    byInst[t.instrument].count++;
  });

  container.innerHTML=`
  <!-- STAT CARDS ROW -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:18px;">
    <div class="stat-card"><div class="stat-label">NET P/L</div><div class="stat-value ${totalPnl>=0?'stat-green':'stat-red'}" style="font-size:1.6rem;">${totalPnl>=0?'+':''}$${(totalPnl/1000).toFixed(1)}K</div><div class="stat-sub">All accounts combined</div></div>
    <div class="stat-card"><div class="stat-label">TOTAL TRADES</div><div class="stat-value stat-accent" style="font-size:1.6rem;">${trades.length}</div><div class="stat-sub">${wins.length}W · ${losses.length}L</div></div>
    <div class="stat-card"><div class="stat-label">WIN RATE</div><div class="stat-value stat-green" style="font-size:1.6rem;">${winRate}%</div><div class="stat-sub">${wins.length} wins of ${trades.length}</div></div>
    <div class="stat-card"><div class="stat-label">PROFIT FACTOR</div><div class="stat-value stat-yellow" style="font-size:1.6rem;">${pf}</div><div class="stat-sub">Target ≥ 1.5</div></div>
    <div class="stat-card"><div class="stat-label">AVG RRR</div><div class="stat-value stat-accent" style="font-size:1.6rem;">${avgRRR}</div><div class="stat-sub">Risk:Reward</div></div>
    <div class="stat-card"><div class="stat-label">EXPECTANCY</div><div class="stat-value ${expectancy>=0?'stat-green':'stat-red'}" style="font-size:1.6rem;">${expectancy>=0?'+':''}$${expectancy}</div><div class="stat-sub">Per trade</div></div>
    <div class="stat-card"><div class="stat-label">BEST TRADE</div><div class="stat-value stat-green" style="font-size:1.6rem;">+$${bestTrade.toFixed(0)}</div><div class="stat-sub">Largest win</div></div>
    <div class="stat-card"><div class="stat-label">WORST TRADE</div><div class="stat-value stat-red" style="font-size:1.6rem;">$${worstTrade.toFixed(0)}</div><div class="stat-sub">Largest loss</div></div>
  </div>

  <!-- EQUITY CURVE + DAILY P&L -->
  <div class="two-col" style="margin-bottom:18px;">
    <div class="panel">
      <div class="panel-header"><span class="panel-title">EQUITY CURVE</span><span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--green);">+$${totalPnl.toFixed(2)}</span></div>
      <div class="panel-body" style="padding:10px 0 0 0;">
        <div class="chart-canvas-wrap" style="height:200px;"><canvas id="equity-${firm}"></canvas></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><span class="panel-title">DAILY P&L</span></div>
      <div class="panel-body" style="padding:10px 0 0 0;">
        <div class="chart-canvas-wrap" style="height:200px;"><canvas id="daily-${firm}"></canvas></div>
      </div>
    </div>
  </div>

  <!-- INSTRUMENT DONUT + MONTHLY P&L -->
  <div class="two-col" style="margin-bottom:18px;">
    <div class="panel">
      <div class="panel-header"><span class="panel-title">BY INSTRUMENT</span></div>
      <div class="panel-body" style="display:flex;align-items:center;gap:18px;padding:14px;">
        <div style="position:relative;width:150px;height:150px;flex-shrink:0;"><canvas id="donut-${firm}"></canvas></div>
        <div id="donut-legend-${firm}" style="flex:1;display:flex;flex-direction:column;gap:6px;"></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><span class="panel-title">MONTHLY P&L</span></div>
      <div class="panel-body" style="padding:10px 0 0 0;">
        <div class="chart-canvas-wrap" style="height:200px;"><canvas id="monthly-${firm}"></canvas></div>
      </div>
    </div>
  </div>

  <!-- RISK LIMITS -->
  <div class="panel" style="margin-bottom:18px;">
    <div class="panel-header"><span class="panel-title">RISK LIMITS — ${firmName.toUpperCase()}</span><span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);">Base $${L.base.toLocaleString()}</span></div>
    <div class="panel-body">
      <div class="ftmo-section">
        <div>
          <div class="progress-item"><div class="progress-header"><span class="progress-label">MAX OVERALL LOSS (${(L.overall/L.base*100).toFixed(0)}%)</span><span class="progress-val" style="color:${overallPct>70?'var(--red)':overallPct>40?'var(--yellow)':'var(--green)'}">$${totalLoss.toFixed(0)} / $${L.overall}</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${overallPct}%;background:${overallPct>70?'var(--red)':overallPct>40?'var(--yellow)':'var(--green)'}"></div></div></div>
          <div class="progress-item"><div class="progress-header"><span class="progress-label">DAILY LOSS LIMIT (${(L.daily/L.base*100).toFixed(0)}%)</span><span class="progress-val stat-green">$0 / $${L.daily}</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:0%;background:var(--green)"></div></div></div>
        </div>
        <div>
          <div class="progress-item"><div class="progress-header"><span class="progress-label">PROFIT TARGET (${(L.target/L.base*100).toFixed(0)}%)</span><span class="progress-val stat-yellow">$${Math.max(0,totalPnl).toFixed(0)} / $${L.target}</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${profitPct}%;background:var(--yellow)"></div></div></div>
          <div class="progress-item"><div class="progress-header"><span class="progress-label">CONSISTENCY SCORE</span><span class="progress-val stat-accent">${winRate}%</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${Math.min(100,parseFloat(winRate))}%;background:${parseFloat(winRate)>=50?'var(--green)':'var(--red)'}"></div></div></div>
        </div>
      </div>
    </div>
  </div>`;

  // Draw charts after DOM settles
  setTimeout(()=>{ drawFirmCharts(firm, trades, dayEntries, monthEntries, byInst); }, 60);
}
