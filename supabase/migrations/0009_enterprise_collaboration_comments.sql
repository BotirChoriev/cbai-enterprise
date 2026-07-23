-- Enterprise collaboration comments / mentions / approvals (cloud).
-- SAFE / IDEMPOTENT: no DROP TABLE, no data wipe, create-if-not-exists + drop policy if exists.
-- Preflight: organizations.id must be uuid (0005). Do NOT use text FKs.
-- Runtime: device-local stores remain fallback when shared backend is not configured.

-- ---------------------------------------------------------------------------
-- enterprise_comments (threaded + resolve)
-- ---------------------------------------------------------------------------
create table if not exists public.enterprise_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  target_type text not null,
  target_id text not null,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  parent_id uuid references public.enterprise_comments (id) on delete cascade,
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enterprise_comments_org_created_idx
  on public.enterprise_comments (organization_id, created_at desc);

create index if not exists enterprise_comments_target_idx
  on public.enterprise_comments (organization_id, target_type, target_id);

create index if not exists enterprise_comments_parent_idx
  on public.enterprise_comments (parent_id);

-- ---------------------------------------------------------------------------
-- enterprise_mentions
-- ---------------------------------------------------------------------------
create table if not exists public.enterprise_mentions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  comment_id uuid not null references public.enterprise_comments (id) on delete cascade,
  mentioned_user_id uuid not null references auth.users (id) on delete cascade,
  mentioned_by uuid not null references auth.users (id) on delete cascade,
  target_type text not null,
  target_id text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists enterprise_mentions_user_idx
  on public.enterprise_mentions (mentioned_user_id, created_at desc);

create index if not exists enterprise_mentions_org_idx
  on public.enterprise_mentions (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- enterprise_approvals
-- ---------------------------------------------------------------------------
create table if not exists public.enterprise_approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  target_type text not null,
  target_id text not null,
  title text not null,
  requested_by uuid not null references auth.users (id) on delete cascade,
  assigned_to uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'rejected', 'cancelled', 'changes_requested')),
  decision_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enterprise_approvals_assignee_idx
  on public.enterprise_approvals (assigned_to, status, created_at desc);

create index if not exists enterprise_approvals_org_idx
  on public.enterprise_approvals (organization_id, status, created_at desc);

alter table public.enterprise_comments enable row level security;
alter table public.enterprise_mentions enable row level security;
alter table public.enterprise_approvals enable row level security;

-- Comments
drop policy if exists enterprise_comments_member_select on public.enterprise_comments;
create policy enterprise_comments_member_select on public.enterprise_comments
  for select using (public.is_active_org_member(organization_id));

drop policy if exists enterprise_comments_member_insert on public.enterprise_comments;
create policy enterprise_comments_member_insert on public.enterprise_comments
  for insert with check (
    author_id = auth.uid()
    and public.is_active_org_member(organization_id)
  );

drop policy if exists enterprise_comments_author_update on public.enterprise_comments;
create policy enterprise_comments_author_update on public.enterprise_comments
  for update using (
    public.is_active_org_member(organization_id)
    and (
      author_id = auth.uid()
      or public.current_user_org_role(organization_id) in ('owner', 'administrator', 'mission_lead', 'reviewer')
    )
  );

-- Mentions
drop policy if exists enterprise_mentions_member_select on public.enterprise_mentions;
create policy enterprise_mentions_member_select on public.enterprise_mentions
  for select using (
    mentioned_user_id = auth.uid()
    or public.is_active_org_member(organization_id)
  );

drop policy if exists enterprise_mentions_member_insert on public.enterprise_mentions;
create policy enterprise_mentions_member_insert on public.enterprise_mentions
  for insert with check (
    mentioned_by = auth.uid()
    and public.is_active_org_member(organization_id)
  );

drop policy if exists enterprise_mentions_recipient_update on public.enterprise_mentions;
create policy enterprise_mentions_recipient_update on public.enterprise_mentions
  for update using (mentioned_user_id = auth.uid());

-- Approvals
drop policy if exists enterprise_approvals_member_select on public.enterprise_approvals;
create policy enterprise_approvals_member_select on public.enterprise_approvals
  for select using (public.is_active_org_member(organization_id));

drop policy if exists enterprise_approvals_member_insert on public.enterprise_approvals;
create policy enterprise_approvals_member_insert on public.enterprise_approvals
  for insert with check (
    requested_by = auth.uid()
    and public.is_active_org_member(organization_id)
    and public.is_active_org_member(organization_id) -- assignee must also be member (enforced in app + trigger optional)
  );

drop policy if exists enterprise_approvals_assignee_update on public.enterprise_approvals;
create policy enterprise_approvals_assignee_update on public.enterprise_approvals
  for update using (
    assigned_to = auth.uid()
    and public.is_active_org_member(organization_id)
    and public.current_user_org_role(organization_id) in ('owner', 'administrator', 'reviewer')
  );

-- updated_at triggers (idempotent)
drop trigger if exists set_updated_at on public.enterprise_comments;
create trigger set_updated_at before update on public.enterprise_comments
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.enterprise_approvals;
create trigger set_updated_at before update on public.enterprise_approvals
  for each row execute function public.set_updated_at();
