-- CBAI — Production schema (Real Supabase Authentication + Cloud Persistence mission)
--
-- Minimum production data model for the Project Engine, Bookmarks, Reports, and Recent Activity.
-- Every user-owned table uses a UUID primary key, an owner_id referencing auth.users, and real
-- created_at/updated_at timestamps. JSONB is used only for genuinely flexible metadata (tags,
-- accessibility preferences) — every relational field (title, status, project_type, body, etc.)
-- is a real typed column, never folded into one blob.
--
-- `local_id` columns exist solely to make the local-to-cloud migration (lib/supabase/migration.ts)
-- idempotent: a device-local record's existing id (e.g. "project-1730000000000-ab12cd") is stored
-- once as a dedup marker so retrying the migration never creates duplicate cloud rows. It is not
-- otherwise used for reads.
--
-- Run this file, then 0002_rls_policies.sql, in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles — one row per auth.users row (Phase 4)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  organization text not null default '',
  preferred_language text not null default 'en',
  workspace_role text not null default '',
  country text not null default '',
  timezone text not null default '',
  accessibility_preferences jsonb not null default '{}'::jsonb,
  assistant_name text not null default '',
  avatar_mode text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is
  'One real profile row per Supabase Auth user. Supabase Auth (auth.users) owns credentials — no password hash is ever stored here.';

-- ---------------------------------------------------------------------------
-- projects (Phase 5 / Project Engine)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  title text not null,
  project_type text not null,
  description text not null default '',
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'archived')),
  visibility text not null default 'private'
    check (visibility in ('private', 'team', 'public')),
  primary_entity_kind text,
  primary_entity_id text,
  primary_entity_name text,
  tags jsonb not null default '[]'::jsonb,
  research_question text,
  objectives text,
  report_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

-- ---------------------------------------------------------------------------
-- project_objectives — forward-compatible granular objectives per project.
-- Today the Project Engine UI edits a single free-text objectives field (mirrored on
-- projects.objectives above for a one-query project read); this table exists so a future
-- checklist-style objectives UI has real schema to land on without another migration. The cloud
-- sync layer keeps exactly one row per project in sync with projects.objectives today.
-- ---------------------------------------------------------------------------
create table if not exists public.project_objectives (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

-- ---------------------------------------------------------------------------
-- project_notes
-- ---------------------------------------------------------------------------
create table if not exists public.project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  body text not null,
  linked_evidence_id text,
  linked_evidence_label text,
  linked_entity_id text,
  linked_entity_name text,
  linked_entity_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

-- ---------------------------------------------------------------------------
-- project_tasks
-- ---------------------------------------------------------------------------
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  title text not null,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

-- ---------------------------------------------------------------------------
-- project_questions
-- ---------------------------------------------------------------------------
create table if not exists public.project_questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  question text not null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

-- ---------------------------------------------------------------------------
-- project_evidence — real, user-authored evidence references (never fabricated evidence)
-- ---------------------------------------------------------------------------
create table if not exists public.project_evidence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  title text not null,
  source_url text,
  linked_entity_id text,
  linked_entity_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

-- ---------------------------------------------------------------------------
-- project_entity_links — Related Entities (Country/Company/University/Research/Project)
-- ---------------------------------------------------------------------------
create table if not exists public.project_entity_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  entity_kind text not null
    check (entity_kind in ('country', 'company', 'university', 'research_topic', 'project')),
  entity_id text not null,
  entity_name text not null,
  entity_code text,
  entity_country_name text,
  created_at timestamptz not null default now(),
  unique (owner_id, local_id),
  unique (owner_id, project_id, entity_kind, entity_id)
);

-- ---------------------------------------------------------------------------
-- bookmarks — pinned entities (Workspace / My Work), separate from recent-view history
-- (recent-view history is intentionally NOT persisted to the cloud: it is high-churn, low-value
-- to sync, and every existing local-only recording call site is untouched).
-- ---------------------------------------------------------------------------
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  entity_kind text not null
    check (entity_kind in ('country', 'company', 'university', 'research_topic', 'project')),
  entity_id text not null,
  entity_name text not null,
  entity_code text,
  entity_country_name text,
  created_at timestamptz not null default now(),
  unique (owner_id, local_id),
  unique (owner_id, entity_kind, entity_id)
);

-- ---------------------------------------------------------------------------
-- reports — persisted report index (Phase 11). CBAI never stores a stale content snapshot: a
-- report "reopen" always re-renders the live profile/project report at read time, so evidence
-- corrections are always reflected. What is genuinely persisted is *that the user saved this
-- report*, when, and what it pointed at — real ownership, real history, no fabricated content.
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  kind text not null
    check (kind in ('project', 'country', 'company', 'university', 'research_topic')),
  entity_id text not null,
  entity_name text not null,
  project_id uuid references public.projects (id) on delete cascade,
  title text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

-- ---------------------------------------------------------------------------
-- activity_events — real, user-caused events only (never synthetic activity)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text,
  event_type text not null,
  entity_kind text,
  entity_id text,
  entity_name text,
  project_id uuid references public.projects (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

-- ---------------------------------------------------------------------------
-- updated_at maintenance — one real trigger function, reused by every table that has the column.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'projects', 'project_objectives', 'project_notes',
    'project_tasks', 'project_questions', 'project_evidence', 'reports'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I; ' ||
      'create trigger set_updated_at before update on public.%I ' ||
      'for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Indexes for the real access patterns this app uses (list-by-owner, list-by-project).
-- ---------------------------------------------------------------------------
create index if not exists projects_owner_id_idx on public.projects (owner_id);
create index if not exists project_objectives_project_id_idx on public.project_objectives (project_id);
create index if not exists project_notes_project_id_idx on public.project_notes (project_id);
create index if not exists project_tasks_project_id_idx on public.project_tasks (project_id);
create index if not exists project_questions_project_id_idx on public.project_questions (project_id);
create index if not exists project_evidence_project_id_idx on public.project_evidence (project_id);
create index if not exists project_entity_links_project_id_idx on public.project_entity_links (project_id);
create index if not exists bookmarks_owner_id_idx on public.bookmarks (owner_id);
create index if not exists reports_owner_id_idx on public.reports (owner_id);
create index if not exists activity_events_owner_id_idx on public.activity_events (owner_id);
