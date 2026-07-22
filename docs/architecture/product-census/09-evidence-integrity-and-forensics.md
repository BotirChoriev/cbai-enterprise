# Evidence integrity and forensics (design only — not implemented)

## Terminology

- **Criminology** studies crime and causes — out of scope as a product judgment engine.
- **Criminalistics / digital forensics** concerns examination of evidence — the professional workspace envisioned here.
CBAI must **never** infer guilt or issue autonomous legal conclusions.

## Alignment assessment (principles only — not certification)

| Framework | Alignment intent | Current CBAI |
|-----------|------------------|--------------|
| NIST SP 800-86 | Preserve originals; document process; use tools appropriately | UNVERIFIED / not implemented as forensic workflow |
| ISO/IEC 27037 | Identification, collection, acquisition, preservation | Not implemented |
| ISO/IEC 27042 | Analysis & interpretation with uncertainty | Reasoning UI PARTIAL; not forensic sign-off |

**This is not a claim of certification or courtroom admissibility.**

## Required forensic flow (future Forensic Evidence Workspace)

1. Case/workspace authorization
2. Legal or organizational authority recorded
3. Evidence intake
4. Original file isolation
5. Cryptographic hash
6. Trusted timestamp
7. Source and acquisition method
8. Custodian identity
9. Chain-of-custody entry
10. Malware-safe quarantine
11. Working-copy creation (derivative ≠ original)
12. Tool and tool-version recording
13. Analysis notes (append; no silent overwrite)
14. Claim/evidence linkage (typed — not interchangeable)
15. Contradiction and uncertainty tracking
16. Independent reviewer
17. Human sign-off
18. Export manifest
19. Retention or legal hold
20. Closure and archival policy

### Hard rules

- Never modify the original.
- Derivatives are separate objects.
- Never hide uncertainty.
- Never infer guilt.
- Never autonomous legal conclusion.
- Never overwrite examiner notes.
- Every access/download/transform/export → audit event.
- CBAI may organize, compare, hash, surface inconsistencies, assist documentation.
- Final forensic/legal conclusions require authorized human expert.

## Relationship to existing “Evidence”

Nav label **Evidence** → `/knowledge` (`EvidenceExplorer`) is a **research/source coverage** surface (`CAP-009`), **not** the forensic workspace. Reusing research evidence stores for custody would be UNSAFE without a separate restricted layer.

## Jurisdiction

Flag all courtroom procedure, retention mandates, and cross-border transfer rules for **qualified counsel** (REQUIRES_HUMAN_REVIEW).
