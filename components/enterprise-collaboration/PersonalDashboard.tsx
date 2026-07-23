"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiBtnSecondary } from "@/components/brand/brand-classes";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { getCurrentUser } from "@/lib/auth/auth-store";
import { buildCollaborationAssistantSnapshot } from "@/lib/enterprise-collaboration";
import { loadOrganizations } from "@/lib/organization-os/organization-store";
import { loadOrganizationMemberships } from "@/lib/organization-os/organization-membership-store";

export default function PersonalDashboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick(1);
  }, []);

  const userId = resolveActorId();
  const user = getCurrentUser();
  const snap = useMemo(() => {
    void tick;
    return buildCollaborationAssistantSnapshot(userId);
  }, [tick, userId]);

  const memberships = useMemo(() => {
    void tick;
    if (!userId) return [];
    return loadOrganizationMemberships().filter((m) => m.userId === userId);
  }, [tick, userId]);

  const orgs = useMemo(() => {
    void tick;
    const all = loadOrganizations();
    return memberships
      .map((m) => all.find((o) => o.id === m.organizationId))
      .filter(Boolean);
  }, [tick, memberships]);

  return (
    <OperatingPageShell
      title="Personal Dashboard"
      description="Your account, organization memberships, and collaboration queue — scoped to you only."
      showMissionContext
      missionContextVariant="compact"
    >
      <EnterpriseStatusBanner />

      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Signed-in operator</p>
        <p className="text-sm text-zinc-200">{user?.displayName ?? user?.email ?? userId ?? "Not signed in"}</p>
        <p className="text-xs text-zinc-500">{snap.summary}</p>
        {!userId ? (
          <Link href="/account" className={cbaiBtnSecondary}>
            Sign in
          </Link>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Organizations", value: String(orgs.length), href: "/enterprise/organization" },
          { label: "Pending approvals", value: String(snap.pendingApprovals), href: "/approvals" },
          { label: "Assigned reviews", value: String(snap.assignedReviews), href: "/reviews" },
          { label: "Unread notifications", value: String(snap.unreadNotifications), href: "/notifications" },
        ].map((card) => (
          <Link key={card.label} href={card.href} className={`${cbaiGlassCard} p-4 hover:border-teal-500/30`}>
            <p className={cbaiSectionEyebrow}>{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">{card.value}</p>
          </Link>
        ))}
      </section>

      <section className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Your organizations</p>
        {orgs.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No organization memberships on this device.{" "}
            <Link href="/organization" className="text-teal-400 hover:text-teal-300">
              Create or join
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {orgs.map((org) =>
              org ? (
                <li key={org.id} className="flex items-center justify-between text-sm text-zinc-300">
                  <span>{org.name}</span>
                  <Link href={`/enterprise/organization?org=${org.id}`} className="text-teal-400 hover:text-teal-300">
                    Open
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </section>
    </OperatingPageShell>
  );
}
