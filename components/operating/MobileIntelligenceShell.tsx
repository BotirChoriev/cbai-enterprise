"use client";

import type { ReactNode } from "react";

/** Mobile Intelligence Mode — sequential, focused layout (not shrunk desktop). */
export default function MobileIntelligenceShell({ children }: { children: ReactNode }) {
  return <div className="cbai-mobile-intelligence-mode flex min-h-0 flex-1 flex-col">{children}</div>;
}
