"use client";

import { useEffect, useState } from "react";
import GlobalStatusStrip from "@/components/enterprise/GlobalStatusStrip";
import { buildGlobalStatus, type GlobalStatusModel } from "@/lib/enterprise/global-status";

type LiveGlobalStatusStripProps = {
  compact?: boolean;
  entityId?: string;
};

/**
 * Global status that merges catalog honesty with live `/api/evidence/observations` counts.
 */
export default function LiveGlobalStatusStrip({ compact, entityId }: LiveGlobalStatusStripProps) {
  const [status, setStatus] = useState<GlobalStatusModel>(() => buildGlobalStatus());

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const params = new URLSearchParams({ refresh: "1" });
        if (entityId) params.set("entityId", entityId);
        const response = await fetch(`/api/evidence/observations?${params.toString()}`, {
          method: "POST",
          credentials: "include",
        });
        const data = (await response.json()) as {
          ok?: boolean;
          observationCount?: number;
          connectedSources?: string[];
        };
        if (!data.ok || cancelled) return;
        const base = buildGlobalStatus();
        const mergedConnected = Math.max(
          base.connectedSources,
          new Set(["cbai-local-registry", ...(data.connectedSources ?? [])]).size,
        );
        setStatus({
          ...base,
          connectedSources: mergedConnected,
          missingSources: Math.max(0, base.totalSources - mergedConnected),
          lastUpdated:
            data.observationCount && data.observationCount > 0
              ? new Date().toISOString()
              : base.lastUpdated,
          coverageBasis:
            data.observationCount && data.observationCount > 0
              ? `${data.observationCount} verified official observation(s) published · ${base.coverageBasis}`
              : base.coverageBasis,
          confidence:
            data.observationCount && data.observationCount > 0
              ? "Partial — verified sources registered"
              : base.confidence,
          evidenceHealth:
            data.observationCount && data.observationCount > 0
              ? "Healthy — registry connected"
              : base.evidenceHealth,
        });
      } catch {
        /* keep catalog baseline */
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [entityId]);

  return <GlobalStatusStrip status={status} compact={compact} />;
}
