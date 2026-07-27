export type SdnVoiceResult =
  | {
      readonly kind: "navigate";
      readonly href: string;
      readonly message: string;
      readonly confirmationRequired: false;
    }
  | {
      readonly kind: "draft_suggestion";
      readonly message: string;
      readonly confirmationRequired: true;
      readonly action: "open_room_composer" | "add_evidence" | "refresh_synthesis" | "debate_to_work";
    }
  | null;

/**
 * Moderator-assistant only. Never decides winners, ranks researchers, or mutates without confirmation.
 */
export function resolveScientificDeliberationVoiceCommand(raw: string): SdnVoiceResult {
  const text = raw.trim();
  if (!text) return null;
  const lower = text.toLowerCase();

  // Constitutional refusals — even without other deliberation markers.
  if (/(who\s+won|winner|permanently\s+true|rank\s+researcher|best\s+scientist|hide\s+counter)/i.test(lower)) {
    return {
      kind: "draft_suggestion",
      confirmationRequired: true,
      action: "open_room_composer",
      message:
        "Voice Operator cannot decide winners, declare permanent truth, rank researchers, or hide counter-evidence. Ask for sources, unknowns, or a Draft Work Card instead.",
    };
  }

  const isDeliberation =
    /(deliberation|munozara|обсужд|müzakere|argument\s+canvas|scientific\s+claim|dalil\s+munozara|debate)/i.test(
      lower,
    ) ||
    (/(evidence|dalil|доказат)/i.test(lower) && /(room|xona|комнат|oda|start|boshl|начн)/i.test(lower));

  if (!isDeliberation && !/(contradiction\s+radar|replication\s+passport|living\s+synthesis|negative\s+results)/i.test(lower)) {
    return null;
  }

  if (/(start|create|boshl|созда|oluştur).*(deliberation|munozara|room|xona|debate)/i.test(lower)) {
    return {
      kind: "draft_suggestion",
      confirmationRequired: true,
      action: "open_room_composer",
      message: "Suggested: open Start scientific deliberation composer. Confirmation required before save.",
    };
  }

  if (/(add|qo['‘]sh|добав).*(evidence|dalil|доказат)/i.test(lower)) {
    return {
      kind: "draft_suggestion",
      confirmationRequired: true,
      action: "add_evidence",
      message: "Suggested: add source-backed evidence. Confirmation required before write.",
    };
  }

  if (/(synthesis|sintez|синтез)/i.test(lower)) {
    return {
      kind: "draft_suggestion",
      confirmationRequired: true,
      action: "refresh_synthesis",
      message: "Suggested: refresh Living Synthesis (time-bound, not final truth). Confirmation required.",
    };
  }

  if (/(work\s+card|operational|debate.?to.?work|ish\s+kart)/i.test(lower)) {
    return {
      kind: "draft_suggestion",
      confirmationRequired: true,
      action: "debate_to_work",
      message: "Suggested: preview Debate-to-Work Operational Object. Confirmation required; create once.",
    };
  }

  if (/(contradiction|replication|negative\s+result|open\s+evidence|dalil)/i.test(lower)) {
    return {
      kind: "navigate",
      href: "/evidence",
      confirmationRequired: false,
      message: "Navigate to Evidence and Scientific Deliberation Network.",
    };
  }

  return {
    kind: "navigate",
    href: "/evidence",
    confirmationRequired: false,
    message: "Open Scientific Deliberation Network on /evidence.",
  };
}
