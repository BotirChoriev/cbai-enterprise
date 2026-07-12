"use client";

import { useEffect } from "react";
import SystemPageShell from "@/components/system/SystemPageShell";

export default function RootError({
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
      message="An unexpected error interrupted this page. Nothing you've saved was lost — Projects, notes, and evidence stay in this browser regardless. Try again, or head back to something that works."
      onRetry={reset}
    />
  );
}
