import type { ReactNode } from "react";
import {
  cbaiEmptyDashed,
  cbaiGlassCard,
  cbaiPanelPadding,
  cbaiSectionEyebrow,
  cbaiStackSm,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

type EmptyStateProps = {
  /** "dashed" — an inline list/grid came back with zero real results after filtering (e.g. a
   * search or filter narrowed a real list to nothing). "section" — a whole page section has no
   * real data connected yet (e.g. no projects created, no evidence connected). Two genuinely
   * different situations, not the same one two ways — see docs/design-system.md. */
  variant?: "dashed" | "section";
  title?: string;
  message: string;
  action?: ReactNode;
};

/**
 * One real empty-state component (Platform Completion mission, Phase 1/2) — previously every
 * component hand-rolled its own empty-state markup, with at least 5 structurally different
 * patterns communicating the same "nothing here yet" intent across the app. Never fabricates
 * content; the message is always the caller's real, honest copy.
 */
export default function EmptyState({ variant = "section", title, message, action }: EmptyStateProps) {
  if (variant === "dashed") {
    return (
      <div className={cbaiEmptyDashed}>
        {title ? <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{title}</p> : null}
        <p className={`${cbaiTextMuted} ${title ? "mt-1" : ""}`}>{message}</p>
        {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
      </div>
    );
  }

  return (
    <section className={`${cbaiGlassCard} ${cbaiPanelPadding} ${cbaiStackSm}`}>
      {title ? <p className={cbaiSectionEyebrow}>{title}</p> : null}
      <p className={cbaiTextMuted}>{message}</p>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
