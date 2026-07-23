-- Preview Completion — object storage refs + team messages (forward-only).
-- DO NOT apply to production without operator approval and live credentials.
-- Compensating rollback: DROP TABLE IF EXISTS in reverse order (see docs/verification/preview-completion/05-migration-plan.md).

-- Object metadata only — blobs live in Storage buckets with signed URLs.
create table if not exists public.storage_objects (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  bucket text not null,
  storage_key text not null,
  content_hash text,
  byte_size bigint,
  mime_type text,
  visibility text not null default 'private' check (visibility in ('private', 'team', 'public')),
  lifecycle_status text not null default 'draft'
    check (lifecycle_status in (
      'draft', 'upload_pending', 'uploading', 'uploaded',
      'processing_pending', 'processing', 'needs_review', 'ready', 'failed'
    )),
  scan_status text not null default 'not_configured'
    check (scan_status in ('not_configured', 'pending', 'clean', 'infected', 'failed', 'external_blocked')),
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, storage_key)
);

create index if not exists storage_objects_owner_idx on public.storage_objects (owner_user_id);
create index if not exists storage_objects_org_idx on public.storage_objects (organization_id);

alter table public.storage_objects enable row level security;

create policy storage_objects_select_owner_or_member on public.storage_objects
  for select using (
    owner_user_id = auth.uid()
    or (organization_id is not null and public.is_active_org_member(organization_id))
  );

create policy storage_objects_insert_owner on public.storage_objects
  for insert with check (
    auth.uid() is not null
    and owner_user_id = auth.uid()
  );

create policy storage_objects_update_owner_or_admin on public.storage_objects
  for update using (
    owner_user_id = auth.uid()
    or (organization_id is not null and public.current_user_org_role(organization_id) in ('owner', 'administrator'))
  );

create policy storage_objects_delete_owner_or_admin on public.storage_objects
  for delete using (
    owner_user_id = auth.uid()
    or (organization_id is not null and public.current_user_org_role(organization_id) in ('owner', 'administrator'))
  );

-- Team/org message threads (server-authoritative; sender from auth.uid()).
create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text,
  visibility text not null default 'team' check (visibility in ('private', 'team', 'public')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  sender_user_id uuid not null references auth.users (id),
  content text not null,
  content_locale text,
  reply_to_id uuid references public.messages (id) on delete set null,
  visibility text not null default 'team' check (visibility in ('private', 'team', 'public')),
  edited_at timestamptz,
  deleted_at timestamptz,
  idempotency_key text,
  created_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);

create index if not exists messages_thread_created_idx on public.messages (thread_id, created_at);
create index if not exists messages_org_created_idx on public.messages (organization_id, created_at);

alter table public.message_threads enable row level security;
alter table public.messages enable row level security;

create policy message_threads_member_select on public.message_threads
  for select using (public.is_active_org_member(organization_id));

create policy message_threads_member_insert on public.message_threads
  for insert with check (
    public.is_active_org_member(organization_id)
    and created_by = auth.uid()
  );

create policy messages_member_select on public.messages
  for select using (public.is_active_org_member(organization_id) and deleted_at is null);

create policy messages_member_insert on public.messages
  for insert with check (
    public.is_active_org_member(organization_id)
    and sender_user_id = auth.uid()
  );

create policy messages_sender_update on public.messages
  for update using (sender_user_id = auth.uid());

-- Append-only activity events (clients cannot forge actor).
-- Compatible with 0001: if activity_events already exists (owner_id schema), skip DDL/index/policies
-- here — 0010_activity_events_org_compat.sql adds org columns + org-aware policies.
do $$
begin
  if to_regclass('public.activity_events') is null then
    create table public.activity_events (
      id uuid primary key default gen_random_uuid(),
      organization_id uuid references public.organizations (id) on delete cascade,
      actor_user_id uuid references auth.users (id) on delete set null,
      action text not null,
      target_type text,
      target_id text,
      correlation_id text,
      created_at timestamptz not null default now()
    );
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'activity_events'
      and column_name = 'organization_id'
  ) then
    execute 'create index if not exists activity_events_org_created_idx on public.activity_events (organization_id, created_at desc)';
  end if;
end $$;

alter table public.activity_events enable row level security;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'activity_events'
      and column_name = 'organization_id'
  ) then
    drop policy if exists activity_events_member_select on public.activity_events;
    create policy activity_events_member_select on public.activity_events
      for select using (
        organization_id is null
        or public.is_active_org_member(organization_id)
      );
    drop policy if exists activity_events_no_client_insert on public.activity_events;
    create policy activity_events_no_client_insert on public.activity_events
      for insert with check (false);
  end if;
end $$;
