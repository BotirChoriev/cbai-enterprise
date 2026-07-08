# RI-BUILD-010 — Open Questions & Negative Results

## Summary

Begins the Living Knowledge phase of Research Intelligence with structured readiness objects for open research questions and negative results — not a discussion system, social feed, or user-generated content.

## Open questions model

- `questionId`, `relatedTopicIds`, `questionCategory`, `futureEvidenceSources`, `humanReviewRequired`, `status`

### Categories

Unknown mechanism, Replication needed, Missing dataset, Clinical validation, Field validation, Method comparison, Safety verification, Policy implications

## Negative result model

- `negativeResultId`, `relatedTopicIds`, `futureExperimentTypes`, `futureEvidenceSources`, `humanReviewRequired`, `status`

Purpose: explain why preserving unsuccessful approaches matters in future workspace — never actual failed experiments.

## Registry

Category readiness entries only — no scientific question text, no failed experiment records:

- Global open question categories (3)
- Topic-specific open questions for Microbiology, Antibiotic resistance, CRISPR, Plant disease resistance
- Global negative result readiness + topic-specific for Antibiotic resistance, Microbiology, CRISPR

## UI integration

Compact **Future scientific knowledge** section on topic detail with:

- Open research questions (up to 3 category cards)
- Negative results overview

Each card: why it matters, status, future workspace support, human review.

## Not included

- No fake scientific data, experiments, researchers, or publications
- No discussion, social feed, or UGC

## Copy rules

Use: open research questions, future evidence, negative results, replication, human scientific review.

Avoid: failure, wrong, bad experiment, best solution, AI answer.
