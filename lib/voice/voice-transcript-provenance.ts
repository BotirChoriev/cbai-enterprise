/**
 * Voice transcript provenance — unconfirmed speech is not trusted platform data.
 */

import type { VoiceTranscriptRecord } from "@/lib/voice/voice-control-types";

const VOICE_TRANSCRIPT_STORE_KEY = "cbai-voice-transcript-records";

export function createVoiceTranscriptRecord(params: {
  transcript: string;
  requestedLang: string;
  confidence: number | null;
  humanConfirmed: boolean;
}): VoiceTranscriptRecord {
  return {
    transcript: params.transcript,
    requestedLang: params.requestedLang,
    confidence: params.confidence,
    capturedAt: new Date().toISOString(),
    humanConfirmed: params.humanConfirmed,
    provenanceKind: "VOICE_TRANSCRIPT",
    needsReview: !params.humanConfirmed,
  };
}

export function readVoiceTranscriptRecords(): readonly VoiceTranscriptRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VOICE_TRANSCRIPT_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VoiceTranscriptRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendVoiceTranscriptRecord(record: VoiceTranscriptRecord): void {
  if (typeof window === "undefined") return;
  const existing = readVoiceTranscriptRecords();
  window.localStorage.setItem(VOICE_TRANSCRIPT_STORE_KEY, JSON.stringify([...existing, record].slice(-50)));
}

export function markVoiceTranscriptConfirmed(transcript: string, capturedAt: string): void {
  if (typeof window === "undefined") return;
  const updated = readVoiceTranscriptRecords().map((record) =>
    record.transcript === transcript && record.capturedAt === capturedAt
      ? { ...record, humanConfirmed: true, needsReview: false }
      : record,
  );
  window.localStorage.setItem(VOICE_TRANSCRIPT_STORE_KEY, JSON.stringify(updated));
}

export function isTrustedVoiceDerivedText(record: VoiceTranscriptRecord): boolean {
  return record.humanConfirmed && !record.needsReview;
}

export function voiceDerivedReviewLabelKey(record: VoiceTranscriptRecord): string {
  if (record.humanConfirmed) return "voiceControl.voiceDerivedConfirmed";
  return "voiceControl.voiceDerivedNeedsReview";
}
