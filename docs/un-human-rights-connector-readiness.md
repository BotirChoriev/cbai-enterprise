# CBAI UN / Human Rights Connector Readiness

**Version:** 1.0.0  
**Connector:** `connector-united-nations`  
**Source:** `src-un`  
**Implementation:** None — readiness architecture only

## Purpose

The UN / Human Rights Connector Readiness Layer prepares CBAI for future official evidence integration with United Nations and agency publishers related to human rights, governance, and sustainable development. This sprint defines indicator mapping, expected record shapes, validation rules, neutrality requirements, and a readiness report — without live API calls, political conclusions, human rights scoring, or fabricated values.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Indicator family definitions | Live UN or agency API requests |
| CBAI Indicator Framework mapping | HTTP clients and credentials |
| Neutrality ruleset | Human rights scores or rankings |
| Future record schema | Social sentiment scoring |
| Validation helpers | Political endorsements or condemnations |
| Readiness report | User-facing indicator display |

## Supported future indicator areas

| Area | CBAI mapping | Status |
|------|--------------|--------|
| Human Rights | `human-rights-treaty-reporting` | mapped |
| Governance | `institutional-framework` | mapped |
| Judicial System | `judicial-independence-disclosure` | mapped |
| Public Services | `public-service-coverage` | mapped |
| Education | `education-enrollment-statistics` | requires_review |
| Health | `health-system-coverage` | requires_review |
| Employment | `labour-market-statistics` | requires_review |
| Gender Equality | — | planned |
| Child Protection | — | planned |
| Disability Inclusion | — | planned |
| Migration | — | planned |
| Civil Registration | `institutional-framework` | requires_review |
| Sustainable Development | `ndc-submission`, `emissions-inventory`, `sendai-framework-reporting` | mapped |

## Official source families

Reference metadata only — not connected, fetched, or scraped:

| Family ID | Organization |
|-----------|--------------|
| `united-nations-data` | United Nations Data |
| `ohchr` | OHCHR |
| `undp` | UNDP |
| `unicef` | UNICEF |
| `un-women` | UN Women |
| `unhcr` | UNHCR |
| `ilo` | ILO |
| `who` | WHO |
| `unesco` | UNESCO |
| `sdg-global-database` | SDG Global Database |

## Expected data shape

Future records must conform to `UnHumanRightsRecordSchema`:

| Field | Required | Type |
|-------|----------|------|
| `countryCode` | Yes | string (ISO 3166) |
| `countryName` | No | string |
| `indicatorCode` | Yes | string (UN/SDG code reference) |
| `indicatorName` | No | string |
| `year` | Yes | integer |
| `value` | No | number \| null |
| `unit` | No | string |
| `source` | Yes | string |
| `sourceAgency` | Yes | string |
| `methodologyReference` | Yes | string |
| `lastUpdated` | No | ISO 8601 string |
| `license` | No | string |
| `metadata` | No | Record<string, string> |

No sample records are included.

## Mapping strategy

1. **Indicator families** — Each policy area defines families with public UN/SDG code references (taxonomy identifiers, not values).
2. **Source families** — Each family declares contributing UN agency references.
3. **CBAI resolution** — Families map to Global Indicator Framework slugs resolved to full IDs at build time.
4. **Mapping status** — `mapped`, `planned`, or `requires_review` when semantic alignment is incomplete.
5. **Governance gate** — No user-facing values from `planned` or `requires_review` families without review.

## Validation rules

`validateUnHumanRightsRecord()` checks future records for:

| Code | Severity | Condition |
|------|----------|-----------|
| `missing_country_code` | error | Empty or missing country code |
| `unknown_country` | error | Code not in CBAI local country registry |
| `missing_indicator_code` | error | Empty or missing indicator code |
| `unknown_indicator_mapping` | warning | Code not registered or not mapped |
| `missing_year` | error | Missing or invalid year |
| `missing_source` | error | Empty source attribution |
| `missing_source_agency` | error | Empty source agency |
| `missing_methodology_reference` | error | Empty methodology reference |
| `invalid_value_type` | error | Value not finite number or null |
| `social_sentiment_scoring_risk` | error | Prohibited sentiment/popularity language |
| `politically_sensitive_wording_risk` | warning | Political endorsement/condemnation language |

## Neutrality rules

Future implementation must follow `UN_HUMAN_RIGHTS_NEUTRALITY_RULES`:

- No political endorsement or condemnation
- No government popularity metrics
- No social unrest scoring
- No citizen sentiment scoring
- No party or leader recommendations
- No policy prescription
- Source attribution required
- Methodology reference required

## Readiness report

```typescript
import { getUnHumanRightsConnectorReadiness } from "@/lib/connectors/un-human-rights";

const report = getUnHumanRightsConnectorReadiness();
```

Returns: `connectorId`, `status`, `mappedIndicators`, `unmappedIndicators`, `requiredNormalizers`, `verificationChecklist`, `neutralityChecklist`, `limitations`, `nextSteps`.

## Security notes

1. **No credentials in repository** — authenticated endpoints use future vault binding only.
2. **No network in readiness layer** — all data from local catalogs and static definitions.
3. **Official source priority** — records must cite UN or agency sources.
4. **No synthetic values** — null observations remain null.
5. **Political neutrality** — constitution-compliant; no scores, rankings, or political conclusions.

## No-live-API guarantee

This module does not import `fetch`, `http`, or network APIs; does not store tokens or secrets; does not scrape external URLs at runtime; and does not include sample observation values.

## Future implementation steps

1. Complete governance review for `requires_review` families.
2. Define CBAI framework extensions for gender equality, child protection, disability, and migration.
3. Implement UN/agency adapters in Evidence Infrastructure.
4. Apply neutrality and sentiment validation on all ingested records.
5. Wire country codes to Global Registry entity IDs.
6. Attach verified evidence with honest connection labels — no human rights scores.

## Verification

```bash
npm run lint
npm run build
```

## Public API

```typescript
import {
  getUnHumanRightsConnectorReadiness,
  validateUnHumanRightsRecord,
  UN_HUMAN_RIGHTS_NEUTRALITY_RULES,
  UN_HUMAN_RIGHTS_SOURCE_FAMILIES,
} from "@/lib/connectors/un-human-rights";
```
