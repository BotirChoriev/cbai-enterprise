# Scientific Deliberation Network — Architecture

## Purpose
Transform `/evidence` into a structured scientific deliberation workspace: claims → evidence → methods → counter-evidence → replication → contradictions → living synthesis → Debate-to-Work → human decision.

## Layers
- **UI:** `components/evidence/ScientificDeliberationHome.tsx` inside `EvidenceExplorer` (`IntelligencePageFrame`)
- **Domain:** `lib/scientific-deliberation/**` (rooms, claims, evidence, roles, synthesis, contradiction radar, replication passport, debate-to-work, voice)
- **Persistence:** localStorage `cbai.scientific-deliberation.v1` — local-only; legacy `cbai.local-evidence.v1` retained
- **i18n:** `lib/i18n/platform-copy-scientific-deliberation.ts` (EN/UZ/RU/TR)
- **Voice:** `resolveScientificDeliberationVoiceCommand` via `lib/domain-intelligence/voice-bridge.ts` (moderator assistant only)
- **OO:** `previewDebateToWork` → Operational Object composer with confirmation + idempotency

## Real vs planned
| Capability | Status |
|---|---|
| Local rooms / claims / evidence | Real (browser) |
| Living synthesis (time-bound) | Real (local) |
| Debate-to-Work drafts | Real (confirmation-gated) |
| Shared realtime multi-user | INFRASTRUCTURE_REQUIRED |
| Live interpretation | EXTERNAL_BLOCKED / not claimed |
| Fabricated researchers | Forbidden |

## Privacy / consent
Transcript and translation consents are room fields; transcripts are not saved without consent. Confidential content stays local unless shared infrastructure is connected.
