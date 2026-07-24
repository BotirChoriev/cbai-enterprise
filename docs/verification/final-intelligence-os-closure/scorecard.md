# Scorecard — Final Intelligence OS Closure (after)

Inspected Playwright captures under `docs/verification/final-intelligence-os-closure/after/` plus live local + Preview broker probes.

Scoring: 1–10 per dimension. Critical surfaces require ≥9 unless noted.

| Surface | Hierarchy | Contrast | Consistency | Action clarity | IOS identity | Localization | Responsiveness | Obstruction | Honesty | A11y | Notes |
|---------|-----------|----------|-------------|----------------|--------------|--------------|----------------|-------------|---------|------|-------|
| Home dark | 9 | 9 | 9 | 9 | 10 | 9 | 9 | 9 | 10 | 9 | Globe renders; canonical IA; no Mission Engine strip |
| Home light | 9 | 9 | 9 | 9 | 10 | 9 | 9 | 9 | 10 | 9 | Spatial navy chrome forced (DD-CLOS-003) |
| My Work | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | |
| Research | 9 | 9 | 9 | 9 | 9 | 9 | 8 | 9 | 9 | 9 | Dense catalog; mobile usable |
| Evidence | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | `/evidence` canonical |
| Countries | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | |
| Graph | 9 | 9 | 9 | 9 | 9 | 9 | 8 | 9 | 9 | 9 | Expert canvas; fallback exists |
| Reports | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | Prerequisites visible |
| Investor | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 10 | 9 | Non-advisory framing |
| Government | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 10 | 9 | Distinct from Governance |
| Governance | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 10 | 9 | Rules/oversight |
| Trust | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 10 | 9 | |
| Settings | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | |
| About UZ | 9 | 9 | 9 | 9 | 9 | 10 | 9 | 9 | 9 | 9 | Title **CBAI haqida** |
| Voice open | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | Text usable; mic semantics fixed |
| Mobile home | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | Country-list fallback when coarse+narrow |

**Dense expert canvases (Research catalog / Graph):** responsive score 8 documented; usable fallbacks present.

## Gates

| Gate | Result |
|------|--------|
| Branch `preview/spatial-world-intelligence` | PASS |
| Main untouched | PASS |
| No commit/push/deploy this closure | PASS |
| Secrets not exposed in docs/report | PASS (meta only) |
| Local Realtime broker session | PASS (`ek_*` mint) |
| Preview Realtime session endpoint | PASS HTTP 200 `ek_*` |
| Globe WebGL (Chromium Playwright) | PASS after `three` install |
| Safari live mic indicator | **HUMAN** — see safari-checklist.md |
| Relevant automated suites | PASS (see final report) |
