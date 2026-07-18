/**
 * Mockable Web Speech API session — final transcripts only, never auto-executes.
 */

import type { VoiceControlPhase } from "@/lib/voice/voice-control-types";
import { extractConfidenceFromResult } from "@/lib/voice/voice-confidence";

export type SpeechRecognitionResultItem = {
  readonly transcript: string;
  readonly confidence?: number;
  readonly isFinal: boolean;
};

export type SpeechRecognitionSessionResult = {
  readonly transcript: string;
  readonly confidence: number | null;
  readonly lang: string;
};

export type SpeechRecognitionSessionCallbacks = {
  onPhaseChange?: (phase: VoiceControlPhase) => void;
  onError?: (code: string) => void;
};

type SpeechRecognitionResultLike = { transcript: string; confidence?: number };
type SpeechRecognitionErrorLike = { error: string };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult:
    | ((event: { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>; resultIndex: number }) => void)
    | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

export class SpeechRecognitionSession {
  private recognition: SpeechRecognitionLike | null = null;
  private callbacks: SpeechRecognitionSessionCallbacks;

  constructor(callbacks: SpeechRecognitionSessionCallbacks = {}) {
    this.callbacks = callbacks;
  }

  start(lang: string): boolean {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return false;

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => this.callbacks.onPhaseChange?.("listening");
    recognition.onresult = (event) => {
      const item = event.results[event.resultIndex]?.[0];
      if (!item?.transcript?.trim()) return;
      const confidencePresentation = extractConfidenceFromResult(item);
      this.callbacks.onPhaseChange?.("transcript_review");
      this.pendingResult = {
        transcript: item.transcript.trim(),
        confidence: confidencePresentation.kind === "available" ? confidencePresentation.value : null,
        lang,
      };
    };
    recognition.onerror = (event) => {
      this.callbacks.onError?.(event.error);
      this.callbacks.onPhaseChange?.("error");
    };
    recognition.onend = () => {
      if (!this.pendingResult) {
        this.callbacks.onPhaseChange?.("idle");
      }
    };

    this.recognition = recognition;
    this.pendingResult = null;
    this.callbacks.onPhaseChange?.("listening");
    recognition.start();
    return true;
  }

  private pendingResult: SpeechRecognitionSessionResult | null = null;

  stop(): void {
    this.recognition?.stop();
  }

  consumeResult(): SpeechRecognitionSessionResult | null {
    const result = this.pendingResult;
    this.pendingResult = null;
    return result;
  }

  /** Deterministic test hook — simulates a browser final result without hardware. */
  simulateFinalResult(result: SpeechRecognitionSessionResult): void {
    this.pendingResult = result;
    this.callbacks.onPhaseChange?.("transcript_review");
  }
}

/** Parse raw browser event into final-only items — interim results are ignored. */
export function parseSpeechResults(
  results: ArrayLike<ArrayLike<SpeechRecognitionResultItem>>,
  resultIndex: number,
): SpeechRecognitionSessionResult | null {
  const item = results[resultIndex]?.[0];
  if (!item?.transcript?.trim()) return null;
  const confidencePresentation = extractConfidenceFromResult(item);
  return {
    transcript: item.transcript.trim(),
    confidence: confidencePresentation.kind === "available" ? confidencePresentation.value : null,
    lang: "",
  };
}
