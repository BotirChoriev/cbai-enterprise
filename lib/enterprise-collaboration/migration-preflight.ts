/**
 * Migration preflight for enterprise collaboration (0009 + 0010).
 * Does not apply migrations. Never prints secrets.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export type PreflightFinding = {
  readonly id: string;
  readonly severity: "info" | "warn" | "blocker";
  readonly message: string;
};

export function runEnterpriseMigrationPreflight(root = process.cwd()): {
  readonly okToApply: boolean;
  readonly findings: readonly PreflightFinding[];
} {
  const findings: PreflightFinding[] = [];
  const m9 = resolve(root, "supabase/migrations/0009_enterprise_collaboration_comments.sql");
  const m10 = resolve(root, "supabase/migrations/0010_activity_events_org_compat.sql");
  const m1 = resolve(root, "supabase/migrations/0001_init_schema.sql");
  const m5 = resolve(root, "supabase/migrations/0005_organization_collaboration_graph.sql");
  const m8 = resolve(root, "supabase/migrations/0008_object_storage_and_messages.sql");

  for (const f of [m9, m10, m1, m5]) {
    if (!existsSync(f)) findings.push({ id: "missing-file", severity: "blocker", message: `Missing ${f}` });
  }

  const sql9 = existsSync(m9) ? readFileSync(m9, "utf8") : "";
  const sql10 = existsSync(m10) ? readFileSync(m10, "utf8") : "";
  const sql1 = existsSync(m1) ? readFileSync(m1, "utf8") : "";
  const sql8 = existsSync(m8) ? readFileSync(m8, "utf8") : "";

  if (/organization_id text not null references public\.organizations/.test(sql9)) {
    findings.push({
      id: "fk-type",
      severity: "blocker",
      message: "0009 still uses text organization_id FK — must be uuid to match organizations.id.",
    });
  } else {
    findings.push({
      id: "fk-type",
      severity: "info",
      message: "0009 uses uuid organization_id FKs (compatible with 0005).",
    });
  }

  if (!/create table if not exists public\.enterprise_comments/.test(sql9)) {
    findings.push({ id: "comments-table", severity: "blocker", message: "0009 missing enterprise_comments." });
  }
  if (!/drop policy if exists/.test(sql9)) {
    findings.push({ id: "idempotent-policies", severity: "warn", message: "0009 policies may not be idempotent." });
  } else {
    findings.push({ id: "idempotent-policies", severity: "info", message: "0009 policies use drop policy if exists." });
  }

  if (/drop table\s+public\.activity_events/i.test(sql10)) {
    findings.push({
      id: "activity-drop",
      severity: "blocker",
      message: "0010 must not drop activity_events.",
    });
  }

  if (/add column if not exists organization_id/.test(sql10)) {
    findings.push({
      id: "activity-compat",
      severity: "info",
      message: "0010 extends activity_events with org columns without destructive reset.",
    });
  } else {
    findings.push({
      id: "activity-compat",
      severity: "blocker",
      message: "0010 missing safe ADD COLUMN path for activity_events.",
    });
  }

  if (/create table if not exists public\.activity_events/.test(sql1) && /create table if not exists public\.activity_events/.test(sql8)) {
    findings.push({
      id: "activity-conflict",
      severity: "warn",
      message:
        "0001 and 0008 both define activity_events; 0008 is a no-op after 0001. 0010 resolves by ALTER.",
    });
  }

  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  const dbUrl = (process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "").trim();
  const hasDb = Boolean(dbUrl);
  const dbLooksPostgres = /^(postgres(?:ql)?:\/\/)/i.test(dbUrl);

  // Apply gate: operator DB URL only. Public anon keys live in Cloudflare Preview and are
  // required for live app/RLS proof, not for SQL migration apply.
  if (!hasDb) {
    findings.push({
      id: "env-db",
      severity: "blocker",
      message: "SUPABASE_DB_URL / DATABASE_URL not set — migration apply is blocked from this environment.",
    });
  } else if (!dbLooksPostgres) {
    findings.push({
      id: "env-db-format",
      severity: "blocker",
      message: "SUPABASE_DB_URL must be a postgresql:// (or postgres://) URI, not an https Project URL.",
    });
  } else {
    findings.push({
      id: "env-db",
      severity: "info",
      message: "SUPABASE_DB_URL present as postgres URI — apply gate satisfied.",
    });
  }

  if (!hasUrl || !hasAnon) {
    findings.push({
      id: "env-public",
      severity: "warn",
      message:
        "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set in this shell — live client/RLS proof remains blocked until local or Pages Preview env provides them.",
    });
  } else {
    findings.push({
      id: "env-public",
      severity: "info",
      message: "Public Supabase URL + anon key present for live client verification.",
    });
  }

  const blockers = findings.filter((f) => f.severity === "blocker");
  return { okToApply: blockers.length === 0, findings };
}
