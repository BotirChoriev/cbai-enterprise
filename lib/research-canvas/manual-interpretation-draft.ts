/**
 * Device-local in-session drafts for manual interpretation input — scoped per Smart Idea.
 */

export const MIN_MANUAL_DESCRIPTION_LENGTH = 30;

export function isValidManualDescription(text: string): boolean {
  return text.trim().length >= MIN_MANUAL_DESCRIPTION_LENGTH;
}

export type ManualInterpretationDraftStore = {
  read(ideaId: string): string;
  write(ideaId: string, text: string): void;
  clear(ideaId: string): void;
};

export function createManualInterpretationDraftStore(): ManualInterpretationDraftStore {
  const drafts = new Map<string, string>();

  return {
    read(ideaId: string) {
      return drafts.get(ideaId) ?? "";
    },
    write(ideaId: string, text: string) {
      drafts.set(ideaId, text);
    },
    clear(ideaId: string) {
      drafts.delete(ideaId);
    },
  };
}

/** Shared in-session store for the Research Canvas client tree. */
export const manualInterpretationDraftStore = createManualInterpretationDraftStore();
