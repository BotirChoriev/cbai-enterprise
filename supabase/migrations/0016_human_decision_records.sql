-- CBAI Human Decision Record — immutable, mission-linked, explicitly confirmed.
-- Additive only. AI may structure options, but only auth.uid() can confirm a
-- decision through the audited RPC. Direct client writes are unavailable.

create table if not exists public.human_decision_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  mission_local_id text not null check (length(btrim(mission_local_id)) > 0),
  problem_local_id text,
  decision_summary text not null check (length(btrim(decision_summary)) > 0),
  options_considered jsonb not null check (jsonb_typeof(options_considered) = 'array'),
  chosen_option text not null check (length(btrim(chosen_option)) > 0),
  rationale text not null check (length(btrim(rationale)) > 0),
  evidence_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_refs) = 'array'),
  unknowns_at_decision jsonb not null default '[]'::jsonb
    check (jsonb_typeof(unknowns_at_decision) = 'array'),
  status text not null default 'human_confirmed' check (status = 'human_confirmed'),
  confirmed_by uuid not null references auth.users (id) on delete cascade,
  confirmed_at timestamptz not null default now(),
  idempotency_key text not null check (length(btrim(idempotency_key)) > 0),
  created_at timestamptz not null default now(),
  unique (owner_id, idempotency_key)
);

create index if not exists human_decision_records_owner_mission_time_idx
  on public.human_decision_records (owner_id, mission_local_id, confirmed_at desc);

create table if not exists public.human_decision_audit_events (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.human_decision_records (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  actor_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null check (event_type = 'human_decision_confirmed'),
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.human_decision_records enable row level security;
alter table public.human_decision_audit_events enable row level security;

create or replace function public.reject_human_decision_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception 'human_decision_history_is_immutable';
end;
$$;

drop trigger if exists reject_human_decision_mutation_trigger
  on public.human_decision_records;
create trigger reject_human_decision_mutation_trigger
before update on public.human_decision_records
for each row execute function public.reject_human_decision_mutation();

create policy human_decision_records_select_owner
  on public.human_decision_records
  for select
  using (owner_id = auth.uid());

create policy human_decision_audit_select_owner
  on public.human_decision_audit_events
  for select
  using (owner_id = auth.uid());

create or replace function public.confirm_human_decision(
  p_mission_local_id text,
  p_problem_local_id text,
  p_decision_summary text,
  p_options_considered jsonb,
  p_chosen_option text,
  p_rationale text,
  p_evidence_refs jsonb,
  p_unknowns_at_decision jsonb,
  p_idempotency_key text
)
returns public.human_decision_records
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_result public.human_decision_records%rowtype;
begin
  if v_actor is null then
    raise exception 'authentication_required';
  end if;
  if p_mission_local_id is null or length(btrim(p_mission_local_id)) = 0 then
    raise exception 'mission_local_id_required';
  end if;
  if p_decision_summary is null or length(btrim(p_decision_summary)) = 0 then
    raise exception 'decision_summary_required';
  end if;
  if p_rationale is null or length(btrim(p_rationale)) = 0 then
    raise exception 'decision_rationale_required';
  end if;
  if jsonb_typeof(p_options_considered) <> 'array'
     or jsonb_array_length(p_options_considered) < 2 then
    raise exception 'at_least_two_options_required';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_options_considered) as options(option_value)
    where jsonb_typeof(option_value) <> 'string'
       or length(btrim(option_value #>> '{}')) = 0
  ) then
    raise exception 'decision_options_must_be_non_empty_strings';
  end if;
  if p_chosen_option is null
     or not exists (
       select 1
       from jsonb_array_elements_text(p_options_considered) as options(option_text)
       where option_text = btrim(p_chosen_option)
     ) then
    raise exception 'chosen_option_must_match_considered_option';
  end if;
  if jsonb_typeof(p_evidence_refs) <> 'array'
     or jsonb_typeof(p_unknowns_at_decision) <> 'array' then
    raise exception 'decision_context_must_be_arrays';
  end if;
  if p_idempotency_key is null or length(btrim(p_idempotency_key)) = 0 then
    raise exception 'idempotency_key_required';
  end if;

  insert into public.human_decision_records (
    owner_id,
    mission_local_id,
    problem_local_id,
    decision_summary,
    options_considered,
    chosen_option,
    rationale,
    evidence_refs,
    unknowns_at_decision,
    confirmed_by,
    idempotency_key
  ) values (
    v_actor,
    btrim(p_mission_local_id),
    nullif(btrim(p_problem_local_id), ''),
    btrim(p_decision_summary),
    p_options_considered,
    btrim(p_chosen_option),
    btrim(p_rationale),
    p_evidence_refs,
    p_unknowns_at_decision,
    v_actor,
    btrim(p_idempotency_key)
  )
  on conflict (owner_id, idempotency_key) do nothing
  returning * into v_result;

  if v_result.id is null then
    select *
      into v_result
      from public.human_decision_records
      where owner_id = v_actor
        and idempotency_key = btrim(p_idempotency_key);
  end if;

  if not exists (
    select 1
    from public.human_decision_audit_events
    where decision_id = v_result.id
      and event_type = 'human_decision_confirmed'
  ) then
    insert into public.human_decision_audit_events (
      decision_id,
      owner_id,
      actor_id,
      event_type,
      safe_metadata
    ) values (
      v_result.id,
      v_actor,
      v_actor,
      'human_decision_confirmed',
      jsonb_build_object(
        'missionLocalId', v_result.mission_local_id,
        'optionCount', jsonb_array_length(v_result.options_considered),
        'unknownCount', jsonb_array_length(v_result.unknowns_at_decision)
      )
    );
  end if;

  return v_result;
end;
$$;

revoke all privileges on table public.human_decision_records from public, anon;
revoke all privileges on table public.human_decision_audit_events from public, anon;
grant select on table public.human_decision_records to authenticated;
grant select on table public.human_decision_audit_events to authenticated;

revoke all privileges on function public.confirm_human_decision(
  text, text, text, jsonb, text, text, jsonb, jsonb, text
) from public, anon, authenticated;
grant execute on function public.confirm_human_decision(
  text, text, text, jsonb, text, text, jsonb, jsonb, text
) to authenticated;
