/** Progressive knowledge depth layers — shared by Inspector and disclosure UI. */

export type KnowledgeLayerContent = {
  surface?: string | null;
  summary?: string | null;
  evidence?: string | null;
  reasoning?: string | null;
  validation?: string | null;
  history?: string | null;
  impact?: string | null;
  legacy?: string | null;
};
