-- Compatibility migration: resolve activity_events schema conflict between 0001 and 0008.
-- 0001 created owner-scoped activity_events.
-- 0008 attempted a different schema via create table if not exists (no-op when 0001 already applied).
-- This migration NEVER drops activity_events or deletes rows.
-- It only ADD COLUMN IF NOT EXISTS for org collaboration fields when missing.

do $$
begin
  -- Ensure table exists (noop if 0001/0008 already created it).
  if to_regclass('public.activity_events') is null then
    create table public.activity_events (
      id uuid primary key default gen_random_uuid(),
      owner_id uuid references auth.users (id) on delete cascade,
      organization_id uuid references public.organizations (id) on delete cascade,
      actor_user_id uuid references auth.users (id) on delete set null,
      action text,
      event_type text,
      target_type text,
      target_id text,
      correlation_id text,
      entity_kind text,
      entity_id text,
      entity_name text,
      project_id uuid,
      local_id text,
      created_at timestamptz not null default now()
    );
  end if;
end $$;

alter table public.activity_events add column if not exists organization_id uuid references public.organizations (id) on delete cascade;
alter table public.activity_events add column if not exists actor_user_id uuid references auth.users (id) on delete set null;
alter table public.activity_events add column if not exists action text;
alter table public.activity_events add column if not exists target_type text;
alter table public.activity_events add column if not exists target_id text;
alter table public.activity_events add column if not exists correlation_id text;
alter table public.activity_events add column if not exists owner_id uuid references auth.users (id) on delete cascade;
alter table public.activity_events add column if not exists event_type text;

-- Backfill action from legacy event_type when present.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'activity_events' and column_name = 'event_type'
  ) then
    execute 'update public.activity_events set action = coalesce(action, event_type) where action is null';
  end if;
end $$;

create index if not exists activity_events_org_created_idx
  on public.activity_events (organization_id, created_at desc);

alter table public.activity_events enable row level security;

-- Preserve existing owner policies; add org-member select without dropping owner access.
drop policy if exists activity_events_member_select_org on public.activity_events;
create policy activity_events_member_select_org on public.activity_events
  for select using (
    (organization_id is not null and public.is_active_org_member(organization_id))
    or (organization_id is null and owner_id = auth.uid())
    or (organization_id is null and actor_user_id = auth.uid())
  );

-- Direct client inserts remain denied for org-scoped forge protection.
-- Prefer security-definer RPCs for append-only org activity.
drop policy if exists activity_events_no_client_insert_org on public.activity_events;
create policy activity_events_no_client_insert_org on public.activity_events
  for insert with check (
    -- Allow personal owner-scoped inserts only (legacy path).
    (organization_id is null and owner_id = auth.uid())
  );

-- Server-side append helper for org activity (authenticated members only).
create or replace function public.append_organization_activity(
  p_organization_id uuid,
  p_action text,
  p_target_type text default null,
  p_target_id text default null,
  p_correlation_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_active_org_member(p_organization_id) then
    raise exception 'not an active organization member';
  end if;
  insert into public.activity_events (
    organization_id, actor_user_id, owner_id, action, event_type, target_type, target_id, correlation_id
  ) values (
    p_organization_id, auth.uid(), auth.uid(), p_action, p_action, p_target_type, p_target_id, p_correlation_id
  )
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.append_organization_activity(uuid, text, text, text, text) from public;
grant execute on function public.append_organization_activity(uuid, text, text, text, text) to authenticated;
