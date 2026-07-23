"use client";

import { useEffect, useMemo, useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { loadActiveEnterpriseContext } from "@/lib/enterprise-collaboration";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { loadCollaborationAudit } from "@/lib/collaboration/collaboration-audit-store";
import { loadMissionCollaborations } from "@/lib/collaboration/collaboration-store";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";
import { loadOrganizationMemberships } from "@/lib/organization-os/organization-membership-store";

export default function ActivityCenter() {
  const [tick, setTick] = useState(0);
  const userId = resolveActorId();

  useEffect(() => setTick(1), []);

  const orgIds = useMemo(() => {
    void tick;
    if (!userId) return [];
    const active = loadActiveEnterpriseContext().organizationId;
    const mine = loadOrganizationMemberships()
      .filter((m) => m.userId === userId)
      .map((m) => m.organizationId);
    if (active && mine.includes(active)) return [active];
    return mine;
  }, [tick, userId]);

  const orgEvents = useMemo(() => {
    void tick;
    return orgIds.flatMap((id) => loadOrganizationAudit(id)).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [tick, orgIds]);

  const collabEvents = useMemo(() => {
    void tick;
    if (!userId) return [];
    const events = [];
    for (const collab of loadMissionCollaborations()) {
      if (collab.ownerOrganizationId && !loadMembershipForUser(userId, collab.ownerOrganizationId)) {
        continue;
      }
      events.push(...loadCollaborationAudit(collab.id));
    }
    return events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [tick, userId]);

  return (
    <OperatingPageShell
      title="Activity Center"
      description="Membership-scoped organization and collaboration audit events. Foreign organization activity is never shown."
      showMissionContext={false}
    >
      <EnterpriseStatusBanner />

      <div className="grid gap-3 lg:grid-cols-2">
        <section className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className={cbaiSectionEyebrow}>Organization audit</p>
          {orgEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">No organization audit events in your scope.</p>
          ) : (
            <ul className="space-y-2">
              {orgEvents.slice(0, 30).map((e) => (
                <li key={e.id} className="text-xs text-zinc-400">
                  {e.timestamp.slice(0, 19)} · {e.event} · {e.actorDisplayName}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className={cbaiSectionEyebrow}>Collaboration audit</p>
          {collabEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">No collaboration audit events in your scope.</p>
          ) : (
            <ul className="space-y-2">
              {collabEvents.slice(0, 30).map((e) => (
                <li key={e.id} className="text-xs text-zinc-400">
                  {e.createdAt.slice(0, 19)} · {e.event} · {e.actorId}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </OperatingPageShell>
  );
}
