# CBAI World Bank Connector Readiness

**Version:** 1.0.0  
**Connector:** `connector-world-bank`  
**Source:** `src-world-bank`  
**Implementation:** None — readiness architecture only

## Purpose

The World Bank Connector Readiness Layer prepares CBAI for future official evidence integration with World Bank Open Data and World Development Indicators (WDI). This sprint defines indicator mapping, expected record shapes, validation rules, and a readiness report — without live API calls, fetch, HTTP, credentials, or fabricated values.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Indicator family definitions | Live WDI API requests |
| CBAI Indicator Framework mapping | HTTP clients and credentials |
| Future record schema | Sample data or fake values |
| Validation helpers | User-facing indicator display |
| Readiness report | Runtime execution |

## Supported future indicator areas

| Area | CBAI mapping | Status |
|------|--------------|--------|
| Economy | `national-accounts` | mapped |
| Trade | `trade-flow-disclosure` | mapped |
| Employment | `labour-market-statistics` | mapped |
| Infrastructure | `infrastructure-asset-registry` | requires_review |
| Energy | `energy-mix-disclosure` | mapped |
| Health | `health-system-coverage` | mapped |
| Education | `education-enrollment-statistics` | mapped |
| Digital Development | `digital-connectivity` | mapped |
| Investment | `fdi-registration` | requires_review |
| Industry | `industry-classification` | requires_review |
| Agriculture | `agriculture-production` | mapped |
| Climate | `emissions-inventory` | mapped |

Additional family: fiscal transparency proxies → `budget-document-publication` (**planned** — WDI fiscal aggregates do not substitute for open budget documents).

## Expected data shape

Future World Bank records must conform to `WorldBankRecordSchema`:

| Field | Required | Type |
|-------|----------|------|
| `countryCode` | Yes | string (ISO 3166) |
| `countryName` | No | string |
| `indicatorCode` | Yes | string (WDI code reference) |
| `indicatorName` | No | string |
| `year` | Yes | integer |
| `value` | No | number \| null |
| `unit` | No | string |
| `source` | Yes | string |
| `lastUpdated` | No | ISO 8601 string |
| `license` | No | string |
| `metadata` | No | Record<string, string> |

No sample records are included in this architecture.

## Mapping strategy

1. **Indicator families** — Each World Bank policy area defines a family with public WDI code references (taxonomy identifiers, not values).
2. **CBAI resolution** — Families map to Global Indicator Framework slugs resolved to full IDs at build time.
3. **Mapping status** — `mapped`, `planned`, or `requires_review` when semantic alignment is incomplete.
4. **Governance gate** — `requires_review` and `planned` families must not auto-populate user-facing indicators.

```typescript
import { resolveCbaiIndicatorIdFromWorldBankCode } from "@/lib/connectors/world-bank";

const cbaiId = resolveCbaiIndicatorIdFromWorldBankCode("NY.GDP.MKTP.CD");
// Returns CBAI indicator ID when mapped, null otherwise
```

## Validation rules

`validateWorldBankRecord()` checks future records for:

| Code | Severity | Condition |
|------|----------|-----------|
| `missing_country_code` | error | Empty or missing country code |
| `unknown_country` | error | Code not in CBAI local country registry |
| `missing_indicator_code` | error | Empty or missing WDI code |
| `unknown_indicator_mapping` | warning | Code not registered or not mapped |
| `missing_year` | error | Missing or invalid year (1900–2200) |
| `missing_source` | error | Empty source attribution |
| `invalid_value_type` | error | Value not finite number or null |

Validation does not execute against live World Bank data.

## Readiness report

```typescript
import { getWorldBankConnectorReadiness } from "@/lib/connectors/world-bank";

const report = getWorldBankConnectorReadiness();
```

Returns:

- `connectorId`, `sourceId`, `status`
- `mappedIndicators` / `unmappedIndicators`
- `requiredNormalizers` — ISO country, date, unit, currency
- `verificationChecklist` — six governance requirements
- `limitations` — architectural constraints
- `nextSteps` — future implementation sequence

## Security notes

1. **No credentials in repository** — API keys referenced only via future vault paths in connector architecture.
2. **No network in readiness layer** — all data derived from local catalogs and static definitions.
3. **Official source priority** — records must include World Bank source attribution.
4. **No synthetic values** — null observations remain null; no interpolation or AI generation.
5. **Constitution compliance** — mapping readiness only; no scores, rankings, or fabricated indicators.

## No-live-API guarantee

This module:

- Does not import `fetch`, `http`, or Node network APIs
- Does not store tokens, secrets, or API keys
- Does not scrape or request external URLs at runtime
- Does not include sample observation values

Static URLs in documentation and connector metadata are reference links only.

## Future implementation steps

1. Complete governance review for `requires_review` families (infrastructure, investment, industry).
2. Resolve `planned` budget transparency proxy mapping.
3. Implement WDI adapter in Evidence Infrastructure (outside this module).
4. Provision credentials in secure vault.
5. Apply required normalizers (`norm-country-iso3166`, `norm-date-iso8601`, `norm-unit-si`, `norm-currency-iso4217`).
6. Bind country codes to Global Registry entity IDs.
7. Validate ingested records with `validateWorldBankRecord()`.
8. Attach verified evidence to country entities with honest connection labels.
9. Transition connector status: `planned` → `ready` → `connected`.

## Integration

| Layer | Role |
|-------|------|
| `lib/connectors/` | Parent connector registry (`connector-world-bank`) |
| `lib/evidence-infrastructure/` | Source record, adapters, normalizers |
| `lib/indicator-framework/` | Target indicator IDs for mapping |
| `lib/registry/` | Future country entity binding |
| `lib/governance/` | Verification and no-synthetic-values rules |

## Verification

```bash
npm run lint
npm run build
```

## Public API

```typescript
import {
  getWorldBankConnectorReadiness,
  validateWorldBankRecord,
  getMappedWorldBankIndicators,
  WORLD_BANK_INDICATOR_FAMILIES,
} from "@/lib/connectors/world-bank";
```
