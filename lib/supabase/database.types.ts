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

export type StorageObjectRow = {
  id: string;
  owner_user_id: string | null;
  organization_id: string | null;
  bucket: string;
  storage_key: string;
  content_hash: string | null;
  byte_size: number | null;
  mime_type: string | null;
  visibility: "private" | "team" | "public";
  lifecycle_status: string;
  scan_status: string;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentArtifactRow = {
  id: string;
  owner_user_id: string;
  storage_object_id: string | null;
  bucket: string;
  storage_key: string;
  original_filename: string;
  safe_filename: string;
  byte_size: number;
  mime_type: string;
  checksum_sha256: string;
  title: string;
  domain: string;
  purpose: string;
  research_question: string;
  content_locale: string;
  privacy: "private" | "team";
  scan_status: "pending" | "clean" | "infected" | "failed" | "external_blocked";
  processing_status:
    | "quarantined"
    | "scan_pending"
    | "extracting"
    | "needs_human_review"
    | "human_confirmed"
    | "failed";
  scanner_provider: string | null;
  scanner_result_id: string | null;
  scanned_at: string | null;
  parser_version: string | null;
  page_count: number | null;
  extraction_warnings: string[];
  human_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentArtifactSectionRow = {
  id: string;
  artifact_id: string;
  owner_user_id: string;
  section_kind: string;
  heading: string | null;
  page_start: number | null;
  page_end: number | null;
  extracted_text: string;
  extraction_confidence: number | null;
  provenance: Record<string, unknown>;
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

export type OrganizationResponsibilityMapRow = {
  id: string;
  organization_id: string;
  problem_local_id: string;
  assignments: Record<string, string>;
  status: "human_confirmed";
  confirmed_by: string;
  confirmed_at: string;
  version: number;
  created_at: string;
  updated_at: string;
};

export type HumanDecisionRecordRow = {
  id: string;
  owner_id: string;
  mission_local_id: string;
  problem_local_id: string | null;
  decision_summary: string;
  options_considered: string[];
  chosen_option: string;
  rationale: string;
  evidence_refs: string[];
  unknowns_at_decision: string[];
  status: "human_confirmed";
  confirmed_by: string;
  confirmed_at: string;
  idempotency_key: string;
  created_at: string;
};

export type ProblemSnapshotRow = {
  id: string;
  owner_id: string;
  local_id: string;
  schema_version: number;
  status: string;
  payload: Record<string, unknown>;
  version: number;
  created_at: string;
  updated_at: string;
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
      storage_objects: TableDef<
        StorageObjectRow,
        Insertable<StorageObjectRow, "id" | "created_at" | "updated_at" | "visibility" | "lifecycle_status" | "scan_status">,
        Partial<Omit<StorageObjectRow, "id" | "owner_user_id" | "created_at">>
      >;
      document_artifacts: TableDef<
        DocumentArtifactRow,
        Insertable<DocumentArtifactRow, "id" | "storage_object_id" | "bucket" | "title" | "domain" | "purpose" | "research_question" | "content_locale" | "privacy" | "scan_status" | "processing_status" | "scanner_provider" | "scanner_result_id" | "scanned_at" | "parser_version" | "page_count" | "extraction_warnings" | "human_confirmed_at" | "created_at" | "updated_at">,
        Partial<Omit<DocumentArtifactRow, "id" | "owner_user_id" | "created_at">>
      >;
      document_artifact_sections: TableDef<
        DocumentArtifactSectionRow,
        Insertable<DocumentArtifactSectionRow, "id" | "heading" | "page_start" | "page_end" | "extraction_confidence" | "provenance" | "created_at">,
        never
      >;
      problem_snapshots: TableDef<
        ProblemSnapshotRow,
        Insertable<ProblemSnapshotRow, "id" | "created_at" | "updated_at" | "version">,
        Partial<Omit<ProblemSnapshotRow, "id" | "owner_id" | "local_id" | "created_at">>
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
      organization_responsibility_maps: TableDef<
        OrganizationResponsibilityMapRow,
        never,
        never
      >;
      human_decision_records: TableDef<
        HumanDecisionRecordRow,
        never,
        never
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
      confirm_organization_responsibility_map: {
        Args: {
          p_organization_id: string;
          p_problem_local_id: string;
          p_assignments: Record<string, string>;
          p_expected_version?: number;
        };
        Returns: OrganizationResponsibilityMapRow;
      };
      confirm_human_decision: {
        Args: {
          p_mission_local_id: string;
          p_problem_local_id: string;
          p_decision_summary: string;
          p_options_considered: string[];
          p_chosen_option: string;
          p_rationale: string;
          p_evidence_refs: string[];
          p_unknowns_at_decision: string[];
          p_idempotency_key: string;
        };
        Returns: HumanDecisionRecordRow;
      };
    };
  };
};
