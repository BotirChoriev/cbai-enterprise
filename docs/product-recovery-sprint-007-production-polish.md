# Product Recovery Sprint-007 — Production Polish

Production polish pass across all active user-facing pages. No new features, architecture, or framework layers — copy, headings, empty states, status labels, buttons, and visual consistency only.

## Pages audited

| Page | Status |
|------|--------|
| Home | Polished — action labels, available-today list |
| Search | Polished — Compare → / Open reports → buttons |
| Dashboard | Polished — removed registry/indicator jargon |
| Countries | Polished — simplified page header, profile sections |
| Companies | Polished — simplified page header |
| Universities | Polished — simplified page header |
| Evidence Explorer | Polished — removed indicator explorer panel, user stats |
| Reports | Polished — heading asks user question |
| Reasoning | Polished — review steps, related information |
| Government | Polished — workspace headings and status labels |
| Investor | Polished — workspace headings and source copy |
| Citizen | Polished — available evidence heading |
| Governance | Polished — review standards / review process |

## Developer terms removed

- **Registry** → profiles / profile list / available profiles
- **Pipeline** → review steps / review process
- **Indicator(s)** → topics / information / related items (user-visible labels)
- **Connector** → source (sanitizer)
- **Framework** → standards (sanitizer)
- **Global Registry** → available profiles
- **Planned / Not connected / Verification pending** → Not yet available / No source connected / Review pending
- **Registry available** (search) → Available now
- **Intelligence 2.0** version stripes on list pages
- **Internal IDs** in comparison matrix and selector debug line
- **Evidence anchor / indicator ID** in decision package lines (sanitized at display)

## Copy improvements

- Headings reframed as user questions where applicable: “What can I open today?”, “Available evidence”, “Missing information”, “Related information”, “How evidence is reviewed”
- Empty states: “No missing information is recorded for this profile.” instead of technical gap language
- Decision package section labels: Available information, Missing information, Official sources
- Search result actions use arrow affordance: Open profile →, Compare →, Open reports →
- Profile flow buttons: Review evidence →, Missing information →
- Comparison copy: side-by-side profiles, missing information differences
- Navigation descriptions updated to plain language

## Visual consistency fixes

- Unified list page headers (Countries, Companies, Universities) — single border card, no gradient/version badge
- Search result secondary actions match profile section button sizing (`min-h-9`, bordered)
- Evidence Explorer reduced to three summary stat cards (removed graph edge stat)
- Consistent `text-base font-semibold` section headings on entity profiles
- Workspace coverage cards use “topics with evidence” instead of indicator counts

## Remaining issues

1. **Orphan components** still contain developer language if mounted elsewhere: `IndicatorExplorerPanel`, `PipelineReadinessPanel`, legacy integration panels — not on active nav journey
2. **Reports route** remains `/analytics` while label is “Reports”
3. **Relationship panels** still render below list column on entity list pages
4. **Decision package source text** is sanitized at display; underlying builders still emit technical strings
5. **Evidence comparison matrix notes** may still include internal phrasing from lib — not fully sanitized
6. **Governance compliance template** section exists in code but is not mounted on Governance page

## Production readiness assessment

**Ready for beta user testing** on the primary journey: Home → Search → Entity Profile → Overview → Evidence → Missing Information → Decision Package → Reports → Compare.

Secondary pages (Evidence Explorer, Reasoning, Workspaces, Governance) are substantially cleaner but still surface domain-specific topic names from data layers.

Recommended next sprint: route alias `/reports`, relationship panel placement, and deep sanitization of comparison matrix notes.

## Verification

```bash
npm run lint
npm run build
```

Both commands must pass before merge.
