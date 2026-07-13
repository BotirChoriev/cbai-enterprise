export type OperatorFigureState =
  | "idle"
  | "listening"
  | "speaking"
  | "thinking"
  | "success";

type OperatorFigureProps = {
  state?: OperatorFigureState;
  size?: number;
  className?: string;
};

const STATE_LABELS: Record<OperatorFigureState, string> = {
  idle: "CBAI Operator — ready",
  listening: "CBAI Operator — listening",
  speaking: "CBAI Operator — speaking",
  thinking: "CBAI Operator — thinking",
  success: "CBAI Operator — confirmed",
};

/**
 * The CBAI Operator's visual identity (Platform Activation mission, Personal Operator Avatar).
 *
 * This is an original, abstract, geometric illustration — deliberately NOT a photorealistic or
 * 3D-rendered person. That is an honest tooling constraint (no image-generation capability is
 * available to produce one) as much as a product choice, and it happens to satisfy the mission's
 * own safety rules directly: an abstract silhouette makes no nationality, ethnicity, gender, or
 * identity claim, cannot be mistaken for a real person, and carries no deepfake risk. It is built
 * from the same network/intelligence visual language as the CBAI mark (components/brand/CBAILogo)
 * so the Operator reads as part of one coherent brand, not a bolted-on mascot.
 *
 * This is a completely separate component from components/shared/Avatar.tsx, which represents the
 * human *user* (initials only, by deliberate, unrelated design) — this component represents the
 * CBAI Operator character itself, and is never used to depict a real user.
 *
 * Motion is driven entirely by CSS (`data-operator-state`), never JS-timed re-renders, and every
 * animation is disabled under the existing `.cbai-reduced-motion` class the platform already
 * applies from the real saved accessibility preference.
 */
export default function OperatorFigure({ state = "idle", size = 96, className = "" }: OperatorFigureProps) {
  const gradId = "operator-grad";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={STATE_LABELS[state]}
      data-operator-state={state}
      className={`cbai-operator-figure shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#2fbf71" />
          <stop offset="60%" stopColor="#0a7a1f" />
          <stop offset="100%" stopColor="#005810" />
        </linearGradient>
      </defs>

      {/* Presence ring — pulses while listening, spins subtly while thinking */}
      <circle
        className="cbai-operator-ring"
        cx="48"
        cy="48"
        r="44"
        stroke={`url(#${gradId})`}
        strokeWidth="1.5"
        opacity="0.35"
      />

      {/* Shoulders */}
      <path
        className="cbai-operator-body"
        d="M18 82c0-14.9 13.4-27 30-27s30 12.1 30 27"
        fill={`url(#${gradId})`}
        opacity="0.22"
      />
      <path
        d="M18 82c0-14.9 13.4-27 30-27s30 12.1 30 27"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Head */}
      <circle className="cbai-operator-head" cx="48" cy="38" r="17" fill={`url(#${gradId})`} opacity="0.16" />
      <circle cx="48" cy="38" r="17" stroke={`url(#${gradId})`} strokeWidth="2" fill="none" />

      {/* Eyes — the only "face" affordance, deliberately minimal and abstract */}
      <g className="cbai-operator-eyes">
        <circle cx="41.5" cy="37" r="2.1" fill="#005810" />
        <circle cx="54.5" cy="37" r="2.1" fill="#005810" />
      </g>

      {/* Mouth — a simple arc that widens slightly while speaking */}
      <path
        className="cbai-operator-mouth"
        d="M41 45.5c2.2 2 9.8 2 14 0"
        stroke="#005810"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Thinking dots — hidden unless state=thinking */}
      <g className="cbai-operator-thinking-dots" opacity="0">
        <circle cx="70" cy="24" r="2" fill="#6d28d9" />
        <circle cx="76" cy="18" r="1.5" fill="#6d28d9" />
        <circle cx="64" cy="16" r="1.5" fill="#6d28d9" />
      </g>

      {/* Success check — hidden unless state=success. Backing circle uses the real active card
          color (CSS custom property, valid in an SVG presentation attribute) so it reads correctly
          against either the default light Intelligence surface or the explicit Deep theme. */}
      <g className="cbai-operator-success" opacity="0">
        <circle cx="72" cy="24" r="10" fill="var(--card)" />
        <circle cx="72" cy="24" r="10" stroke="#2fbf71" strokeWidth="1.5" fill="none" />
        <path d="M67.5 24l3 3 6-6.5" stroke="#2fbf71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}
