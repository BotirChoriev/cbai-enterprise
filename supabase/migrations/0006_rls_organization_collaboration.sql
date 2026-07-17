-- BUILD-034 — RLS for organization, collaboration, living graph, notifications.
-- Requires 0005_organization_collaboration_graph.sql.

-- Helper: active membership for current user
create or replace function public.current_user_org_role(org_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.organization_memberships m
  where m.organization_id = org_id
    and m.user_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

create or replace function public.is_active_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.is_active_collaboration_participant(collab_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.collaboration_participants p
    where p.collaboration_id = collab_id
      and p.user_id = auth.uid()
      and p.status = 'active'
  );
$$;

-- organizations
alter table public.organizations enable row level security;

create policy organizations_select_member on public.organizations
  for select using (public.is_active_org_member(id));

create policy organizations_insert_authenticated on public.organizations
  for insert with check (auth.uid() is not null and created_by = auth.uid());

create policy organizations_update_admin on public.organizations
  for update using (
    public.current_user_org_role(id) in ('owner', 'administrator')
  );

-- organization_memberships
alter table public.organization_memberships enable row level security;

create policy org_memberships_select on public.organization_memberships
  for select using (public.is_active_org_member(organization_id));

create policy org_memberships_insert on public.organization_memberships
  for insert with check (
    public.current_user_org_role(organization_id) in ('owner', 'administrator')
    or (
      user_id = auth.uid()
      and status = 'active'
      and exists (
        select 1 from public.organization_invitations i
        where i.organization_id = organization_memberships.organization_id
          and i.status = 'accepted'
          and i.accepted_by = auth.uid()
      )
    )
  );

create policy org_memberships_update on public.organization_memberships
  for update using (
    public.current_user_org_role(organization_id) in ('owner', 'administrator')
    and not (
      role = 'owner'
      and public.organization_active_owner_count(organization_id) <= 1
      and organization_memberships.role = 'owner'
    )
  );

create policy org_memberships_delete on public.organization_memberships
  for delete using (
    public.current_user_org_role(organization_id) in ('owner', 'administrator')
    and not (
      organization_memberships.role = 'owner'
      and public.organization_active_owner_count(organization_id) <= 1
    )
  );

-- organization_invitations
alter table public.organization_invitations enable row level security;

create policy org_invitations_select on public.organization_invitations
  for select using (
    public.current_user_org_role(organization_id) in ('owner', 'administrator', 'mission_lead')
    or (
      recipient_email_normalized = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status = 'pending'
    )
  );

create policy org_invitations_insert on public.organization_invitations
  for insert with check (
    public.current_user_org_role(organization_id) in ('owner', 'administrator', 'mission_lead')
    and created_by = auth.uid()
  );

create policy org_invitations_update on public.organization_invitations
  for update using (
    public.current_user_org_role(organization_id) in ('owner', 'administrator', 'mission_lead')
    or (
      recipient_email_normalized = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status = 'pending'
    )
  );

-- organization_audit_events
alter table public.organization_audit_events enable row level security;

create policy org_audit_select on public.organization_audit_events
  for select using (
    public.current_user_org_role(organization_id) in ('owner', 'administrator')
  );

create policy org_audit_insert on public.organization_audit_events
  for insert with check (actor_id = auth.uid());

-- mission_collaborations
alter table public.mission_collaborations enable row level security;

create policy collab_select on public.mission_collaborations
  for select using (
    created_by = auth.uid()
    or public.is_active_collaboration_participant(id)
    or (
      owner_organization_id is not null
      and public.is_active_org_member(owner_organization_id)
    )
  );

create policy collab_insert on public.mission_collaborations
  for insert with check (created_by = auth.uid());

create policy collab_update on public.mission_collaborations
  for update using (
    created_by = auth.uid()
    or public.is_active_collaboration_participant(id)
  );

-- collaboration_participants
alter table public.collaboration_participants enable row level security;

create policy collab_participants_select on public.collaboration_participants
  for select using (public.is_active_collaboration_participant(collaboration_id));

create policy collab_participants_insert on public.collaboration_participants
  for insert with check (
    exists (
      select 1 from public.mission_collaborations c
      where c.id = collaboration_id and c.created_by = auth.uid()
    )
  );

create policy collab_participants_update on public.collaboration_participants
  for update using (
    user_id = auth.uid()
    or exists (
      select 1 from public.mission_collaborations c
      where c.id = collaboration_id and c.created_by = auth.uid()
    )
  );

-- collaboration_shared_objects
alter table public.collaboration_shared_objects enable row level security;

create policy collab_shared_select on public.collaboration_shared_objects
  for select using (
    public.is_active_collaboration_participant(collaboration_id)
    and status = 'active'
  );

create policy collab_shared_insert on public.collaboration_shared_objects
  for insert with check (
    shared_by = auth.uid()
    and public.is_active_collaboration_participant(collaboration_id)
  );

create policy collab_shared_update on public.collaboration_shared_objects
  for update using (shared_by = auth.uid());

-- collaboration_review_assignments
alter table public.collaboration_review_assignments enable row level security;

create policy collab_review_select on public.collaboration_review_assignments
  for select using (
    assigned_to = auth.uid()
    or assigned_by = auth.uid()
    or public.is_active_collaboration_participant(collaboration_id)
  );

create policy collab_review_insert on public.collaboration_review_assignments
  for insert with check (assigned_by = auth.uid());

create policy collab_review_update on public.collaboration_review_assignments
  for update using (assigned_to = auth.uid() or assigned_by = auth.uid());

-- user_notifications
alter table public.user_notifications enable row level security;

create policy notifications_select on public.user_notifications
  for select using (recipient_user_id = auth.uid());

create policy notifications_update on public.user_notifications
  for update using (recipient_user_id = auth.uid());

create policy notifications_insert on public.user_notifications
  for insert with check (recipient_user_id = auth.uid() or actor_id = auth.uid());

-- living_relationships
alter table public.living_relationships enable row level security;

create policy living_relationships_select on public.living_relationships
  for select using (
    created_by = auth.uid()
    or (
      organization_id is not null
      and public.is_active_org_member(organization_id)
    )
    or (
      collaboration_id is not null
      and public.is_active_collaboration_participant(collaboration_id)
    )
  );

create policy living_relationships_insert on public.living_relationships
  for insert with check (created_by = auth.uid());

create policy living_relationships_update on public.living_relationships
  for update using (created_by = auth.uid());
