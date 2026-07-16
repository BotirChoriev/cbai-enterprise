"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  atmosphereStyleVars,
  resolveIntelligenceAtmosphere,
} from "@/lib/intelligence-os/intelligence-atmosphere";
import { resolveAdaptiveDensity } from "@/lib/intelligence-os/adaptive-density";
import { recordIntelligenceSpaceVisit } from "@/lib/intelligence-os/living-context-memory";
import { resolveIntelligenceSpace } from "@/lib/intelligence-os/intelligence-spaces";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";

type IntelligenceAtmosphereShellProps = {
  children: ReactNode;
  className?: string;
};

/** Applies per-space atmosphere, user density preference, and records visit for context memory. */
export default function IntelligenceAtmosphereShell({
  children,
  className = "",
}: IntelligenceAtmosphereShellProps) {
  const pathname = usePathname();
  const { profile } = useAssistantProfile();
  const spaceId = resolveIntelligenceSpace(pathname);
  const atmosphere = resolveIntelligenceAtmosphere(spaceId);
  const { density } = resolveAdaptiveDensity(profile.displayDensity ?? "standard", atmosphere.density);

  useEffect(() => {
    recordIntelligenceSpaceVisit(spaceId, pathname);
  }, [spaceId, pathname]);

  return (
    <div
      data-cbai-space={spaceId}
      data-cbai-density={density}
      className={`cbai-intelligence-atmosphere ${className}`}
      style={atmosphereStyleVars({ ...atmosphere, density })}
    >
      {children}
    </div>
  );
}
