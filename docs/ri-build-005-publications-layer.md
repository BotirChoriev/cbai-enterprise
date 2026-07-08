# RI-BUILD-005 — Publications Layer

## Summary

Adds a read-only publication layer model to Research Intelligence — readiness architecture only, with no live publication data.

## Publication layer model

Each layer entry includes:

- `publicationLayerId`, `relatedTopicIds`
- `supportedSourceTypes`, `expectedMetadata`
- `sourceStatus`, `evidenceStatus`
- `limitations`, `futureCapabilities`
- `humanReviewRequired`, `version`

## Status values

- `source_not_connected`
- `metadata_not_available`
- `future_integration_required`

## Supported future source types

PubMed, Crossref, OpenAlex, Semantic Scholar, arXiv, DOAJ, Google Scholar, University repositories, Publisher APIs

## Expected metadata

title, authors, affiliations, abstract, journal, publicationDate, doi, keywords, methods, datasets, funding, citations, license, sourceUrl

## Registry

Readiness-only entries — no actual publication records, titles, authors, DOIs, or journals:

- Global readiness profile (all topics)
- Topic-specific readiness for Microbiology, Antibiotic resistance, CRISPR

## Query helpers

- `findPublicationLayerById`
- `findPublicationLayerByTopic`
- `listPublicationSourceTypes`
- `listExpectedMetadataFields`
- `getPublicationReadinessForTopic`

## Validation

Checks duplicate layer IDs, broken topic references, invalid status values, and empty source/metadata definitions. Runs at registry load.

## UI integration

Research Topic Detail includes a **Publication readiness** section with future sources, expected metadata, current status, limitations, and future capabilities.

## Not included

- No fake publications, authors, journals, or citation counts
- No live database connections
- No collaboration or chat

## Copy rules

Use: publication sources, research literature, metadata, not connected yet, future integration, human review.

Avoid: top papers, best publication, high impact, citation score, ranking, AI summary.
