// ── FSH Empire · CHARTS ──

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
