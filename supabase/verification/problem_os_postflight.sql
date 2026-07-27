-- CBAI Problem OS 0008 — read-only postflight.
-- Run after the migration. RLS/policy/function checks must be true and policy counts exact.
-- force_rls is reported for visibility; owner isolation is enforced by enabled RLS + policies.

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('problem_snapshots', 'problem_audit_events')
order by c.relname;

select
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('problem_snapshots', 'problem_audit_events')
order by tablename, policyname;

select
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
  and trigger_name in (
    'protect_problem_history_trigger',
    'audit_problem_snapshot_change_trigger'
  )
order by trigger_name, event_manipulation;

select
  to_regprocedure('public.protect_problem_history()') is not null
    as protect_problem_history_exists,
  to_regprocedure('public.audit_problem_snapshot_change()') is not null
    as audit_problem_snapshot_change_exists;

select
  count(*) filter (where tablename = 'problem_snapshots') = 3
    as snapshot_policy_count_is_exact,
  count(*) filter (where tablename = 'problem_audit_events') = 1
    as audit_policy_count_is_exact,
  count(*) filter (
    where tablename = 'problem_audit_events'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  ) = 0 as audit_has_no_client_mutation_policy
from pg_policies
where schemaname = 'public'
  and tablename in ('problem_snapshots', 'problem_audit_events');

select
  not has_function_privilege('anon', 'public.protect_problem_history()', 'EXECUTE')
    and not has_function_privilege('authenticated', 'public.protect_problem_history()', 'EXECUTE')
    as history_trigger_not_client_executable,
  not has_function_privilege('anon', 'public.audit_problem_snapshot_change()', 'EXECUTE')
    and not has_function_privilege('authenticated', 'public.audit_problem_snapshot_change()', 'EXECUTE')
    as audit_trigger_not_client_executable;
