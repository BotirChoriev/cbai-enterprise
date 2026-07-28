-- Block 1 Artifact Intelligence — private quarantine storage and document provenance.
-- Additive only. Apply to cbai-preview before any production consideration.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cbai-artifacts',
  'cbai-artifacts',
  false,
  209715200,
  array['application/pdf']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.document_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  storage_object_id uuid references public.storage_objects (id) on delete set null,
  bucket text not null default 'cbai-artifacts',
  storage_key text not null,
  original_filename text not null,
  safe_filename text not null,
  byte_size bigint not null check (byte_size > 0 and byte_size <= 209715200),
  mime_type text not null check (mime_type = 'application/pdf'),
  checksum_sha256 text not null check (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  title text not null default '',
  domain text not null default '',
  purpose text not null default '',
  research_question text not null default '',
  content_locale text not null default 'en',
  privacy text not null default 'private'
    check (privacy in ('private', 'team')),
  scan_status text not null default 'pending'
    check (scan_status in ('pending', 'clean', 'infected', 'failed', 'external_blocked')),
  processing_status text not null default 'quarantined'
    check (processing_status in (
      'quarantined', 'scan_pending', 'extracting', 'needs_human_review',
      'human_confirmed', 'failed'
    )),
  scanner_provider text,
  scanner_result_id text,
  scanned_at timestamptz,
  parser_version text,
  page_count integer check (page_count is null or page_count > 0),
  extraction_warnings text[] not null default '{}',
  human_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, checksum_sha256),
  unique (bucket, storage_key)
);

create table if not exists public.document_artifact_sections (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.document_artifacts (id) on delete cascade,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  section_kind text not null
    check (section_kind in (
      'title', 'abstract', 'research_question', 'methodology', 'findings',
      'references', 'table', 'figure', 'formula', 'appendix', 'other'
    )),
  heading text,
  page_start integer check (page_start is null or page_start > 0),
  page_end integer check (page_end is null or page_end > 0),
  extracted_text text not null default '',
  extraction_confidence numeric check (
    extraction_confidence is null
    or (extraction_confidence >= 0 and extraction_confidence <= 1)
  ),
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists document_artifacts_owner_created_idx
  on public.document_artifacts (owner_user_id, created_at desc);
create index if not exists document_artifacts_processing_idx
  on public.document_artifacts (processing_status, scan_status);
create index if not exists document_artifact_sections_artifact_page_idx
  on public.document_artifact_sections (artifact_id, page_start);

alter table public.document_artifacts enable row level security;
alter table public.document_artifact_sections enable row level security;

drop policy if exists document_artifacts_owner_select on public.document_artifacts;
create policy document_artifacts_owner_select on public.document_artifacts
  for select to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists document_artifacts_owner_insert_quarantined on public.document_artifacts;
create policy document_artifacts_owner_insert_quarantined on public.document_artifacts
  for insert to authenticated
  with check (
    owner_user_id = auth.uid()
    and bucket = 'cbai-artifacts'
    and scan_status = 'pending'
    and processing_status in ('quarantined', 'scan_pending')
    and human_confirmed_at is null
  );

drop policy if exists document_artifacts_owner_update on public.document_artifacts;
create policy document_artifacts_owner_update on public.document_artifacts
  for update to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists document_artifacts_owner_delete on public.document_artifacts;
create policy document_artifacts_owner_delete on public.document_artifacts
  for delete to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists document_sections_owner_select on public.document_artifact_sections;
create policy document_sections_owner_select on public.document_artifact_sections
  for select to authenticated
  using (owner_user_id = auth.uid());

-- Sections are processor-authored. Authenticated clients cannot fabricate extraction.
revoke insert, update, delete on public.document_artifact_sections from authenticated;

create or replace function private.guard_document_artifact_client_transition()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if auth.role() = 'authenticated' then
    if new.owner_user_id <> old.owner_user_id
      or new.bucket <> old.bucket
      or new.storage_key <> old.storage_key
      or new.checksum_sha256 <> old.checksum_sha256
      or new.scan_status <> old.scan_status
      or new.scanner_provider is distinct from old.scanner_provider
      or new.scanner_result_id is distinct from old.scanner_result_id
      or new.scanned_at is distinct from old.scanned_at
      or new.parser_version is distinct from old.parser_version
      or new.page_count is distinct from old.page_count
      or new.extraction_warnings is distinct from old.extraction_warnings
    then
      raise exception 'artifact_security_fields_are_processor_owned'
        using errcode = '42501';
    end if;

    if new.processing_status <> old.processing_status then
      if not (
        old.processing_status = 'needs_human_review'
        and new.processing_status = 'human_confirmed'
        and old.scan_status = 'clean'
        and new.human_confirmed_at is not null
      ) then
        raise exception 'artifact_transition_requires_processor'
          using errcode = '42501';
      end if;
    end if;

    if old.processing_status <> 'needs_human_review'
      and new.human_confirmed_at is distinct from old.human_confirmed_at
    then
      raise exception 'artifact_human_confirmation_not_ready'
        using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_document_artifact_client_transition
  on public.document_artifacts;
create trigger guard_document_artifact_client_transition
before update on public.document_artifacts
for each row execute function private.guard_document_artifact_client_transition();

-- Uploads are always written into the authenticated user's private prefix.
drop policy if exists cbai_artifacts_insert_own_prefix on storage.objects;
create policy cbai_artifacts_insert_own_prefix on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'cbai-artifacts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Quarantined bytes are not downloadable. A processor must mark the matching
-- metadata row clean before the owner can read or generate a signed URL.
drop policy if exists cbai_artifacts_select_clean_owner on storage.objects;
create policy cbai_artifacts_select_clean_owner on storage.objects
  for select to authenticated
  using (
    bucket_id = 'cbai-artifacts'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.document_artifacts a
      where a.owner_user_id = auth.uid()
        and a.bucket = bucket_id
        and a.storage_key = name
        and a.scan_status = 'clean'
        and a.processing_status in (
          'extracting', 'needs_human_review', 'human_confirmed'
        )
    )
  );

drop policy if exists cbai_artifacts_delete_own_prefix on storage.objects;
create policy cbai_artifacts_delete_own_prefix on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'cbai-artifacts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

revoke all on table public.document_artifacts from anon;
revoke all on table public.document_artifact_sections from anon;
grant select, insert, update, delete on table public.document_artifacts to authenticated;
grant select on table public.document_artifact_sections to authenticated;

