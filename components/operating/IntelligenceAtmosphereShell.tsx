"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  atmosphereStyleVars,
  resolveIntelligenceAtmosphere,
} from "@/lib/intelligence-os/intelligence-atmosphere";
import { recordIntelligenceSpaceVisit } from "@/lib/intelligence-os/living-context-memory";
import { resolveIntelligenceSpace } from "@/lib/intelligence-os/intelligence-spaces";

type IntelligenceAtmosphereShellProps = {
  children: ReactNode;
  className?: string;
};

/** Applies per-space atmosphere and records visit for context memory. */
export default function IntelligenceAtmosphereShell({
  children,
  className = "",
}: IntelligenceAtmosphereShellProps) {
  const pathname = usePathname();
  const spaceId = resolveIntelligenceSpace(pathname);
  const atmosphere = resolveIntelligenceAtmosphere(spaceId);

  useEffect(() => {
    recordIntelligenceSpaceVisit(spaceId, pathname);
  }, [spaceId, pathname]);

  return (
    <div
      data-cbai-space={spaceId}
      data-cbai-density={atmosphere.density}
      className={`cbai-intelligence-atmosphere ${className}`}
      style={atmosphereStyleVars(atmosphere)}
    >
      {children}
    </div>
  );
}
