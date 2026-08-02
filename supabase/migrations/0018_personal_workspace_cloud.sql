-- Owner-private Personal Workspace aggregates and recoverable creation runs.
-- The browser may read only its authenticated owner's records. All writes pass
-- through one authenticated RPC so a workspace and its checkpoint cannot split.
create table if not exists public.personal_workspace_aggregates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  workspace_id text not null check (length(btrim(workspace_id)) > 0),
  context_id text not null check (length(btrim(context_id)) > 0),
  version integer not null check (version > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, workspace_id)
);

create table if not exists public.workspace_creation_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  run_id text not null check (length(btrim(run_id)) > 0),
  workspace_id text not null check (length(btrim(workspace_id)) > 0),
  idempotency_key text not null check (length(btrim(idempotency_key)) > 0),
  status text not null check (status in ('running', 'failed', 'completed')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, run_id),
  unique (owner_id, idempotency_key),
  foreign key (owner_id, workspace_id)
    references public.personal_workspace_aggregates (owner_id, workspace_id) on delete cascade
);

create index if not exists personal_workspace_owner_updated_idx
  on public.personal_workspace_aggregates (owner_id, updated_at desc);
create index if not exists workspace_creation_runs_owner_updated_idx
  on public.workspace_creation_runs (owner_id, updated_at desc);

alter table public.personal_workspace_aggregates enable row level security;
alter table public.workspace_creation_runs enable row level security;

create policy personal_workspace_select_owner on public.personal_workspace_aggregates
  for select using (owner_id = auth.uid());
create policy workspace_creation_runs_select_owner on public.workspace_creation_runs
  for select using (owner_id = auth.uid());

create or replace function public.save_personal_workspace(
  p_workspace jsonb,
  p_run jsonb
)
returns jsonb
language plpgsql security definer set search_path = pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_workspace_id text := btrim(p_workspace ->> 'workspaceId');
  v_run_id text := btrim(p_run ->> 'runId');
  v_context_id text := btrim(p_workspace ->> 'contextId');
  v_idempotency_key text := btrim(p_run ->> 'idempotencyKey');
  v_workspace_owner text := btrim(p_workspace ->> 'ownerId');
  v_run_owner text := btrim(p_run ->> 'ownerId');
  v_version integer;
  v_status text := btrim(p_run ->> 'status');
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if jsonb_typeof(p_workspace) <> 'object' or jsonb_typeof(p_run) <> 'object' then
    raise exception 'workspace_payloads_must_be_objects';
  end if;
  if v_workspace_id is null or length(v_workspace_id) = 0
     or v_run_id is null or length(v_run_id) = 0
     or v_context_id is null or length(v_context_id) = 0
     or v_idempotency_key is null or length(v_idempotency_key) = 0 then
    raise exception 'workspace_identity_required';
  end if;
  if btrim(p_run ->> 'workspaceId') <> v_workspace_id then
    raise exception 'workspace_run_mismatch';
  end if;
  if v_workspace_owner <> v_actor::text or v_run_owner <> v_actor::text then
    raise exception 'workspace_owner_mismatch';
  end if;
  begin
    v_version := (p_workspace ->> 'version')::integer;
  exception when others then raise exception 'invalid_workspace_version';
  end;
  if v_version < 1 then raise exception 'invalid_workspace_version'; end if;
  if v_status not in ('running', 'failed', 'completed') then raise exception 'invalid_run_status'; end if;

  insert into public.personal_workspace_aggregates
    (owner_id, workspace_id, context_id, version, payload)
  values (v_actor, v_workspace_id, v_context_id, v_version, p_workspace)
  on conflict (owner_id, workspace_id) do update set
    context_id = excluded.context_id,
    version = excluded.version,
    payload = excluded.payload,
    updated_at = now();

  insert into public.workspace_creation_runs
    (owner_id, run_id, workspace_id, idempotency_key, status, payload)
  values (v_actor, v_run_id, v_workspace_id, v_idempotency_key, v_status, p_run)
  on conflict (owner_id, run_id) do update set
    workspace_id = excluded.workspace_id,
    idempotency_key = excluded.idempotency_key,
    status = excluded.status,
    payload = excluded.payload,
    updated_at = now();

  return jsonb_build_object('workspace', p_workspace, 'run', p_run);
end;
$$;

revoke all privileges on table public.personal_workspace_aggregates from public, anon;
revoke all privileges on table public.workspace_creation_runs from public, anon;
grant select on table public.personal_workspace_aggregates to authenticated;
grant select on table public.workspace_creation_runs to authenticated;
revoke all privileges on function public.save_personal_workspace(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.save_personal_workspace(jsonb, jsonb) to authenticated;
