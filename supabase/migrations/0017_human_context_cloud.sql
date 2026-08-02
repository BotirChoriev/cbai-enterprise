-- Owner-private Human Context snapshots with optimistic versioning and audit.
create table if not exists public.human_context_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  context_id text not null check (length(btrim(context_id)) > 0),
  scope_kind text not null check (scope_kind in ('person', 'organization', 'workspace', 'session')),
  scope_ref text not null check (length(btrim(scope_ref)) > 0),
  version integer not null check (version > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, context_id)
);

create table if not exists public.human_context_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  context_id text not null,
  event_id text not null check (length(btrim(event_id)) > 0),
  event_type text not null check (length(btrim(event_type)) > 0),
  context_version integer not null check (context_version > 0),
  actor_kind text not null check (actor_kind in ('human', 'system', 'integration')),
  correlation_id text not null check (length(btrim(correlation_id)) > 0),
  idempotency_key text,
  safe_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(safe_metadata) = 'object'),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (owner_id, event_id),
  foreign key (owner_id, context_id)
    references public.human_context_snapshots (owner_id, context_id) on delete cascade
);

create index if not exists human_context_snapshots_owner_updated_idx
  on public.human_context_snapshots (owner_id, updated_at desc);
create index if not exists human_context_events_owner_context_version_idx
  on public.human_context_events (owner_id, context_id, context_version desc);

alter table public.human_context_snapshots enable row level security;
alter table public.human_context_events enable row level security;
create policy human_context_snapshots_select_owner on public.human_context_snapshots
  for select using (owner_id = auth.uid());
create policy human_context_events_select_owner on public.human_context_events
  for select using (owner_id = auth.uid());

create or replace function public.save_human_context(
  p_context jsonb, p_expected_version integer, p_event jsonb
)
returns public.human_context_snapshots
language plpgsql security definer set search_path = pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_context_id text := btrim(p_context ->> 'contextId');
  v_scope_kind text := btrim(p_context #>> '{scope,kind}');
  v_scope_ref text;
  v_version integer;
  v_current_version integer;
  v_result public.human_context_snapshots%rowtype;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if jsonb_typeof(p_context) <> 'object' or jsonb_typeof(p_event) <> 'object' then
    raise exception 'human_context_payloads_must_be_objects';
  end if;
  if v_context_id is null or length(v_context_id) = 0 then raise exception 'context_id_required'; end if;
  if v_scope_kind not in ('person', 'organization', 'workspace', 'session') then
    raise exception 'invalid_context_scope';
  end if;
  v_scope_ref := case v_scope_kind
    when 'person' then btrim(p_context #>> '{scope,personId}')
    when 'organization' then btrim(p_context #>> '{scope,organizationId}')
    when 'workspace' then btrim(p_context #>> '{scope,workspaceId}')
    when 'session' then btrim(p_context #>> '{scope,sessionId}')
  end;
  if v_scope_ref is null or length(v_scope_ref) = 0 then raise exception 'context_scope_ref_required'; end if;
  begin
    v_version := (p_context ->> 'version')::integer;
  exception when others then raise exception 'invalid_context_version';
  end;
  if v_version < 1 then raise exception 'invalid_context_version'; end if;
  if btrim(p_event ->> 'aggregateId') <> v_context_id
     or (p_event ->> 'aggregateVersion')::integer <> v_version then
    raise exception 'event_context_mismatch';
  end if;

  select version into v_current_version from public.human_context_snapshots
    where owner_id = v_actor and context_id = v_context_id for update;
  if coalesce(v_current_version, 0) <> p_expected_version
     or v_version <> p_expected_version + 1 then
    raise exception 'human_context_version_conflict';
  end if;

  insert into public.human_context_snapshots
    (owner_id, context_id, scope_kind, scope_ref, version, payload)
  values (v_actor, v_context_id, v_scope_kind, v_scope_ref, v_version, p_context)
  on conflict (owner_id, context_id) do update set
    scope_kind = excluded.scope_kind, scope_ref = excluded.scope_ref,
    version = excluded.version, payload = excluded.payload, updated_at = now()
  returning * into v_result;

  insert into public.human_context_events
    (owner_id, context_id, event_id, event_type, context_version, actor_kind,
     correlation_id, idempotency_key, safe_metadata, occurred_at)
  values
    (v_actor, v_context_id, btrim(p_event ->> 'eventId'), btrim(p_event ->> 'eventType'),
     v_version, btrim(p_event #>> '{actor,actorKind}'), btrim(p_event ->> 'correlationId'),
     nullif(btrim(p_event ->> 'idempotencyKey'), ''),
     jsonb_build_object('changedKeys', coalesce(p_event #> '{payload,changedKeys}', '[]'::jsonb)),
     (p_event ->> 'occurredAt')::timestamptz);
  return v_result;
end;
$$;

create or replace function public.delete_human_context(p_context_id text)
returns boolean language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid := auth.uid(); v_deleted integer;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  delete from public.human_context_snapshots
    where owner_id = v_actor and context_id = btrim(p_context_id);
  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

revoke all privileges on table public.human_context_snapshots from public, anon;
revoke all privileges on table public.human_context_events from public, anon;
grant select on table public.human_context_snapshots to authenticated;
grant select on table public.human_context_events to authenticated;
revoke all privileges on function public.save_human_context(jsonb, integer, jsonb) from public, anon, authenticated;
grant execute on function public.save_human_context(jsonb, integer, jsonb) to authenticated;
revoke all privileges on function public.delete_human_context(text) from public, anon, authenticated;
grant execute on function public.delete_human_context(text) to authenticated;
