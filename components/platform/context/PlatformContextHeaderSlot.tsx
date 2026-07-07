"use client";

import { usePathname } from "next/navigation";
import { shouldShowContextHeader } from "@/lib/context";
import { isPublicJourneyRoute } from "@/lib/navigation";
import PlatformContextHeader from "@/components/platform/context/PlatformContextHeader";
import { moduleIdFromPath, PLATFORM_MODULES } from "@/lib/context";

const MODULE_LABEL_OVERRIDES: Record<string, string> = {
  "/knowledge": "Evidence",
  "/analytics": "Reports",
  "/ai-control": "Governance",
};

function resolveModuleLabel(pathname: string): string {
  if (MODULE_LABEL_OVERRIDES[pathname]) {
    return MODULE_LABEL_OVERRIDES[pathname];
  }

  const moduleId = moduleIdFromPath(pathname);
  if (moduleId) {
    return PLATFORM_MODULES[moduleId].label;
  }

  return "CBAI";
}

export default function PlatformContextHeaderSlot() {
  const pathname = usePathname();

  if (!shouldShowContextHeader(pathname) || isPublicJourneyRoute(pathname)) {
    return null;
  }

  return <PlatformContextHeader moduleLabel={resolveModuleLabel(pathname)} />;
}
