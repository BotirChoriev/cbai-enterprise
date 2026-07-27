-- CBAI Problem OS 0008 — read-only preflight.
-- Run before supabase/migrations/0008_problem_os.sql. Every row must report "ready".

select
  'pgcrypto/gen_random_uuid available' as check_name,
  case when to_regprocedure('gen_random_uuid()') is not null then 'ready' else 'blocked' end as result;

select
  'auth.users prerequisite exists' as check_name,
  case when to_regclass('auth.users') is not null then 'ready' else 'blocked' end as result;

select
  'problem_snapshots is not partially installed' as check_name,
  case when to_regclass('public.problem_snapshots') is null then 'ready' else 'review_existing_install' end as result;

select
  'problem_audit_events is not partially installed' as check_name,
  case when to_regclass('public.problem_audit_events') is null then 'ready' else 'review_existing_install' end as result;

select
  'Problem OS trigger functions are not partially installed' as check_name,
  case
    when to_regprocedure('public.protect_problem_history()') is null
     and to_regprocedure('public.audit_problem_snapshot_change()') is null
    then 'ready'
    else 'review_existing_install'
  end as result;
