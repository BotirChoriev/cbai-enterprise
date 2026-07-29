-- Forward repair for 0014: derive the assignment count from the object keys.

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
  v_assignment_count integer;
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

  select count(*)::integer
    into v_assignment_count
    from jsonb_object_keys(v_result.assignments);

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
      'assignmentCount', v_assignment_count
    )
  );

  return v_result;
end;
$$;

revoke all privileges on function public.confirm_organization_responsibility_map(uuid, text, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.confirm_organization_responsibility_map(uuid, text, jsonb, integer)
  to authenticated;
