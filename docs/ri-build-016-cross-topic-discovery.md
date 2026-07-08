# RI-BUILD-016 — Cross-Topic Research Discovery

## Summary

Adds catalog-based cross-topic research discovery so users can find related research topics from shared domain, methods, evidence types, and future research objects — without fake data, live databases, or ranking scores.

## Discovery model

Each `CrossTopicDiscovery` record includes:

- `discoveryId`, `sourceTopicId`, `relatedTopicId`
- `relationshipReasons`: `same_domain`, `shared_method`, `shared_evidence_type`, `shared_future_object`
- `sharedMethods`, `sharedEvidenceTypes`, `sharedDomain`, `futureObjects`
- `status`: `catalog_connection` (metadata links are not scientific proof)
- `humanReviewRequired`, `version`

Primary links require at least one of same domain, shared method, or shared evidence type. Shared future objects augment those connections.

## UI integration

| Surface | Section | Limit |
|---------|---------|-------|
| Research Workspace Explorer | Related research topics | 8 |
| Topic detail page | Related topics (compact) | 6 |

Every section displays:

> These connections come from catalog metadata. They are not scientific proof.

## Key files

- `lib/research/discovery/discovery-types.ts`
- `lib/research/discovery/discovery-builder.ts`
- `lib/research/discovery/discovery-query.ts`
- `lib/research/discovery/discovery-validation.ts`
- `components/research/discovery/CrossTopicDiscovery.tsx`
- `components/research/discovery/DiscoveryTopicCard.tsx`
- `components/research/discovery/DiscoveryReasonBadge.tsx`
- `components/research/discovery/DiscoveryPath.tsx`

## Non-goals

- No fake researchers, publications, or experiments
- No live database connections
- No chat, collaboration, or AI discovery language
- No scores, rankings, or causal claims

## Verification

```bash
npm run lint
npm run build
```
