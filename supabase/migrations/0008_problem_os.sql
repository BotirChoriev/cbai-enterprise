-- CBAI Problem OS — durable local-first aggregate snapshots with human-owned RLS.
-- Additive only: no existing table, policy, or route is replaced.

create table if not exists public.problem_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_id text not null,
  schema_version integer not null default 1 check (schema_version > 0),
  status text not null,
  payload jsonb not null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id),
  check (jsonb_typeof(payload) = 'object'),
  check (payload ->> 'finalDecisionOwner' = 'human')
);

create index if not exists problem_snapshots_owner_updated_idx
  on public.problem_snapshots (owner_id, updated_at desc);

create table if not exists public.problem_audit_events (
  id uuid primary key default gen_random_uuid(),
  problem_local_id text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  actor_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists problem_audit_events_owner_problem_time_idx
  on public.problem_audit_events (owner_id, problem_local_id, created_at desc);

create or replace function public.protect_problem_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_decisions jsonb := coalesce(old.payload -> 'decisions', '[]'::jsonb);
  new_decisions jsonb := coalesce(new.payload -> 'decisions', '[]'::jsonb);
  old_activity jsonb := coalesce(old.payload -> 'activity', '[]'::jsonb);
  new_activity jsonb := coalesce(new.payload -> 'activity', '[]'::jsonb);
  new_decisions_prefix jsonb;
  new_activity_prefix jsonb;
begin
  if old.owner_id <> new.owner_id or old.local_id <> new.local_id then
    raise exception 'problem_identity_is_immutable';
  end if;

  if jsonb_typeof(old_decisions) <> 'array' or jsonb_typeof(new_decisions) <> 'array' then
    raise exception 'problem_decision_history_must_be_array';
  end if;
  select coalesce(jsonb_agg(item order by position), '[]'::jsonb)
    into new_decisions_prefix
    from jsonb_array_elements(new_decisions) with ordinality as entries(item, position)
    where position <= jsonb_array_length(old_decisions);
  if jsonb_typeof(new_decisions) <> 'array'
     or jsonb_array_length(new_decisions) < jsonb_array_length(old_decisions)
     or new_decisions_prefix <> old_decisions then
    raise exception 'problem_decision_history_is_append_only';
  end if;

  if jsonb_typeof(old_activity) <> 'array' or jsonb_typeof(new_activity) <> 'array' then
    raise exception 'problem_activity_history_must_be_array';
  end if;
  select coalesce(jsonb_agg(item order by position), '[]'::jsonb)
    into new_activity_prefix
    from jsonb_array_elements(new_activity) with ordinality as entries(item, position)
    where position <= jsonb_array_length(old_activity);
  if jsonb_typeof(new_activity) <> 'array'
     or jsonb_array_length(new_activity) < jsonb_array_length(old_activity)
     or new_activity_prefix <> old_activity then
    raise exception 'problem_activity_is_append_only';
  end if;
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_problem_history_trigger on public.problem_snapshots;
create trigger protect_problem_history_trigger
before update on public.problem_snapshots
for each row execute function public.protect_problem_history();

create or replace function public.audit_problem_snapshot_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.problem_audit_events (
    problem_local_id, owner_id, actor_id, event_type, safe_metadata
  ) values (
    new.local_id,
    new.owner_id,
    auth.uid(),
    case when tg_op = 'INSERT' then 'problem_snapshot_created' else 'problem_snapshot_updated' end,
    jsonb_build_object('version', new.version, 'status', new.status)
  );
  return new;
end;
$$;

drop trigger if exists audit_problem_snapshot_change_trigger on public.problem_snapshots;
create trigger audit_problem_snapshot_change_trigger
after insert or update on public.problem_snapshots
for each row execute function public.audit_problem_snapshot_change();

alter table public.problem_snapshots enable row level security;
alter table public.problem_audit_events enable row level security;

create policy problem_snapshots_select_owner on public.problem_snapshots
  for select using (owner_id = auth.uid());
create policy problem_snapshots_insert_owner on public.problem_snapshots
  for insert with check (owner_id = auth.uid());
create policy problem_snapshots_update_owner on public.problem_snapshots
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy problem_audit_events_select_owner on public.problem_audit_events
  for select using (owner_id = auth.uid());

-- No client insert/update/delete policy exists for audit events. Only the
-- security-definer snapshot trigger can append them.
