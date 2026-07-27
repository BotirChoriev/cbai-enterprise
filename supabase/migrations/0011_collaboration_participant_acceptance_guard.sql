-- Collaboration participant acceptance guard.
-- Invited users may see and accept only their own invitation; they cannot change role or identity.

drop policy if exists collab_participants_select on public.collaboration_participants;
create policy collab_participants_select on public.collaboration_participants
  for select using (
    user_id = auth.uid()
    or public.is_active_collaboration_participant(collaboration_id)
  );

create or replace function public.protect_collaboration_participant_self_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  caller_is_creator boolean;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select exists (
    select 1
    from public.mission_collaborations c
    where c.id = old.collaboration_id
      and c.created_by = auth.uid()
  ) into caller_is_creator;

  if caller_is_creator then
    return new;
  end if;

  if old.user_id <> auth.uid() then
    raise exception 'not_authorized';
  end if;

  if new.collaboration_id <> old.collaboration_id
     or new.participant_type <> old.participant_type
     or new.user_id is distinct from old.user_id
     or new.organization_id is distinct from old.organization_id
     or new.role <> old.role
     or new.invited_by <> old.invited_by
     or new.invited_at <> old.invited_at then
    raise exception 'participant_identity_or_role_is_immutable_for_self';
  end if;

  if old.status <> 'invited'
     or new.status <> 'active'
     or new.accepted_at is null
     or new.revoked_at is not null then
    raise exception 'invalid_participant_self_transition';
  end if;

  return new;
end;
$$;

revoke all privileges on function public.protect_collaboration_participant_self_update()
  from public, anon, authenticated;

drop trigger if exists protect_collaboration_participant_self_update_trigger
  on public.collaboration_participants;
create trigger protect_collaboration_participant_self_update_trigger
before update on public.collaboration_participants
for each row execute function public.protect_collaboration_participant_self_update();
