-- Enterprise collaboration comments / mentions / approvals (cloud schema forward).
-- Device-local stores are the runtime path until shared sync is wired.

create table if not exists public.enterprise_comments (
  id text primary key,
  organization_id text not null references public.organizations (id) on delete cascade,
  target_type text not null,
  target_id text not null,
  author_id uuid not null references auth.users (id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enterprise_comments_org_created_idx
  on public.enterprise_comments (organization_id, created_at desc);

create table if not exists public.enterprise_mentions (
  id text primary key,
  organization_id text not null references public.organizations (id) on delete cascade,
  comment_id text not null references public.enterprise_comments (id) on delete cascade,
  mentioned_user_id uuid not null references auth.users (id),
  mentioned_by uuid not null references auth.users (id),
  target_type text not null,
  target_id text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists enterprise_mentions_user_idx
  on public.enterprise_mentions (mentioned_user_id, created_at desc);

create table if not exists public.enterprise_approvals (
  id text primary key,
  organization_id text not null references public.organizations (id) on delete cascade,
  target_type text not null,
  target_id text not null,
  title text not null,
  requested_by uuid not null references auth.users (id),
  assigned_to uuid not null references auth.users (id),
  status text not null check (status in ('pending', 'approved', 'rejected', 'cancelled', 'changes_requested')),
  decision_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enterprise_approvals_assignee_idx
  on public.enterprise_approvals (assigned_to, status, created_at desc);

alter table public.enterprise_comments enable row level security;
alter table public.enterprise_mentions enable row level security;
alter table public.enterprise_approvals enable row level security;

-- Members of the organization may select comments in that org.
drop policy if exists enterprise_comments_member_select on public.enterprise_comments;
create policy enterprise_comments_member_select on public.enterprise_comments
  for select using (
    exists (
      select 1 from public.organization_memberships m
      where m.organization_id = enterprise_comments.organization_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists enterprise_comments_member_insert on public.enterprise_comments;
create policy enterprise_comments_member_insert on public.enterprise_comments
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.organization_memberships m
      where m.organization_id = enterprise_comments.organization_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists enterprise_mentions_member_select on public.enterprise_mentions;
create policy enterprise_mentions_member_select on public.enterprise_mentions
  for select using (
    mentioned_user_id = auth.uid()
    or exists (
      select 1 from public.organization_memberships m
      where m.organization_id = enterprise_mentions.organization_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists enterprise_approvals_member_select on public.enterprise_approvals;
create policy enterprise_approvals_member_select on public.enterprise_approvals
  for select using (
    exists (
      select 1 from public.organization_memberships m
      where m.organization_id = enterprise_approvals.organization_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists enterprise_approvals_member_insert on public.enterprise_approvals;
create policy enterprise_approvals_member_insert on public.enterprise_approvals
  for insert with check (
    requested_by = auth.uid()
    and exists (
      select 1 from public.organization_memberships m
      where m.organization_id = enterprise_approvals.organization_id
        and m.user_id = auth.uid()
    )
  );
