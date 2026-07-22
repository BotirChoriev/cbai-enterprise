# Stage 1 dependency rules

Encoded in `lib/canonical-contracts/dependency-rules.ts` and enforced by `scripts/test-architecture-boundaries.ts`.

## Allowed direction (canonical)

```
voice-operator / typed command
        ↓
lib/platform-actions  (registry, allowlisted href)
        ↓
optional forward-deployed-engines confirmation
        ↓
router.push(allowlisted href only)
```

## Forbidden

| From | Must not import |
|------|-----------------|
| `app/`, `components/` | `@/lib/intelligence/...` (orphan) |
| `lib/platform-actions/` | orphan `@/lib/intelligence` |
| `lib/voice-operator/`, `components/voice-operator/` | orphan `@/lib/intelligence` |
| FDE modules | orphan `@/lib/intelligence` |

## Allowed distinction

`@/lib/intelligence-os` is **canonical** for missions / progressive disclosure — not quarantine.

## Quarantine (mark only)

- `lib/intelligence` (+ evidence/graph subtrees)
- `lib/collaboration` (provisional → `lib/organization-os`)

No delete/move in Stage 1.
