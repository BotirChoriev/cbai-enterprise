# Canonical domain model (proposed)

**Status:** DESIGN proposal only. Not implemented in this audit.
**Rules:** Old records without new fields remain readable; unknown fields preserved; migrations idempotent; user-entered text never silently translated/rewritten (`docs/architecture/locale-provenance-policy.md`).

## Separation invariants

| Concept | Must not be confused with |
|---------|---------------------------|
| EvidenceItem | Claim, Analysis, Decision, Source file blob |
| Source | EvidenceItem (source is provenance of evidence) |
| Claim | Hypothesis, Analysis conclusion |
| Hypothesis | Claim (hypothesis is tentative) |
| Analysis | Decision / HumanApproval |
| Decision / HumanApproval | Automated engine output |

Current code often uses “evidence” for coverage catalogs, research saved items, and pipeline readiness (`lib/evidence-*`, `lib/research/evidence`). Unification is Stage 1 work.

## Core objects

Every canonical object SHOULD eventually carry:

- `id` (stable)
- `ownerId` / `workspaceId` / `visibility`
- `authorId`
- `createdLocale` / `contentLocale`
- `createdAt` / `updatedAt`
- `provenance` (method, source refs, tool versions)
- `permissions` (explicit ACL or role binding)
- `version`
- `relationships[]`
- `retentionStatus` / `legalHold`
- `auditEventIds[]`
- `migrationCompatibility` / `unknownFields` bag
- allowed state transitions (documented FSM)

### Identity / Person
Maps today: `lib/auth/*` users (device-local + Supabase). Gaps: no verified Person profile distinct from account; voice must not mutate profile from speech without consent (`auth-action-policy`, identity intents).

### Organization / Team
Maps: `lib/organization-os/*` (`cbai-organizations`). `/teams` drafts are PARTIAL parallel (`CAP-024`). Canonical: Organization OS; Teams UI should bind to it.

### Membership / Role
Maps: `cbai-organization-memberships`, invitations. Proposed roles (Product Access Model): owner, administrator, researcher, reviewer, contributor, viewer + forensic roles later. Server enforcement today: PARTIAL only when Supabase RLS applied (`supabase/migrations/0002*.sql`, `0006*.sql`).

### Workspace
Five access layers (see Phase F design in `08-privacy-legal-copyright-model.md` and IA doc): Public, Personal Cabinet, Team, Publication, Restricted Forensics. Today: soft boundaries via routes + localStorage keys.

### Project
Maps: `lib/project/project-store.ts` (`cbai-projects`, related keys). KEEP.

### Mission
Maps: `lib/intelligence-os/mission-store.ts` (`cbai-missions`). Distinct from Project: Mission = operating context / continuity; Project = owned work container. Overlap with research-mission naming — document, don’t merge blindly.

### Operational Object
Maps: `lib/operational-objects/*`. Related: `lib/ontology/*` (`cbai-ontology-objects`) — MERGE carefully; preserve both key namespaces until mapped.

### Task / Work Plan
Maps: `cbai-project-tasks`; genesis execution tasks (`cbai-genesis-execution-*`) — MERGE candidate into Project tasks.

### EvidenceItem
Canonical future type for an examinable assertion-supporting item with hash/provenance. Today: fragmented (explorer coverage, research lifecycle, project evidence refs).

### Source
Maps: `cbai-saved-knowledge-sources`, source reviews. Official connectors documented separately.

### Claim / Hypothesis / Analysis
PARTIAL across reasoning explorer and research findings (`cbai-research-findings`). Need explicit types — not interchangeable with EvidenceItem.

### Decision / Human Approval
Maps: FDE confirmation panels (`components/forward-deployed/ConfirmationPanel.tsx`); genesis decisions store. Voice Level 3 must require confirmation (`lib/voice-operator/identity/action-levels.ts` patterns).

### Report
Maps: `cbai-saved-reports` / `lib/reports/*`.

### Publication
PARTIAL in-memory `/publications`. Needs rights fields (Phase I).

### Comment / Conversation
PLACEHOLDER `/messages`. Notifications store exists (`cbai-user-notifications`) but `/notifications` empty shell.

### Attachment
Scientific intake stores metadata/`fileName` only (`lib/scientific-intake`) — not blob storage. EXTERNAL_BLOCKED for real object store.

### Feedback
Missing — design in `10-feedback-and-incident-loop.md`.

### Audit Event
PARTIAL: organization/collaboration/genesis/ontology audit keys. Need append-only policy for forensics/security.

### Consent / Permission
PARTIAL: publication checkboxes; voice pending intent; no unified Consent object.

### Legal Hold / Retention Policy
DOCUMENTATION_ONLY — design Stage 7+.

## State transition sketch (EvidenceItem future)

`draft → submitted → accepted_intake → (quarantined|hashed) → under_analysis → peer_review → signed_off → closed`
Illegal: mutating original bytes; deleting audit; autonomous legal conclusion states.
