/**
 * Research Intelligence voice commands — read-only navigate or draft suggestion.
 */

import { RESEARCH_TOPICS } from "@/lib/research/research-topics";

export type GriVoiceResult =
  | {
      readonly type: "navigate";
      readonly href: string;
      readonly message: string;
      readonly idempotencyKey: string;
    }
  | {
      readonly type: "suggest_draft";
      readonly preset: "control_cabinet" | "evidence_request" | "meeting_plan" | "research_question";
      readonly message: string;
      readonly idempotencyKey: string;
      readonly requiresHumanConfirmation: true;
    }
  | {
      readonly type: "message";
      readonly message: string;
      readonly idempotencyKey: string;
    };

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u02bb\u02bcʻ''`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveGlobalResearchIntelligenceVoiceCommand(
  rawInput: string,
): GriVoiceResult | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;
  const n = normalize(trimmed);
  const key = `gri:${n}`;

  const isResearchIntent =
    /research|tadqiqot|исследован|araştırma|opportunity|imkoniyat|control cabinet|scientific work|methodology|replication|grant|seminar|library|publication|global research/i.test(
      trimmed,
    );
  if (!isResearchIntent) return null;

  if (/stop listening|close (the )?operator/i.test(trimmed)) {
    return {
      type: "message",
      message: "Stop/Close is handled by Voice Operator lifecycle — releasing mic/audio.",
      idempotencyKey: key,
    };
  }

  if (/evidence request|dalil so|запрос доказательств|kanıt talebi/i.test(trimmed)) {
    return {
      type: "suggest_draft",
      preset: "evidence_request",
      message: "Prepared an Evidence Request Draft Work Card. Nothing is saved until you confirm.",
      idempotencyKey: key,
      requiresHumanConfirmation: true,
    };
  }

  if (/meeting plan|uchrashuv|план встречи|toplantı/i.test(trimmed)) {
    return {
      type: "suggest_draft",
      preset: "meeting_plan",
      message: "Prepared a Meeting Plan draft. Consent required before recording or assignments.",
      idempotencyKey: key,
      requiresHumanConfirmation: true,
    };
  }

  if (/control cabinet|create scientific|scientific work|loyiha yarat|создай.*исследован/i.test(trimmed)) {
    return {
      type: "suggest_draft",
      preset: "control_cabinet",
      message: "Prepared Scientific Control Cabinet draft. Confirmation required before create.",
      idempotencyKey: key,
      requiresHumanConfirmation: true,
    };
  }

  if (/opportunity|imkoniyat|grant|radar|fırsat|возможност/i.test(trimmed)) {
    return {
      type: "navigate",
      href: "/research?view=opportunities",
      message: "Opening Opportunity Radar — verified dated records only.",
      idempotencyKey: key,
    };
  }

  if (/match|moslash|подбор|eşleş/i.test(trimmed)) {
    return {
      type: "navigate",
      href: "/research?view=match",
      message: "Opening Academic/Research Match — 3–5 explainable options.",
      idempotencyKey: key,
    };
  }

  if (/library|nashr|publication|библиотека|kütüphane/i.test(trimmed)) {
    return {
      type: "navigate",
      href: "/research?view=library",
      message: "Opening Scientific Library Bridge — adapters may be not connected.",
      idempotencyKey: key,
    };
  }

  if (/stopped|inconclusive|failed|to'xtatilgan|останов|başarısız/i.test(trimmed)) {
    return {
      type: "navigate",
      href: "/research?view=lifecycle&state=stopped",
      message: "Opening stopped/inconclusive lifecycle surface — reasons only when sourced.",
      idempotencyKey: key,
    };
  }

  const topic = RESEARCH_TOPICS.find((t) => n.includes(normalize(t.topicName).slice(0, 12)));
  if (topic) {
    return {
      type: "navigate",
      href: `/research/${encodeURIComponent(topic.topicId)}`,
      message: `Opening catalog topic ${topic.topicName}.`,
      idempotencyKey: key,
    };
  }

  return {
    type: "navigate",
    href: "/research?view=intelligence",
    message: "Opening Global Research Intelligence Network.",
    idempotencyKey: key,
  };
}
