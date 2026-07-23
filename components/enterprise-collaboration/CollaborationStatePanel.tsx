"use client";

import { cbaiTextMuted } from "@/components/brand/brand-classes";

export type CollaborationUiState = "loading" | "empty" | "denied" | "error" | "ready" | "signed_out";

type Props = {
  readonly state: CollaborationUiState;
  readonly message?: string | null;
  readonly children?: React.ReactNode;
};

const COPY: Record<Exclude<CollaborationUiState, "ready">, string> = {
  loading: "Loading organization collaboration…",
  empty: "Nothing here yet for this organization.",
  denied: "Access denied — you are not a member of this organization (RLS).",
  error: "Could not load collaboration data.",
  signed_out: "Sign in with Preview Supabase Auth to use shared collaboration.",
};

/** Honest loading / empty / denied / error surfaces for collaboration UI. */
export default function CollaborationStatePanel({ state, message, children }: Props) {
  if (state === "ready") return <>{children}</>;
  return (
    <p className={`text-sm ${state === "error" || state === "denied" ? "text-amber-400/90" : "text-zinc-500"}`} role="status">
      {message?.trim() || COPY[state]}
      {state === "loading" ? <span className={`${cbaiTextMuted} ml-1`}>Please wait.</span> : null}
    </p>
  );
}
