# RI-BUILD-007 — Laboratories Layer

## Summary

Adds a read-only laboratory layer model to Research Intelligence — readiness architecture only, with no live laboratory data.

## Laboratory layer model

Each layer entry includes:

- `laboratoryLayerId`, `relatedTopicIds`
- `supportedLabTypes`, `expectedMetadata`
- `sourceStatus`, `evidenceStatus`
- `limitations`, `futureCapabilities`
- `equipmentSupported`, `safetyEthicsSupported`, `affiliationSupported`
- `humanReviewRequired`, `version`

## Status values

- `source_not_connected`
- `metadata_not_available`
- `future_integration_required`

## Supported future lab types

University laboratory, Government laboratory, Hospital laboratory, Industrial R&D laboratory, Independent research center, Field station, Clinical laboratory, Computational laboratory, Shared core facility, Teaching laboratory

## Expected metadata

laboratoryName, institution, country, city, researchAreas, equipment, methods, projects, researchers, experiments, datasets, publications, patents, safetyProtocols, ethicsApproval, certifications, sourceUrl

## Registry

Readiness-only entries — no actual laboratory records, names, equipment, institutions, or researchers:

- Global readiness profile (all topics)
- Topic-specific readiness for Microbiology, Antibiotic resistance, CRISPR

## Query helpers

- `findLaboratoryLayerById`
- `findLaboratoryLayerByTopic`
- `listLaboratoryTypes`
- `listExpectedLaboratoryMetadataFields`
- `getLaboratoryReadinessForTopic`

## Validation

Checks duplicate layer IDs, broken topic references, invalid status values, and empty type/metadata definitions. Runs at registry load.

## UI integration

Research Topic Detail includes a **Laboratory readiness** section with future lab types, expected metadata, status, equipment/safety/affiliation support, limitations, and future capabilities.

## Not included

- No fake laboratories, equipment, researchers, experiments, or metrics
- No live database connections
- No collaboration or chat

## Copy rules

Use: laboratory records, equipment, projects, methods, safety and ethics, affiliations, not connected yet, future integration, human review.

Avoid: top lab, best lab, ranked lab, success rate, AI conclusion, score.
