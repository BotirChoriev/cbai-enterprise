# 12 — Versioning Standard

**Document ID:** CBAI-Standard-12-Versioning  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define semantic versioning rules for the CBAI platform, indicator framework, methodology blocks, API contracts, and standards themselves. Versioning enables safe evolution without silent breaking changes or retroactive reinterpretation of evidence.

---

## Principles

- **Transparency** — version identifiers visible in registry, API, and audit reports
- **Stability over novelty** — prefer additive changes over breaking changes
- **Auditability** — historical versions retained for compliance review
- **Separation** — platform version ≠ indicator version ≠ methodology version

---

## Architecture

```
Standards Suite (docs/standards/)     → CBAI-Standards-v1.0
        │
Platform Release (application)       → cbai-enterprise@semver (package.json)
        │
Indicator Framework                  → FRAMEWORK_VERSION (lib/indicator-framework)
        │
Per-indicator version                → indicator.version field
        │
Methodology version                  → per indicator methodology semver (future)
        │
API schema                           → /v1/ REST, GraphQL schemaVersion
```

Each layer versions independently but documents compatibility matrix.

---

## Rules

1. Use [Semantic Versioning 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`.
2. **MAJOR** — breaking change to schema, constitution principle, or API contract.
3. **MINOR** — additive indicators, sources, entities, or backward-compatible fields.
4. **PATCH** — typo fixes, copy corrections, non-semantic documentation updates.
5. Breaking indicator ID changes require deprecation period — IDs never silently reused.
6. Standards amendments bump standards suite version (this directory README).
7. Changelog entry required for every MINOR and MAJOR bump.

---

## Platform versions

| Artifact | Current | Location |
|----------|---------|----------|
| Application package | `0.1.0` | `package.json` |
| Standards suite | `1.0.0` | `docs/standards/README.md` |
| Constitution doc | v1 | `docs/CBAI-Constitution-v1.md` |
| Domain model | v1 | `docs/CBAI-Domain-Model-v1.md` |

**Release naming (future):** `CBAI Enterprise 2026.3` aligned to semver tags.

---

## Indicator versions

| Scope | Version field | Rules |
|-------|---------------|-------|
| Framework | `FRAMEWORK_VERSION` in `types.ts` | Bump MINOR when adding indicators/domains |
| Individual indicator | `indicator.version` | Matches framework unless indicator-only patch |
| Domain catalog | Implicit framework version | Domains version with framework |

**Indicator lifecycle interaction:**

- `deprecated` indicators retain version history
- Successor indicator references `replaces: { id, version }` (future field)

---

## Methodology versions

Methodology blocks version independently when logic changes:

| Change type | Version bump |
|-------------|--------------|
| Typo in whyItExists | PATCH |
| New required evidence source | MINOR |
| Changed futureScoringDerivation algorithm description | MINOR |
| Removed indicator or reversed evidentiary requirement | MAJOR |

UI footers display: `Methodology v1.2.0 · Indicator: national-accounts`

---

## API versions

| Surface | Version mechanism |
|---------|-------------------|
| REST | URL path `/v1/`, `/v2/` |
| GraphQL | `schemaVersion` in introspection + deprecation directives |
| SDK | Matches API major version (`@cbai/sdk@1.x`) |

**Compatibility:** One major version supported after successor launch (minimum 12 months enterprise).

---

## Standards document versioning

Each file in `docs/standards/` includes:

```markdown
**Version:** 1.0.0
```

| Change | Action |
|--------|--------|
| Clarification, no rule change | PATCH across affected docs |
| New rule or entity type | MINOR + update README diagram |
| Principle removal or reversal | MAJOR + constitution review |

---

## Allowed

- Additive indicator and source registry entries (MINOR)
- Framework version constant exported from single module
- API `Sunset` and `Deprecation` headers
- Git tags matching platform releases
- Compatibility matrix in release notes

---

## Forbidden

- Silent field removal from entity schema without MAJOR bump
- Reusing deprecated indicator IDs for new semantics
- API `/latest/` unversioned alias in production
- Retroactive version labels on historical audit reports
- Mixing platform marketing version with API semver without mapping doc

---

## Examples

**Compliant — framework minor bump**

> `1.0.0` → `1.1.0`: Added 3 indicators in climate domain, no breaking schema changes.

**Compliant — API major bump**

> `/v1/countries` returns evidence wrapper; `/v2/countries` adds required `locale` param — v1 supported 12 months.

**Compliant — methodology patch**

> Fixed typo in `missingEvidence` for `patent-filing-disclosure` — methodology `1.0.0` → `1.0.1`.

**Non-compliant**

> Renamed indicator slug `national-accounts` → `gdp` without deprecation record.

---

## Future expansion

- Automated semver check in CI (registry diff → suggested bump)
- Version compatibility API endpoint
- Indicator migration tooling (`replaces` chain)
- Tenant pinning to specific framework version
- Signed release artifacts for enterprise deployment

---

## Cross-references

- [03 — Indicator Standard](./03-indicator-standard.md)
- [06 — Methodology Standard](./06-methodology-standard.md)
- [11 — API Standard](./11-api-standard.md)
- [01 — Constitution](./01-cbai-constitution.md)
