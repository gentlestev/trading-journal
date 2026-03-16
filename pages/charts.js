// ============================================================
// FSH Empire — Page: Charts
// ============================================================

export function drawFirmCharts(firm, trades, dayEntries, monthEntries, byInst){
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
