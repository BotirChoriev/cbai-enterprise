-- Preview security hardening — additive privilege and search_path changes only.
-- Authenticated RPCs remain callable by signed-in users; anon and PUBLIC lose direct EXECUTE.

-- Client-facing organization RPCs: authenticated by design.
revoke all privileges on function public.create_organization_with_owner(text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_organization_with_owner(text, text, text, text, text)
  to authenticated;
alter function public.create_organization_with_owner(text, text, text, text, text)
  set search_path = pg_catalog;

revoke all privileges on function public.accept_organization_invitation_by_token(text)
  from public, anon, authenticated;
grant execute on function public.accept_organization_invitation_by_token(text)
  to authenticated;
alter function public.accept_organization_invitation_by_token(text)
  set search_path = pg_catalog, extensions;

revoke all privileges on function public.append_organization_activity(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.append_organization_activity(uuid, text, text, text, text)
  to authenticated;
alter function public.append_organization_activity(uuid, text, text, text, text)
  set search_path = pg_catalog;

-- RLS helpers: required while evaluating authenticated policies, never anonymous RPCs.
revoke all privileges on function public.current_user_org_role(uuid)
  from public, anon, authenticated;
grant execute on function public.current_user_org_role(uuid) to authenticated;
alter function public.current_user_org_role(uuid) set search_path = pg_catalog;

revoke all privileges on function public.is_active_org_member(uuid)
  from public, anon, authenticated;
grant execute on function public.is_active_org_member(uuid) to authenticated;
alter function public.is_active_org_member(uuid) set search_path = pg_catalog;

revoke all privileges on function public.is_active_collaboration_participant(uuid)
  from public, anon, authenticated;
grant execute on function public.is_active_collaboration_participant(uuid) to authenticated;
alter function public.is_active_collaboration_participant(uuid) set search_path = pg_catalog;

revoke all privileges on function public.organization_active_owner_count(uuid)
  from public, anon, authenticated;
grant execute on function public.organization_active_owner_count(uuid) to authenticated;
alter function public.organization_active_owner_count(uuid) set search_path = pg_catalog;

-- Internal trigger/event-trigger functions: never public RPCs.
revoke all privileges on function public.set_updated_at()
  from public, anon, authenticated;
alter function public.set_updated_at() set search_path = pg_catalog;

revoke all privileges on function public.rls_auto_enable()
  from public, anon, authenticated;
alter function public.rls_auto_enable() set search_path = pg_catalog;
