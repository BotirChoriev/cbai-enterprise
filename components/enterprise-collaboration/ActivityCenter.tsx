"use client";

import { useCallback, useEffect, useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import CollaborationStatePanel from "@/components/enterprise-collaboration/CollaborationStatePanel";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { useActiveOrganization } from "@/components/enterprise-collaboration/ActiveOrganizationProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import {
  fetchOrganizationActivityEvents,
  type OrganizationActivityEvent,
} from "@/lib/enterprise-collaboration/cloud-persistence";
import { hydrateOrganizationPersistence } from "@/lib/persistence/organization-persistence-service";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";

export default function ActivityCenter() {
  const { cloudUser, isCloudSignedIn } = useAuth();
  const { activeOrganizationId, organizations, sharedBackend, loading: orgLoading } =
    useActiveOrganization();
  const userId = cloudUser?.id ?? resolveActorId();
  const [events, setEvents] = useState<OrganizationActivityEvent[]>([]);
  const [auditFallback, setAuditFallback] = useState<
    { id: string; timestamp: string; event: string; actorDisplayName: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const orgId = activeOrganizationId ?? organizations[0]?.id ?? null;
  const membership = orgId && userId ? loadMembershipForUser(userId, orgId) : null;

  const reload = useCallback(async () => {
    if (!userId || !orgId) {
      setEvents([]);
      setAuditFallback([]);
      setLoaded(true);
      return;
    }
    setError(null);
    try {
      if (sharedBackend && isCloudSignedIn) {
        await hydrateOrganizationPersistence(userId);
      }
      const result = await fetchOrganizationActivityEvents(orgId);
      if ("error" in result) {
        setError(result.error);
        setEvents([]);
        setAuditFallback(loadOrganizationAudit(orgId).slice(0, 30));
      } else {
        setEvents(result);
        setAuditFallback([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load activity.");
    } finally {
      setLoaded(true);
    }
  }, [userId, orgId, sharedBackend, isCloudSignedIn]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const state =
    orgLoading || !loaded
      ? "loading"
      : !userId
        ? "signed_out"
        : !orgId || !membership
          ? "denied"
          : error && events.length === 0 && auditFallback.length === 0
            ? "error"
            : "ready";

  return (
    <OperatingPageShell
      title="Activity Center"
      description="Organization activity_events from Preview Supabase (RLS). Foreign organization activity is never shown."
      showMissionContext={false}
    >
      <EnterpriseStatusBanner />

      <CollaborationStatePanel state={state} message={error}>
        <div className="grid gap-3 lg:grid-cols-2">
          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className={cbaiSectionEyebrow}>Organization activity timeline</p>
            {events.length === 0 ? (
              <p className="text-sm text-zinc-500">
                {sharedBackend
                  ? "No activity_events for the active organization yet."
                  : "Shared Preview Supabase required for activity_events."}
              </p>
            ) : (
              <ul className="space-y-2">
                {events.map((e) => (
                  <li key={e.id} className="text-xs text-zinc-400">
                    {e.createdAt.slice(0, 19)} · {e.action}
                    {e.targetType ? ` · ${e.targetType}` : ""}
                    {e.actorUserId ? ` · ${e.actorUserId.slice(0, 8)}…` : ""}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className={cbaiSectionEyebrow}>Organization audit (membership mirror)</p>
            {auditFallback.length === 0 ? (
              <p className="text-sm text-zinc-500">
                {events.length > 0
                  ? "Live activity_events are the primary timeline when shared backend is active."
                  : "No audit rows in the hydrated membership mirror."}
              </p>
            ) : (
              <ul className="space-y-2">
                {auditFallback.map((e) => (
                  <li key={e.id} className="text-xs text-zinc-400">
                    {e.timestamp.slice(0, 19)} · {e.event} · {e.actorDisplayName}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </CollaborationStatePanel>
    </OperatingPageShell>
  );
}
