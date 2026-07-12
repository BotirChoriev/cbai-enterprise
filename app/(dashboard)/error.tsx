"use client";

import { useEffect } from "react";
import SystemPageShell from "@/components/system/SystemPageShell";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SystemPageShell
      eyebrow="Unexpected Error"
      title="Something went wrong"
      message="This page ran into a problem while loading. Nothing you've saved was lost — Projects, notes, and evidence stay in this browser regardless. Try again, or head back to something that works."
      onRetry={reset}
    />
  );
}
