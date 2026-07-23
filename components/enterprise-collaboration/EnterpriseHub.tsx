"use client";

import Link from "next/link";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { getEnterpriseCapabilityMatrix } from "@/lib/enterprise-collaboration";

const HUB = [
  { href: "/organization/workspace", title: "Organization Workspace", body: "Members, comments, approvals, activity." },
  { href: "/enterprise/personal", title: "Personal Dashboard", body: "Your memberships and queues." },
  { href: "/enterprise/organization", title: "Organization Dashboard", body: "Active org, roles, comments, audit." },
  { href: "/enterprise/workspace", title: "Workspace Dashboard", body: "Product lenses + active org context." },
  { href: "/enterprise/mission", title: "Mission Dashboard", body: "Collaborations, assignees, comments." },
  { href: "/notifications", title: "Notification Center", body: "In-app alerts and @mentions." },
  { href: "/reviews", title: "Review Center", body: "Assigned collaboration reviews." },
  { href: "/approvals", title: "Approval Center", body: "Request and decide approvals." },
  { href: "/activity", title: "Activity Center", body: "Membership-scoped activity timeline." },
];

const STATUS_LABEL = {
  implemented: "Implemented",
  partially_implemented: "Partially implemented",
  planned: "Planned",
  missing: "Missing",
  blocked: "Blocked",
} as const;

export default function EnterpriseHub() {
  const matrix = getEnterpriseCapabilityMatrix();

  return (
    <OperatingPageShell
      title="Enterprise Collaboration"
      description="Centers for personal, organization, workspace, and mission collaboration — with honest capability status."
      showMissionContext
      missionContextVariant="compact"
    >
      <EnterpriseStatusBanner />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HUB.map((item) => (
          <Link key={item.href} href={item.href} className={`${cbaiGlassCard} p-4 hover:border-teal-500/30`}>
            <p className={cbaiSectionEyebrow}>{item.title}</p>
            <p className="mt-2 text-sm text-zinc-400">{item.body}</p>
          </Link>
        ))}
      </section>

      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Capability matrix</p>
        <ul className="space-y-2">
          {matrix.map((row) => (
            <li key={row.id} className="text-sm text-zinc-300">
              <span className="text-zinc-100">{row.label}</span> — {STATUS_LABEL[row.status]}
              <span className="block text-xs text-zinc-500">{row.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </OperatingPageShell>
  );
}
