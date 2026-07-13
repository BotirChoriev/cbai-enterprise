export type OperatorOrbState = "idle" | "listening" | "speaking" | "thinking" | "success";

type OperatorOrbProps = {
  state?: OperatorOrbState;
  size?: number;
  className?: string;
};

const STATE_LABELS: Record<OperatorOrbState, string> = {
  idle: "CBAI Operator — ready",
  listening: "CBAI Operator — listening",
  speaking: "CBAI Operator — speaking",
  thinking: "CBAI Operator — thinking",
  success: "CBAI Operator — confirmed",
};

/**
 * The CBAI Operator's visual identity — a real, always-present abstract signature, not a mascot.
 *
 * Deliberately not a face or a figure: an illustrated humanoid persona (gendered or otherwise)
 * would assume an identity this product cannot honestly back up. An orb of light carries no
 * nationality, gender, age, or species claim, cannot be mistaken for a real or deepfaked person,
 * and still reads as "alive" through motion alone — the same convention real premium voice
 * products use (a responsive instrument, not an avatar). Built from the same emerald/gold
 * identity as the CBAI mark, so it reads as one brand, not a bolted-on widget.
 *
 * Motion is driven entirely by CSS (`data-operator-state`), never JS-timed re-renders, and every
 * animation is disabled under the existing `.cbai-reduced-motion` class the platform already
 * applies from the real saved accessibility preference.
 */
export default function OperatorOrb({ state = "idle", size = 96, className = "" }: OperatorOrbProps) {
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
      </defs>

      {/* Ambient glow — soft, breathing halo behind the core */}
      <circle className="cbai-orb-glow" cx="48" cy="48" r="34" fill="url(#orb-core)" opacity="0.22" />

      {/* Presence ring — brightens/tightens while listening, sweeps while thinking */}
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

      {/* Core sphere */}
      <circle className="cbai-orb-core" cx="48" cy="48" r="22" fill="url(#orb-core)" />
      <circle cx="40" cy="40" r="6" fill="#ffffff" opacity="0.28" />

      {/* Confirmation flash — hidden unless state=success */}
      <circle className="cbai-orb-flash" cx="48" cy="48" r="27" stroke="url(#orb-gold)" strokeWidth="2.5" fill="none" opacity="0" />
    </svg>
  );
}
