// ── FSH Empire · RENDER ──

function renderFirmOverview(firm,firmName){
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

function drawFirmCharts(firm, trades, dayEntries, monthEntries, byInst){
  // ── EQUITY CURVE ──
  (function(){
    const canvas=document.getElementById('equity-'+firm);
    if(!canvas)return;
    const sorted=trades.slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
    const base=10000; // starting balance display
    let r=base;
    const pts=[base,...sorted.map(t=>{r+=parseFloat(t.profit_loss||0);return r;})];
    const W=canvas.offsetWidth||500, H=canvas.offsetHeight||200;
    canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const pad={top:16,right:70,bottom:28,left:70};
    const minV=Math.min(...pts), maxV=Math.max(...pts);
    const range=maxV-minV||1;
    const toX=i=>pad.left+(i/(pts.length-1||1))*(W-pad.left-pad.right);
    const toY=v=>pad.top+(maxV-v)/range*(H-pad.top-pad.bottom);
    // Grid lines + Y labels
    ctx.strokeStyle='rgba(30,37,48,0.8)'; ctx.lineWidth=1; ctx.fillStyle='#5a6478';
    ctx.font='10px IBM Plex Mono,monospace'; ctx.textAlign='right';
    const steps=5;
    for(let i=0;i<=steps;i++){
      const v=minV+(range/steps)*i;
      const y=toY(v);
      ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(W-pad.right,y); ctx.stroke();
      ctx.fillText('$'+Math.round(v).toLocaleString(),pad.left-6,y+4);
    }
    // X date labels
    ctx.textAlign='center';
    const labelCount=Math.min(6,pts.length-1);
    for(let i=0;i<labelCount;i++){
      const idx=Math.round(i/(labelCount-1||1)*(pts.length-2));
      const d=sorted[idx]?.date||'';
      const x=toX(idx+1);
      ctx.fillText(d.slice(5),x,H-6);
    }
    // Area fill
    const grad=ctx.createLinearGradient(0,pad.top,0,H-pad.bottom);
    grad.addColorStop(0,'rgba(0,212,255,0.18)'); grad.addColorStop(1,'rgba(0,212,255,0)');
    ctx.fillStyle=grad;
    ctx.beginPath(); ctx.moveTo(toX(0),toY(pts[0]));
    pts.forEach((v,i)=>ctx.lineTo(toX(i),toY(v)));
    ctx.lineTo(toX(pts.length-1),H-pad.bottom); ctx.lineTo(toX(0),H-pad.bottom); ctx.closePath(); ctx.fill();
    // Line
    ctx.strokeStyle='#00d4ff'; ctx.lineWidth=2; ctx.lineJoin='round';
    ctx.shadowColor='rgba(0,212,255,0.5)'; ctx.shadowBlur=6;
    ctx.beginPath(); pts.forEach((v,i)=>i===0?ctx.moveTo(toX(i),toY(v)):ctx.lineTo(toX(i),toY(v))); ctx.stroke();
    ctx.shadowBlur=0;
  })();

  // ── DAILY P&L BARS ──
  (function(){
    const canvas=document.getElementById('daily-'+firm);
    if(!canvas||!dayEntries.length)return;
    const W=canvas.offsetWidth||500, H=canvas.offsetHeight||200;
    canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const vals=dayEntries.map(([,d])=>d.pnl);
    const maxAbs=Math.max(Math.abs(Math.min(...vals)),Math.abs(Math.max(...vals)),1);
    const pad={top:16,right:16,bottom:28,left:60};
    const zero=pad.top+(H-pad.top-pad.bottom)/2;
    const barW=Math.max(2,Math.floor((W-pad.left-pad.right)/vals.length)-2);
    // Grid
    ctx.strokeStyle='rgba(30,37,48,0.8)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad.left,zero); ctx.lineTo(W-pad.right,zero); ctx.stroke();
    // Y labels
    ctx.fillStyle='#5a6478'; ctx.font='10px IBM Plex Mono,monospace'; ctx.textAlign='right';
    ['top','mid','bot'].forEach((pos,i)=>{
      const v=i===0?maxAbs:i===1?0:-maxAbs;
      const y=i===0?pad.top:i===1?zero:H-pad.bottom;
      ctx.fillText('$'+Math.round(v).toLocaleString(),pad.left-4,y+4);
    });
    // Bars
    vals.forEach((v,i)=>{
      const x=pad.left+i*((W-pad.left-pad.right)/vals.length);
      const barH=Math.abs(v)/maxAbs*((H-pad.top-pad.bottom)/2);
      ctx.fillStyle=v>=0?'rgba(0,230,118,0.75)':'rgba(255,23,68,0.75)';
      if(v>=0) ctx.fillRect(x,zero-barH,barW,barH);
      else ctx.fillRect(x,zero,barW,barH);
    });
    // X axis labels (first of each month)
    ctx.textAlign='center'; ctx.fillStyle='#5a6478'; ctx.font='10px IBM Plex Mono,monospace';
    let lastMonth='';
    dayEntries.forEach(([d],i)=>{
      const m=d.slice(0,7);
      if(m!==lastMonth){
        lastMonth=m;
        const x=pad.left+i*((W-pad.left-pad.right)/vals.length)+barW/2;
        ctx.fillText(d.slice(5,10),x,H-6);
      }
    });
  })();

  // ── MONTHLY P&L BARS ──
  (function(){
    const canvas=document.getElementById('monthly-'+firm);
    if(!canvas||!monthEntries.length)return;
    const W=canvas.offsetWidth||500, H=canvas.offsetHeight||200;
    canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const vals=monthEntries.map(([,d])=>d.pnl);
    const maxAbs=Math.max(Math.abs(Math.min(...vals)),Math.abs(Math.max(...vals)),1);
    const pad={top:16,right:16,bottom:28,left:66};
    const zero=pad.top+(H-pad.top-pad.bottom)*(maxAbs/(maxAbs*2));
    const barW=Math.max(20,Math.floor((W-pad.left-pad.right)/vals.length)*0.65);
    const gap=(W-pad.left-pad.right)/vals.length;
    // Grid
    ctx.strokeStyle='rgba(30,37,48,0.8)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad.left,zero); ctx.lineTo(W-pad.right,zero); ctx.stroke();
    // Y labels
    ctx.fillStyle='#5a6478'; ctx.font='10px IBM Plex Mono,monospace'; ctx.textAlign='right';
    [maxAbs,0,-maxAbs].forEach((v,i)=>{
      const y=i===0?pad.top:i===1?zero:H-pad.bottom;
      ctx.fillText('$'+Math.round(v).toLocaleString(),pad.left-4,y+4);
    });
    // Bars
    vals.forEach((v,i)=>{
      const x=pad.left+i*gap+(gap-barW)/2;
      const barH=Math.abs(v)/maxAbs*((H-pad.top-pad.bottom)/2);
      ctx.fillStyle=v>=0?'rgba(0,230,118,0.75)':'rgba(255,23,68,0.75)';
      if(v>=0) ctx.fillRect(x,zero-barH,barW,barH);
      else ctx.fillRect(x,zero,barW,barH);
      // Label
      ctx.fillStyle='#5a6478'; ctx.textAlign='center'; ctx.font='10px IBM Plex Mono,monospace';
      ctx.fillText(monthEntries[i][0].slice(0,7),x+barW/2,H-6);
    });
  })();

  // ── DONUT CHART ──
  (function(){
    const canvas=document.getElementById('donut-'+firm);
    const legend=document.getElementById('donut-legend-'+firm);
    if(!canvas)return;
    const entries=Object.entries(byInst).sort((a,b)=>b[1].count-a[1].count).slice(0,6);
    const total=entries.reduce((s,[,d])=>s+d.count,0)||1;
    const colors=['#00d4ff','#00e676','#ffd600','#ff6b35','#ff1744','#7c4dff'];
    const W=150,H=150;
    canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    let angle=-Math.PI/2;
    entries.forEach(([inst,d],i)=>{
      const slice=(d.count/total)*Math.PI*2;
      ctx.beginPath();
      ctx.moveTo(W/2,H/2);
      ctx.arc(W/2,H/2,68,angle,angle+slice);
      ctx.closePath();
      ctx.fillStyle=colors[i%colors.length];
      ctx.fill();
      angle+=slice;
    });
    // Inner hole
    ctx.beginPath(); ctx.arc(W/2,H/2,42,0,Math.PI*2); ctx.fillStyle='#111418'; ctx.fill();
    // Legend
    if(legend){
      legend.innerHTML=entries.map(([inst,d],i)=>`
        <div style="display:flex;align-items:center;gap:7px;">
          <div style="width:10px;height:10px;border-radius:2px;background:${colors[i%colors.length]};flex-shrink:0;"></div>
          <span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text);flex:1;">${inst}</span>
          <span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);">${(d.count/total*100).toFixed(0)}%</span>
        </div>`).join('');
    }
  })();
}

function renderFirmUpload(firm,firmName){
  const container=document.getElementById(firm+'-upload');
  container.innerHTML=`
    <div class="two-col" style="margin-bottom:18px;">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">UPLOAD CSV / EXCEL / HTML</span></div>
        <div class="panel-body">
          <p style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);margin-bottom:14px;line-height:1.6;">Upload .csv, .xlsx or .html/.htm exported from MT5 or ${firmName}. All trades saved under <strong style="color:var(--accent);">${firmName}</strong>.</p>
          <div id="${firm}-csvDropZone" style="border:2px dashed var(--border);border-radius:6px;padding:32px;text-align:center;cursor:pointer;transition:all .2s;"
            onclick="document.getElementById('${firm}-csvInput').click()"
            ondragover="event.preventDefault();this.style.borderColor='var(--accent)'"
            ondragleave="this.style.borderColor='var(--border)'"
            ondrop="handleFirmCSVDrop(event,'${firm}','${firmName}')">
            <div style="font-size:2rem;margin-bottom:8px;">📁</div>
            <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text);letter-spacing:1px;margin-bottom:4px;">DROP FILES HERE OR CLICK TO BROWSE</div>
            <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--muted);">.csv .xlsx .html .htm — multiple files OK</div>
          </div>
          <input type="file" id="${firm}-csvInput" accept=".csv,.xlsx,.xls,.html,.htm" multiple style="display:none;" onchange="handleFirmCSVFiles(this.files,'${firm}','${firmName}')"/>
          <div id="${firm}-csvPreview" style="margin-top:14px;display:none;">
            <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--accent);margin-bottom:8px;" id="${firm}-csvPreviewLabel"></div>
            <div style="overflow-x:auto;max-height:200px;overflow-y:auto;" id="${firm}-csvPreviewTable"></div>
            <button class="btn btn-success btn-sm" onclick="saveFirmTrades('${firm}','${firmName}','csv')" style="margin-top:10px;width:100%;">SAVE TO ${firmName.toUpperCase()}</button>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><span class="panel-title">UPLOAD SCREENSHOTS</span><span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent);">AI-POWERED</span></div>
        <div class="panel-body">
          <p style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);margin-bottom:14px;line-height:1.6;">Upload screenshots of your ${firmName} trade history. AI reads and extracts all trades.</p>
          <div id="${firm}-imgDropZone" style="border:2px dashed var(--border);border-radius:6px;padding:32px;text-align:center;cursor:pointer;transition:all .2s;"
            onclick="document.getElementById('${firm}-imgInput').click()"
            ondragover="event.preventDefault();this.style.borderColor='var(--accent)'"
            ondragleave="this.style.borderColor='var(--border)'"
            ondrop="handleFirmImgDrop(event,'${firm}','${firmName}')">
            <div style="font-size:2rem;margin-bottom:8px;">🖼️</div>
            <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text);letter-spacing:1px;margin-bottom:4px;">DROP SCREENSHOTS HERE OR CLICK TO BROWSE</div>
            <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--muted);">.png .jpg .jpeg .heic — multiple files OK</div>
          </div>
          <input type="file" id="${firm}-imgInput" accept="image/*,.heic,.heif" multiple style="display:none;" onchange="handleFirmImgFiles(this.files,'${firm}','${firmName}')"/>
          <div id="${firm}-imgProgressArea" style="display:none;margin-top:14px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent);" id="${firm}-imgProgressLabel">Processing...</span>
              <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--muted);" id="${firm}-imgProgressCount">0/0</span>
            </div>
            <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;">
              <div id="${firm}-imgProgressBar" style="height:100%;background:var(--accent);border-radius:2px;width:0%;transition:width 0.3s;"></div>
            </div>
            <div id="${firm}-imgFileStatuses" style="margin-top:10px;display:flex;flex-direction:column;gap:5px;max-height:140px;overflow-y:auto;"></div>
          </div>
          <div id="${firm}-imgPreview" style="margin-top:10px;display:none;">
            <div style="overflow-x:auto;max-height:200px;overflow-y:auto;" id="${firm}-imgPreviewTable"></div>
            <button class="btn btn-success btn-sm" onclick="saveFirmTrades('${firm}','${firmName}','img')" style="margin-top:10px;width:100%;">SAVE TO ${firmName.toUpperCase()}</button>
          </div>
        </div>
      </div>
    </div>
    <div class="panel" style="margin-bottom:18px;">
      <div class="panel-header"><span class="panel-title">PASTE TRADE DATA</span></div>
      <div class="panel-body">
        <p style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);margin-bottom:12px;line-height:1.6;">Paste raw trade data from ${firmName}. AI parses any format.</p>
        <textarea id="${firm}-pasteData" class="form-textarea" style="min-height:110px;width:100%;" placeholder="Paste your ${firmName} trade history here..."></textarea>
        <button class="btn btn-primary" onclick="parseFirmPaste('${firm}','${firmName}')" style="margin-top:10px;width:100%;padding:10px;">PARSE &amp; PREVIEW</button>
        <div id="${firm}-pastePreview" style="margin-top:14px;display:none;">
          <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--accent);margin-bottom:8px;" id="${firm}-pastePreviewLabel"></div>
          <div style="overflow-x:auto;max-height:200px;overflow-y:auto;" id="${firm}-pastePreviewTable"></div>
          <button class="btn btn-success btn-sm" onclick="saveFirmTrades('${firm}','${firmName}','paste')" style="margin-top:10px;width:100%;">SAVE TO ${firmName.toUpperCase()}</button>
        </div>
      </div>
    </div>`;
}

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

function renderFirmJournal(firm,firmName){
  const container=document.getElementById(firm+'-journal');
  const firmTrades=allTrades.filter(t=>t.account_provider===firmName);
  const instrumentOptions=`<option value="">Select instrument</option>`+
    [...new Set(firmTrades.map(t=>t.instrument).filter(Boolean))].map(i=>`<option>${i}</option>`).join('')+
    `<option>Other</option>`;
  container.innerHTML=`
    <div class="journal-grid">
      <div class="panel" style="position:sticky;top:20px;">
        <div class="panel-header"><span class="panel-title">NEW ENTRY — ${firmName.toUpperCase()}</span></div>
        <div class="panel-body">
          <div class="journal-form">
            <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="${firm}-jDate"/></div>
            <div class="form-group"><label class="form-label">Instrument</label><select class="form-select" id="${firm}-jInstrument">${instrumentOptions}</select></div>
            <div class="form-group"><label class="form-label">Trade Result</label><select class="form-select" id="${firm}-jResult"><option value="">Select result</option><option>Win</option><option>Loss</option><option>Break Even</option></select></div>
            <div class="form-group"><label class="form-label">Emotion Before Trade</label>
              <div class="emotion-grid">
                <button class="emotion-btn" onclick="selectFirmEmotion(this,'${firm}','Calm')">😌 Calm</button>
                <button class="emotion-btn" onclick="selectFirmEmotion(this,'${firm}','Confident')">💪 Confident</button>
                <button class="emotion-btn" onclick="selectFirmEmotion(this,'${firm}','FOMO')">😰 FOMO</button>
                <button class="emotion-btn" onclick="selectFirmEmotion(this,'${firm}','Revenge')">😤 Revenge</button>
                <button class="emotion-btn" onclick="selectFirmEmotion(this,'${firm}','Anxious')">😟 Anxious</button>
                <button class="emotion-btn" onclick="selectFirmEmotion(this,'${firm}','Bored')">😑 Bored</button>
              </div>
            </div>
            <div class="form-group"><label class="form-label">Why I Entered</label><textarea class="form-textarea" id="${firm}-jReasoning" placeholder="Setup, confluence..."></textarea></div>
            <div class="form-group"><label class="form-label">What Went Well</label><textarea class="form-textarea" id="${firm}-jWell" placeholder="Discipline, execution..."></textarea></div>
            <div class="form-group"><label class="form-label">What To Improve</label><textarea class="form-textarea" id="${firm}-jImprove" placeholder="Mistakes, what I'd do differently..."></textarea></div>
            <button class="btn btn-success" onclick="saveFirmJournal('${firm}','${firmName}')" style="width:100%;padding:11px;letter-spacing:2px;">SAVE ENTRY</button>
          </div>
        </div>
      </div>
      <div id="${firm}-journalEntries" class="journal-entries"><div class="no-entries">No entries for ${firmName} yet.</div></div>
    </div>`;
  document.getElementById(firm+'-jDate').value=new Date().toISOString().split('T')[0];
  loadFirmJournalEntries(firm,firmName);
}

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
