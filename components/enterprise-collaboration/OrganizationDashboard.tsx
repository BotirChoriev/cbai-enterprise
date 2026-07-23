"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import {
  cbaiBtnSecondary,
  cbaiFocusRing,
  cbaiGlassCard,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import {
  loadActiveEnterpriseContext,
  setActiveOrganizationForUser,
  loadEnterpriseCommentsForOrganization,
} from "@/lib/enterprise-collaboration";
import { loadOrganizations } from "@/lib/organization-os/organization-store";
import {
  loadMembershipForUser,
  loadOrganizationMemberships,
} from "@/lib/organization-os/organization-membership-store";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { permissionsForRole } from "@/lib/organization-os/permissions-service";

export default function OrganizationDashboard() {
  const searchParams = useSearchParams();
  const orgParam = searchParams.get("org");
  const [tick, setTick] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const userId = resolveActorId() ?? "device-local";

  useEffect(() => {
    setTick(1);
  }, []);

  const memberships = useMemo(() => {
    void tick;
    return loadOrganizationMemberships().filter((m) => m.userId === userId);
  }, [tick, userId]);

  const organizations = useMemo(() => {
    void tick;
    const all = loadOrganizations();
    return memberships
      .map((m) => all.find((o) => o.id === m.organizationId))
      .filter((o): o is NonNullable<typeof o> => Boolean(o));
  }, [tick, memberships]);

  const activeId = useMemo(() => {
    void tick;
    if (orgParam && loadMembershipForUser(userId, orgParam)) return orgParam;
    return loadActiveEnterpriseContext().organizationId ?? organizations[0]?.id ?? null;
  }, [tick, orgParam, organizations, userId]);

  const membership = activeId ? loadMembershipForUser(userId, activeId) : null;
  const comments = useMemo(() => {
    void tick;
    if (!activeId) return [];
    const result = loadEnterpriseCommentsForOrganization(userId, activeId);
    return "error" in result ? [] : result;
  }, [tick, activeId, userId]);

  const audit = useMemo(() => {
    void tick;
    return activeId ? loadOrganizationAudit(activeId).slice(0, 8) : [];
  }, [tick, activeId]);

  function activate(orgId: string) {
    const result = setActiveOrganizationForUser(userId, orgId);
    if ("error" in result) {
      setFeedback(result.error);
      return;
    }
    setFeedback(`Active organization set to ${organizations.find((o) => o.id === orgId)?.name ?? orgId}`);
    setTick((n) => n + 1);
  }

  return (
    <OperatingPageShell
      title="Organization Dashboard"
      description="Members, roles, comments, and audit for organizations you belong to."
      showMissionContext
      missionContextVariant="compact"
    >
      <EnterpriseStatusBanner />

      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Active organization</p>
        {organizations.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No memberships. <Link href="/organization" className="text-teal-400">Create an organization</Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {organizations.map((org) => (
              <button
                key={org.id}
                type="button"
                className={`${cbaiBtnSecondary} ${cbaiFocusRing} ${activeId === org.id ? "border-teal-400/50 text-teal-200" : ""}`}
                onClick={() => activate(org.id)}
              >
                {org.name}
              </button>
            ))}
          </div>
        )}
        {feedback ? <p className="text-xs text-teal-300">{feedback}</p> : null}
        {membership ? (
          <p className="text-xs text-zinc-500">
            Your role: <span className="text-zinc-300">{membership.role}</span> · Permissions:{" "}
            {permissionsForRole(membership.role).length}
          </p>
        ) : null}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className={cbaiSectionEyebrow}>Recent org comments</p>
          {comments.length === 0 ? (
            <p className="text-sm text-zinc-500">No comments in this organization yet.</p>
          ) : (
            <ul className="space-y-2">
              {comments.slice(0, 6).map((c) => (
                <li key={c.id} className="text-sm text-zinc-300">
                  <span className="text-zinc-500">{c.authorId}</span> — {c.body.slice(0, 120)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className={cbaiSectionEyebrow}>Audit (membership-scoped)</p>
          {audit.length === 0 ? (
            <p className="text-sm text-zinc-500">No audit events for this organization.</p>
          ) : (
            <ul className="space-y-2">
              {audit.map((e) => (
                <li key={e.id} className="text-xs text-zinc-400">
                  {e.timestamp.slice(0, 19)} · {e.event} · {e.actorDisplayName}
                </li>
              ))}
            </ul>
          )}
          <Link href="/activity" className="text-xs text-teal-400 hover:text-teal-300">
            Open Activity Center →
          </Link>
        </div>
      </section>
    </OperatingPageShell>
  );
}
