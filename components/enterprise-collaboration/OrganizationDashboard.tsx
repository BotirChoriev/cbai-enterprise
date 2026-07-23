"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import CollaborationStatePanel from "@/components/enterprise-collaboration/CollaborationStatePanel";
import {
  cbaiBtnSecondary,
  cbaiFocusRing,
  cbaiGlassCard,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { useActiveOrganization } from "@/components/enterprise-collaboration/ActiveOrganizationProvider";
import {
  loadActiveEnterpriseContext,
  setActiveOrganizationForUser,
} from "@/lib/enterprise-collaboration";
import {
  fetchOrganizationActivityEvents,
  fetchOrganizationComments,
} from "@/lib/enterprise-collaboration/cloud-persistence";
import type { EnterpriseComment } from "@/lib/enterprise-collaboration/types";
import type { OrganizationActivityEvent } from "@/lib/enterprise-collaboration/cloud-persistence";
import { hydrateOrganizationPersistence } from "@/lib/persistence/organization-persistence-service";
import {
  loadMembershipForUser,
  loadOrganizationMemberships,
} from "@/lib/organization-os/organization-membership-store";
import { permissionsForRole } from "@/lib/organization-os/permissions-service";
import { displayLabelForStorageRole } from "@/lib/organization-os/workspace-roles";

export default function OrganizationDashboard() {
  const searchParams = useSearchParams();
  const orgParam = searchParams.get("org");
  const { cloudUser, isCloudSignedIn } = useAuth();
  const {
    organizations,
    activeOrganizationId,
    sharedBackend,
    loading: orgLoading,
    refresh,
    setActiveOrganization,
  } = useActiveOrganization();
  const userId = cloudUser?.id ?? resolveActorId() ?? "device-local";
  const [feedback, setFeedback] = useState<string | null>(null);
  const [comments, setComments] = useState<EnterpriseComment[]>([]);
  const [activity, setActivity] = useState<OrganizationActivityEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const activeId = useMemo(() => {
    if (orgParam && organizations.some((o) => o.id === orgParam)) return orgParam;
    return (
      activeOrganizationId ??
      loadActiveEnterpriseContext().organizationId ??
      organizations[0]?.id ??
      null
    );
  }, [orgParam, organizations, activeOrganizationId]);

  const membership = activeId ? loadMembershipForUser(userId, activeId) : null;
  const members = activeId ? loadOrganizationMemberships(activeId) : [];

  const reload = useCallback(async () => {
    if (!activeId || !userId) {
      setComments([]);
      setActivity([]);
      setLoaded(true);
      return;
    }
    setError(null);
    try {
      if (sharedBackend && isCloudSignedIn) {
        await hydrateOrganizationPersistence(userId);
      }
      const [cRes, aRes] = await Promise.all([
        fetchOrganizationComments(userId, activeId),
        fetchOrganizationActivityEvents(activeId),
      ]);
      if ("error" in cRes) {
        setError(cRes.error);
        setComments([]);
      } else {
        setComments(cRes);
      }
      if ("error" in aRes) {
        setActivity([]);
      } else {
        setActivity(aRes);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load organization.");
    } finally {
      setLoaded(true);
    }
  }, [activeId, userId, sharedBackend, isCloudSignedIn]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function activate(orgId: string) {
    if (sharedBackend) {
      await setActiveOrganization(orgId);
    } else {
      const result = setActiveOrganizationForUser(userId, orgId);
      if ("error" in result) {
        setFeedback(result.error);
        return;
      }
    }
    setFeedback(`Active organization set.`);
    await refresh();
    await reload();
  }

  const state =
    orgLoading || !loaded
      ? "loading"
      : organizations.length === 0
        ? "empty"
        : error
          ? "error"
          : !membership
            ? "denied"
            : "ready";

  return (
    <OperatingPageShell
      title="Organization Dashboard"
      description="Members, roles, comments, and activity for organizations you belong to."
      showMissionContext
      missionContextVariant="compact"
    >
      <EnterpriseStatusBanner />

      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Active organization</p>
        {organizations.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No memberships.{" "}
            <Link href="/organization" className="text-teal-400">
              Create an organization
            </Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {organizations.map((org) => (
              <button
                key={org.id}
                type="button"
                className={`${cbaiBtnSecondary} ${cbaiFocusRing} ${activeId === org.id ? "border-teal-400/50 text-teal-200" : ""}`}
                onClick={() => void activate(org.id)}
              >
                {org.name}
              </button>
            ))}
            <Link href="/organization/workspace" className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}>
              Open Workspace
            </Link>
          </div>
        )}
        {feedback ? <p className="text-xs text-teal-300">{feedback}</p> : null}
        {membership ? (
          <p className="text-xs text-zinc-500">
            Your role:{" "}
            <span className="text-zinc-300">{displayLabelForStorageRole(membership.role)}</span> · Permissions:{" "}
            {permissionsForRole(membership.role).length}
          </p>
        ) : null}
      </section>

      <CollaborationStatePanel state={state} message={error}>
        <section className="grid gap-3 lg:grid-cols-2">
          <div className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className={cbaiSectionEyebrow}>Members</p>
            {members.length === 0 ? (
              <p className="text-sm text-zinc-500">No members visible.</p>
            ) : (
              <ul className="space-y-2">
                {members.map((m) => (
                  <li key={m.id} className="text-sm text-zinc-300">
                    {m.userDisplayName || m.userId.slice(0, 8)} · {displayLabelForStorageRole(m.role)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className={cbaiSectionEyebrow}>Recent org comments</p>
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-500">No comments in this organization yet.</p>
            ) : (
              <ul className="space-y-2">
                {comments.slice(0, 6).map((c) => (
                  <li key={c.id} className="text-sm text-zinc-300">
                    <span className="text-zinc-500">{c.authorId.slice(0, 8)}…</span> — {c.body.slice(0, 120)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={`${cbaiGlassCard} space-y-2 p-4 lg:col-span-2`}>
            <p className={cbaiSectionEyebrow}>Activity (membership-scoped)</p>
            {activity.length === 0 ? (
              <p className="text-sm text-zinc-500">No activity_events for this organization yet.</p>
            ) : (
              <ul className="space-y-2">
                {activity.slice(0, 8).map((e) => (
                  <li key={e.id} className="text-xs text-zinc-400">
                    {e.createdAt.slice(0, 19)} · {e.action}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/activity" className="text-xs text-teal-400 hover:text-teal-300">
              Open Activity Center →
            </Link>
          </div>
        </section>
      </CollaborationStatePanel>
    </OperatingPageShell>
  );
}
