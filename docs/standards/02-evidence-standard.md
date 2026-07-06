# 02 — Evidence Standard

**Document ID:** CBAI-Standard-02-Evidence  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define what qualifies as evidence on CBAI, how evidence sources are registered and lifecycle-managed, and how verification status is communicated. Evidence is the foundation of all intelligence — without it, the platform shows absence, not invention.

---

## Principles

- **Evidence First** — claims require sources or explicit unavailability
- **Provenance** — every evidence item traces to a registered source
- **Verification before promotion** — connected ≠ verified until validation passes
- **Separation of Evidence and Judgment** — raw evidence is not a score
- **Transparency** — source name, status, and verification state are user-visible

---

## Architecture

```
Evidence Source Registry
        │
        ▼
  Source Lifecycle (connected / not_connected / planned / deprecated / verification_pending)
        │
        ▼
  Evidence Items (documents, registry fields, graph edges, API payloads)
        │
        ▼
  Indicators · Entities · Relationships · Reasoning (future)
```

Evidence flows **upward** from sources. UI and reasoning consume evidence; they do not create it.

| Layer | Responsibility |
|-------|----------------|
| Source registry | Declares authoritative origins (UN, World Bank, NSO, local registry) |
| Collectors (future) | Fetch and normalize from connected sources |
| Validators (future) | Schema, freshness, and cross-source checks |
| Adapters | Map domain data to evidence items without fabrication |
| Presentation | Show evidence status before interpretive content |

---

## Rules

1. Every evidence source must be registered before use in indicators or entity fields.
2. Source status must be one of the defined lifecycle states (see below).
3. User-facing fields must display evidence status when value is shown or withheld.
4. `verification_pending` blocks use in evaluations and rankings — display only with label.
5. Deprecated sources must not feed new evidence; historical items retain deprecation metadata.
6. Local registry evidence must declare catalog scope (what the on-platform registry covers).

---

## Evidence source lifecycle

| Status | Meaning | User-facing label |
|--------|---------|-------------------|
| `planned` | Source identified; no integration work started | Planned |
| `not_connected` | Registry entry exists; API or feed not wired | Not connected |
| `connected` | Technical connection established; data may flow | Connected |
| `verification_pending` | Data received; validation not complete | Verification pending |
| `deprecated` | Source retired or superseded; do not use for new evidence | Deprecated |

**Note:** `connected` does not imply verified. Promotion to verified evidence requires passing validation rules (future automated + manual gates).

---

## Allowed

- Showing registry facts from `cbai-local-registry` with "Available — local registry" attribution
- Listing required sources on indicators with not_connected status
- Withholding fields entirely when no evidence exists (preferred over empty fabrication)
- Evidence cards with source name, date, document type, and link (when connected)
- Graph edges marked `evidence_available` or `evidence_missing`

---

## Forbidden

- Presenting unconnected sources as if data were live
- Mixing deprecated source data without deprecation notice
- Using verification_pending data in confidence scores or rankings
- Inventing document URLs, publication dates, or statistics
- Evidence items with no source slug or registry reference
- Scraping or social media content as primary evidence without governance review

---

## Examples

**Compliant — source registry entry**

```yaml
slug: world-bank
name: World Bank
status: not_connected
examples: [World Development Indicators]
```

**Compliant — field with evidence status**

> **GDP (nominal)** — Not connected  
> Required source: World Bank · Indicator: national-accounts

**Compliant — verified edge (future)**

> Stanford → partner → Apple  
> Evidence: MOU publication · Source: university-disclosures · Verified: 2025-03-12

**Non-compliant**

> GDP: $27.4T (no source, no status label)

---

## Future expansion

- Automated freshness SLAs per source type
- Cross-source reconciliation (NSO vs World Bank GDP)
- Document ingestion pipeline with hash and immutable audit log
- Evidence Explorer UI ([global indicator framework integration map](../global-indicator-framework.md))
- Tenant-scoped private evidence with same lifecycle rules
- Cryptographic attestation for high-assurance sources

---

## Cross-references

- [01 — Constitution](./01-cbai-constitution.md)
- [03 — Indicator Standard](./03-indicator-standard.md)
- [05 — Relationship Standard](./05-relationship-standard.md)
- `lib/indicator-framework/sources/registry.ts` (reference implementation)
