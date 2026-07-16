"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type CanvasOperatingObjectProps = {
  kind: "mission" | "question" | "evidence" | "knowledge" | "impact" | "operator";
  label: string;
  value: string;
  detail?: string;
  href?: string;
  status?: "complete" | "partial" | "missing" | "attention";
  children?: ReactNode;
  className?: string;
};

const KIND_ACCENT: Record<CanvasOperatingObjectProps["kind"], string> = {
  mission: "border-l-teal-500/70",
  question: "border-l-teal-400/50",
  evidence: "border-l-emerald-500/50",
  knowledge: "border-l-zinc-500/50",
  impact: "border-l-[var(--gold)]/60",
  operator: "border-l-teal-300/40",
};

const STATUS_DOT: Record<NonNullable<CanvasOperatingObjectProps["status"]>, string> = {
  complete: "bg-emerald-500/80",
  partial: "bg-amber-500/70",
  missing: "bg-zinc-600/60",
  attention: "bg-[var(--gold)]/80",
};

export default function CanvasOperatingObject({
  kind,
  label,
  value,
  detail,
  href,
  status = "missing",
  children,
  className = "",
}: CanvasOperatingObjectProps) {
  const body = (
    <article
      className={`cbai-operating-object cbai-thought-enter group relative border-l-2 bg-[var(--surface)]/40 px-4 py-3 transition-colors hover:bg-[var(--surface)]/70 ${KIND_ACCENT[kind]} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cbaiSectionEyebrow}>{label}</p>
        <span
          className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[status]}`}
          aria-hidden="true"
          title={status}
        />
      </div>
      <p className="mt-1 text-sm font-medium leading-snug text-zinc-100">{value}</p>
      {detail ? <p className="mt-1 text-xs leading-relaxed text-zinc-500">{detail}</p> : null}
      {children}
    </article>
  );

  if (href && !children) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40">
        {body}
      </Link>
    );
  }
  return body;
}
