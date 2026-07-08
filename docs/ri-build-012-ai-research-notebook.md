# RI-BUILD-012 — AI Research Notebook

## Summary

Adds a read-only AI Research Notebook concept to Research Intelligence — an evidence-organizing interface built from catalog data only. Not live AI, chat, or generated conclusions.

## Notebook model

- `notebookId`, `topicId`, `topicName`, `domain`
- `summarySections`, `evidenceFocus`, `openQuestionCategories`
- `negativeResultPurpose`, `graphConnections`, `limitations`
- `futureWorkspaceSupport`, `humanReviewRequired`, `status`, `version`

## Status values

- `catalog_notebook_available`
- `live_evidence_not_connected`
- `ai_generation_not_active`

## Summary sections

Topic overview, Available catalog information, Methods to review, Evidence types to connect, Open question categories, Negative results purpose, Future workspace support, Human scientific review

## Data sources

Built from existing static data only:

- Research topic catalog
- Research graph connections
- Open questions readiness
- Negative results purpose
- Future workspace and limitations lists

## UI integration

Compact **AI Research Notebook** section on topic detail pages with summary, evidence focus, open questions, negative results purpose, limitations, and human review notice.

## Not included

- No live AI generation, chat, message input, or fake notebook history
- No fake summaries, conclusions, recommendations, or predictions

## Copy rules

Use: structured notebook, catalog information, evidence focus, open questions, negative results, human scientific review, live evidence not connected.

Avoid: AI answer, AI conclusion, best method, top finding, prediction, recommendation.
