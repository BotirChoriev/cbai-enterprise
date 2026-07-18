/** VAD / turn detection — conservative for longer Uzbek sentences. */

export const VOICE_VAD_CONFIG = {
  /** Milliseconds of silence before end-of-turn (conservative for Uzbek). */
  silenceDurationMs: 900,
  /** Minimum speech duration before a turn can finalize. */
  minSpeechDurationMs: 400,
  /** Allow user barge-in while assistant is responding. */
  bargeInEnabled: true,
} as const;

export type VadPhase = "idle" | "speech_started" | "speech_ended";

export function nextVadPhase(current: VadPhase, hasSpeech: boolean): VadPhase {
  if (current === "idle" && hasSpeech) return "speech_started";
  if (current === "speech_started" && !hasSpeech) return "speech_ended";
  if (current === "speech_ended" && hasSpeech) return "speech_started";
  return current;
}
