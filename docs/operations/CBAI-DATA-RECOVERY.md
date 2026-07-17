# CBAI Data Recovery (BUILD-038)

## Device-local

Data lives in namespaced `localStorage`. Recovery: same browser profile, same origin.

## Supabase (when configured)

- Organizations, memberships, collaborations: tables in migration 0005.
- Backup: Supabase dashboard point-in-time (operator responsibility).
- Audit tables are append-only — do not delete for incident investigation.

## Export

No automated full export in Closed Alpha. Users can copy organization audit and saved sources from UI.
