"use client";

import Link from "next/link";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiTextMuted } from "@/components/brand/brand-classes";
import {
  getEnterpriseCapabilityMatrix,
  realtimeCollaborationStatus,
} from "@/lib/enterprise-collaboration";

const STATUS_LABEL = {
  implemented: "Implemented",
  partially_implemented: "Partially implemented",
  planned: "Planned",
  missing: "Missing",
  blocked: "Blocked",
} as const;

export default function EnterpriseStatusBanner() {
  const realtime = realtimeCollaborationStatus();
  const rows = getEnterpriseCapabilityMatrix().slice(0, 6);

  return (
    <section className={`${cbaiGlassCard} space-y-3 p-4`} aria-label="Enterprise collaboration status">
      <p className={cbaiSectionEyebrow}>Enterprise honesty</p>
      <p className="text-sm text-zinc-300">
        Collaboration centers below use organization membership checks. Realtime sync is{" "}
        <span className="text-zinc-100">{STATUS_LABEL[realtime.status]}</span> — {realtime.message}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-lg border border-zinc-800/80 px-3 py-2">
            <p className="text-xs font-medium text-zinc-200">
              {row.label} · {STATUS_LABEL[row.status]}
            </p>
            <p className={`${cbaiTextMuted} mt-1`}>{row.note}</p>
          </li>
        ))}
      </ul>
      <p className={cbaiTextMuted}>
        Product lenses (Investor / Government / Citizen) are not organization tenants.{" "}
        <Link href="/organization" className="text-teal-400 hover:text-teal-300">
          Manage organizations
        </Link>
        {" · "}
        <Link href="/organization/workspace" className="text-teal-400 hover:text-teal-300">
          Organization Workspace
        </Link>
      </p>
    </section>
  );
}
