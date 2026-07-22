# Route scorecard (after Chromium capture — inspected)

Scale 1–10. A critical route is “complete” only at ≥9 across **all** categories. Scores below are from inspected screenshots + tests, not aspiration.

| Route | Identity | Hierarchy | Consistency | Contrast | Actions | i18n | A11y* | Responsive* | Voice* | Honesty |
|-------|---------:|----------:|------------:|---------:|--------:|-----:|------:|------------:|-------:|--------:|
| `/` Home | 9 | 8 | 9 | 9 | 8 | 8 | 8 | 8 | 8 | 9 |
| `/my-work` | 9 | 9 | 9 | 9 | 9 | 9 | 8 | 8 | 8 | 9 |
| `/knowledge` | 9 | 8 | 9 | 9 | 8 | 9 | 8 | 8 | 8 | 9 |
| `/graph` | 8 | 8 | 8 | 8 | 8 | 8 | 7 | 7 | 7 | 8 |
| `/reports` | 9 | 8 | 9 | 9 | 8 | 9 | 8 | 8 | 8 | 9 |
| `/countries` | 9 | 8 | 9 | 9 | 8 | 8 | 8 | 8 | 8 | 8 |
| `/research` | 9 | 8 | 9 | 9 | 8 | 9 | 8 | 8 | 8 | 9 |
| `/settings` | 8 | 8 | 8 | 9 | 8 | 9 | 8 | 8 | 8 | 9 |
| Collab shells | 8 | 7 | 8 | 8 | 7 | 8 | 7 | 7 | 8 | 8 |

\*A11y/responsive/voice columns combine automated tests + Chromium spot checks. Live Realtime E2E and Safari remain unproven here.

### Matrix coverage (this pass)
- Dark desktop: 20+ routes refreshed under `after/`
- Light desktop: home, my-work, evidence, research, reports, settings, graph, countries
- UZ desktop: home, my-work, evidence, research, settings, reports
- Mobile 390×844: home, my-work, evidence, research, settings
- Voice open: `desktop-dark-voice-open.png` (dock Ready + Close/End session visible)

### Still not ≥9 across every category for every critical route
Home spatial vs internal sidebar IA still differs slightly on the spatial home chrome. Graph density and collab PLACEHOLDER honesty keep some cells at 7–8. **Do not claim full product completion.**

Screenshots: `docs/verification/intelligence-os-final-closure/after/` (~42 files)
