// ── FSH Empire · DATA ──

function renderAllTradesTable(){
  const tbody=document.getElementById('allTradesBody');
  if(!tbody)return;
  const filter=document.getElementById('allTradeFilter')?.value||'all';
  const filtered=filter==='all'?allTrades:allTrades.filter(t=>t.account_provider===filter);
  document.getElementById('allTradeCount').textContent=filtered.length+' of '+allTrades.length+' trades';
  if(!filtered.length){
    tbody.innerHTML='<tr><td colspan="9"><div class="loading-state">No trades found</div></td></tr>';
    return;
  }
  tbody.innerHTML=filtered.slice().reverse().map(t=>{
    const pnl=parseFloat(t.profit_loss||0);
    const badge=t.result==='Win'?'badge-win':t.result==='Loss'?'badge-loss':'badge-be';
    const pc=pnl>0?'stat-green':pnl<0?'stat-red':'stat-yellow';
    const firm=t.account_provider||'—';
    const firmColor=firm==='Deriv'?'var(--accent)':firm==='FTMO'?'var(--green)':firm==='The5ers'?'var(--yellow)':'var(--muted)';
    return`<tr>
      <td>${t.date}</td>
      <td><span style="color:${firmColor};font-weight:600;font-size:0.72rem;">${firm}</span></td>
      <td style="color:var(--accent);font-weight:600;">${t.instrument}</td>
      <td>${t.direction||'—'}</td>
      <td>${t.entry_price?'$'+parseFloat(t.entry_price).toFixed(2):'—'}</td>
      <td>${t.exit_price?'$'+parseFloat(t.exit_price).toFixed(2):'—'}</td>
      <td class="${pc}" style="font-weight:600;">${pnl>=0?'+':''}$${pnl.toFixed(2)}</td>
      <td><span class="badge ${badge}">${t.result}</span></td>
      <td style="display:flex;gap:4px;">
        <button class="btn btn-outline btn-sm" onclick="quickJournal('${t.instrument}','${t.date}')" style="padding:3px 7px;font-size:0.65rem;">+NOTE</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTrade('${t.id}')" style="padding:3px 7px;font-size:0.65rem;">DEL</button>
      </td>
    </tr>`;
  }).join('');
}

