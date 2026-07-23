/**
 * Apply Preview enterprise schema using SUPABASE_DB_URL.
 * Never prints the connection string or password.
 *
 * - Empty / missing foundation → apply 0001…0010 in order
 * - organizations already present → apply 0009 then 0010 only
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runEnterpriseMigrationPreflight } from "@/lib/enterprise-collaboration/migration-preflight";

const FOUNDATION_FILES = [
  "supabase/migrations/0001_init_schema.sql",
  "supabase/migrations/0002_rls_policies.sql",
  // 0003 is verification SELECTs only — skip
  "supabase/migrations/0004_evidence_bookmarks.sql",
  "supabase/migrations/0005_organization_collaboration_graph.sql",
  "supabase/migrations/0006_rls_organization_collaboration.sql",
  "supabase/migrations/0007_organization_rpc_functions.sql",
  "supabase/migrations/0008_object_storage_and_messages.sql",
] as const;

const ENTERPRISE_FILES = [
  "supabase/migrations/0009_enterprise_collaboration_comments.sql",
  "supabase/migrations/0010_activity_events_org_compat.sql",
  "supabase/migrations/0011_fix_invitation_digest.sql",
] as const;

async function main() {
  // Load .env.local if present (without logging values).
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const s = line.trim();
      if (!s || s.startsWith("#") || !s.includes("=")) continue;
      const i = s.indexOf("=");
      const k = s.slice(0, i);
      let v = s.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env) || !process.env[k]) process.env[k] = v;
    }
  } catch {
    // optional
  }

  const report = runEnterpriseMigrationPreflight();
  console.log("=== preflight ===");
  console.log(`okToApply: ${report.okToApply}`);
  for (const f of report.findings) {
    console.log(`[${f.severity}] ${f.id}: ${f.message}`);
  }
  if (!report.okToApply) {
    process.exitCode = 2;
    return;
  }

  const dbUrl = (process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "").trim();
  const { default: pg } = await import("pg");
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("connected: yes (host masked)");
  try {
    const foundation = await client.query<{
      organizations: boolean;
      storage_objects: boolean;
      enterprise_comments: boolean;
    }>(`
      select
        to_regclass('public.organizations') is not null as organizations,
        to_regclass('public.storage_objects') is not null as storage_objects,
        to_regclass('public.enterprise_comments') is not null as enterprise_comments
    `);
    const hasOrgs = Boolean(foundation.rows[0]?.organizations);
    const hasStorage = Boolean(foundation.rows[0]?.storage_objects);
    const hasEnterprise = Boolean(foundation.rows[0]?.enterprise_comments);

    let files: string[];
    let mode: string;
    if (!hasOrgs) {
      files = [...FOUNDATION_FILES, ...ENTERPRISE_FILES];
      mode = "full-chain (foundation missing — applying 0001…0010)";
    } else if (!hasStorage) {
      files = [
        "supabase/migrations/0008_object_storage_and_messages.sql",
        ...ENTERPRISE_FILES,
      ];
      mode = "resume-0008+enterprise (orgs present, storage/messages missing)";
    } else if (!hasEnterprise) {
      files = [...ENTERPRISE_FILES];
      mode = "enterprise-only (0009 then 0010)";
    } else {
      files = [...ENTERPRISE_FILES];
      mode = "re-apply-enterprise (idempotent 0009/0010)";
    }
    console.log(`mode: ${mode}`);

    for (const file of files) {
      const sql = readFileSync(resolve(process.cwd(), file), "utf8");
      console.log(`applying: ${file}`);
      await client.query(sql);
      console.log(`applied: ${file} OK`);
    }

    const checks = await client.query(`
      select
        to_regclass('public.enterprise_comments') is not null as enterprise_comments,
        to_regclass('public.enterprise_mentions') is not null as enterprise_mentions,
        to_regclass('public.enterprise_approvals') is not null as enterprise_approvals,
        to_regclass('public.organizations') is not null as organizations,
        to_regclass('public.organization_memberships') is not null as organization_memberships,
        to_regclass('public.organization_invitations') is not null as organization_invitations,
        to_regclass('public.user_notifications') is not null as user_notifications,
        to_regclass('public.activity_events') is not null as activity_events,
        to_regclass('public.mission_collaborations') is not null as mission_collaborations,
        exists(select 1 from pg_proc where proname = 'append_organization_activity') as append_rpc,
        exists(
          select 1 from information_schema.columns
          where table_schema='public' and table_name='enterprise_comments' and column_name='parent_id'
        ) as comments_parent_id,
        exists(
          select 1 from information_schema.columns
          where table_schema='public' and table_name='enterprise_comments' and column_name='resolved_at'
        ) as comments_resolved_at,
        exists(
          select 1 from information_schema.columns
          where table_schema='public' and table_name='activity_events' and column_name='organization_id'
        ) as activity_organization_id,
        (select relrowsecurity from pg_class where oid = 'public.enterprise_comments'::regclass) as comments_rls,
        (select relrowsecurity from pg_class where oid = 'public.enterprise_mentions'::regclass) as mentions_rls,
        (select relrowsecurity from pg_class where oid = 'public.enterprise_approvals'::regclass) as approvals_rls
    `);
    console.log("=== live verification ===");
    console.log(JSON.stringify(checks.rows[0], null, 2));

    const policies = await client.query(`
      select tablename, policyname
      from pg_policies
      where schemaname = 'public'
        and tablename in ('enterprise_comments','enterprise_mentions','enterprise_approvals','activity_events')
      order by tablename, policyname
    `);
    console.log("=== policies ===");
    for (const row of policies.rows) {
      console.log(`${row.tablename}: ${row.policyname}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("apply failed:", err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
