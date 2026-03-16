// ── FSH Empire · UI ──

function startClock(){setInterval(()=>{document.getElementById('liveTime').textContent=new Date().toUTCString().slice(17,25)+' UTC';},1000);}
