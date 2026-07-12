-- CBAI — RLS verification queries (Real Supabase Authentication + Cloud Persistence mission)
--
-- Not a migration (creates/changes nothing) — run manually in the Supabase SQL editor after
-- 0001/0002 to verify Row Level Security is actually enforced. Documented here instead of only in
-- prose so the verification is a real, repeatable artifact, not a claim.

-- 1. Confirm RLS is enabled on every user-owned table (expect rowsecurity = true for all 11 rows).
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relname in (
  'profiles', 'projects', 'project_objectives', 'project_notes', 'project_tasks',
  'project_questions', 'project_evidence', 'project_entity_links', 'bookmarks',
  'reports', 'activity_events'
)
order by relname;

-- 2. Confirm each table has exactly 4 policies (select/insert/update/delete) — expect policy_count = 4
-- for every table except profiles, which is also 4 but keyed on id instead of owner_id.
select tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;

-- 3. Cross-user isolation check — run as two different authenticated users (via the Supabase
-- client, not the SQL editor's superuser role, since the SQL editor bypasses RLS by default).
-- As user A:
--   insert into public.projects (owner_id, title, project_type)
--   values (auth.uid(), 'User A project', 'research_project');
-- As user B, confirm the row above is invisible and unmodifiable:
--   select * from public.projects; -- must NOT include "User A project"
--   update public.projects set title = 'hijacked' where title = 'User A project'; -- must affect 0 rows
--   delete from public.projects where title = 'User A project'; -- must affect 0 rows

-- 4. Payload spoofing check — confirm inserting a row with someone else's owner_id is rejected.
-- As any authenticated user (replace the UUID with a real other user's id):
--   insert into public.projects (owner_id, title, project_type)
--   values ('00000000-0000-0000-0000-000000000000', 'spoofed', 'research_project');
-- Expected: rejected by the projects_insert_own policy's `with check (auth.uid() = owner_id)`.

-- 5. Anonymous (signed-out) access check — using the anon key with no session, confirm zero rows
-- are ever returned or written for any table above (no policy here permits `auth.uid() is null`).
