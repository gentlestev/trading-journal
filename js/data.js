// FSH Empire — Data: Supabase CRUD, renderTradesTable
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

async function loadTradesFromSupabase(){
  if(!currentUser)return;
  const{data,error}=await sb.from('trades').select('*').eq('user_id',currentUser.id).order('date',{ascending:true});
  if(error){console.warn(error);return;}
  allTrades=data||[];renderAllTradesTable();
  // Refresh active firm sub-page if on a firm
  if(typeof activeFirm!=='undefined'&&typeof activeSubTab!=='undefined'&&activeFirm&&FIRMS[activeFirm]){
    renderSubPage(activeFirm,activeSubTab);
  }
}

function renderTradesTable(){
  const tbody=document.getElementById('tradesBody');
  document.getElementById('tradeCount').textContent=allTrades.length+' trades';
  if(!allTrades.length){tbody.innerHTML='<tr><td colspan="8"><div class="loading-state">No trades yet — connect Deriv to sync</div></td></tr>';return;}
  tbody.innerHTML=allTrades.slice().reverse().map(t=>{
    const pnl=parseFloat(t.profit_loss);
    const badge=t.result==='Win'?'badge-win':t.result==='Loss'?'badge-loss':'badge-be';
    const pc=pnl>0?'stat-green':pnl<0?'stat-red':'stat-yellow';
    return`<tr><td>${t.date}</td><td style="color:var(--accent);font-weight:600;">${t.instrument}</td><td>${t.direction||'—'}</td><td>${t.entry_price?'$'+parseFloat(t.entry_price).toFixed(2):'—'}</td><td>${t.exit_price?'$'+parseFloat(t.exit_price).toFixed(2):'—'}</td><td class="${pc}" style="font-weight:600;">${pnl>=0?'+':''}$${pnl.toFixed(2)}</td><td><span class="badge ${badge}">${t.result}</span></td><td><button class="btn btn-outline btn-sm" onclick="quickJournal('${t.instrument}','${t.date}')">+ NOTE</button></td></tr>`;
  }).join('');
}

function renderDashboard(){}

function drawEquityCurve(){}
