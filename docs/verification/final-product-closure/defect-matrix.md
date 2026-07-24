# Final Product Closure — Defect Matrix

| ID | Sev | Surface | Symptom | Root cause | Fix | Status |
|----|-----|---------|---------|------------|-----|--------|
| PC-01 | P0 | Voice dock | npm/.dev.vars dominant in user notice | Setup hint in main panel | User notice + collapsible diagnostics | ✅ Fixed |
| PC-02 | P0 | Voice mic | title attr exposed dev commands | Tooltip on disabled mic | Removed title; aria-label user notice | ✅ Fixed |
| PC-03 | P1 | Indicator explorer | English "Coverage Status", "Connected" | No i18n | `indicatorExplorer` keys + client components | ✅ Fixed |
| PC-04 | P1 | Reasoning table | English column headers | Hardcoded th text | `reasoningPage.table*` keys | ✅ Fixed |
| PC-05 | P1 | Voice states | invalid_api_key conflated with mic | Generic ERROR fallback | Classified broker codes (prior session) | ✅ Fixed |
| PC-06 | P2 | Trust | Long document hierarchy | Inherent density | Section nav retained | ✅ Acceptable |
| PC-07 | P2 | Legacy zinc | Some expert panels use zinc-* | Historical | Semantic tokens in touched panels | ✅ Partial |
| EXT-01 | — | Live voice | No Realtime audio | Invalid OPENAI_API_KEY | EXTERNAL_BLOCKED — key deferred | ⏸ External |
