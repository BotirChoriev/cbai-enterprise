# CBAI Canonical Product Census — Executive Summary

**Audit mode:** documentation-only (Phases A–P). No product code changes authorized or performed in this census pass.
**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690`
**Upstream:** `NO_UPSTREAM`
**Date context:** 2026-07-22 (local)

## Verdict

CBAI already behaves as a **partial Universal Intelligence Operating System** on a static Next.js export (`next.config.ts` `output: "export"`), with a coherent primary IA in `lib/navigation.ts`, a spatial home globe, entity intelligence, research, evidence-at-`/knowledge`, graph, missions/projects/operational objects, voice+platform-actions+forward-deployed engines, and dual auth (device-local + optional Supabase).

It is **not** a single consolidated domain: evidence, orchestration, collaboration, and workspace naming each have overlapping implementations. Large dormant trees (notably `lib/intelligence/**` with **no** `app/`/`components/` imports) inflate perceived completeness. Collaboration routes added for auth-aware voice (`/files`, `/messages`, `/notifications`) are honest empties; teams/publications/scientific intake are PARTIAL local drafts without a real upload/backend.

**Confidence language used throughout:** PROVEN · PARTIAL · UNVERIFIED · EXTERNAL_BLOCKED · REQUIRES_HUMAN_REVIEW. This census does **not** claim production-ready, complete, or secure.

## What is PROVEN in source + routes

| Area | Evidence |
|------|----------|
| Spatial World Intelligence | `app/(dashboard)/page.tsx` → `SpatialWorldIntelligenceHome`; `scripts/test-spatial-world-intelligence.ts` |
| Primary nav IA | `lib/navigation.ts` primary/secondary sections |
| Voice dock + command path | `app/(dashboard)/layout.tsx`; `lib/voice-operator/*`; `lib/platform-actions/*`; many `scripts/test-voice-*.ts` |
| Voice broker function | `functions/api/voice/session.ts` → `pages-voice-session-broker.ts` |
| OO / projects / missions | `lib/operational-objects/*`, `lib/project/*`, `lib/intelligence-os/*`; `/my-work` |
| Evidence UI (nav “Evidence”) | `/knowledge` → `EvidenceExplorer` (`components/evidence/*`) |
| Graph | `/graph` + `lib/living-object-network` |
| Investor / Government / Governance / Trust | dedicated routes under `app/(dashboard)/` |
| i18n EN/UZ/RU/TR plumbing | `lib/i18n/dictionaries/*`; locale test scripts |

## Highest-risk findings (REQUIRES_HUMAN_REVIEW)

1. **Voice session mint** gated by origin allowlist only — no user auth / rate limit (`functions/api/voice/session.ts`, broker handler). Cost-abuse and unauthenticated ephemeral credential minting.
2. **Device-local auth** (`lib/auth/auth-store.ts`, `cbai-auth-users`) treated as sign-in for collab gates — not cryptographic server identity.
3. **Evidence ≠ forensics.** Platform evidence assists research; no chain-of-custody workspace exists (CAP-032 DOCUMENTATION_ONLY). Premature “forensic” marketing would be unsafe.
4. **Orphan orchestration** `lib/intelligence/**` (~200 files) contradicts docs that imply a live agent runtime; `/agents` UI states runtime not connected.
5. **Publication / rights / feedback** models are missing or stubbed — Stages 6 and 8 designs only.

## Consolidation direction (not implemented)

Canonical live path: **Voice Operator + platform-actions + FDE** for orchestration; **evidence-explorer + infrastructure + gap + comparison + runtime** for evidence UI; **lib/graph + living-object-network** for graph; **organization-os** for teams/org; **intelligence-os + project + operational-objects** for work — with explicit MERGE of research-evidence types and QUARANTINE of `lib/intelligence` and UI-orphaned `lib/collaboration`.

## First three implementation stages (recommend only)

See `15-phased-implementation-plan.md`. Summary:

0. Freeze + backup (ops)
1. Canonical types and ownership boundaries
2. Store / provider / orchestrator consolidation

**Stop:** no implementation in this audit.

## Safety

Starting and ending manifests: `starting-safety-manifest.txt`, `ending-safety-manifest.txt`.
Intentional writes: only under `docs/architecture/product-census/`.
Secrets: env **names** inventoried; values never read from `.dev.vars` / live keys.
