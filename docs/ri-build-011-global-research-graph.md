# RI-BUILD-011 — Global Research Graph

## Summary

Turns Research Intelligence from a static catalog into a connected research navigation experience using catalog metadata only — no live scientific proof.

## Graph model

**Nodes:** `nodeId`, `nodeType`, `label`, `description`, `href`, `status`

**Edges:** `edgeId`, `sourceNodeId`, `targetNodeId`, `relationshipType`, `status`

### Node types

research_topic, domain, method, evidence_type, future_object

### Relationship types

belongs_to_domain, uses_method, requires_evidence, related_topic, future_supports

### Status values

catalog_available, not_connected_yet, future_workspace

## Graph building rules

Uses only existing catalog data:

- Topics, domains, relatedMethods, relatedEvidenceTypes from `research-topics.ts`
- Future objects from `RESEARCH_TOPIC_FUTURE_SUPPORTS`

Related topics derived only from same domain, shared methods, or shared evidence types — labeled "Related by shared catalog metadata."

## UI

### `/research`

**Global Research Graph** section with explanation, compact preview, legend, and link to start with a topic.

### `/research/[topicId]`

**Research graph** section with focused topic node, domain, methods, evidence types, related topics, and future objects.

## Validation

`validateResearchGraph()` checks duplicate IDs, broken edge references, unknown types, and invalid statuses. Topic graphs validate at build time.

## Honest notice

Every graph includes: "This graph uses catalog connections only. It does not prove scientific relationships."

## Not included

- No fake researchers, publications, experiments, or metrics
- No live databases, chat, or collaboration
- No external graph library or animations

## Copy rules

Use: research graph, related research topics, shared methods, evidence types, future research objects, catalog connection, not connected yet.

Avoid: AI discovered, scientific proof, causal link, best method, ranked, score, prediction.
