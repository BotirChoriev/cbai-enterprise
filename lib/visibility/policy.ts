/**
 * Canonical visibility policy (DD-PC-006).
 * Default private. Public never implicit. Attachments never broaden silently.
 */

export type VisibilityScope = "private" | "team" | "public";

export type VisibilityChangeRequest = {
  readonly from: VisibilityScope;
  readonly to: VisibilityScope;
  readonly includeAttachments: boolean;
  readonly rightsConfirmed: boolean;
  readonly consentConfirmed: boolean;
  readonly licenseSelected: boolean;
  readonly humanConfirmed: boolean;
};

export const VISIBILITY_DEFAULT: VisibilityScope = "private";

export function mayFinalizeVisibilityChange(req: VisibilityChangeRequest): {
  ok: boolean;
  reason: string | null;
} {
  if (req.from === req.to) return { ok: true, reason: null };
  if (req.to === "public") {
    if (!req.humanConfirmed) return { ok: false, reason: "confirmation_required" };
    if (!req.rightsConfirmed || !req.consentConfirmed || !req.licenseSelected) {
      return { ok: false, reason: "rights_incomplete" };
    }
  }
  if (req.to === "team" && !req.humanConfirmed) {
    return { ok: false, reason: "confirmation_required" };
  }
  // Public cannot auto-include private attachments without explicit include flag + confirmation.
  if (req.to === "public" && req.includeAttachments && !req.humanConfirmed) {
    return { ok: false, reason: "attachment_publication_confirmation_required" };
  }
  return { ok: true, reason: null };
}

export function attachmentVisibility(
  parent: VisibilityScope,
  attachmentDeclared: VisibilityScope,
): VisibilityScope {
  // Attachments inherit or narrow — never broaden.
  const rank: Record<VisibilityScope, number> = { private: 0, team: 1, public: 2 };
  return rank[attachmentDeclared] <= rank[parent] ? attachmentDeclared : parent;
}
