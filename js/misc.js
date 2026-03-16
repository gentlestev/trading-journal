// ── FSH Empire · MISC ──

function selectEmotion(btn,emotion){document.querySelectorAll('.emotion-btn').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');selectedEmotion=emotion;}

function quickJournal(instrument,date){
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',i===2));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-journal').classList.add('active');
  document.getElementById('jInstrument').value=instrument;
  document.getElementById('jDate').value=date;
  document.getElementById('jReasoning').focus();
}

// ── JOURNAL IMAGE UPLOAD ──
let journalImgBase64 = null;
let journalImgMime = null;

function handleJournalImgDrop(e){
  e.preventDefault();
  document.getElementById('jImgDropZone').style.borderColor='var(--border)';
  if(e.dataTransfer.files[0]) handleJournalImg(e.dataTransfer.files[0]);
}

async function handleJournalImg(file){
  if(!file) return;
  const {base64, mimeType} = await fileToBase64Safe(file);
  journalImgBase64 = base64;
  journalImgMime = mimeType;
  // Show preview
  document.getElementById('jImgPreviewImg').src = 'data:'+mimeType+';base64,'+base64;
  document.getElementById('jImgPreview').style.display = 'block';
  document.getElementById('jImgDropZone').style.display = 'none';
}

function clearJournalImg(){
  journalImgBase64 = null;
  journalImgMime = null;
  document.getElementById('jImgPreview').style.display = 'none';
  document.getElementById('jImgDropZone').style.display = 'block';
  document.getElementById('jImgInput').value = '';
}

async function uploadJournalImgToSupabase(){
  if(!journalImgBase64 || !currentUser) return null;
  try{
    // Convert base64 to blob
    const byteArr = Uint8Array.from(atob(journalImgBase64), c => c.charCodeAt(0));
    const ext = journalImgMime === 'image/png' ? 'png' : 'jpg';
    const filename = currentUser.id + '/' + Date.now() + '.' + ext;
    const {data, error} = await sb.storage.from('journal-images').upload(filename, byteArr, {
      contentType: journalImgMime, upsert: false
    });
    if(error){ console.warn('Storage error:', error); return null; }
    const {data: urlData} = sb.storage.from('journal-images').getPublicUrl(filename);
    return urlData?.publicUrl || null;
  }catch(e){ console.warn('Image upload error:', e); return null; }
}

