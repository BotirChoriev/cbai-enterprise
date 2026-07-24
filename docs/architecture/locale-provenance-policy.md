# Locale Provenance Policy

**Branch:** `preview/spatial-world-intelligence`
**Scope:** Missions, Projects, Operational Objects, companion memory

## Principles

1. **Preserve user text exactly** — never silently translate stored user content.
2. **Translate platform labels at render time** — buttons, statuses, empty states, and validation use dictionary keys.
3. **Backward compatibility** — records without locale metadata continue to work; migrations are idempotent.
4. **Official names stay in source language** — registry names and source quotations remain as recorded; UI labels them as source material.

## Metadata fields

| Field | When set | Purpose |
|-------|----------|---------|
| `contentLocale` | On user-authored text save | Language the user wrote in |
| `createdLocale` | On record creation (legacy fallback) | UI locale active at creation |
| `systemCopyKey` | On deterministic platform strings | Render-time translation key |

Unknown fields, IDs, timestamps, and relationships are always preserved.

## Display rules

- Show compact **“stored in {language}”** only when locale differs from active UI and helps orientation.
- Do not re-translate user titles, problem statements, notes, or evidence quotations.
- Official registered entity names and catalog source text may appear in their official language with a **source material** label when shown beside UI copy.

## Migration

- `lib/persistence/local-to-shared-org-migration.ts` and operational-object stores apply locale fields additively.
- Re-running migration does not duplicate records or overwrite user text.

## Voice and commands

- Voice Operator instructions follow active UI locale.
- Command interpreter produces draft cards with locale provenance on inferred fields; user confirms before creation.
