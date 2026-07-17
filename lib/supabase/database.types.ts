/**
 * Hand-written types mirroring supabase/migrations/0001_init_schema.sql exactly (Real Supabase
 * Authentication + Cloud Persistence mission). Keep in sync with the SQL by hand — there is no
 * Supabase CLI project link in this environment to run `supabase gen types` against, and
 * generating types against a schema no live project has actually applied would be a bigger
 * fabrication than a manually maintained file. If a real Supabase project is later linked, prefer
 * regenerating this file with the CLI and diffing it against the manual version below.
 */

// Relationships is required by @supabase/postgrest-js's GenericTable shape but this app never
// uses Supabase's embedded-resource select syntax (it does explicit per-table queries), so it is
// always real-but-empty rather than fabricated foreign-key metadata.
type TableDef<Row, Insert, Update> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export type ProjectStatusValue = "active" | "paused" | "completed" | "archived";
export type ProjectVisibilityValue = "private" | "team" | "public";
export type ProjectTaskStatusValue = "todo" | "in_progress" | "done";
export type EntityKindValue = "country" | "company" | "university" | "research_topic" | "project";
/** bookmarks also allows "evidence" — a general saved reference to a real, catalog-backed
 * TopicEvidenceCatalogItem, deliberately not a valid project_entity_links kind (evidence is never
 * a project's "Related Entity" the way country/company/university/research_topic/project are). */
export type BookmarkKindValue = EntityKindValue | "evidence";
export type ReportKindValue = "project" | "country" | "company" | "university" | "research_topic";

