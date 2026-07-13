/**
 * Real time-of-day resolver (Platform Activation mission — "current local time where safely
 * available" in the multilingual greeting). Reads the real, already-saved AssistantProfile.timezone
 * (the browser's own IANA zone, captured once at profile creation) via the standard Intl API —
 * never a guessed or hardcoded timezone, never a fabricated clock.
 */

export type TimeOfDay = "morning" | "afternoon" | "evening";

/** Returns null when the saved timezone string can't be resolved (e.g. corrupted/legacy data) —
 * an honest "don't know" rather than defaulting to a specific time of day. */
export function resolveTimeOfDay(timezone: string, now: Date = new Date()): TimeOfDay | null {
  try {
    const hourString = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone || undefined,
    }).format(now);
    const hour = Number.parseInt(hourString, 10);
    if (Number.isNaN(hour)) return null;

    if (hour < 5) return "evening";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  } catch {
    return null;
  }
}
