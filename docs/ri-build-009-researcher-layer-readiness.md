# RI-BUILD-009 — Researcher Layer Readiness

## Summary

Adds a read-only researcher readiness model to Research Intelligence — no live researcher profiles, names, or affiliations.

## Researcher readiness model

Each entry includes:

- `researcherLayerId`, `relatedTopicIds`
- `supportedResearcherTypes`, `expectedProfileMetadata`, `verificationSources`
- `sourceStatus`, `evidenceStatus`
- `limitations`, `futureCapabilities`
- `humanReviewRequired`, `version`

## Status values

- `source_not_connected`
- `metadata_not_available`
- `future_integration_required`

## Supported future researcher types

Professor, Research scientist, Postdoctoral researcher, Doctoral student, Graduate student, Laboratory technician, Clinical researcher, Independent researcher, Government researcher, Industry researcher

## Expected profile metadata

fullName, affiliation, role, department, country, researchAreas, ORCID, publications, datasets, patents, experiments, laboratories, funding, collaborations, sourceUrl

## Verification sources

ORCID, University profile, Research institution profile, Government research profile, Publisher author profile, OpenAlex author profile, Crossref contributor metadata, Institutional email verification

## Registry

Readiness-only entries — no actual researcher records:

- Global readiness profile (all topics)
- Topic-specific readiness for Microbiology, Antibiotic resistance

## Query helpers

- `findResearcherLayerById`
- `findResearcherLayerByTopic`
- `listResearcherTypes`
- `listExpectedProfileMetadataFields`
- `listVerificationSources`
- `getResearcherReadinessForTopic`

## UI integration

Researcher readiness is integrated into the **Future research workspace** section on topic detail pages — not a standalone long section. Shows future types, verification sources, profile metadata, limitations, and future capabilities with message: "Researcher profiles are not connected yet."

## Not included

- No fake researchers, names, profiles, institutions, or publications
- No user accounts, collaboration, chat, or live databases

## Copy rules

Use: verified researchers, academic contributors, affiliations, research areas, verification sources, not connected yet, future workspace, human review.

Avoid: top scientist, best researcher, ranked, score, followers, likes, social feed, AI selected.
