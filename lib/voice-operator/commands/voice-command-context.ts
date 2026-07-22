/**
 * Voice session command context — temporary only; never silently persists to profile.
 */

import type { VoiceSessionContext } from "@/lib/voice-operator/commands/voice-command-types";
import { mayPersistProfileIdentity } from "@/lib/voice-operator/commands/voice-command-policy";

const emptyContext = (): VoiceSessionContext => ({
  roleHint: null,
  domainId: null,
  domainLabel: null,
  lastActionId: null,
  lastHref: null,
  introduced: false,
  updatedAt: new Date().toISOString(),
});

let sessionContext: VoiceSessionContext = emptyContext();

export function readVoiceSessionContext(): VoiceSessionContext {
  return sessionContext;
}

export function resetVoiceSessionContext(): void {
  sessionContext = emptyContext();
}

export function patchVoiceSessionContext(patch: Partial<VoiceSessionContext>): VoiceSessionContext {
  sessionContext = {
    ...sessionContext,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return sessionContext;
}

export function markVoiceIntroduced(): void {
  patchVoiceSessionContext({ introduced: true });
}

/**
 * Store role/domain as temporary session context only.
 * Permanent profile persistence is intentionally blocked by policy.
 */
export function applyTemporaryRoleContext(input: {
  roleHint: string;
  domainId: string;
  domainLabel: string;
}): VoiceSessionContext {
  if (mayPersistProfileIdentity()) {
    throw new Error("Profile identity persistence is not allowed without confirmation");
  }
  return patchVoiceSessionContext({
    roleHint: input.roleHint,
    domainId: input.domainId,
    domainLabel: input.domainLabel,
  });
}

export function createEmptyVoiceSessionContext(): VoiceSessionContext {
  return emptyContext();
}
