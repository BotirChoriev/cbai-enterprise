"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Preserves query params when redirecting legacy /analytics links to /reports. */
export default function AnalyticsRedirectClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const target = query ? `/reports?${query}` : "/reports";
    window.location.replace(target);
  }, [searchParams]);

  return (
    <p className="px-6 py-12 text-center text-sm text-zinc-500">Redirecting to Reports Center…</p>
  );
}
