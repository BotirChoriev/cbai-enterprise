import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OrganizationResponsibilityMapRow } from "@/lib/supabase/database.types";
import type { ResponsibilityMapDraft, ResponsibilityRole } from "@/lib/organization-os/responsibility-map";

export type PersistedResponsibilityMap = {
  readonly id: string;
  readonly organizationId: string;
  readonly problemLocalId: string;
  readonly assignments: Partial<Record<ResponsibilityRole, string>>;
  readonly confirmedBy: string;
  readonly confirmedAt: string;
  readonly version: number;
};

function mapRow(row: OrganizationResponsibilityMapRow): PersistedResponsibilityMap {
  return {
    id: row.id,
    organizationId: row.organization_id,
    problemLocalId: row.problem_local_id,
    assignments: row.assignments as Partial<Record<ResponsibilityRole, string>>,
    confirmedBy: row.confirmed_by,
    confirmedAt: row.confirmed_at,
    version: row.version,
  };
}

export async function loadResponsibilityMap(
  organizationId: string,
  problemLocalId: string,
): Promise<PersistedResponsibilityMap | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data, error } = await client
    .from("organization_responsibility_maps")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("problem_local_id", problemLocalId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
}

export async function persistConfirmedResponsibilityMap(input: {
  readonly organizationId: string;
  readonly problemLocalId: string;
  readonly draft: ResponsibilityMapDraft;
  readonly expectedVersion: number;
}): Promise<{ ok: true; value: PersistedResponsibilityMap } | { ok: false; message: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, message: "Shared backend is not configured." };
  if (!input.draft.readyForHumanReview) {
    return { ok: false, message: "Responsibility map still has unresolved gaps or conflicts." };
  }
  const assignments = Object.fromEntries(
    input.draft.assignments
      .filter((assignment) => assignment.memberId)
      .map((assignment) => [assignment.role, assignment.memberId as string]),
  );
  const { data, error } = await client.rpc("confirm_organization_responsibility_map", {
    p_organization_id: input.organizationId,
    p_problem_local_id: input.problemLocalId,
    p_assignments: assignments,
    p_expected_version: input.expectedVersion,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, value: mapRow(data) };
}
