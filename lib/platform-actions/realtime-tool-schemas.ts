/** OpenAI Realtime tool definitions — allowlisted platform actions only. */

import { PLATFORM_ACTION_IDS, getPlatformActionDefinition } from "@/lib/platform-actions/registry";

export const PLATFORM_REALTIME_TOOL_NAME = "execute_platform_action";

export type PlatformToolArgumentShape = {
  readonly action_id: string;
  readonly entity_id?: string;
  readonly entity_name?: string;
  readonly topic_id?: string;
  readonly query?: string;
  readonly title?: string;
  readonly user_statement?: string;
};

const READ_ONLY_ACTION_IDS = PLATFORM_ACTION_IDS.filter((id) => getPlatformActionDefinition(id)?.readOnly);

export function buildPlatformRealtimeTools(): readonly Record<string, unknown>[] {
  return [
    {
      type: "function",
      name: PLATFORM_REALTIME_TOOL_NAME,
      description:
        "Execute a safe, allowlisted CBAI platform action such as navigation, opening an entity, or opening a draft work card. Never invent routes or save data without user confirmation.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          action_id: {
            type: "string",
            enum: PLATFORM_ACTION_IDS,
            description: "Canonical platform action identifier.",
          },
          entity_id: { type: "string", description: "Entity id for country, company, or university actions." },
          entity_name: { type: "string", description: "Display name for entity actions." },
          topic_id: { type: "string", description: "Research topic id when opening a topic page." },
          query: { type: "string", description: "Optional search query." },
          title: { type: "string", description: "Draft title for compose actions." },
          user_statement: { type: "string", description: "Exact user statement for provenance." },
        },
        required: ["action_id"],
      },
    },
  ];
}

export function validatePlatformToolArguments(raw: unknown): PlatformToolArgumentShape | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const actionId = typeof record.action_id === "string" ? record.action_id.trim() : "";
  if (!actionId || !getPlatformActionDefinition(actionId)) return null;

  const optionalString = (key: string): string | undefined => {
    const value = record[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  const unknownKeys = Object.keys(record).filter(
    (key) =>
      !["action_id", "entity_id", "entity_name", "topic_id", "query", "title", "user_statement"].includes(key),
  );
  if (unknownKeys.length > 0) return null;

  return {
    action_id: actionId,
    entity_id: optionalString("entity_id"),
    entity_name: optionalString("entity_name"),
    topic_id: optionalString("topic_id"),
    query: optionalString("query"),
    title: optionalString("title"),
    user_statement: optionalString("user_statement"),
  };
}

export function isReadOnlyPlatformToolAction(actionId: string): boolean {
  return READ_ONLY_ACTION_IDS.includes(actionId as (typeof READ_ONLY_ACTION_IDS)[number]);
}
