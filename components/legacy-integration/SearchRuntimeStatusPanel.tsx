"use client";

import { useMemo } from "react";
import { collectLegacyBuildIntegrationModel } from "@/lib/legacy-build-integration";
import SearchRuntimeStatusSection from "@/components/legacy-integration/SearchRuntimeStatusSection";

export default function SearchRuntimeStatusPanel() {
  const model = useMemo(() => collectLegacyBuildIntegrationModel(), []);
  return <SearchRuntimeStatusSection model={model} />;
}