function renderFirmPage(pageId, firmName){
  const container=document.getElementById('page-'+pageId);
  const trades=allTrades.filter(t=>t.account_provider===firmName);
  
  const wins=trades.filter(t=>t.result==='Win');
  const losses=trades.filter(t=>t.result==='Loss');
  const totalPnl=trades.reduce((s,t)=>s+parseFloat(t.profit_loss||0),0);
  const winRate=trades.length?(wins.length/trades.length*100).toFixed(1):0;
  const grossWin=wins.reduce((s,t)=>s+parseFloat(t.profit_loss||0),0);
  const grossLoss=Math.abs(losses.reduce((s,t)=>s+parseFloat(t.profit_loss||0),0));
  const pf=grossLoss>0?(grossWin/grossLoss).toFixed(2):'∞';
  const avgWin=wins.length?grossWin/wins.length:0;
  const avgLoss=losses.length?grossLoss/losses.length:0;

  // Firm-specific limits
  const limits={
    'Deriv':{daily:500,overall:1000,target:1000,base:10000},
    'FTMO':{daily:500,overall:1000,target:1000,base:10000},
    'The5ers':{daily:400,overall:800,target:800,base:8000},
    'Other':{daily:500,overall:1000,target:1000,base:10000}
  };
  const L=limits[firmName]||limits['Other'];
  const totalLoss=Math.abs(Math.min(0,totalPnl));
  const overallPct=Math.min(100,totalLoss/L.overall*100);
  const profitPct=Math.min(100,Math.max(0,totalPnl)/L.target*100);

  const tradeRows=trades.slice().reverse().map(t=>{
    const pnl=parseFloat(t.profit_loss||0);
    const badge=t.result==='Win'?'badge-win':t.result==='Loss'?'badge-loss':'badge-be';
    const pc=pnl>0?'stat-green':pnl<0?'stat-red':'stat-yellow';
    return`<tr><td>${t.date}</td><td style="color:var(--accent);font-weight:600;">${t.instrument}</td><td>${t.direction||'—'}</td><td>${t.entry_price?'$'+parseFloat(t.entry_price).toFixed(2):'—'}</td><td>${t.exit_price?'$'+parseFloat(t.exit_price).toFixed(2):'—'}</td><td class="${pc}" style="font-weight:600;">${pnl>=0?'+':''}$${pnl.toFixed(2)}</td><td><span class="badge ${badge}">${t.result}</span></td></tr>`;
  }).join('');

  container.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div style="font-family:var(--font-display);font-size:1.6rem;letter-spacing:4px;color:var(--accent);">${firmName.toUpperCase()}</div>
      <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);">${trades.length} trades tracked</div>
    </div>

    ${!trades.length ? `<div class="panel"><div class="panel-body"><div class="loading-state">No trades for ${firmName} yet.<br>Upload trades and tag them as ${firmName}.</div></div></div>` : `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Net P&L</div><div class="stat-value ${totalPnl>=0?'stat-green':'stat-red'}">${totalPnl>=0?'+':''}$${totalPnl.toFixed(2)}</div><div class="stat-sub">${wins.length}W / ${losses.length}L</div></div>
      <div class="stat-card"><div class="stat-label">Win Rate</div><div class="stat-value stat-green">${winRate}%</div><div class="stat-sub">${trades.length} total trades</div></div>
      <div class="stat-card"><div class="stat-label">Profit Factor</div><div class="stat-value stat-yellow">${pf}</div><div class="stat-sub">Gross profit / loss</div></div>
      <div class="stat-card"><div class="stat-label">Avg Win</div><div class="stat-value stat-green">$${avgWin.toFixed(2)}</div><div class="stat-sub">${wins.length} wins</div></div>
      <div class="stat-card"><div class="stat-label">Avg Loss</div><div class="stat-value stat-red">$${avgLoss.toFixed(2)}</div><div class="stat-sub">${losses.length} losses</div></div>
    </div>

    <div class="panel">
      <div class="panel-header"><span class="panel-title">RISK LIMITS — ${firmName.toUpperCase()}</span><span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);">Base $${L.base.toLocaleString()}</span></div>
      <div class="panel-body">
        <div class="ftmo-section">
          <div>
            <div class="progress-item"><div class="progress-header"><span class="progress-label">MAX OVERALL LOSS</span><span class="progress-val">$${totalLoss.toFixed(0)} / $${L.overall}</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${overallPct}%;background:${overallPct>70?'var(--red)':overallPct>40?'var(--yellow)':'var(--green)'}"></div></div></div>
            <div class="progress-item"><div class="progress-header"><span class="progress-label">DAILY LOSS LIMIT</span><span class="progress-val stat-green">$0 / $${L.daily}</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:0%;background:var(--green)"></div></div></div>
          </div>
          <div>
            <div class="progress-item"><div class="progress-header"><span class="progress-label">PROFIT TARGET</span><span class="progress-val stat-yellow">$${Math.max(0,totalPnl).toFixed(0)} / $${L.target}</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${profitPct}%;background:var(--yellow)"></div></div></div>
            <div class="progress-item"><div class="progress-header"><span class="progress-label">CONSISTENCY</span><span class="progress-val stat-accent">${winRate}%</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${winRate}%;background:${parseFloat(winRate)>=50?'var(--green)':'var(--red)'}"></div></div></div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><span class="panel-title">TRADE HISTORY — ${firmName.toUpperCase()}</span></div>
      <div style="overflow-x:auto;">
        <table class="trades-table">
          <thead><tr><th>Date</th><th>Instrument</th><th>Direction</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Result</th></tr></thead>
          <tbody>${tradeRows||'<tr><td colspan="7"><div class="loading-state">No trades yet</div></td></tr>'}</tbody>
        </table>
      </div>
    </div>`}
  `;
}


function showCongratsScreen(name){
  document.getElementById('congratsName').textContent = name.toUpperCase();
  document.getElementById('congratsScreen').classList.add('show');
  launchConfetti();
}

function closeCongratsScreen(){
  document.getElementById('congratsScreen').classList.remove('show');
  switchAuthTab('login');
}

function launchConfetti(){
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#00d4ff','#00e676','#ff6b35','#ffd600','#ff1744','#7c4dff'];
  for(let i = 0; i < 80; i++){
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.cssText = [
      'left:'+Math.random()*100+'vw',
      'background:'+colors[Math.floor(Math.random()*colors.length)],
      'width:'+(6+Math.random()*8)+'px',
      'height:'+(6+Math.random()*8)+'px',
      'animation-duration:'+(2+Math.random()*3)+'s',
      'animation-delay:'+(Math.random()*2)+'s'
    ].join(';');
    container.appendChild(el);
  }
}

function showToast(msg,isError=false){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show'+(isError?' error':'');
  setTimeout(()=>t.className='toast',3200);
}

function openDerivModal(){document.getElementById('connectModal').classList.add('open');if(derivToken)document.getElementById('derivTokenInput').value=derivToken;}
function closeDerivModal(){document.getElementById('connectModal').classList.remove('open');}

function connectDeriv(auto=false){
  const token=auto?derivToken:document.getElementById('derivTokenInput').value.trim();
  if(!token){showToast('Please enter your API token',true);return;}
  derivToken=token;
  if(currentUser)localStorage.setItem('dt_'+currentUser.id,token);
  closeDerivModal();setDerivStatus('connecting');
  if(derivWS)derivWS.close();
  derivWS=new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
  derivWS.onopen=()=>derivWS.send(JSON.stringify({authorize:token}));
  derivWS.onmessage=(e)=>{
    const data=JSON.parse(e.data);
    if(data.msg_type==='authorize'){
      if(data.error){setDerivStatus('disconnected');showToast('Deriv: '+data.error.message,true);return;}
      setDerivStatus('connected');
      const bal=parseFloat(data.authorize.balance);
      document.getElementById('statBalance').textContent='$'+bal.toLocaleString('en-US',{minimumFractionDigits:2});
      document.getElementById('statBalanceSub').textContent=data.authorize.currency+' · Real Account';
      showToast('✅ Deriv connected — '+data.authorize.loginid);
      derivWS.send(JSON.stringify({profit_table:1,description:1,limit:100,sort:'DESC'}));
    }
    if(data.msg_type==='profit_table'&&data.profit_table?.transactions)processDerivTrades(data.profit_table.transactions);
  };
  derivWS.onerror=()=>{setDerivStatus('disconnected');showToast('Deriv connection error',true);};
  derivWS.onclose=()=>setDerivStatus('disconnected');
}

function setDerivStatus(s){const el=document.getElementById('derivStatus');el.className='deriv-status '+s;el.textContent='DERIV '+(s==='connected'?'LIVE':s==='connecting'?'...':'OFF');}

async function processDerivTrades(transactions){
  if(!currentUser)return;
  const filtered=transactions.filter(t=>{const d=new Date(t.purchase_time*1000);return d>=new Date('2026-02-01')&&d<=new Date('2026-03-31');});
  const trades=filtered.map(t=>{const pnl=parseFloat(t.sell_price)-parseFloat(t.buy_price);return{date:new Date(t.purchase_time*1000).toISOString().split('T')[0],instrument:t.shortcode?t.shortcode.split('_')[0]:'Unknown',direction:t.shortcode?.includes('CALL')?'Buy':'Sell',lots:1,entry_price:parseFloat(t.buy_price),exit_price:parseFloat(t.sell_price),profit_loss:pnl,result:pnl>0?'Win':pnl<0?'Loss':'Break Even',user_id:currentUser.id};});
  for(const trade of trades)await sb.from('trades').upsert(trade,{onConflict:'date,instrument,entry_price'});
  await loadTradesFromSupabase();showToast('✅ Synced '+trades.length+' trades');
}

async function syncTrades(){
  if(!derivWS||derivWS.readyState!==WebSocket.OPEN){showToast('Connect Deriv first',true);return;}
  showToast('Syncing...');derivWS.send(JSON.stringify({profit_table:1,description:1,limit:100,sort:'DESC'}));
}

async function deleteTrade(id){
  if(!id||!currentUser) return;
  if(!confirm('Delete this trade? This cannot be undone.')) return;
  const{error}=await sb.from('trades').delete().eq('id',id).eq('user_id',currentUser.id);
  if(error){showToast('Error deleting trade: '+error.message,true);return;}
  showToast('Trade deleted.');
  await loadTradesFromSupabase();
}

async function deleteAllTrades(){
  if(!currentUser) return;
  const filter=document.getElementById('tradeFilter')?.value||'all';
  const label=filter==='all'?'ALL trades':'all '+filter+' trades';
  if(!confirm('Delete '+label+'? This CANNOT be undone.')) return;
  let query=sb.from('trades').delete().eq('user_id',currentUser.id);
  if(filter!=='all') query=query.eq('account_provider',filter);
  const{error}=await query;
  if(error){showToast('Error: '+error.message,true);return;}
  showToast('Deleted '+label+'.');
  await loadTradesFromSupabase();
}
