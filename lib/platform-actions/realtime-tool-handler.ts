/** Realtime tool call handling — dedupe, validate, execute, respond. */

import { resolvePlatformActionFromIntent } from "@/lib/platform-actions/resolve-platform-action";
import { getPlatformActionDefinition } from "@/lib/platform-actions/registry";
import {
  PLATFORM_REALTIME_TOOL_NAME,
  validatePlatformToolArguments,
} from "@/lib/platform-actions/realtime-tool-schemas";
import type {
  PlatformActionContext,
  PlatformActionId,
  PlatformActionResult,
  RealtimeToolCallRequest,
  RealtimeToolCallResult,
} from "@/lib/platform-actions/types";

export type RealtimeToolHandlerState = {
  readonly completedCallIds: Set<string>;
  readonly sessionGeneration: number;
};

export function createRealtimeToolHandlerState(sessionGeneration = 0): RealtimeToolHandlerState {
  return { completedCallIds: new Set(), sessionGeneration };
}

export function platformToolCallToResult(
  request: RealtimeToolCallRequest,
  context: PlatformActionContext,
  state: RealtimeToolHandlerState,
  currentGeneration: number,
): RealtimeToolCallResult {
  if (currentGeneration !== state.sessionGeneration) {
    return {
      callId: request.callId,
      output: { ok: false, code: "stale_session", messageKey: "platformAction.staleSession" },
    };
  }

  if (state.completedCallIds.has(request.callId)) {
    return {
      callId: request.callId,
      output: { ok: false, code: "duplicate_call", messageKey: "platformAction.duplicateCall" },
    };
  }

  if (request.name !== PLATFORM_REALTIME_TOOL_NAME) {
    return {
      callId: request.callId,
      output: { ok: false, code: "unknown_tool", messageKey: "platformAction.unknownTool" },
    };
  }

  let parsedArgs: unknown;
  try {
    parsedArgs = JSON.parse(request.argumentsJson || "{}");
  } catch {
    return {
      callId: request.callId,
      output: { ok: false, code: "malformed_arguments", messageKey: "platformAction.malformedToolCall" },
    };
  }

  const args = validatePlatformToolArguments(parsedArgs);
  if (!args) {
    return {
      callId: request.callId,
      output: { ok: false, code: "malformed_arguments", messageKey: "platformAction.malformedToolCall" },
    };
  }

  const def = getPlatformActionDefinition(args.action_id);
  if (!def) {
    return {
      callId: request.callId,
      output: { ok: false, code: "unknown_action", messageKey: "platformAction.unknownAction" },
    };
  }

  state.completedCallIds.add(request.callId);

  const result = resolvePlatformActionFromIntent(
    {
      actionId: args.action_id as PlatformActionId,
      confidence: "high",
      params: {
        entityId: args.entity_id,
        entityName: args.entity_name,
        topicId: args.topic_id,
        query: args.query,
        title: args.title,
        userStatement: args.user_statement ?? context.originalText,
      },
      originalText: args.user_statement ?? context.originalText,
    },
    { ...context, originalText: args.user_statement ?? context.originalText },
  );

  return {
    callId: request.callId,
    output: serializePlatformActionResult(result),
  };
}

function serializePlatformActionResult(result: PlatformActionResult): Record<string, unknown> {
  if (!result.ok) {
    return {
      ok: false,
      code: result.code,
      messageKey: result.messageKey,
      clarifyOptions: result.clarifyOptions?.map((option) => option.id) ?? [],
    };
  }

  return {
    ok: true,
    actionId: result.actionId,
    href: result.navigation?.href ?? null,
    requiresConfirmation: Boolean(result.mutation),
    draftOpened: Boolean(result.mutation),
    localControl: result.localControl ?? null,
    messageKey: result.messageKey ?? null,
    guidance: result.guidance
      ? {
          sectionKey: result.guidance.sectionKey,
          purposeKey: result.guidance.purposeKey,
          nextActions: result.guidance.nextActions.map((action) => action.id),
        }
      : null,
  };
}

export function buildRealtimeToolOutputMessages(result: RealtimeToolCallResult): readonly Record<string, unknown>[] {
  return [
    {
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: result.callId,
        output: JSON.stringify(result.output),
      },
    },
    { type: "response.create" },
  ];
}
