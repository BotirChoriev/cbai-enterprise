-- CBAI Problem OS — trigger functions are internal database boundaries, not public RPCs.
-- Trigger execution continues under the table trigger; clients must never invoke these directly.

revoke all privileges on function public.protect_problem_history() from public, anon, authenticated;
revoke all privileges on function public.audit_problem_snapshot_change() from public, anon, authenticated;
