"use client";

import { usePathname } from "next/navigation";
import { shouldShowContextHeader } from "@/lib/context";
import PlatformContextHeader from "@/components/platform/context/PlatformContextHeader";
import { moduleIdFromPath, PLATFORM_MODULES } from "@/lib/context";

const MODULE_LABEL_OVERRIDES: Record<string, string> = {
  "/knowledge": "Evidence Explorer",
  "/analytics": "Reports Center",
  "/ai-control": "Governance Control",
};

function resolveModuleLabel(pathname: string): string {
  if (MODULE_LABEL_OVERRIDES[pathname]) {
    return MODULE_LABEL_OVERRIDES[pathname];
  }

  const moduleId = moduleIdFromPath(pathname);
  if (moduleId) {
    return PLATFORM_MODULES[moduleId].label;
  }

  return "Platform";
}

export default function PlatformContextHeaderSlot() {
  const pathname = usePathname();

  if (!shouldShowContextHeader(pathname)) {
    return null;
  }

  return <PlatformContextHeader moduleLabel={resolveModuleLabel(pathname)} />;
}
