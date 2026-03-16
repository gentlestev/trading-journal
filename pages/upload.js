// ============================================================
// FSH Empire — Page: Upload
// ============================================================

import { allTrades } from '../js/app.js';

export function renderFirmUpload(firm,firmName){
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
