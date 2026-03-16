// FSH Empire — Journal: save/load journal entries
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
