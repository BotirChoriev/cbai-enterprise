# Privacy, public discovery, multilingual provenance

**Discovery:** `lib/discovery/global-activity.ts` + `/discover`  
**Groups/meetings/media:** `lib/collaboration/groups-meetings-media.ts`

- New work defaults to **Private**.
- Global Activity lists only `visibility: "public"` items. Empty feed is honest (no fabricated popularity).
- Original content language is preserved (`createOriginalContentView`). Translation states: original | translated | translation_pending | unavailable | needs_review. Machine translation is never labeled human-reviewed.
- Live meeting audio translation capability remains `live_audio_pipeline_required`.
- Media upload capability remains `configuration_required` until object storage is configured.
