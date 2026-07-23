# Official Connector Foundation — Phase 1

Additive architecture on Preview. **No live external source connections.**

## What Phase 1 includes

1. Source registry (`source-registry.ts`) — planned sources only
2. Connector contracts/types (`types.ts`, `connector-contracts.ts`) — `liveEnabled: false`
3. Fetch adapter (`fetch-adapter.ts`) — timeout, retry, rate-limit classification
4. Runtime response validation (`validate.ts`)
5. Data normalization (`normalize.ts`)
6. Provenance metadata (required fields on every draft)
7. `retrievedAt` / `lastCheckedAt`
8. Freshness state
9. Connector health state
10. Timeout and retry handling
11. Rate-limit classification
12. Cache interface (`cache.ts`)
13. Audit logging (`audit.ts`)
14. Duplicate prevention (`store.ts`)
15. Safe missing-source fallback (`missing-source.ts`)

## Required provenance fields

- sourceName, sourceType, officialSourceUrl, datasetOrEndpoint
- indicatorName, jurisdiction, referencePeriod
- retrievedAt, lastCheckedAt, publicationDate (nullable)
- unit, transformationNotes
- verificationState, freshnessState, connectorHealth

## Explicitly out of scope

- Connecting World Bank / UN / OECD / BLS / SEC / Census / BEA as live
- Inventing sample evidence
- Marking any connector live
- Replacing existing evidence placeholders
- Changes to Voice Operator or Digital Assistant OS

## Next phase (World Bank first)

Wire `fconn-world-bank-wdi` to the World Bank WDI API using this foundation’s fetch → validate → normalize → provenance → store path, set `liveEnabled` only after a successful verified fetch, and never invent values on failure (use `missingSourceFallback`).
