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

  return <SystemPageShell variant="error" onRetry={reset} />;
}
