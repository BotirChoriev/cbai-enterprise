/**
 * Identity FAQ intent matching — deterministic, locale-aware.
 */

import { normalizePlatformText } from "@/lib/platform-actions/normalize-text";
import type { CbaiIdentityFaqKind } from "@/lib/voice-operator/identity/cbai-identity";

type FaqPattern = {
  readonly kind: CbaiIdentityFaqKind;
  readonly patterns: readonly RegExp[];
};

const FAQ_PATTERNS: readonly FaqPattern[] = [
  {
    kind: "what_is",
    patterns: [
      /cbai\s+nima/i,
      /what\s+is\s+cbai/i,
      /что\s+такое\s+cbai/i,
      /cbai\s+nedir/i,
      /cbai\s+haqida\s+gapir/i,
    ],
  },
  {
    kind: "creator",
    patterns: [
      /kim\s+yarat/i,
      /who\s+(created|built|initiated)/i,
      /кто\s+создал/i,
      /kim\s+geliştir/i,
      /botir/i,
    ],
  },
  {
    kind: "purpose",
    patterns: [/maqsadi\s+nima/i, /what\s+is\s+(its\s+)?purpose/i, /какова\s+цель/i, /amacı\s+ne/i],
  },
  {
    kind: "essence",
    patterns: [/mohiyati\s+nima/i, /what\s+is\s+(its\s+)?essence/i, /в\s+чём\s+суть/i, /özü\s+ne/i],
  },
  {
    kind: "serves",
    patterns: [/nimaga\s+xizmat/i, /who\s+(does\s+it\s+)?serve/i, /кому\s+служит/i, /kime\s+hizmet/i],
  },
  {
    kind: "vision",
    patterns: [/viz(yoni|ioni)\s+nima/i, /what\s+is\s+(its\s+)?vision/i, /каково\s+видение/i, /vizyonu\s+ne/i],
  },
  {
    kind: "is_human",
    patterns: [/cbai\s+insonmi/i, /are\s+you\s+human/i, /ты\s+человек/i, /insan\s+mısın/i, /sen\s+insonmisan/i],
  },
  {
    kind: "is_chatbot",
    patterns: [/oddiy\s+chatbot/i, /just\s+(another\s+)?chatbot/i, /просто\s+чатбот/i, /sadece\s+chatbot/i],
  },
  {
    kind: "vs_google_chatgpt",
    patterns: [/google.*chatgpt/i, /chatgpt.*google/i, /farqi\s+nima/i, /how\s+.*different/i, /чем\s+отлича/i],
  },
  {
    kind: "makes_decisions",
    patterns: [
      /qaror\s+qiladimi/i,
      /make\s+decisions?\s+for\s+me/i,
      /принимает\s+решения/i,
      /benim\s+için\s+karar/i,
    ],
  },
];

export function matchIdentityFaqIntent(text: string): CbaiIdentityFaqKind | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const normalized = normalizePlatformText(trimmed);
  for (const entry of FAQ_PATTERNS) {
    if (entry.patterns.some((re) => re.test(trimmed) || re.test(normalized))) {
      return entry.kind;
    }
  }
  return null;
}
