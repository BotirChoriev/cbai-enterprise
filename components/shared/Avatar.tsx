import { ASSISTANT_AVATAR_CLASSES, type AssistantAvatarId } from "@/lib/assistant/assistant-profile";

export type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-lg",
};

type AvatarProps = {
  /** Real saved name — used for the initial and the accessible label. Empty means no profile yet. */
  name: string;
  avatar: AssistantAvatarId;
  size?: AvatarSize;
  className?: string;
};

/**
 * One consistent avatar presentation (Release 5, Phase 3) — initials only, never a generated or
 * photorealistic person, never a demographic assumption. Used identically everywhere an identity
 * needs to show: Home, My Work, Settings, Command Center, account menu.
 */
export default function Avatar({ name, avatar, size = "md", className = "" }: AvatarProps) {
  const trimmed = name.trim();
  const initial = trimmed.slice(0, 1).toUpperCase();

  return (
    <span
      role="img"
      aria-label={trimmed ? `${trimmed}'s avatar` : "No Assistant profile set up yet"}
      className={`flex shrink-0 items-center justify-center rounded-full border font-semibold uppercase ${SIZE_CLASSES[size]} ${ASSISTANT_AVATAR_CLASSES[avatar]} ${className}`}
    >
      {trimmed ? (
        initial
      ) : (
        <svg className="h-1/2 w-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
    </span>
  );
}
