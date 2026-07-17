/**
 * BUILD-039 — Supabase organization repository (production shared path).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { generateInvitationTokenSync } from "@/lib/organization-os/invitation-token";
import type {
  AcceptInviteInput,
  CreateOrganizationInput,
  InviteMemberInput,
  InviteMemberResult,
  OrganizationRepository,
  RepositoryResult,
} from "@/lib/persistence/organization-repository.types";
import {
  mapAuditRow,
  mapInvitationRow,
  mapMembershipRow,
  mapOrganizationRow,
  mapSupabaseError,
  type AuditRow,
  type InvitationRow,
  type MembershipRow,
  type OrganizationRow,
} from "@/lib/persistence/supabase-row-mappers";
import type { Organization } from "@/lib/organization-os/organization.types";
import type {
  OrganizationInvitation,
  OrganizationMembership,
} from "@/lib/organization-os/organization-membership-store";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function ok<T>(value: T): RepositoryResult<T> {
  return { ok: true, value };
}

function err(code: string, message: string): RepositoryResult<never> {
  return { ok: false, code, message };
}

function getClient() {
  return getSupabaseBrowserClient();
}

export class SupabaseOrganizationRepository implements OrganizationRepository {
  readonly adapterKind = "supabase_shared" as const;
  readonly isShared = true;

  async listOrganizations(userId: string): Promise<readonly Organization[]> {
    const client = getClient();
    if (!client) return [];
    const { data: memberships, error: memErr } = await client
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("status", "active");
    if (memErr || !memberships?.length) return [];
    const ids = memberships.map((m) => m.organization_id as string);
    const { data: orgs } = await client.from("organizations").select("*").in("id", ids);
    return ((orgs ?? []) as OrganizationRow[]).map(mapOrganizationRow);
  }

  async getOrganization(organizationId: string): Promise<Organization | null> {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client.from("organizations").select("*").eq("id", organizationId).maybeSingle();
    if (error || !data) return null;
    return mapOrganizationRow(data as OrganizationRow);
  }

  async createOrganizationWithOwner(
    input: CreateOrganizationInput,
  ): Promise<RepositoryResult<{ organization: Organization; membership: OrganizationMembership }>> {
    const client = getClient();
    if (!client) return err("shared_backend_not_configured", "Shared backend is not configured.");

    const { data, error: rpcErr } = await client.rpc("create_organization_with_owner", {
      p_name: input.name.trim(),
      p_organization_type: input.kind,
      p_identity_kind: "workspace_organization",
      p_official_website: input.website ?? null,
      p_country_code: input.country ?? null,
    });

    if (rpcErr) {
      const mapped = mapSupabaseError(rpcErr);
      return err(mapped.code, mapped.message);
    }

    const payload = data as { organization: OrganizationRow; membership: MembershipRow };
    return ok({
      organization: mapOrganizationRow(payload.organization),
      membership: mapMembershipRow(payload.membership, input.ownerDisplayName),
    });
  }

  async listMemberships(organizationId: string): Promise<readonly OrganizationMembership[]> {
    const client = getClient();
    if (!client) return [];
    const { data } = await client
      .from("organization_memberships")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("status", "active");
    return ((data ?? []) as MembershipRow[]).map((r) => mapMembershipRow(r));
  }

  async listInvitations(organizationId: string): Promise<readonly OrganizationInvitation[]> {
    const client = getClient();
    if (!client) return [];
    const { data } = await client
      .from("organization_invitations")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    return ((data ?? []) as InvitationRow[]).map(mapInvitationRow);
  }

  async inviteMember(input: InviteMemberInput): Promise<RepositoryResult<InviteMemberResult>> {
    const client = getClient();
    if (!client) return err("shared_backend_not_configured", "Shared backend is not configured.");

    const { rawToken, tokenHash } = generateInvitationTokenSync();
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

    const { data, error: insertErr } = await client
      .from("organization_invitations")
      .insert({
        organization_id: input.organizationId,
        recipient_email_normalized: input.inviteeEmail.trim().toLowerCase(),
        intended_role: input.role,
        token_hash: tokenHash,
        status: "pending",
        expires_at: expiresAt,
        created_by: input.inviterId,
        accepted_by: null,
        accepted_at: null,
        revoked_at: null,
      })
      .select("*")
      .single();

    if (insertErr) {
      const mapped = mapSupabaseError(insertErr);
      return err(mapped.code, mapped.message);
    }

    await client.from("organization_audit_events").insert({
      organization_id: input.organizationId,
      actor_id: input.inviterId,
      action: "invitation_created",
      target_type: "invitation",
      target_id: (data as InvitationRow).id,
      safe_metadata: { role: input.role, actorDisplayName: input.inviterDisplayName },
    });

    return ok({ invitation: mapInvitationRow(data as InvitationRow), rawToken });
  }

  async acceptInvitation(input: AcceptInviteInput): Promise<RepositoryResult<OrganizationMembership>> {
    const client = getClient();
    if (!client) return err("shared_backend_not_configured", "Shared backend is not configured.");

    const { data, error: rpcErr } = await client.rpc("accept_organization_invitation_by_token", {
      p_raw_token: input.rawToken.trim(),
    });

    if (rpcErr) {
      const mapped = mapSupabaseError(rpcErr);
      return err(mapped.code, mapped.message);
    }

    const payload = data as { membership: MembershipRow };
    return ok(mapMembershipRow(payload.membership, input.userDisplayName));
  }

  async revokeInvitation(
    invitationId: string,
    actorId: string,
    actorDisplayName: string,
  ): Promise<RepositoryResult<boolean>> {
    const client = getClient();
    if (!client) return err("shared_backend_not_configured", "Shared backend is not configured.");

    const { data: inv } = await client
      .from("organization_invitations")
      .select("*")
      .eq("id", invitationId)
      .maybeSingle();
    if (!inv || (inv as InvitationRow).status !== "pending") {
      return err("not_found", "Invitation not found.");
    }

    const { error: updErr } = await client
      .from("organization_invitations")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId)
      .eq("status", "pending");

    if (updErr) {
      const mapped = mapSupabaseError(updErr);
      return err(mapped.code, mapped.message);
    }

    await client.from("organization_audit_events").insert({
      organization_id: (inv as InvitationRow).organization_id,
      actor_id: actorId,
      action: "invitation_revoked",
      target_type: "invitation",
      target_id: invitationId,
      safe_metadata: { actorDisplayName },
    });

    return ok(true);
  }

  async listAudit(organizationId: string) {
    const client = getClient();
    if (!client) return [];
    const { data } = await client
      .from("organization_audit_events")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(100);
    return ((data ?? []) as AuditRow[]).map(mapAuditRow);
  }
}
