# FSH Empire — Trading Dashboard

Hosted at: https://gentlestev.github.io/trading-journal/

## Structure

```
trading-journal/
├── index.html              ← Shell only: placeholder divs + one <script type="module">
│
├── components/             ← Reusable UI builders (inject HTML into placeholders)
│   ├── header.js           ← renderHeader()  — app bar, main nav, sub-nav
│   └── auth.js             ← renderAuth()    — login + register screens
│
├── pages/                  ← One file per sub-page, each exports a render function
│   ├── overview.js         ← renderFirmOverview()  — stats, equity curve, charts, risk
│   ├── charts.js           ← drawFirmCharts()      — canvas: equity/daily/monthly/donut
│   ├── upload.js           ← renderFirmUpload()    — CSV, AI screenshots, paste
│   ├── history.js          ← renderFirmHistory()   — trade table per firm
│   ├── journal.js          ← renderFirmJournal()   — journal form + entries per firm
│   ├── analysis.js         ← renderFirmAnalysis()  — win rate, emotions, monthly
│   └── alltrades.js        ← renderAllTradesTable() + renderAllAnalysis()
│
├── js/                     ← Core logic modules
│   ├── app.js              ← Entry point: state, bootstrap, window.* exposure
│   ├── ui.js               ← Clock, toast, modal open/close
│   ├── auth.js             ← Login, register, Google OAuth, validation, country data
│   ├── nav.js              ← switchMainTab(), switchSubTab(), renderSubPage()
│   ├── deriv.js            ← WebSocket connection, trade sync
│   ├── data.js             ← loadTradesFromSupabase(), CRUD, renderAllTradesTable
│   ├── upload.js           ← File/image/paste handlers, saveFirmTrades
│   ├── journal.js          ← saveFirmJournal, loadFirmJournalEntries, emotions
│   └── utils.js            ← parseMT5Html, tradeKey, drawCurveOnCanvas, base64
│
└── styles/
    ├── main.css            ← CSS variables, reset, layout, nav
    ├── auth.css            ← Auth & congrats screen styles
    └── components.css      ← Buttons, forms, panels, cards, tables, modals, charts
```

## How it works

`index.html` loads **one** `<script type="module" src="js/app.js">`.  
`app.js` imports everything via ES modules and on DOMContentLoaded:
1. Calls `renderAuth()` and `renderHeader()` to inject HTML
2. Checks Supabase session
3. On login, calls `loadTradesFromSupabase()` then boots to Deriv tab

## To add a new firm

1. Add a `<div class="tab">` in `components/header.js` → `renderHeader()`
2. Add firm containers in `index.html`
3. Add entry to `FIRMS` in `js/app.js`
4. Add risk limits for firm in `pages/overview.js` → `renderFirmOverview()`

## Supabase config

Edit `SUPABASE_URL` and `SUPABASE_KEY` in `js/app.js`.

## Deploy to GitHub Pages

Push all files to `gentlestev/trading-journal` repo root.  
GitHub Pages serves `index.html` → loads modules → app runs.
