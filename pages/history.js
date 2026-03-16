// FSH Empire — Page: Trade History per firm
function renderFirmHistory(firm,firmName){
  const container=document.getElementById(firm+'-history');
  const trades=allTrades.filter(t=>t.account_provider===firmName);
  if(!trades.length){
    container.innerHTML=`<div class="panel"><div class="panel-body"><div class="loading-state">No trades for ${firmName} yet.</div></div></div>`;
    return;
  }
  const rows=trades.slice().reverse().map(t=>{
    const pnl=parseFloat(t.profit_loss||0);
    const badge=t.result==='Win'?'badge-win':t.result==='Loss'?'badge-loss':'badge-be';
    const pc=pnl>0?'stat-green':pnl<0?'stat-red':'stat-yellow';
    return`<tr><td>${t.date}</td><td style="color:var(--accent);font-weight:600;">${t.instrument}</td><td>${t.direction||'—'}</td><td>${t.entry_price?'$'+parseFloat(t.entry_price).toFixed(2):'—'}</td><td>${t.exit_price?'$'+parseFloat(t.exit_price).toFixed(2):'—'}</td><td class="${pc}" style="font-weight:600;">${pnl>=0?'+':''}$${pnl.toFixed(2)}</td><td><span class="badge ${badge}">${t.result}</span></td><td><button class="btn btn-danger btn-sm" onclick="deleteTrade('${t.id}')" style="padding:3px 7px;font-size:0.65rem;">DEL</button></td></tr>`;
  }).join('');
  container.innerHTML=`
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">TRADE HISTORY — ${firmName.toUpperCase()}</span>
        <div style="display:flex;gap:8px;">
          <span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);">${trades.length} trades</span>
          <button class="btn btn-danger btn-sm" onclick="deleteFirmTrades('${firmName}')">DELETE ALL</button>
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table class="trades-table">
          <thead><tr><th>Date</th><th>Instrument</th><th>Direction</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Result</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}
