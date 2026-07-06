# 11 — API Standard

**Document ID:** CBAI-Standard-11-API  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define future public API contracts for CBAI Enterprise — REST, GraphQL, and SDK surfaces. APIs expose registry facts, indicator definitions, evidence status, and relationships — not fabricated intelligence or undisclosed scoring.

**Current state:** Documentation only. No public API is implemented. Static export remains the delivery mode.

---

## Principles

- **Evidence First** — every payload field includes provenance or status metadata
- **Transparency** — API responses mirror UI honesty (unavailable ≠ null pretending availability)
- **Versioned contracts** — breaking changes require semver bump
- **Political Neutrality** — no editorial endpoints (trending, recommended countries)
- **Zero Demo Policy** — no demo API keys returning fake scores

---

## Architecture

```
Future API Gateway
        │
        ├── REST v1 (resource-oriented)
        ├── GraphQL (query + typed schema)
        └── SDK (@cursor/sdk pattern / @cbai/sdk future)
                │
                ▼
        Domain services
        ├── Entity registry
        ├── Indicator framework
        ├── Evidence sources
        ├── Graph relationships
        └── Methodology metadata
                │
                ▼
        Authentication / tenancy / rate limits (future)
```

APIs read from the same single source of truth as the web app — no parallel entity stores.

---

## Rules

1. Public APIs require version prefix: `/v1/` (REST) or schema version field (GraphQL).
2. Every entity field returns `{ value, evidenceStatus, sourceSlug?, updatedAt? }` wrapper or equivalent.
3. Indicator endpoints return definitions and status — not computed scores until evaluation layer exists.
4. Rate limits and authentication required before public launch.
5. Deprecated fields supported for one major version minimum.
6. OpenAPI / GraphQL schema published alongside [12 — Versioning](./12-versioning-standard.md).

---

## Future REST

**Base URL (planned):** `https://api.cbai.enterprise/v1`

| Resource | Methods | Description |
|----------|---------|-------------|
| `/countries` | GET | List registry countries |
| `/countries/{id}` | GET | Country detail with evidence-wrapped fields |
| `/companies` | GET, GET `/{id}` | Company registry |
| `/universities` | GET, GET `/{id}` | University registry |
| `/indicators` | GET | Indicator registry |
| `/indicators/{slug}` | GET | Single indicator + methodology |
| `/sources` | GET | Evidence source registry |
| `/graph/entities/{id}/relationships` | GET | Edges with evidence status |
| `/methodology/{indicatorId}` | GET | Methodology block by version |

**Response envelope (planned):**

```json
{
  "data": { },
  "meta": {
    "apiVersion": "1.0.0",
    "requestId": "uuid",
    "evidencePolicy": "constitution-v1"
  }
}
```

---

## Future GraphQL

**Schema principles:**

- Queries mirror REST resources — no special score shortcuts
- `Entity` interface with `Country`, `Company`, `University` implementations
- `Indicator` type with nested `Methodology` and `Source` connections
- `GraphEdge` with `evidenceStatus` enum
- No `recommendedEntities` or `trendingScores` root queries

**Example query (illustrative):**

```graphql
query CountryIndicators($id: ID!) {
  country(id: $id) {
    name
    indicators {
      slug
      title
      status
      methodology { whyItExists missingEvidence }
    }
  }
}
```

---

## Future SDK

**Package (planned):** `@cbai/sdk` — TypeScript first, Python second

| Capability | SDK surface |
|------------|-------------|
| Entity fetch | `client.countries.get(id)` |
| Indicator browse | `client.indicators.list({ domain })` |
| Source status | `client.sources.get(slug)` |
| Graph | `client.graph.relationships(entityId)` |
| Version | `client.version()` |

SDK types generated from OpenAPI/GraphQL schema — never hand-maintained parallel types.

---

## Allowed

- Read-only registry and indicator endpoints in v1
- Webhook notifications for source connection status changes (future v2)
- Tenant-scoped API keys with audit log
- Pagination, filtering by entity type and indicator domain
- `410 Gone` for deprecated endpoints with migration link

---

## Forbidden

- Undocumented score or ranking endpoints
- GraphQL fields that bypass evidence wrappers
- Bulk export of fabricated demo dataset
- API responses with confidence percentages without methodology URL
- Breaking changes without version bump
- Public write endpoints without governance review (v1 read-only)

---

## Examples

**Compliant — REST field wrapper**

```json
{
  "gdp": {
    "value": null,
    "evidenceStatus": "not_connected",
    "requiredSources": ["world-bank"],
    "indicatorSlug": "national-accounts"
  }
}
```

**Compliant — indicator response**

```json
{
  "slug": "national-accounts",
  "status": "not_connected",
  "methodologyVersion": "1.0.0"
}
```

**Non-compliant**

```json
{
  "investmentScore": 96.1,
  "confidence": "high"
}
```

---

## Future expansion

- OAuth 2.0 / OIDC for enterprise SSO
- Data residency routing (EU, US regions)
- GraphQL subscriptions for evidence connection events
- Python and Go SDKs
- API compliance scanner (forbidden field detection)
- Developer portal with constitution summary

---

## Cross-references

- [02 — Evidence Standard](./02-evidence-standard.md)
- [03 — Indicator Standard](./03-indicator-standard.md)
- [04 — Entity Standard](./04-entity-standard.md)
- [12 — Versioning Standard](./12-versioning-standard.md)
