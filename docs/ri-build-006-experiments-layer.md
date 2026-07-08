# RI-BUILD-006 — Experiments Layer

## Summary

Adds a read-only experiment layer model to Research Intelligence — readiness architecture only, with no live experiment data.

## Experiment layer model

Each layer entry includes:

- `experimentLayerId`, `relatedTopicIds`
- `supportedExperimentTypes`, `expectedMetadata`
- `sourceStatus`, `evidenceStatus`
- `limitations`, `futureCapabilities`
- `negativeResultsSupported`, `replicationSupported`
- `humanReviewRequired`, `version`

## Status values

- `source_not_connected`
- `metadata_not_available`
- `future_integration_required`

## Supported future experiment types

Laboratory experiment, Field experiment, Clinical experiment, Computational experiment, Simulation, Replication study, Longitudinal study, Pilot study, Negative result, Protocol comparison

## Expected metadata

experimentTitle, researchQuestion, method, materials, variables, controls, sampleSize, environment, duration, results, limitations, replicationStatus, negativeResultStatus, datasetReference, ethicsApproval, sourceUrl

## Registry

Readiness-only entries — no actual experiment records, titles, methods, results, or sample sizes:

- Global readiness profile (all topics)
- Topic-specific readiness for Microbiology, Antibiotic resistance, CRISPR

## Query helpers

- `findExperimentLayerById`
- `findExperimentLayerByTopic`
- `listExperimentTypes`
- `listExpectedExperimentMetadataFields`
- `getExperimentReadinessForTopic`

## Validation

Checks duplicate layer IDs, broken topic references, invalid status values, and empty type/metadata definitions. Runs at registry load.

## UI integration

Research Topic Detail includes an **Experiment readiness** section with future types, expected metadata, status, negative results support, replication support, limitations, and future capabilities.

## Not included

- No fake experiments, researchers, results, or success/failure claims
- No live database connections
- No collaboration or chat

## Copy rules

Use: experiment records, methods, variables, replication, negative results, not connected yet, future integration, human review.

Avoid: successful method, best method, proven result, top experiment, AI conclusion, ranking, score.
