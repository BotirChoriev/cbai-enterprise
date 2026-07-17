"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getCurrentUserId } from "@/lib/auth/auth-store";
import { loadOrganizations } from "@/lib/organization-os/organization-store";
import {
  createOrganizationWithOwner,
  inviteOrganizationMember,
  loadOrganizationInvitations,
  loadOrganizationMemberships,
  revokeOrganizationInvitation,
} from "@/lib/organization-os/organization-membership-store";
import { authorizeOrganizationAction } from "@/lib/organization-os/authorization-policy";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { backfillLivingRelationships } from "@/lib/living-object-network/living-relationship-backfill";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import type { OrganizationKind } from "@/lib/organization-os/organization.types";
import { ORGANIZATION_KINDS } from "@/lib/organization-os/organization.types";

export default function OrganizationPageClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const orgParam = searchParams.get("org");
  const inviteToken = searchParams.get("invite");
  const [tick, setTick] = useState(0);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<OrganizationKind>("other");
  const [website, setWebsite] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = getCurrentUserId() ?? "device-local";
  const displayName = "Operator";

  const bump = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onChange = () => bump();
    window.addEventListener(MISSION_DATA_CHANGED, onChange);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChange);
  }, [bump]);

  const organizations = useMemo(() => {
    void tick;
    return [...loadOrganizations()];
  }, [tick]);

  const selectedOrgId = orgParam ?? organizations[0]?.id ?? null;
  const selectedOrg = organizations.find((o) => o.id === selectedOrgId) ?? null;

  const members = useMemo(() => {
    void tick;
    return selectedOrgId ? loadOrganizationMemberships(selectedOrgId) : [];
  }, [selectedOrgId, tick]);

  const invitations = useMemo(() => {
    void tick;
    return selectedOrgId ? loadOrganizationInvitations(selectedOrgId) : [];
  }, [selectedOrgId, tick]);

  const audit = useMemo(() => {
    void tick;
    return selectedOrgId ? loadOrganizationAudit(selectedOrgId) : [];
  }, [selectedOrgId, tick]);

  const canInvite =
    selectedOrgId &&
    authorizeOrganizationAction({
      actorId: userId,
      organizationId: selectedOrgId,
      action: "membership.invite",
    }).ok;

  const persistenceNote = isSupabaseConfigured()
    ? "Projects may sync via Supabase when signed in. Organization membership remains device-local until org cloud sync is connected."
    : "Shared backend not configured — organization data is device-local only. Multi-user collaboration requires Supabase setup.";

  const createOrg = () => {
    setError(null);
    if (!name.trim()) {
      setError("Organization name is required.");
      return;
    }
    const result = createOrganizationWithOwner({
      name,
      kind,
      ownerUserId: userId,
      ownerDisplayName: displayName,
      website: website.trim() || null,
    });
    backfillLivingRelationships(userId);
    setFeedback(`Organization "${result.organization.name}" created. This is a user workspace — not an officially verified institution.`);
    setName("");
    bump();
  };

  const sendInvite = () => {
    if (!selectedOrgId || !canInvite) return;
    setError(null);
    const result = inviteOrganizationMember({
      organizationId: selectedOrgId,
      inviterId: userId,
      inviterDisplayName: displayName,
      inviteeEmail: inviteEmail,
      role: "member",
    });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    const link = `${window.location.origin}/organization?invite=${result.token}`;
    setFeedback(`Invitation created. Email was not sent — copy this link: ${link}`);
    setInviteEmail("");
    bump();
  };

  return (
    <OperatingPageShell title={t("organizationOs.missionRoomEyebrow")} showOperator={false}>
      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Organization OS</p>
        <p className="text-xs text-amber-400/90" role="status">
          {persistenceNote}
        </p>
        {inviteToken ? (
          <p className="text-xs text-zinc-400">
            Invitation token present — accept from the account matching the invited email on this device.
          </p>
        ) : null}
      </section>

      <section className={`${cbaiGlassCard} space-y-4 p-4`} aria-labelledby="create-org-heading">
        <h2 id="create-org-heading" className="text-sm font-semibold text-zinc-100">
          Create organization
        </h2>
        <p className="text-xs text-zinc-500">
          User-created workspace only. Naming &quot;NASA&quot;, &quot;WHO&quot;, or another real institution does not verify official representation.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="org-name" className="text-xs text-zinc-500">
              Name
            </label>
            <input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
            />
          </div>
          <div>
            <label htmlFor="org-kind" className="text-xs text-zinc-500">
              Type
            </label>
            <select
              id="org-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as OrganizationKind)}
              className={`mt-1 min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
            >
              {ORGANIZATION_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="button" onClick={createOrg} className={`${cbaiBtnPrimary} min-h-10`}>
          Create organization
        </button>
      </section>

      {selectedOrg ? (
        <>
          <section className={`${cbaiGlassCard} space-y-3 p-4`}>
            <h2 className="text-sm font-semibold text-zinc-100">{selectedOrg.name}</h2>
            <p className="text-xs text-zinc-500">
              {selectedOrg.identityKind} · {members.length} member(s) · v{selectedOrg.version}
            </p>
            <dl className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-3">
              <div>
                <dt className="text-zinc-600">Missions</dt>
                <dd>Linked via mission context</dd>
              </div>
              <div>
                <dt className="text-zinc-600">Members</dt>
                <dd>{members.length}</dd>
              </div>
              <div>
                <dt className="text-zinc-600">Pending invites</dt>
                <dd>{invitations.filter((i) => i.status === "pending").length}</dd>
              </div>
            </dl>
          </section>

          {canInvite ? (
            <section className={`${cbaiGlassCard} space-y-3 p-4`}>
              <h3 className="text-sm font-semibold text-zinc-100">Invite member</h3>
              <label htmlFor="invite-email" className="text-xs text-zinc-500">
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
              />
              <button type="button" onClick={sendInvite} className={`${cbaiBtnPrimary} min-h-10`}>
                Create invitation link
              </button>
              <p className="text-[10px] text-zinc-600">Email transport not connected — invitation link only.</p>
            </section>
          ) : null}

          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <h3 className="text-sm font-semibold text-zinc-100">Members</h3>
            <ul className="space-y-1 text-xs text-zinc-400">
              {members.map((m) => (
                <li key={m.id}>
                  {m.userDisplayName} · {m.role} · v{m.version}
                </li>
              ))}
            </ul>
          </section>

          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <h3 className="text-sm font-semibold text-zinc-100">Audit</h3>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-[10px] text-zinc-500">
              {audit.slice(-10).map((a) => (
                <li key={a.id}>
                  {a.timestamp.slice(0, 19)} · {a.event} · {a.actorDisplayName}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {feedback ? (
        <p className="text-xs text-teal-400/90" role="status">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-amber-400/90" role="alert">
          {error}
        </p>
      ) : null}
    </OperatingPageShell>
  );
}
