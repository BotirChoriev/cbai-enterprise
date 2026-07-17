-- BUILD-039 — Atomic organization RPC functions (security definer, RLS-safe paths).
-- Requires 0005 + 0006 applied.

-- Create organization + owner membership in one transaction.
create or replace function public.create_organization_with_owner(
  p_name text,
  p_organization_type text default 'other',
  p_identity_kind text default 'workspace_organization',
  p_official_website text default null,
  p_country_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org public.organizations%rowtype;
  v_mem public.organization_memberships%rowtype;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.organizations (
    name,
    normalized_name,
    organization_type,
    identity_kind,
    official_website,
    country_code,
    created_by
  ) values (
    trim(p_name),
    lower(trim(p_name)),
    coalesce(p_organization_type, 'other'),
    coalesce(p_identity_kind, 'workspace_organization'),
    p_official_website,
    p_country_code,
    v_uid
  )
  returning * into v_org;

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role,
    status,
    joined_at
  ) values (
    v_org.id,
    v_uid,
    'owner',
    'active',
    now()
  )
  returning * into v_mem;

  insert into public.organization_audit_events (
    organization_id,
    actor_id,
    action,
    target_type,
    target_id,
    safe_metadata
  ) values (
    v_org.id,
    v_uid,
    'organization_created',
    'organization',
    v_org.id,
    jsonb_build_object('name', v_org.name)
  );

  return jsonb_build_object(
    'organization', to_jsonb(v_org),
    'membership', to_jsonb(v_mem)
  );
end;
$$;

revoke all on function public.create_organization_with_owner(text, text, text, text, text) from public;
grant execute on function public.create_organization_with_owner(text, text, text, text, text) to authenticated;

-- Accept invitation by raw token (hashed server-side); binds auth email.
create or replace function public.accept_organization_invitation_by_token(p_raw_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_hash text;
  v_inv public.organization_invitations%rowtype;
  v_mem public.organization_memberships%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if v_email = '' then
    raise exception 'validation_failed';
  end if;

  v_hash := encode(digest(trim(p_raw_token), 'sha256'), 'hex');

  select * into v_inv
  from public.organization_invitations i
  where i.token_hash = v_hash
  for update;

  if not found then
    raise exception 'not_found';
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'validation_failed';
  end if;
  if v_inv.expires_at < now() then
    update public.organization_invitations set status = 'expired', updated_at = now()
    where id = v_inv.id;
    raise exception 'expired';
  end if;
  if v_inv.recipient_email_normalized <> v_email then
    raise exception 'not_authorized';
  end if;

  update public.organization_invitations
  set status = 'accepted',
      accepted_by = v_uid,
      accepted_at = now(),
      updated_at = now(),
      version = version + 1
  where id = v_inv.id;

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role,
    status,
    invited_by,
    joined_at
  ) values (
    v_inv.organization_id,
    v_uid,
    v_inv.intended_role,
    'active',
    v_inv.created_by,
    now()
  )
  on conflict (organization_id, user_id) do update
  set role = excluded.role,
      status = 'active',
      updated_at = now(),
      version = organization_memberships.version + 1
  returning * into v_mem;

  insert into public.organization_audit_events (
    organization_id,
    actor_id,
    action,
    target_type,
    target_id,
    safe_metadata
  ) values (
    v_inv.organization_id,
    v_uid,
    'invitation_accepted',
    'invitation',
    v_inv.id,
    jsonb_build_object('role', v_inv.intended_role)
  );

  return jsonb_build_object('membership', to_jsonb(v_mem), 'invitation_id', v_inv.id);
end;
$$;

revoke all on function public.accept_organization_invitation_by_token(text) from public;
grant execute on function public.accept_organization_invitation_by_token(text) to authenticated;
