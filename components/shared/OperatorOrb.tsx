"use client";

/**
 * Abstract Operator signature — an illustrated orb, not a humanoid mascot or photorealistic avatar.
 */
import { useTranslation } from "@/lib/i18n/use-translation";

export type OperatorOrbState =
  | "present"
  | "idle"
  | "greeting"
  | "listening"
  | "transcribing"
  | "interpreting"
  | "clarification-required"
  | "showing-evidence"
  | "proposing-alternatives"
  | "waiting-decision"
  | "executing"
  | "speaking"
  | "success"
  | "warning"
  | "unsupported"
  | "permission-denied"
  | "error"
  | "complete"
  | "thinking";

const STATE_I18N_KEY: Record<OperatorOrbState, keyof import("@/lib/i18n/dictionary-types").TranslationDictionary["operatorStates"]> = {
  present: "present",
  idle: "present",
  greeting: "present",
  listening: "listening",
  transcribing: "transcribing",
  interpreting: "interpreting",
  "clarification-required": "clarificationRequired",
  "showing-evidence": "showingEvidence",
  "proposing-alternatives": "proposingAlternatives",
  "waiting-decision": "waitingDecision",
  executing: "executing",
  speaking: "executing",
  success: "success",
  warning: "warning",
  unsupported: "unsupported",
  "permission-denied": "permissionDenied",
  error: "error",
  complete: "complete",
  thinking: "interpreting",
};

/** Maps extended states to CSS animation keys (no fake waveform states). */
function cssState(state: OperatorOrbState): string {
  switch (state) {
    case "listening":
    case "transcribing":
      return "listening";
    case "interpreting":
    case "executing":
    case "thinking":
      return "interpreting";
    case "speaking":
      return "speaking";
    case "success":
    case "complete":
      return "success";
    case "warning":
    case "unsupported":
    case "permission-denied":
    case "error":
      return "error";
    case "greeting":
      return "greeting";
    default:
      return "idle";
  }
}

type OperatorOrbProps = {
  state?: OperatorOrbState;
  size?: number;
  className?: string;
};

export default function OperatorOrb({ state = "present", size = 96, className = "" }: OperatorOrbProps) {
  const { t } = useTranslation();
  const label = t(`operatorStates.${STATE_I18N_KEY[state]}`);
  const dataState = cssState(state);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      data-operator-state={dataState}
      className={`cbai-operator-orb shrink-0 ${className}`}
    >
      <defs>
        <radialGradient id="orb-core" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#6fe3a4" />
          <stop offset="45%" stopColor="#2fbf71" />
          <stop offset="100%" stopColor="#005810" />
        </radialGradient>
        <linearGradient id="orb-sweep" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6fe3a4" stopOpacity="0" />
          <stop offset="50%" stopColor="#6fe3a4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2fbf71" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="orb-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3d38a" />
          <stop offset="100%" stopColor="#c6952f" />
        </linearGradient>
        <linearGradient id="orb-error" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      <circle className="cbai-orb-glow" cx="48" cy="48" r="34" fill="url(#orb-core)" opacity="0.22" />
      <circle className="cbai-orb-ring" cx="48" cy="48" r="40" stroke="url(#orb-core)" strokeWidth="1.5" opacity="0.3" fill="none" />
      <circle
        className="cbai-orb-sweep"
        cx="48"
        cy="48"
        r="40"
        stroke="url(#orb-sweep)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="70 182"
        fill="none"
        opacity="0"
      />
      <circle className="cbai-orb-core" cx="48" cy="48" r="22" fill="url(#orb-core)" />
      <circle cx="40" cy="40" r="6" fill="#ffffff" opacity="0.28" />
      <circle className="cbai-orb-flash" cx="48" cy="48" r="27" stroke="url(#orb-gold)" strokeWidth="2.5" fill="none" opacity="0" />
      <circle className="cbai-orb-error" cx="48" cy="48" r="40" stroke="url(#orb-error)" strokeWidth="2" fill="none" opacity="0" />
    </svg>
  );
}
