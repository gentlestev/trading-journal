# FSH Empire — Trading Dashboard

## Project Structure

```
fsh-empire/
├── index.html          ← Shell: HTML structure only, loads all CSS & JS
│
├── styles/
│   ├── base.css        ← CSS variables, reset, body, layout grid
│   ├── auth.css        ← Auth screen (login/register/congrats)
│   └── app.css         ← App: header, nav, panels, cards, tables, forms, charts
│
└── js/
    ├── config.js       ← Supabase keys, global state (allTrades, currentUser)
    ├── ui.js           ← Toast, clock, modal helpers
    ├── auth.js         ← Login, register, Google auth, validation, country data
    ├── nav.js          ← switchMainTab, switchSubTab, renderSubPage
    ├── render.js       ← renderFirmOverview/Upload/History/Journal/Analysis, renderAllAnalysis
    ├── charts.js       ← drawCurveOnCanvas, drawFirmCharts (equity/daily/monthly/donut)
    ├── upload.js       ← CSV/image/paste upload handlers per firm, saveFirmTrades
    ├── journal.js      ← saveFirmJournal, loadFirmJournalEntries, emotion tracking
    ├── data.js         ← loadTradesFromSupabase, renderAllTradesTable, deleteTrade, deriv sync
    ├── supabase.js     ← loadTradesFromSupabase, renderTradesTable stubs
    └── misc.js         ← parseMT5Html, legacy handlers, utility functions
```

## To Deploy to GitHub Pages

1. Upload all files maintaining this folder structure
2. `index.html` goes in root
3. `styles/` and `js/` folders go alongside it

## Adding a New Firm

1. Add a tab in `index.html` nav
2. Add firm containers in `index.html` main
3. Add firm to `FIRMS` object in `js/nav.js`
4. Add risk limits for firm in `js/render.js` → `renderFirmOverview`

## Supabase Config

Edit `js/config.js` to update keys.
