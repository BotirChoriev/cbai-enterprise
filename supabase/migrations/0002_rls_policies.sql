-- CBAI — Row Level Security (Real Supabase Authentication + Cloud Persistence mission, Phase 6)
--
-- Every user-owned table gets RLS enabled and four policies (select/insert/update/delete), all
-- keyed off `owner_id = auth.uid()`. The browser-supplied `owner_id` on an INSERT is never trusted
-- on its own — the `with check` clause re-verifies it server-side against the authenticated
-- session on every write, so a payload cannot claim another user's owner_id.
--
-- No public/team visibility policy is created here: `projects.visibility` can be set to "team" or
-- "public" in the UI, but those values are declared Planned (see lib/project/project-types.ts,
-- PROJECT_VISIBILITY_LABELS) and are not offered as selectable in CreateProjectForm. Activating a
-- real shared-visibility policy is future work and must be a deliberate, reviewed addition — not a
-- default this migration turns on silently.

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_objectives enable row level security;
alter table public.project_notes enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_questions enable row level security;
alter table public.project_evidence enable row level security;
alter table public.project_entity_links enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reports enable row level security;
alter table public.activity_events enable row level security;

-- ---------------------------------------------------------------------------
-- profiles — keyed by id (== auth.uid()), not owner_id.
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Reusable pattern for every owner_id-keyed table below: select/insert/update/delete, all
-- restricted to auth.uid() = owner_id. Written out per table (not via a dynamic DO block) so each
-- policy is individually inspectable and diffable in the Supabase dashboard.
-- ---------------------------------------------------------------------------

-- projects
drop policy if exists projects_select_own on public.projects;
create policy projects_select_own on public.projects for select using (auth.uid() = owner_id);
drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own on public.projects for insert with check (auth.uid() = owner_id);
drop policy if exists projects_update_own on public.projects;
create policy projects_update_own on public.projects for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists projects_delete_own on public.projects;
create policy projects_delete_own on public.projects for delete using (auth.uid() = owner_id);

-- project_objectives
drop policy if exists project_objectives_select_own on public.project_objectives;
create policy project_objectives_select_own on public.project_objectives for select using (auth.uid() = owner_id);
drop policy if exists project_objectives_insert_own on public.project_objectives;
create policy project_objectives_insert_own on public.project_objectives for insert with check (auth.uid() = owner_id);
drop policy if exists project_objectives_update_own on public.project_objectives;
create policy project_objectives_update_own on public.project_objectives for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists project_objectives_delete_own on public.project_objectives;
create policy project_objectives_delete_own on public.project_objectives for delete using (auth.uid() = owner_id);

-- project_notes
drop policy if exists project_notes_select_own on public.project_notes;
create policy project_notes_select_own on public.project_notes for select using (auth.uid() = owner_id);
drop policy if exists project_notes_insert_own on public.project_notes;
create policy project_notes_insert_own on public.project_notes for insert with check (auth.uid() = owner_id);
drop policy if exists project_notes_update_own on public.project_notes;
create policy project_notes_update_own on public.project_notes for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists project_notes_delete_own on public.project_notes;
create policy project_notes_delete_own on public.project_notes for delete using (auth.uid() = owner_id);

-- project_tasks
drop policy if exists project_tasks_select_own on public.project_tasks;
create policy project_tasks_select_own on public.project_tasks for select using (auth.uid() = owner_id);
drop policy if exists project_tasks_insert_own on public.project_tasks;
create policy project_tasks_insert_own on public.project_tasks for insert with check (auth.uid() = owner_id);
drop policy if exists project_tasks_update_own on public.project_tasks;
create policy project_tasks_update_own on public.project_tasks for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists project_tasks_delete_own on public.project_tasks;
create policy project_tasks_delete_own on public.project_tasks for delete using (auth.uid() = owner_id);

-- project_questions
drop policy if exists project_questions_select_own on public.project_questions;
create policy project_questions_select_own on public.project_questions for select using (auth.uid() = owner_id);
drop policy if exists project_questions_insert_own on public.project_questions;
create policy project_questions_insert_own on public.project_questions for insert with check (auth.uid() = owner_id);
drop policy if exists project_questions_update_own on public.project_questions;
create policy project_questions_update_own on public.project_questions for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists project_questions_delete_own on public.project_questions;
create policy project_questions_delete_own on public.project_questions for delete using (auth.uid() = owner_id);

-- project_evidence
drop policy if exists project_evidence_select_own on public.project_evidence;
create policy project_evidence_select_own on public.project_evidence for select using (auth.uid() = owner_id);
drop policy if exists project_evidence_insert_own on public.project_evidence;
create policy project_evidence_insert_own on public.project_evidence for insert with check (auth.uid() = owner_id);
drop policy if exists project_evidence_update_own on public.project_evidence;
create policy project_evidence_update_own on public.project_evidence for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists project_evidence_delete_own on public.project_evidence;
create policy project_evidence_delete_own on public.project_evidence for delete using (auth.uid() = owner_id);

-- project_entity_links
drop policy if exists project_entity_links_select_own on public.project_entity_links;
create policy project_entity_links_select_own on public.project_entity_links for select using (auth.uid() = owner_id);
drop policy if exists project_entity_links_insert_own on public.project_entity_links;
create policy project_entity_links_insert_own on public.project_entity_links for insert with check (auth.uid() = owner_id);
drop policy if exists project_entity_links_update_own on public.project_entity_links;
create policy project_entity_links_update_own on public.project_entity_links for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists project_entity_links_delete_own on public.project_entity_links;
create policy project_entity_links_delete_own on public.project_entity_links for delete using (auth.uid() = owner_id);

-- bookmarks
drop policy if exists bookmarks_select_own on public.bookmarks;
create policy bookmarks_select_own on public.bookmarks for select using (auth.uid() = owner_id);
drop policy if exists bookmarks_insert_own on public.bookmarks;
create policy bookmarks_insert_own on public.bookmarks for insert with check (auth.uid() = owner_id);
drop policy if exists bookmarks_update_own on public.bookmarks;
create policy bookmarks_update_own on public.bookmarks for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists bookmarks_delete_own on public.bookmarks;
create policy bookmarks_delete_own on public.bookmarks for delete using (auth.uid() = owner_id);

-- reports
drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports for select using (auth.uid() = owner_id);
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports for insert with check (auth.uid() = owner_id);
drop policy if exists reports_update_own on public.reports;
create policy reports_update_own on public.reports for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists reports_delete_own on public.reports;
create policy reports_delete_own on public.reports for delete using (auth.uid() = owner_id);

-- activity_events
drop policy if exists activity_events_select_own on public.activity_events;
create policy activity_events_select_own on public.activity_events for select using (auth.uid() = owner_id);
drop policy if exists activity_events_insert_own on public.activity_events;
create policy activity_events_insert_own on public.activity_events for insert with check (auth.uid() = owner_id);
drop policy if exists activity_events_update_own on public.activity_events;
create policy activity_events_update_own on public.activity_events for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists activity_events_delete_own on public.activity_events;
create policy activity_events_delete_own on public.activity_events for delete using (auth.uid() = owner_id);
