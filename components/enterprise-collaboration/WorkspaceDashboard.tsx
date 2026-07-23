"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import { cbaiBtnSecondary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import {
  loadActiveEnterpriseContext,
  saveActiveEnterpriseContext,
} from "@/lib/enterprise-collaboration";

const LENSES = [
  {
    id: "investor" as const,
    href: "/investor",
    title: "Investor",
    body: "Economic evidence lens — not an organization tenant.",
  },
  {
    id: "government" as const,
    href: "/government",
    title: "Government",
    body: "Governance evidence lens — not an organization tenant.",
  },
  {
    id: "citizen" as const,
    href: "/citizen",
    title: "Citizen",
    body: "Public information lens — not an organization tenant.",
  },
];

export default function WorkspaceDashboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => setTick(1), []);

  const active = useMemo(() => {
    void tick;
    return loadActiveEnterpriseContext();
  }, [tick]);

  return (
    <OperatingPageShell
      title="Workspace Dashboard"
      description="Product workspace lenses plus active organization context. Lenses do not isolate tenants."
      showMissionContext
      missionContextVariant="compact"
    >
      <EnterpriseStatusBanner />

      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Active context</p>
        <p className="text-sm text-zinc-300">
          Organization:{" "}
          <span className="text-zinc-100">{active.organizationId ?? "None selected"}</span>
        </p>
        <p className="text-sm text-zinc-300">
          Workspace lens:{" "}
          <span className="text-zinc-100">{active.workspaceId ?? "None selected"}</span>
        </p>
        <Link href="/enterprise/organization" className="text-xs text-teal-400 hover:text-teal-300">
          Switch organization →
        </Link>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {LENSES.map((lens) => (
          <div key={lens.id} className={`${cbaiGlassCard} space-y-3 p-4`}>
            <p className={cbaiSectionEyebrow}>{lens.title}</p>
            <p className="text-sm text-zinc-400">{lens.body}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}
                onClick={() => {
                  saveActiveEnterpriseContext({ workspaceId: lens.id });
                  setTick((n) => n + 1);
                }}
              >
                Set active lens
              </button>
              <Link href={lens.href} className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}>
                Open lens
              </Link>
            </div>
          </div>
        ))}
      </section>
    </OperatingPageShell>
  );
}
