"use client";

import { useMemo } from "react";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveProgressiveDisclosure } from "@/lib/intelligence-os/progressive-disclosure";

/** Resolves progressive disclosure flags from user density preference. */
export function useProgressiveDisclosure() {
  const { profile } = useAssistantProfile();
  return useMemo(
    () => resolveProgressiveDisclosure(profile.displayDensity ?? "standard"),
    [profile.displayDensity],
  );
}
