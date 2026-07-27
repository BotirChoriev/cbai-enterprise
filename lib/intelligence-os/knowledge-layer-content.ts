/** Progressive knowledge depth layers — shared by Inspector and disclosure UI. */

export type KnowledgeLayerContent = {
  surface?: string | null;
  summary?: string | null;
  evidence?: string | null;
  /** Full dot-path i18n key overriding `evidence` when it is deterministic platform copy. */
  evidenceKey?: "universalWorkspace.seeEntityModule" | null;
  reasoning?: string | null;
  validation?: string | null;
  history?: string | null;
  impact?: string | null;
  legacy?: string | null;
};
