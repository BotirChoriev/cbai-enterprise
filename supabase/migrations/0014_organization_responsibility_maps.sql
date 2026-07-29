-- CBAI People & Responsibility Engine — human-confirmed responsibility maps.
-- Additive only. Direct client writes are intentionally unavailable: authenticated
-- organization leaders confirm a complete map through one audited RPC.

create table if not exists public.organization_responsibility_maps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  problem_local_id text not null check (length(btrim(problem_local_id)) > 0),
  assignments jsonb not null check (jsonb_typeof(assignments) = 'object'),
  status text not null default 'human_confirmed'
    check (status = 'human_confirmed'),
  confirmed_by uuid not null references auth.users (id) on delete restrict,
  confirmed_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, problem_local_id)
);

create index if not exists organization_responsibility_maps_org_updated_idx
  on public.organization_responsibility_maps (organization_id, updated_at desc);

alter table public.organization_responsibility_maps enable row level security;

create policy responsibility_maps_select_member
  on public.organization_responsibility_maps
  for select
  using (public.is_active_org_member(organization_id));

-- There are deliberately no INSERT, UPDATE, or DELETE policies. The RPC below is
-- the only client-facing write path and performs role, membership, completeness,
-- separation-of-duty, optimistic-lock, and audit checks atomically.

create or replace function public.confirm_organization_responsibility_map(
  p_organization_id uuid,
  p_problem_local_id text,
  p_assignments jsonb,
  p_expected_version integer default 0
)
returns public.organization_responsibility_maps
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_role text;
  v_role text;
  v_membership_id uuid;
  v_existing public.organization_responsibility_maps%rowtype;
  v_result public.organization_responsibility_maps%rowtype;
  v_allowed_roles constant text[] := array[
    'problem_owner',
    'evidence_contributor',
    'evidence_reviewer',
    'scenario_reviewer',
    'decision_owner',
    'action_owner',
    'monitoring_owner',
    'observer'
  ];
  v_required_roles constant text[] := array[
    'problem_owner',
    'evidence_reviewer',
    'decision_owner',
    'monitoring_owner'
  ];
begin
  if v_actor is null then
    raise exception 'authentication_required';
  end if;

  v_actor_role := private.current_user_org_role(p_organization_id);
  if v_actor_role is null
     or v_actor_role not in ('owner', 'administrator', 'mission_lead') then
    raise exception 'responsibility_map_confirmation_not_authorized';
  end if;

  if p_problem_local_id is null or length(btrim(p_problem_local_id)) = 0 then
    raise exception 'problem_local_id_required';
  end if;
  if jsonb_typeof(p_assignments) <> 'object' then
    raise exception 'responsibility_assignments_must_be_object';
  end if;
  if exists (
    select 1
    from jsonb_object_keys(p_assignments) as keys(role_name)
    where not (role_name = any(v_allowed_roles))
  ) then
    raise exception 'unknown_responsibility_role';
  end if;

  foreach v_role in array v_required_roles loop
    if not (p_assignments ? v_role)
       or jsonb_typeof(p_assignments -> v_role) <> 'string'
       or length(btrim(p_assignments ->> v_role)) = 0 then
      raise exception 'required_responsibility_missing:%', v_role;
    end if;
  end loop;

  for v_role in
    select role_name
    from jsonb_object_keys(p_assignments) as keys(role_name)
  loop
    if jsonb_typeof(p_assignments -> v_role) <> 'string' then
      raise exception 'responsibility_assignment_must_be_membership_id:%', v_role;
    end if;
    begin
      v_membership_id := (p_assignments ->> v_role)::uuid;
    exception when invalid_text_representation then
      raise exception 'responsibility_assignment_invalid_membership_id:%', v_role;
    end;
    if not exists (
      select 1
      from public.organization_memberships m
      where m.id = v_membership_id
        and m.organization_id = p_organization_id
        and m.status = 'active'
    ) then
      raise exception 'responsibility_assignment_not_active_member:%', v_role;
    end if;
  end loop;

  if p_assignments ->> 'decision_owner' = p_assignments ->> 'evidence_reviewer' then
    raise exception 'decision_owner_is_evidence_reviewer';
  end if;
  if p_assignments ? 'scenario_reviewer'
     and p_assignments ->> 'decision_owner' = p_assignments ->> 'scenario_reviewer' then
    raise exception 'decision_owner_is_only_scenario_reviewer';
  end if;
  if p_assignments ->> 'problem_owner' = p_assignments ->> 'monitoring_owner' then
    raise exception 'problem_has_no_independent_monitor';
  end if;

  select *
    into v_existing
    from public.organization_responsibility_maps
    where organization_id = p_organization_id
      and problem_local_id = btrim(p_problem_local_id)
    for update;

  if found and v_existing.version <> p_expected_version then
    raise exception 'responsibility_map_version_conflict';
  end if;
  if not found and p_expected_version <> 0 then
    raise exception 'responsibility_map_version_conflict';
  end if;

  insert into public.organization_responsibility_maps (
    organization_id,
    problem_local_id,
    assignments,
    confirmed_by,
    version
  ) values (
    p_organization_id,
    btrim(p_problem_local_id),
    p_assignments,
    v_actor,
    1
  )
  on conflict (organization_id, problem_local_id) do update
  set assignments = excluded.assignments,
      status = 'human_confirmed',
      confirmed_by = v_actor,
      confirmed_at = now(),
      version = public.organization_responsibility_maps.version + 1,
      updated_at = now()
  returning * into v_result;

  insert into public.organization_audit_events (
    organization_id,
    actor_id,
    action,
    target_type,
    target_id,
    safe_metadata
  ) values (
    p_organization_id,
    v_actor,
    'responsibility_map_human_confirmed',
    'responsibility_map',
    v_result.id,
    jsonb_build_object(
      'problemLocalId', v_result.problem_local_id,
      'version', v_result.version,
      'assignmentCount', jsonb_object_length(v_result.assignments)
    )
  );

  return v_result;
end;
$$;

revoke all privileges on table public.organization_responsibility_maps
  from public, anon;
grant select on table public.organization_responsibility_maps to authenticated;

revoke all privileges on function public.confirm_organization_responsibility_map(uuid, text, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.confirm_organization_responsibility_map(uuid, text, jsonb, integer)
  to authenticated;
