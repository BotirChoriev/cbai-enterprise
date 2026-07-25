# Adaptive workspace templates and role confirmation

**Templates:** `lib/adaptive-workspace/templates.ts`  
**Draft flow:** `lib/adaptive-workspace/role-discovery.ts`  
**UI:** `components/adaptive-workspace/AdaptiveWorkspaceClient.tsx` (embedded on My Work)

Flow: detect → interpret → confirm → create. Nothing is persisted until the user confirms. Confirm opens the Operational Object composer; there is no silent profile or workspace write.

Templates (student, researcher/scientist, academic/educator, economist, government, investor/analyst, organization, general) are starting structures with editable fields and default privacy `private`.

Mappings: `ADAPTIVE_WORKSPACE_MAPPINGS` documents profile → OO → projects/missions/evidence/meetings/groups/media/follows.
