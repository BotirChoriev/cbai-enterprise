"use client";

import type { ReactNode } from "react";
import { AssistantProfileProvider } from "@/components/platform/context/AssistantProfileProvider";

/** Minimal root provider so error/404 pages outside the dashboard shell still get theme + language. */
export default function RootProviders({ children }: { children: ReactNode }) {
  return <AssistantProfileProvider>{children}</AssistantProfileProvider>;
}
