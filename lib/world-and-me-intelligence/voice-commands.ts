export type WimVoiceResult =
  | { readonly kind: "navigate"; readonly href: string; readonly message: string; readonly confirmationRequired: false }
  | {
      readonly kind: "draft_suggestion";
      readonly message: string;
      readonly confirmationRequired: true;
      readonly action: "open_draft" | "explain_relationship" | "change_view";
      readonly view?: string;
    }
  | null;

export function resolveWorldAndMeVoiceCommand(raw: string): WimVoiceResult {
  const text = raw.trim();
  if (!text) return null;
  const lower = text.toLowerCase();

  if (/(send\s+message|email\s+them|auto\s+create|best\s+answer|winner)/i.test(lower)) {
    return {
      kind: "draft_suggestion",
      confirmationRequired: true,
      action: "open_draft",
      message:
        "Voice cannot send external messages, auto-create work, or declare a single best answer. Ask for options or a Draft Work Card.",
    };
  }

  const isWim =
    /(world\s+and\s+me|intelligence\s+map|what\s+changed|change\s+radar|relationship\s+explain|my\s+world|bilim\s+graf|knowledge\s+graph)/i.test(
      lower,
    ) ||
    (/(map|timeline|compare)/i.test(lower) && /(graph|world|intelligence)/i.test(lower));

  if (!isWim) return null;

  if (/(create|link\s+to\s+my\s+work|draft\s+work)/i.test(lower)) {
    return {
      kind: "draft_suggestion",
      confirmationRequired: true,
      action: "open_draft",
      message: "Suggested: open Draft Work Card from map context. Confirmation required; create once.",
    };
  }

  if (/(explain|how\s+is.*related|relationship)/i.test(lower)) {
    return {
      kind: "draft_suggestion",
      confirmationRequired: true,
      action: "explain_relationship",
      message: "Suggested: run Relationship Explainer on two selected nodes. No manufactured paths.",
    };
  }

  for (const view of ["map", "relationships", "timeline", "compare", "my_world"] as const) {
    if (lower.includes(view.replace("_", " ")) || lower.includes(view)) {
      return {
        kind: "draft_suggestion",
        confirmationRequired: true,
        action: "change_view",
        view,
        message: `Suggested: switch World and Me view to ${view}.`,
      };
    }
  }

  return {
    kind: "navigate",
    href: "/graph",
    confirmationRequired: false,
    message: "Open World and Me — Live Intelligence Map.",
  };
}