export type ProfileRow = {
  id: string;
  display_name: string;
  organization: string;
  preferred_language: string;
  workspace_role: string;
  country: string;
  timezone: string;
  accessibility_preferences: Record<string, unknown>;
  assistant_name: string;
  avatar_mode: string;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  owner_id: string;
  local_id: string | null;
  title: string;
  project_type: string;
  description: string;
  status: ProjectStatusValue;
  visibility: ProjectVisibilityValue;
  primary_entity_kind: string | null;
  primary_entity_id: string | null;
  primary_entity_name: string | null;
  tags: string[];
  research_question: string | null;
  objectives: string | null;
  report_generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectObjectiveRow = {
  id: string;
  project_id: string;
  owner_id: string;
  local_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

export type ProjectNoteRow = {
  id: string;
  project_id: string;
  owner_id: string;
  local_id: string | null;
  body: string;
  linked_evidence_id: string | null;
  linked_evidence_label: string | null;
  linked_entity_id: string | null;
  linked_entity_name: string | null;
  linked_entity_type: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectTaskRow = {
  id: string;
  project_id: string;
  owner_id: string;
  local_id: string | null;
  title: string;
  status: ProjectTaskStatusValue;
  created_at: string;
  updated_at: string;
};

export type ProjectQuestionRow = {
  id: string;
  project_id: string;
  owner_id: string;
  local_id: string | null;
  question: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectEvidenceRow = {
  id: string;
  project_id: string;
  owner_id: string;
  local_id: string | null;
  title: string;
  source_url: string | null;
  linked_entity_id: string | null;
  linked_entity_name: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectEntityLinkRow = {
  id: string;
  project_id: string;
  owner_id: string;
  local_id: string | null;
  entity_kind: EntityKindValue;
  entity_id: string;
  entity_name: string;
  entity_code: string | null;
  entity_country_name: string | null;
  created_at: string;
};

export type BookmarkRow = {
  id: string;
  owner_id: string;
  local_id: string | null;
  entity_kind: BookmarkKindValue;
  entity_id: string;
  entity_name: string;
  entity_code: string | null;
  entity_country_name: string | null;
  created_at: string;
};

export type ReportRow = {
  id: string;
  owner_id: string;
  local_id: string | null;
  kind: ReportKindValue;
  entity_id: string;
  entity_name: string;
  project_id: string | null;
  title: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
};

export type ActivityEventRow = {
  id: string;
  owner_id: string;
  local_id: string | null;
  event_type: string;
  entity_kind: string | null;
  entity_id: string | null;
  entity_name: string | null;
  project_id: string | null;
  created_at: string;
};

export type OrganizationRow = {
  id: string;
  name: string;
  normalized_name: string;
  organization_type: string;
  identity_kind: string;
  official_website: string | null;
  country_code: string | null;
  verification_state: string;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type OrganizationMembershipRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  status: string;
  version: number;
  invited_by: string | null;
  joined_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationInvitationRow = {
  id: string;
  organization_id: string;
  recipient_email_normalized: string;
  intended_role: string;
  token_hash: string;
  status: string;
  expires_at: string;
  created_by: string;
  accepted_by: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
};

export type OrganizationAuditEventRow = {
  id: string;
  organization_id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  safe_metadata: Record<string, unknown>;
  created_at: string;
};

type Insertable<Row, DefaultedKeys extends keyof Row> = Omit<Row, DefaultedKeys> &
  Partial<Pick<Row, DefaultedKeys>>;

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        ProfileRow,
        Insertable<
          ProfileRow,
          | "created_at"
          | "updated_at"
          | "display_name"
          | "organization"
          | "preferred_language"
          | "workspace_role"
          | "country"
          | "timezone"
          | "accessibility_preferences"
          | "assistant_name"
          | "avatar_mode"
        >,
        Partial<Omit<ProfileRow, "id">>
      >;
      projects: TableDef<
        ProjectRow,
        Insertable<ProjectRow, "id" | "created_at" | "updated_at" | "tags" | "status" | "visibility">,
        Partial<Omit<ProjectRow, "id" | "owner_id">>
      >;
      project_objectives: TableDef<
        ProjectObjectiveRow,
        Insertable<ProjectObjectiveRow, "id" | "created_at" | "updated_at">,
        Partial<Omit<ProjectObjectiveRow, "id" | "owner_id" | "project_id">>
      >;
      project_notes: TableDef<
        ProjectNoteRow,
        Insertable<ProjectNoteRow, "id" | "created_at" | "updated_at">,
        Partial<Omit<ProjectNoteRow, "id" | "owner_id" | "project_id">>
      >;
      project_tasks: TableDef<
        ProjectTaskRow,
        Insertable<ProjectTaskRow, "id" | "created_at" | "updated_at" | "status">,
        Partial<Omit<ProjectTaskRow, "id" | "owner_id" | "project_id">>
      >;
      project_questions: TableDef<
        ProjectQuestionRow,
        Insertable<ProjectQuestionRow, "id" | "created_at" | "updated_at" | "resolved">,
        Partial<Omit<ProjectQuestionRow, "id" | "owner_id" | "project_id">>
      >;
      project_evidence: TableDef<
        ProjectEvidenceRow,
        Insertable<ProjectEvidenceRow, "id" | "created_at" | "updated_at">,
        Partial<Omit<ProjectEvidenceRow, "id" | "owner_id" | "project_id">>
      >;
      project_entity_links: TableDef<
        ProjectEntityLinkRow,
        Insertable<ProjectEntityLinkRow, "id" | "created_at">,
        Partial<Omit<ProjectEntityLinkRow, "id" | "owner_id" | "project_id">>
      >;
      bookmarks: TableDef<
        BookmarkRow,
        Insertable<BookmarkRow, "id" | "created_at">,
        Partial<Omit<BookmarkRow, "id" | "owner_id">>
      >;
      reports: TableDef<
        ReportRow,
        Insertable<ReportRow, "id" | "created_at" | "updated_at" | "generated_at">,
        Partial<Omit<ReportRow, "id" | "owner_id">>
      >;
      activity_events: TableDef<
        ActivityEventRow,
        Insertable<ActivityEventRow, "id" | "created_at">,
        Partial<Omit<ActivityEventRow, "id" | "owner_id">>
      >;
      organizations: TableDef<
        OrganizationRow,
        Insertable<OrganizationRow, "id" | "created_at" | "updated_at" | "version" | "verification_state" | "identity_kind" | "organization_type" | "normalized_name">,
        Partial<Omit<OrganizationRow, "id">>
      >;
      organization_memberships: TableDef<
        OrganizationMembershipRow,
        Insertable<OrganizationMembershipRow, "id" | "created_at" | "updated_at" | "version" | "status">,
        Partial<Omit<OrganizationMembershipRow, "id">>
      >;
      organization_invitations: TableDef<
        OrganizationInvitationRow,
        Insertable<OrganizationInvitationRow, "id" | "created_at" | "updated_at" | "version" | "status">,
        Partial<Omit<OrganizationInvitationRow, "id">>
      >;
      organization_audit_events: TableDef<
        OrganizationAuditEventRow,
        Insertable<OrganizationAuditEventRow, "id" | "created_at" | "safe_metadata" | "target_type">,
        Partial<Omit<OrganizationAuditEventRow, "id">>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      create_organization_with_owner: {
        Args: {
          p_name: string;
          p_organization_type?: string;
          p_identity_kind?: string;
          p_official_website?: string | null;
          p_country_code?: string | null;
        };
        Returns: unknown;
      };
      accept_organization_invitation_by_token: {
        Args: { p_raw_token: string };
        Returns: unknown;
      };
    };
  };
};
