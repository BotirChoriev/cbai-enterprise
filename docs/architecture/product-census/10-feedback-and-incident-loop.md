# Feedback and incident loop (design)

**Status:** DOCUMENTATION_ONLY — no canonical feedback module found in census (`CAP-031`).

## Canonical Feedback object (proposed)

| Field | Purpose |
|-------|---------|
| id | stable |
| route | where observed |
| objectId / objectType | linked domain object |
| workspaceId | scope |
| uiState | density, panel, voice open/closed |
| build / commit | `HEAD` hash + app version if any |
| locale | UI locale |
| browser / device | opt-in diagnostics |
| expectedResult / actualResult | reporter narrative |
| severity | sev0–sev3 |
| category | see below |
| screenshotRef | opt-in, redacted |
| redactionConfirmation | boolean required if attachments |
| reporterId | identity |
| ownerId | triage owner |
| status | new → triage → in_progress → resolved → closed |
| resolution | text |
| auditHistory | append-only |

## Categories

bug · usability · accessibility · localization · evidence integrity · privacy · security · copyright · abuse · data quality · feature request

## Restricted triage path

Security, privacy, and evidence-integrity reports must **not** flow through public discussion channels. Separate queue, least-privilege responders, no automatic inclusion of secrets/transcripts.

## Rules

- Screenshots/diagnostics opt-in; redact before upload.
- Never auto-attach voice transcripts without consent.
- Link to incident-response workflow in `07-security-threat-model.md`.
- Implementation target: Stage 8 in `15-phased-implementation-plan.md` (not started).
