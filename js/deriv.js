// FSH Empire — Deriv: WebSocket, trade sync
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
