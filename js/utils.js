// ============================================================
// FSH Empire — Utils: MT5 HTML parser, tradeKey, canvas helpers, base64
// ============================================================

function parseMT5Html(html){
    const trades = [];
    // Extract all table rows using regex
    const rowMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi)||[];
    rowMatches.forEach(row=>{
      const cellMatches = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)||[];
      const cells = cellMatches.map(c=>c.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim());
      if(cells.length < 10) return;
      // Must start with date pattern YYYY.MM.DD
      if(!/^\d{4}\.\d{2}\.\d{2}/.test(cells[0])) return;
      const dir = (cells[3]||'').toLowerCase();
      if(dir!=='buy'&&dir!=='sell') return;
      try{
        const date = cells[0].slice(0,10).replace(/\./g,'-');
        const symbol = cells[2]||'Unknown';
        const entry = parseFloat((cells[6]||'0').replace(/\s/g,''))||0;
        const exitP = parseFloat((cells[10]||'0').replace(/\s/g,''))||0;
        const pnl = parseFloat((cells[13]||'0').replace(/[\s,]/g,''))||0;
        trades.push({date,instrument:symbol,direction:dir.charAt(0).toUpperCase()+dir.slice(1),
          entry_price:entry,exit_price:exitP,profit_loss:pnl,
          result:pnl>0?'Win':pnl<0?'Loss':'Break Even'});
      }catch(e){}
    });
    return trades;
  }

async function handleCSVFiles(files){
  if(!files||!files.length)return;
  csvParsedTrades=[];
  document.getElementById('csvPreviewLabel').textContent='Processing '+files.length+' file(s)...';
  document.getElementById('csvPreview').style.display='block';
  document.getElementById('csvPreviewTable').innerHTML='<div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);padding:10px;">Reading files...</div>';
  for(const file of Array.from(files)){
    await handleCSVFile(file);
  }
  if(csvParsedTrades.length){
    document.getElementById('csvPreviewLabel').textContent='Found '+csvParsedTrades.length+' total trades across '+files.length+' file(s) — review then save:';
    showTradePreview('csvPreview','csvPreviewLabel','csvPreviewTable',csvParsedTrades);
  } else {
    document.getElementById('csvPreviewLabel').textContent='No trades found in uploaded files.';
  }
}

function tradeKey(t){
  return [t.date,t.instrument,t.direction,String(parseFloat(t.entry_price||0).toFixed(5)),String(parseFloat(t.profit_loss||0).toFixed(2))].join('|');
}


async function saveCSVTrades(){
  // Use already-detected firm from upload, fall back to dropdown, then instrument scan
  const provider = (_csvFirm && _csvFirm!=='Other') ? _csvFirm : detectOrGetProvider('uploadProvider', csvParsedTrades);
  await saveUploadedTrades(csvParsedTrades, 'csvPreview', provider);
}

function drawCurveOnCanvas(canvas,pts){
  const W=canvas.offsetWidth||600,H=canvas.offsetHeight||190;
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  if(pts.length<2)return;
  const min=Math.min(...pts),max=Math.max(...pts);
  const range=max-min||1;
  const pad=20;
  const toX=i=>(i/(pts.length-1))*(W-pad*2)+pad;
  const toY=v=>H-pad-(v-min)/range*(H-pad*2);
  ctx.strokeStyle='#00d4ff';ctx.lineWidth=2;ctx.lineJoin='round';
  ctx.shadowColor='rgba(0,212,255,0.4)';ctx.shadowBlur=8;
  ctx.beginPath();pts.forEach((v,i)=>i===0?ctx.moveTo(toX(i),toY(v)):ctx.lineTo(toX(i),toY(v)));ctx.stroke();
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'rgba(0,212,255,0.15)');grad.addColorStop(1,'rgba(0,212,255,0)');
  ctx.fillStyle=grad;
  ctx.beginPath();ctx.moveTo(toX(0),toY(pts[0]));pts.forEach((v,i)=>ctx.lineTo(toX(i),toY(v)));ctx.lineTo(toX(pts.length-1),H);ctx.lineTo(toX(0),H);ctx.closePath();ctx.fill();
}

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
      <td class="${pc}" style="font-weight:600;">${pnl>=0?'+':''}}$${pnl.toFixed(2)}</td>
      <td><span class="badge ${badge}">${t.result}</span></td>
      <td style="display:flex;gap:4px;">
        <button class="btn btn-outline btn-sm" onclick="quickJournal('${t.instrument}','${t.date}')" style="padding:3px 7px;font-size:0.65rem;">+NOTE</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTrade('${t.id}')" style="padding:3px 7px;font-size:0.65rem;">DEL</button>
      </td>
    </tr>`;
  }).join('');
}

async function fileToBase64Safe(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>{
        // Fallback: just return raw base64
        resolve({base64:reader.result.split(',')[1],mimeType:'image/jpeg'});
      };
      img.onload=()=>{
        // Resize to max 1600px wide for best AI reading while keeping file small
        const MAX=1600;
        let w=img.width,h=img.height;
        if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}
        const canvas=document.createElement('canvas');
        canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,w,h);
        const dataUrl=canvas.toDataURL('image/jpeg',0.92);
        resolve({base64:dataUrl.split(',')[1],mimeType:'image/jpeg'});
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function fileToBase64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.onerror=rej;r.readAsDataURL(file);});}

// ── PASTE PARSE ──
let pasteParsedTrades=[];

function fileToBase64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.onerror=rej;r.readAsDataURL(file);});}

// ── PASTE PARSE ──
let pasteParsedTrades=[];
async function parsePastedTrades(){
  const text=document.getElementById('pasteTradeData').value.trim();
  if(!text){showToast('Please paste some trade data first',true);return;}
  showToast('🤖 Parsing trades...');
  try{
    const resp=await fetch('https://empty-tree-0b19.nwaogalanyapaulinus.workers.dev',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({text:text})
    });
    const data=await resp.json();
    const raw=data.response||data.content?.[0]?.text||'[]';
    const clean=raw.replace(/```json|```/g,'').trim();
    pasteParsedTrades=JSON.parse(clean).map(t=>({...t,user_id:currentUser?.id}));
    _pasteFirm = autoDetectFirm(text) || 'Other';
    showDetectedFirm('pasteDetectedFirm', _pasteFirm==='Other'?null:_pasteFirm);
    showTradePreview('pastePreview','pastePreviewLabel','pastePreviewTable',pasteParsedTrades);
    showToast('✅ Found '+pasteParsedTrades.length+' trades!');
  }catch(e){showToast('Could not parse trades. Try a different format.',true);}
}
