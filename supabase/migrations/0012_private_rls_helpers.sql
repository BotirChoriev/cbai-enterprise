-- Move SECURITY DEFINER implementation details outside the exposed public API schema.
-- Existing public function names remain as SECURITY INVOKER wrappers, preserving every policy.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.current_user_org_role(org_id uuid)
returns text
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select m.role
  from public.organization_memberships m
  where m.organization_id = org_id
    and m.user_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

create or replace function private.is_active_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function private.is_active_collaboration_participant(collab_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.collaboration_participants p
    where p.collaboration_id = collab_id
      and (
        (p.participant_type = 'user' and p.user_id = auth.uid())
        or (
          p.participant_type = 'organization'
          and exists (
            select 1
            from public.organization_memberships m
            where m.organization_id = p.organization_id
              and m.user_id = auth.uid()
              and m.status = 'active'
          )
        )
      )
      and p.status = 'active'
  );
$$;

revoke all privileges on function private.current_user_org_role(uuid)
  from public, anon, authenticated;
revoke all privileges on function private.is_active_org_member(uuid)
  from public, anon, authenticated;
revoke all privileges on function private.is_active_collaboration_participant(uuid)
  from public, anon, authenticated;
grant execute on function private.current_user_org_role(uuid) to authenticated;
grant execute on function private.is_active_org_member(uuid) to authenticated;
grant execute on function private.is_active_collaboration_participant(uuid) to authenticated;

create or replace function public.current_user_org_role(org_id uuid)
returns text
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select private.current_user_org_role(org_id);
$$;

create or replace function public.is_active_org_member(org_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select private.is_active_org_member(org_id);
$$;

create or replace function public.is_active_collaboration_participant(collab_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select private.is_active_collaboration_participant(collab_id);
$$;

revoke all privileges on function public.current_user_org_role(uuid)
  from public, anon, authenticated;
revoke all privileges on function public.is_active_org_member(uuid)
  from public, anon, authenticated;
revoke all privileges on function public.is_active_collaboration_participant(uuid)
  from public, anon, authenticated;
grant execute on function public.current_user_org_role(uuid) to authenticated;
grant execute on function public.is_active_org_member(uuid) to authenticated;
grant execute on function public.is_active_collaboration_participant(uuid) to authenticated;
