# CBAI Known Limitations (BUILD-028.5 update)

## Source ingestion

| Limitation | Detail |
|------------|--------|
| Device-local persistence | Saved sources, reviews, and mission links survive reload on this browser only |
| Crossref client-side | Static export prevents server-side Crossref proxy; requests from user browser |
| Metadata only | Crossref records are not full-text evidence |
| Self-review | No reviewer assignment system; review is labeled self-review (device-local) |
| No collaboration | BUILD-030 blocked until canonical persisted objects exist — now implemented locally |
| Probable dedupe | Title/year/author matches do not silently merge |

## Report readiness

Export formats remain honestly unavailable. Readiness is qualitative and requires human-reviewed accepted evidence plus completed impact review.

## Browser verification

Playwright browser regression requires dev server; run separately from unit tests.
