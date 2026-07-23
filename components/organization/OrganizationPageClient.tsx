"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getCurrentUser } from "@/lib/auth/auth-store";
import { loadOrganizations } from "@/lib/organization-os/organization-store";
import {
  loadOrganizationInvitations,
  loadOrganizationMemberships,
} from "@/lib/organization-os/organization-membership-store";
import { authorizeOrganizationAction } from "@/lib/organization-os/authorization-policy";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { backfillLivingRelationships } from "@/lib/living-object-network/living-relationship-backfill";
import { resolvePersistenceStatus } from "@/lib/persistence/persistence-capability";
import {
  acceptOrganizationInvitationPersisted,
  createOrganizationPersisted,
  hydrateOrganizationPersistence,
  inviteOrganizationMemberPersisted,
} from "@/lib/persistence/organization-persistence-service";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";
import { getCloudSession } from "@/lib/supabase/cloud-auth";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import ExecutionOsPanel from "@/components/genesis/ExecutionOsPanel";
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
  const [busy, setBusy] = useState(false);
  const [cloudEmail, setCloudEmail] = useState<string | null>(null);

  const userId = resolveActorId() ?? "device-local";
  const localUser = getCurrentUser();
  const displayName = localUser?.displayName ?? cloudEmail?.split("@")[0] ?? "Operator";

  const bump = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onChange = () => bump();
    window.addEventListener(MISSION_DATA_CHANGED, onChange);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChange);
  }, [bump]);

  useEffect(() => {
    if (!isOrganizationCollaborationShared()) return;
    void (async () => {
      const session = await getCloudSession();
      if (session) {
        setCloudEmail(session.user.email);
        await hydrateOrganizationPersistence(session.user.id);
        bump();
      }
    })();
  }, [bump]);

  useEffect(() => {
    if (!inviteToken || !isOrganizationCollaborationShared()) return;
    void (async () => {
      const session = await getCloudSession();
      if (!session) {
        setError(t("organizationOs.signInRequired"));
        return;
      }
      setBusy(true);
      const result = await acceptOrganizationInvitationPersisted({
        rawToken: inviteToken,
        userDisplayName: session.user.email.split("@")[0] ?? "Member",
        userEmail: session.user.email,
      });
      setBusy(false);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setFeedback(t("organizationOs.inviteAccepted"));
      bump();
    })();
  }, [inviteToken, t, bump]);

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

  const persistence = useMemo(() => resolvePersistenceStatus(), []);
  const persistenceNote =
    persistence.capability === "shared_backend_ready"
      ? t("organizationOs.persistenceSharedReady")
      : persistence.capability === "shared_backend_misconfigured"
        ? t("organizationOs.persistenceMisconfigured")
        : t("organizationOs.persistenceDeviceLocal");

  const createOrg = () => {
    void (async () => {
      setError(null);
      if (isOrganizationCollaborationShared() && !getSyncedCloudUserId()) {
        setError(t("organizationOs.signInRequired"));
        return;
      }
      if (!name.trim()) {
        setError(t("organizationOs.nameRequired"));
        return;
      }
      setBusy(true);
      if (isOrganizationCollaborationShared()) {
        const result = await createOrganizationPersisted({
          name,
          kind,
          ownerDisplayName: displayName,
          website: website.trim() || null,
        });
        setBusy(false);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        backfillLivingRelationships(userId);
        setFeedback(t("organizationOs.orgCreated", { name: result.organization.name }));
      } else {
        const { createOrganizationWithOwner } = await import(
          "@/lib/organization-os/organization-membership-store"
        );
        const result = createOrganizationWithOwner({
          name,
          kind,
          ownerUserId: userId,
          ownerDisplayName: displayName,
          website: website.trim() || null,
        });
        setBusy(false);
        backfillLivingRelationships(userId);
        setFeedback(t("organizationOs.orgCreated", { name: result.organization.name }));
      }
      setName("");
      bump();
    })();
  };

  const sendInvite = () => {
    if (!selectedOrgId || !canInvite) return;
    void (async () => {
      setError(null);
      setBusy(true);
      if (isOrganizationCollaborationShared()) {
        const result = await inviteOrganizationMemberPersisted({
          organizationId: selectedOrgId,
          inviterDisplayName: displayName,
          inviteeEmail: inviteEmail,
          role: "member",
        });
        setBusy(false);
        if ("error" in result) {
          setError(typeof result.error === "string" ? result.error : "Invite failed.");
          return;
        }
        if (result.emailStatus === "delivered") {
          setFeedback(`Invitation created and email delivered to ${inviteEmail}.`);
        } else {
          const link = result.acceptUrl ?? `${window.location.origin}/organization?invite=${result.rawToken}`;
          setFeedback(
            `Email delivery not configured — invitation record is valid. Preview copy-link: ${link}`,
          );
          if (result.copyLinkAllowed && navigator.clipboard?.writeText) {
            void navigator.clipboard.writeText(link);
          }
        }
      } else {
        const { inviteOrganizationMember } = await import(
          "@/lib/organization-os/organization-membership-store"
        );
        const result = inviteOrganizationMember({
          organizationId: selectedOrgId,
          inviterId: userId,
          inviterDisplayName: displayName,
          inviteeEmail: inviteEmail,
          role: "member",
        });
        setBusy(false);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        const link = `${window.location.origin}/organization?invite=${result.rawToken}`;
        setFeedback(t("organizationOs.inviteCreated", { link }));
      }
      setInviteEmail("");
      bump();
    })();
  };

  return (
    <OperatingPageShell title={t("organizationOs.missionRoomEyebrow")} showOperator={false}>
      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>{t("organizationOs.pageEyebrow")}</p>
        <p className="text-xs text-amber-400/90" role="status">
          {persistenceNote}
        </p>
        {inviteToken ? (
          <p className="text-xs text-zinc-400">{t("organizationOs.inviteTokenPresent")}</p>
        ) : null}
        {busy ? (
          <p className="text-xs text-zinc-500" role="status" aria-live="polite">
            {t("organizationOs.saving")}
          </p>
        ) : null}
      </section>

      <section className={`${cbaiGlassCard} space-y-4 p-4`} aria-labelledby="create-org-heading">
        <h2 id="create-org-heading" className="text-sm font-semibold text-zinc-100">
          {t("organizationOs.createHeading")}
        </h2>
        <p className="text-xs text-zinc-500">{t("organizationOs.identityWarning")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="org-name" className="text-xs text-zinc-500">
              {t("organizationOs.nameLabel")}
            </label>
            <input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              className={`mt-1 min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
            />
          </div>
          <div>
            <label htmlFor="org-kind" className="text-xs text-zinc-500">
              {t("organizationOs.typeLabel")}
            </label>
            <select
              id="org-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as OrganizationKind)}
              disabled={busy}
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
        <button type="button" onClick={createOrg} disabled={busy} className={`${cbaiBtnPrimary} min-h-10`}>
          {t("organizationOs.createButton")}
        </button>
      </section>

      {selectedOrg ? (
        <>
          <section className={`${cbaiGlassCard} space-y-3 p-4`}>
            <h2 className="text-sm font-semibold text-zinc-100">{selectedOrg.name}</h2>
            <p className="text-xs text-zinc-500">
              {selectedOrg.identityKind} · {t("organizationOs.memberCount", { count: String(members.length) })} · v
              {selectedOrg.version}
            </p>
            <dl className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-3">
              <div>
                <dt className="text-zinc-600">{t("organizationOs.missionsLabel")}</dt>
                <dd>{t("organizationOs.missionsLinked")}</dd>
              </div>
              <div>
                <dt className="text-zinc-600">{t("organizationOs.membersLabel")}</dt>
                <dd>{members.length}</dd>
              </div>
              <div>
                <dt className="text-zinc-600">{t("organizationOs.pendingInvitesLabel")}</dt>
                <dd>{invitations.filter((i) => i.status === "pending").length}</dd>
              </div>
            </dl>
          </section>

          {canInvite ? (
            <section className={`${cbaiGlassCard} space-y-3 p-4`}>
              <h3 className="text-sm font-semibold text-zinc-100">{t("organizationOs.inviteHeading")}</h3>
              <label htmlFor="invite-email" className="text-xs text-zinc-500">
                {t("organizationOs.emailLabel")}
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={busy}
                className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
              />
              <button type="button" onClick={sendInvite} disabled={busy} className={`${cbaiBtnPrimary} min-h-10`}>
                {t("organizationOs.createInviteLink")}
              </button>
              <p className="text-[10px] text-zinc-600">{t("organizationOs.emailNotSent")}</p>
            </section>
          ) : null}

          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <h3 className="text-sm font-semibold text-zinc-100">{t("organizationOs.membersLabel")}</h3>
            <ul className="space-y-1 text-xs text-zinc-400">
              {members.map((m) => (
                <li key={m.id}>
                  {m.userDisplayName} · {m.role} · v{m.version}
                </li>
              ))}
            </ul>
          </section>

          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <h3 className="text-sm font-semibold text-zinc-100">{t("organizationOs.auditHeading")}</h3>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-[10px] text-zinc-500">
              {audit.slice(-10).map((a) => (
                <li key={a.id}>
                  {a.timestamp.slice(0, 19)} · {a.event} · {a.actorDisplayName}
                </li>
              ))}
            </ul>
          </section>

          <ExecutionOsPanel organizationId={selectedOrg.id} operatorName={displayName} />
        </>
      ) : null}

      {feedback ? (
        <p className="text-xs text-teal-400/90" role="status" aria-live="polite">
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
