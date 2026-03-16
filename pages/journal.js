// ============================================================
// FSH Empire — Page: Journal
// ============================================================

import { allTrades } from '../js/app.js';
import { saveFirmJournal, loadFirmJournalEntries, selectFirmEmotion } from '../js/journal.js';

export function renderFirmJournal(firm,firmName){
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
