-- BUILD-034 — Organization, collaboration, living graph, notifications schema.
-- Run after 0004_evidence_bookmarks.sql, then 0006_rls_organization_collaboration.sql.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  organization_type text not null default 'other',
  identity_kind text not null default 'workspace_organization',
  official_website text,
  country_code text,
  verification_state text not null default 'unverified',
  version integer not null default 1,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists organizations_normalized_name_idx on public.organizations (normalized_name);

-- ---------------------------------------------------------------------------
-- organization_memberships
-- ---------------------------------------------------------------------------
create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  status text not null default 'active',
  version integer not null default 1,
  invited_by uuid references auth.users (id) on delete set null,
  joined_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_memberships_user_idx
  on public.organization_memberships (user_id, status);

create index if not exists organization_memberships_org_idx
  on public.organization_memberships (organization_id, status);

-- ---------------------------------------------------------------------------
-- organization_invitations
-- ---------------------------------------------------------------------------
create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  recipient_email_normalized text not null,
  intended_role text not null,
  token_hash text not null,
  status text not null default 'pending',
  expires_at timestamptz not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  accepted_by uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organization_invitations_token_hash_idx
  on public.organization_invitations (token_hash);

create index if not exists organization_invitations_recipient_idx
  on public.organization_invitations (recipient_email_normalized, status);

-- ---------------------------------------------------------------------------
-- organization_audit_events
-- ---------------------------------------------------------------------------
create table if not exists public.organization_audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_type text not null default 'unknown',
  target_id uuid,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists organization_audit_events_org_time_idx
  on public.organization_audit_events (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- mission_collaborations
-- ---------------------------------------------------------------------------
create table if not exists public.mission_collaborations (
  id uuid primary key default gen_random_uuid(),
  mission_id text not null,
  owner_organization_id uuid references public.organizations (id) on delete set null,
  title text not null,
  description text,
  visibility text not null default 'invited_participants',
  status text not null default 'draft',
  version integer not null default 1,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists mission_collaborations_mission_idx
  on public.mission_collaborations (mission_id, status);

-- ---------------------------------------------------------------------------
-- collaboration_participants
-- ---------------------------------------------------------------------------
create table if not exists public.collaboration_participants (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.mission_collaborations (id) on delete cascade,
  participant_type text not null check (participant_type in ('user', 'organization')),
  user_id uuid references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  role text not null,
  status text not null default 'invited',
  invited_by uuid not null references auth.users (id) on delete cascade,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  version integer not null default 1,
  check (
    (participant_type = 'user' and user_id is not null and organization_id is null)
    or (participant_type = 'organization' and organization_id is not null and user_id is null)
  )
);

create index if not exists collaboration_participants_collab_idx
  on public.collaboration_participants (collaboration_id, status);

create index if not exists collaboration_participants_user_idx
  on public.collaboration_participants (user_id, status);

-- ---------------------------------------------------------------------------
-- collaboration_shared_objects
-- ---------------------------------------------------------------------------
create table if not exists public.collaboration_shared_objects (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.mission_collaborations (id) on delete cascade,
  object_type text not null,
  object_id text not null,
  access_level text not null default 'view',
  shared_by uuid not null references auth.users (id) on delete cascade,
  shared_at timestamptz not null default now(),
  revoked_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  status text not null default 'active',
  version integer not null default 1
);

create index if not exists collaboration_shared_objects_collab_idx
  on public.collaboration_shared_objects (collaboration_id, status);

-- ---------------------------------------------------------------------------
-- collaboration_review_assignments
-- ---------------------------------------------------------------------------
create table if not exists public.collaboration_review_assignments (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.mission_collaborations (id) on delete cascade,
  object_type text not null,
  object_id text not null,
  assigned_by uuid not null references auth.users (id) on delete cascade,
  assigned_to uuid not null references auth.users (id) on delete cascade,
  status text not null default 'assigned',
  due_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collaboration_review_assignments_assignee_idx
  on public.collaboration_review_assignments (assigned_to, status);

-- ---------------------------------------------------------------------------
-- user_notifications
-- ---------------------------------------------------------------------------
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users (id) on delete cascade,
  notification_type text not null,
  actor_id uuid references auth.users (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  collaboration_id uuid references public.mission_collaborations (id) on delete set null,
  object_type text,
  object_id text,
  safe_metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists user_notifications_recipient_read_idx
  on public.user_notifications (recipient_user_id, read_at, created_at desc);

-- ---------------------------------------------------------------------------
-- living_relationships
-- ---------------------------------------------------------------------------
create table if not exists public.living_relationships (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  target_type text not null,
  target_id text not null,
  relationship_type text not null,
  direction text not null default 'directed',
  status text not null default 'suggested',
  provenance jsonb not null default '{}'::jsonb,
  supporting_evidence_ids jsonb not null default '[]'::jsonb,
  contradicting_evidence_ids jsonb not null default '[]'::jsonb,
  mission_id text,
  organization_id uuid references public.organizations (id) on delete set null,
  collaboration_id uuid references public.mission_collaborations (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  limitations jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists living_relationships_source_idx
  on public.living_relationships (source_type, source_id, status);

create index if not exists living_relationships_target_idx
  on public.living_relationships (target_type, target_id, status);

create index if not exists living_relationships_mission_idx
  on public.living_relationships (mission_id, status);

-- ---------------------------------------------------------------------------
-- Last-owner protection helper
-- ---------------------------------------------------------------------------
create or replace function public.organization_active_owner_count(org_id uuid)
returns integer
language sql
stable
as $$
  select count(*)::integer
  from public.organization_memberships m
  where m.organization_id = org_id
    and m.role = 'owner'
    and m.status = 'active';
$$;
