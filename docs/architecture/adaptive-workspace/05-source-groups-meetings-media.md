# Source transparency, groups, meetings, media/PDF

- Source disclosure uses existing provenance (`lib/intelligence-os/source-provenance.ts` and Provenance UI). Voice must answer “which sources?” from attached evidence only — never invent sources.
- Groups/meetings/media types live in `lib/collaboration/groups-meetings-media.ts` with honest empty/capability states.
- PDF intake continues via local PDF ingestion (`lib/pdf-ingestion/`); no simulated cloud success when storage is not configured. Making uploads public requires confirmation.
