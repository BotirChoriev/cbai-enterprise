# Localization verification — Preview Completion Program

**Branch:** `preview/spatial-world-intelligence`
**Recorded:** 2026-07-22
**Locales:** EN, UZ, RU, TR

---

## Automated checks

| Check | Status | Evidence |
|-------|--------|----------|
| Locale completeness script | **PROVEN_AUTOMATED** | `test:locale-completeness` |
| Localization closure invariants | **PROVEN_AUTOMATED** | `test:localization-closure` (12/12) |
| Platform copy build slices present | **PROVEN_LOCAL** | `lib/i18n/platform-copy-build007-*.ts`, `build008-*.ts` |
| Voice command multilingual fixtures | **PROVEN_AUTOMATED** | Voice test suites |
| Entity indicator localization | **PROVEN_LOCAL** | Countries/companies/universities copy |
| Spatial world intelligence locale tests | **PROVEN_AUTOMATED** | `test:spatial-world-intelligence` (15/15) |

---

## Manual / visual locale passes

| Locale | Surface | Status | Prior artifact |
|--------|---------|--------|----------------|
| EN | Home | **PROVEN_LOCAL** | `final-intelligence-os/locale-en-home.png` (prior program) |
| UZ | Countries | **PROVEN_LOCAL** | locale-uz captures |
| RU | Research | **PROVEN_LOCAL** | locale-ru-research.png |
| TR | Settings | **PROVEN_LOCAL** | locale-tr-settings.png |
| UZ | Company/country/university detail | **MANUAL_REQUIRED** | Safari reality checklist partial |
| TR | Longest-label voice dock | **PROVEN_LOCAL** | voice-operating-navigator captures |

---

## Route coverage

| Route group | localization status in matrix |
|-------------|------------------------------|
| Public journey (/, search, entities, knowledge, research) | **PROVEN_LOCAL** |
| Auth collab shells (`authCollab.*`) | **PROVEN_LOCAL** keys present; placeholders EN-complete |
| Governance preview eyebrow | **PROVEN_LOCAL** |
| Organization org-OS | **PARTIAL** — some org copy not fully verified all locales |

---

## Gaps

- Not all 24 listed routes have locale-specific screenshots in `preview-completion/screenshots/`
- Live Preview locale switch on deployed URL: **EXTERNAL_BLOCKED**
- Professional translation review: **MANUAL_REQUIRED**
