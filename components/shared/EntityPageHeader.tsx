"use client";

import { cbaiPageHeader, cbaiSectionEyebrow, cbaiTextMuted } from "@/components/brand/brand-classes";
import type { ReactNode } from "react";

type EntityPageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
};

/** Shared page header — title, purpose line, optional primary action. */
export default function EntityPageHeader({ title, description, eyebrow, action }: EntityPageHeaderProps) {
  return (
    <header className={`${cbaiPageHeader} flex flex-col gap-2`}>
      {eyebrow ? <p className={cbaiSectionEyebrow}>{eyebrow}</p> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--cbai-text-primary)] sm:text-2xl">{title}</h1>
          {description ? <p className={`max-w-3xl text-sm ${cbaiTextMuted}`}>{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