async function saveJournalEntry(){
  if(!currentUser)return;
  const entry={entry_date:document.getElementById('jDate').value,instrument:document.getElementById('jInstrument').value,result:document.getElementById('jResult').value,emotions:selectedEmotion,reasoning:document.getElementById('jReasoning').value,what_went_well:document.getElementById('jWell').value,what_to_improve:document.getElementById('jImprove').value,weekly_review:document.getElementById('jWeekly').value,user_id:currentUser.id};
  if(!entry.entry_date||!entry.instrument){showToast('Date and instrument required',true);return;}
  const{error}=await sb.from('journal_entries').insert([entry]);
  if(error){showToast('Error: '+error.message,true);return;}
  showToast('✅ Journal entry saved!');
  ['jReasoning','jWell','jImprove','jWeekly'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('jResult').value='';document.getElementById('jInstrument').value='';
  document.querySelectorAll('.emotion-btn').forEach(b=>b.classList.remove('selected'));selectedEmotion='';
  loadJournalEntries();
}

async function deleteJournalEntry(id){
  if(!id||!currentUser)return;
  if(!confirm('Delete this journal entry? This cannot be undone.'))return;
  const{error}=await sb.from('journal_entries').delete().eq('id',id).eq('user_id',currentUser.id);
  if(error){showToast('Error: '+error.message,true);return;}
  showToast('Journal entry deleted.');
  loadJournalEntries();
}

async function editJournalEntry(id){
  if(!id||!currentUser)return;
  const{data,error}=await sb.from('journal_entries').select('*').eq('id',id).single();
  if(error||!data){showToast('Could not load entry',true);return;}
  // Populate form with existing data
  document.getElementById('jDate').value=data.entry_date||'';
  document.getElementById('jInstrument').value=data.instrument||'';
  document.getElementById('jResult').value=data.result||'';
  document.getElementById('jReasoning').value=data.reasoning||'';
  document.getElementById('jWell').value=data.what_went_well||'';
  document.getElementById('jImprove').value=data.what_to_improve||'';
  document.getElementById('jWeekly').value=data.weekly_review||'';
  // Set emotion
  selectedEmotion=data.emotions||'';
  document.querySelectorAll('.emotion-btn').forEach(b=>{
    b.classList.toggle('selected',b.textContent.includes(selectedEmotion)&&selectedEmotion!=='');
  });
  // Mark as editing
  window._editingJournalId=id;
  const btn=document.querySelector('[onclick="saveJournalEntry()"]');
  if(btn){btn.textContent='UPDATE ENTRY';btn.style.background='var(--accent2)';}
  // Scroll to form
  document.querySelector('.journal-grid').scrollIntoView({behavior:'smooth'});
  showToast('Entry loaded — make changes and click UPDATE ENTRY');
}

async function loadJournalEntries(){
  if(!currentUser)return;
  const{data,error}=await sb.from('journal_entries').select('*').eq('user_id',currentUser.id).order('entry_date',{ascending:false});
  if(error){console.warn(error);return;}
  const container=document.getElementById('journalEntries');
  if(!data||!data.length){container.innerHTML='<div class="no-entries">No journal entries yet.<br>Add your first entry →</div>';return;}
  container.innerHTML=data.map(e=>{
    const badgeClass=e.result==='Win'?'badge-win':e.result==='Loss'?'badge-loss':'badge-be';
    return `<div class="journal-entry-card">
      <div class="entry-meta">
        <div><div class="entry-date">${e.entry_date}</div><div class="entry-instrument">${e.instrument||'—'}</div></div>
        <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
          ${e.emotions?`<span class="entry-emotion">${e.emotions}</span>`:''}
          ${e.result?`<span class="badge ${badgeClass}">${e.result}</span>`:''}
          <div style="display:flex;gap:5px;margin-top:4px;">
            <button class="btn btn-outline btn-sm" onclick="editJournalEntry('${e.id}')" style="padding:3px 8px;font-size:0.65rem;">EDIT</button>
            <button class="btn btn-danger btn-sm" onclick="deleteJournalEntry('${e.id}')" style="padding:3px 8px;font-size:0.65rem;">DEL</button>
          </div>
        </div>
      </div>
      ${e.reasoning?`<div class="entry-section"><div class="entry-section-label">Reasoning</div><div class="entry-text">${e.reasoning}</div></div>`:''}
      ${e.what_went_well?`<div class="entry-section"><div class="entry-section-label">What went well</div><div class="entry-text">${e.what_went_well}</div></div>`:''}
      ${e.what_to_improve?`<div class="entry-section"><div class="entry-section-label">To improve</div><div class="entry-text">${e.what_to_improve}</div></div>`:''}
      ${e.weekly_review?`<div class="entry-section"><div class="entry-section-label">Weekly Review</div><div class="entry-text">${e.weekly_review}</div></div>`:''}
      ${e.image_url?`<div class="entry-section"><div class="entry-section-label">Screenshot</div><img src="${e.image_url}" style="width:100%;border-radius:4px;border:1px solid var(--border);margin-top:4px;max-height:200px;object-fit:cover;cursor:pointer;" onclick="window.open('${e.image_url}','_blank')"/></div>`:''}
    </div>`;
  }).join('');
}

function renderAnalysis(){}

// ── CSV/EXCEL UPLOAD ──
let csvParsedTrades = [];
let imgParsedTrades = [];
let _imgRawText = "";

function handleCSVDrop(e){e.preventDefault();document.getElementById('csvDropZone').style.borderColor='var(--border)';if(e.dataTransfer.files.length)handleCSVFiles(e.dataTransfer.files);}
function handleImgDrop(e){e.preventDefault();document.getElementById('imgDropZone').style.borderColor='var(--border)';handleImgFiles(e.dataTransfer.files);}

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

async function handleCSVFile(file){
  if(!file)return;
  const text=await file.text();
  const name=file.name.toLowerCase();

  // HTML/HTM — handle MT5 UTF-16 export format
  if(name.endsWith('.html')||name.endsWith('.htm')){
    showToast('Reading MT5 HTML file...');
    try{
      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      // Detect UTF-16 BOM (FF FE or FE FF)
      let htmlText = '';
      if((bytes[0]===0xFF&&bytes[1]===0xFE)||(bytes[0]===0xFE&&bytes[1]===0xFF)){
        htmlText = new TextDecoder('utf-16').decode(arrayBuf);
      } else {
        htmlText = new TextDecoder('utf-8').decode(arrayBuf);
      }
      // Remove null chars
      htmlText = htmlText.replace(/ /g,'');

      const trades = parseMT5Html(htmlText);

      if(trades.length){
        _csvFirm = autoDetectFirm(htmlText) || 'Other';
        showDetectedFirm('csvDetectedFirm', _csvFirm==='Other'?null:_csvFirm);
        csvParsedTrades.push(...trades.map(t=>({...t,user_id:currentUser?.id})));
        showTradePreview('csvPreview','csvPreviewLabel','csvPreviewTable',csvParsedTrades);
        showToast('Found '+trades.length+' trades → '+_csvFirm);
      } else {
        showToast('No trades found. Make sure this is a MT5 Trade History Report.',true);
      }
    }catch(e){
      console.warn('HTML parse error:',e);
      showToast('Could not read HTML. Please export from MT5 as HTML and try again.',true);
    }
    return;
  }



  // CSV — parse directly
  const lines=text.split('\n').filter(l=>l.trim());
  const trades=[];
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split(',').map(c=>c.trim().replace(/"/g,''));
    if(cols.length<3)continue;
    const pnl=parseFloat(cols[5]||cols[4]||0);
    trades.push({
      date:cols[0]||new Date().toISOString().split('T')[0],
      instrument:cols[1]||'Unknown',
      direction:cols[2]||'—',
      entry_price:parseFloat(cols[3])||0,
      exit_price:parseFloat(cols[4])||0,
      profit_loss:pnl,
      result:pnl>0?'Win':pnl<0?'Loss':'Break Even',
      user_id:currentUser?.id
    });
  }
  // Auto-detect from instrument names in CSV
  const instText = trades.map(t=>t.instrument||'').join(' ');
  _csvFirm = autoDetectFirm(instText) || 'Other';
  showDetectedFirm('csvDetectedFirm', _csvFirm==='Other'?null:_csvFirm);
  csvParsedTrades.push(...trades);
}

// ── SCREENSHOT AI PARSE ──
async function handleImgFiles(files){
  if(!files||!files.length)return;
  imgParsedTrades=[];
  const fileArr=Array.from(files);
  const total=fileArr.length;
  const progressArea=document.getElementById('imgProgressArea');
  const progressLabel=document.getElementById('imgProgressLabel');
  const progressCount=document.getElementById('imgProgressCount');
  const progressBar=document.getElementById('imgProgressBar');
  const fileStatuses=document.getElementById('imgFileStatuses');
  const imgPreview=document.getElementById('imgPreview');
  progressArea.style.display='block';
  imgPreview.style.display='none';
  progressLabel.style.color='var(--accent)';
  progressLabel.textContent='Processing '+total+' screenshot'+(total>1?'s':'')+'...';
  progressCount.textContent='0/'+total;
  progressBar.style.width='0%';
  fileStatuses.innerHTML='';
  fileArr.forEach((file,i)=>{
    const row=document.createElement('div');
    row.id='fstatus_'+i;
    row.style.cssText='display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:0.68rem;padding:5px 8px;background:var(--surface2);border-radius:3px;';
    const fname=file.name||('Screenshot '+(i+1));
    row.innerHTML='<span id="ficon_'+i+'" style="color:var(--muted);">[ ]</span>'
      +'<span style="color:var(--muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+fname+'</span>'
      +'<span id="ftrades_'+i+'" style="color:var(--muted);">waiting</span>';
    fileStatuses.appendChild(row);
  });
  let completed=0;
  function updateProgress(){
    completed++;
    const pct=Math.round(completed/total*100);
    progressBar.style.width=pct+'%';
    progressCount.textContent=completed+'/'+total;
    if(completed===total) progressLabel.textContent='Done! Processed '+total+' file'+(total>1?'s':'');
  }
  const results=await Promise.allSettled(fileArr.map(async(file,i)=>{
    document.getElementById('ficon_'+i).textContent='[~]';
    document.getElementById('ftrades_'+i).textContent='reading...';
    try{
      const {base64,mimeType}=await fileToBase64Safe(file);
      
      // Show size info for debugging
      const sizeKB = Math.round(base64.length * 0.75 / 1024);
      document.getElementById('ftrades_'+i).textContent='sending '+sizeKB+'KB...';
      
      const resp=await fetch('https://empty-tree-0b19.nwaogalanyapaulinus.workers.dev',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({image:base64,mimeType:mimeType,prompt:'You are a trading journal assistant. This screenshot shows trade history from MT5, Deriv, FTMO, The5ers, or similar. Extract ALL visible trades and return ONLY a JSON array, no explanation, no markdown. Each object: date (YYYY-MM-DD), instrument (string), direction (Buy or Sell), entry_price (number), exit_price (number), profit_loss (number, negative for losses), result (Win/Loss/Break Even). Use 0 for missing numbers, Unknown for missing strings. Return [] ONLY if truly no trade rows exist.'})
      });
      
      if(!resp.ok) throw new Error('Worker returned HTTP '+resp.status);
      
      const data=await resp.json();
      console.log('Worker response:', JSON.stringify(data).slice(0,300));
      
      if(data.error) throw new Error(JSON.stringify(data.error));
      
      const text=data.response||data.content?.[0]?.text||'';
      console.log('Raw AI response:', text.slice(0,500));
      
      if(!text||text.trim()==='') throw new Error('Empty response from worker');
      
      const clean=text.replace(/```json|```/g,'').trim();
      const jsonMatch=clean.match(/\[[\s\S]*\]/);
      if(!jsonMatch) throw new Error('No JSON found in: '+clean.slice(0,100));
      
      const parsed=JSON.parse(jsonMatch[0]);
      if(!Array.isArray(parsed)||!parsed.length) throw new Error('Empty trade array');
      
      document.getElementById('ficon_'+i).style.color='var(--green)';
      document.getElementById('ficon_'+i).textContent='[OK]';
      document.getElementById('ftrades_'+i).style.color='var(--green)';
      document.getElementById('ftrades_'+i).textContent=parsed.length+' trade'+(parsed.length>1?'s':'');
      updateProgress();
      return parsed.map(t=>({...t,user_id:currentUser?.id}));
    }catch(e){
      document.getElementById('ficon_'+i).style.color='var(--red)';
      document.getElementById('ficon_'+i).textContent='[X]';
      document.getElementById('ftrades_'+i).style.color='var(--red)';
      document.getElementById('ftrades_'+i).textContent=e.message.slice(0,40);
      updateProgress();
      console.error('Image parse error for',file.name,':',e.message);
      return [];
    }
  }));
  results.forEach(r=>{ if(r.status==='fulfilled') imgParsedTrades.push(...r.value); });
  // Detect firm from extracted instruments + filenames
  const imgInstText = imgParsedTrades.map(t=>t.instrument||'').join(' ');
  const imgFileNames = fileArr.map(f=>f.name||'').join(' ');
  _imgFirm = autoDetectFirm(imgInstText+' '+imgFileNames) || 'Other';
  showDetectedFirm('imgDetectedFirm', _imgFirm==='Other'?null:_imgFirm);
  if(imgParsedTrades.length){
    progressLabel.textContent='Found '+imgParsedTrades.length+' trades across '+total+' file'+(total>1?'s':'')+'!';
    progressLabel.style.color='var(--green)';
    document.getElementById('imgPreviewLabel').textContent='Preview — '+imgParsedTrades.length+' trades found:';
    showTradePreview('imgPreview',null,'imgPreviewTable',imgParsedTrades);
    imgPreview.style.display='block';
  } else {
    progressLabel.textContent='No trades found. Make sure screenshots show trade history rows.';
    progressLabel.style.color='var(--yellow)';
  }
}
// Safe base64 converter — resizes and normalises phone images
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

function showTradePreview(containerId, labelId, tableId, trades){
  const container=document.getElementById(containerId);
  if(labelId)document.getElementById(labelId).textContent='Found '+trades.length+' trades — review before saving:';
  container.style.display='block';
  const tableEl=document.getElementById(tableId);
  tableEl.innerHTML=`<table class="trades-table"><thead><tr><th>Date</th><th>Instrument</th><th>Direction</th><th>P&L</th><th>Result</th></tr></thead><tbody>`+
    trades.map(t=>{
      const pnl=parseFloat(t.profit_loss);
      const badge=t.result==='Win'?'badge-win':t.result==='Loss'?'badge-loss':'badge-be';
      return`<tr><td>${t.date}</td><td style="color:var(--accent)">${t.instrument}</td><td>${t.direction||'—'}</td><td class="${pnl>=0?'stat-green':'stat-red'}">${pnl>=0?'+':''}$${pnl.toFixed(2)}</td><td><span class="badge ${badge}">${t.result}</span></td></tr>`;
    }).join('')+'</tbody></table>';
}

// ── AUTO-DETECT FIRM FROM FILE CONTENT ──
function autoDetectFirm(text){
  const t = text.toLowerCase();
  if(t.includes('fivepercent')||t.includes('five percent')||t.includes('5percent')||t.includes('the5ers')||t.includes('5%ers')) return 'The5ers';
  if(t.includes('ftmo')) return 'FTMO';
  if(t.includes('myforexfunds')||t.includes('mff')) return 'Other';
  if(t.includes('deriv')||t.includes('volatility')||t.includes('binary')) return 'Deriv';
  if(t.includes('fundedtrader')||t.includes('funded trader')) return 'Other';
  if(t.includes('topstep')||t.includes('apex')||t.includes('trueforex')) return 'Other';
  return null; // could not detect
}

// ── GENERATE DUPLICATE KEY ──
function tradeKey(t){
  return [t.date,t.instrument,t.direction,String(parseFloat(t.entry_price||0).toFixed(5)),String(parseFloat(t.profit_loss||0).toFixed(2))].join('|');
}


async function saveCSVTrades(){
  // Use already-detected firm from upload, fall back to dropdown, then instrument scan
  const provider = (_csvFirm && _csvFirm!=='Other') ? _csvFirm : detectOrGetProvider('uploadProvider', csvParsedTrades);
  await saveUploadedTrades(csvParsedTrades, 'csvPreview', provider);
}
async function saveImgTrades(){
  const provider = (_imgFirm && _imgFirm!=='Other') ? _imgFirm : detectOrGetProvider('imgUploadProvider', imgParsedTrades);
  await saveUploadedTrades(imgParsedTrades, 'imgPreview', provider);
}
async function savePastedTrades(){
  const provider = (_pasteFirm && _pasteFirm!=='Other') ? _pasteFirm : detectOrGetProvider('pasteUploadProvider', pasteParsedTrades);
  await saveUploadedTrades(pasteParsedTrades, 'pastePreview', provider);
}

function detectOrGetProvider(dropdownId, trades){
  // Scan instrument names + any firm field on the trade objects
  const combined = trades.map(t=>[(t.instrument||''),(t.account_provider||''),(t.firm||'')].join(' ')).join(' ').toLowerCase();
  const detected = autoDetectFirm(combined);
  if(detected) return detected;
  // Fall back to dropdown selection
  return document.getElementById(dropdownId)?.value || 'Other';
}

async function saveUploadedTrades(trades, containerId, provider){
  if(!trades.length){showToast('No trades to save',true);return;}
  if(!currentUser){showToast('Please sign in first',true);return;}

  // Get existing trades to prevent duplicates
  const{data:existing}=await sb.from('trades').select('date,instrument,direction,entry_price,profit_loss').eq('user_id',currentUser.id);
  const existingKeys=new Set((existing||[]).map(t=>tradeKey(t)));

  // Filter out duplicates
  const newTrades=trades.filter(t=>!existingKeys.has(tradeKey(t)));
  const dupeCount=trades.length-newTrades.length;

  if(!newTrades.length){
    showToast('All '+trades.length+' trades already exist — no duplicates saved.',true);
    document.getElementById(containerId).style.display='none';
    return;
  }

  // Batch insert
  const batch=newTrades.map(t=>({
    ...t,
    user_id:currentUser.id,
    account_provider:provider
  }));

  let saved=0;
  const chunkSize=50;
  for(let i=0;i<batch.length;i+=chunkSize){
    const chunk=batch.slice(i,i+chunkSize);
    const{error}=await sb.from('trades').insert(chunk);
    if(!error) saved+=chunk.length;
    else console.warn('Insert error:',error.message);
  }

  let msg='Saved '+saved+' trades to '+provider+'!';
  if(dupeCount>0) msg+=' ('+dupeCount+' duplicates skipped)';
  showToast(msg);
  document.getElementById(containerId).style.display='none';
  await loadTradesFromSupabase();

  // Auto-navigate to firm history tab after save
  // (handled by renderSubPage refresh in loadTradesFromSupabase)
}

window.addEventListener('resize',()=>{if(allTrades.length)drawEquityCurve();});
