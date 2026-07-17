# CBAI Genesis Baseline

Recorded: July 16, 2026 — BUILD-027 program start.

## Git state

| Item | Value |
|------|-------|
| Branch | `main` |
| HEAD | `1ae177aa023f52f76b11e72f248b726529f19eb0` |
| origin/main | `945dc6e91d00d9a5082ba605bbdd8b5b0791dc4c` |
| Commits ahead | 5 |
| Working tree | clean at audit start |
| Push | not pushed |

### Recent commits

```
1ae177a Knowledge Brain, universal intent, BUILD-026, thinking desk, audit
d0e37bb BUILD-025 research panels, project home, home lead
e6fe267 Research depth i18n, ProjectHome live refresh
3caf2e6 Living core home/My Work/command
baef3e1 BUILD-024 research depth, command feedback, project home
945dc6e (origin/main) System integration release
```

## Architecture summary

| Layer | Location | Notes |
|-------|----------|-------|
| Routes | `app/(dashboard)/*` | 27 routes, no `app/api` yet |
| Mission | `lib/intelligence-os/mission-store.ts` | localStorage |
| Projects | `lib/project/project-store.ts` | localStorage + Supabase outbox |
| Research workspace | `lib/research/research-workspace-store.ts` | notes, findings, lifecycle |
| Knowledge Brain | `lib/intelligence-os/knowledge-brain.ts` | explainability buckets |
| Universal Intent | `lib/intelligence-os/universal-intent.ts` | command categorization |
| Connectors (catalog) | `lib/connectors/*` | definitions only, no HTTP |
| Organizations | `lib/organization-os/*` | device-local, no membership |
| Graph | `lib/graph/*`, `lib/research/graph/*` | built from catalogs |
| Event bus | `lib/intelligence-os/mission-activation-events.ts` | browser CustomEvent |
| Auth | `lib/auth/*`, Supabase cloud | local + cloud modes |
| i18n | `lib/i18n/dictionaries/*` | EN/UZ/RU/TR type-checked |
| Tests | `scripts/test-*.ts` | 34 scripts; Playwright in dev |

## Verified truth-state issues (pre-BUILD-027)

See `CBAI-REAL-DATA-TRUTH-LEDGER.md` — GEN-T001 through GEN-T006.

## Quality gate baseline (pre-fix)

| Gate | Result |
|------|--------|
| `npm run lint` | pass (warnings only) |
| `npx tsc --noEmit` | pass |
| `npm run build` | pass |
| `test:*` (34) | 33/34 pass |
| `test:browser-regression` | skip/fail — requires dev server + Playwright browser |
| Browser responsive | not verified this session |
| Live external API | not connected |
