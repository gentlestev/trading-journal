// FSH Empire — UI: clock, toast, modals, congrats
function startClock(){setInterval(()=>{document.getElementById('liveTime').textContent=new Date().toUTCString().slice(17,25)+' UTC';},1000);}

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

function showToast(msg,isError=false){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show'+(isError?' error':'');
  setTimeout(()=>t.className='toast',3200);
}

function openDerivModal(){document.getElementById('connectModal').classList.add('open');if(derivToken)document.getElementById('derivTokenInput').value=derivToken;}
function closeDerivModal(){document.getElementById('connectModal').classList.remove('open');}
