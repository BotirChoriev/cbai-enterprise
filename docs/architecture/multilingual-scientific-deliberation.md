# Multilingual Scientific Deliberation

## UI
Deterministic labels via `getSdnCopy(locale)` for EN/UZ/RU/TR.

## Contributions
- Preserve `originalText` + `sourceLanguage`
- Optional `translatedText` beside original; never replaces source
- Low-confidence warnings; human-corrected translation field
- Formulas, units, DOI, proper names preserved in source text

## Consent
- `translationConsent` / `transcriptConsent` on room
- No transcript persistence without consent

## Glossary
`GlossaryTerm` supports approved translations with human reviewer + version.
