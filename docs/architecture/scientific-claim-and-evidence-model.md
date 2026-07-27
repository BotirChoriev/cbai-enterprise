# Scientific Claim and Evidence Model

## Entities
See `lib/scientific-deliberation/types.ts`:
- `DeliberationRoom`, `ScientificClaim`, `DeliberationEvidenceRecord`
- `MethodReview`, `ReplicationRecord`, `ScientificContribution`
- `SynthesisSnapshot`, `GlossaryTerm`, `ParticipantReference`
- `DecisionCheckpoint`, `ScientificAuditEvent`, `ContradictionLink`

## Claim status
`proposed` → … → `human_confirmed` only. Never auto-convert to permanent truth.

## Evidence
Stance: `support` | `challenge` | `context`.
Dual surfaces: `originalSourceText` vs `cbaiInterpretation`. Unknowns remain explicit.

## Migration
`migrate.ts` — additive, idempotent, preserves unknown fields and locales. User content never silently translated.
