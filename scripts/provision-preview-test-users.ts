/**
 * Preview-only: create Auth users A/B/C and write CBAI_TEST_USER_* into .env.local.
 * Uses anon signUp + DB email confirm (SUPABASE_DB_URL). Never touches Production.
 * Never prints passwords or connection strings.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
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
}

function upsertEnvLocal(vars: Record<string, string>): void {
  const envPath = resolve(process.cwd(), ".env.local");
  let raw = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(raw)) {
      raw = raw.replace(re, line);
    } else {
      raw = `${raw.trimEnd()}\n${line}\n`;
    }
  }
  writeFileSync(envPath, raw.endsWith("\n") ? raw : `${raw}\n`, "utf8");
}

function genPassword(): string {
  return `CbaiPrev_${randomBytes(12).toString("base64url")}!9`;
}

type UserSpec = {
  label: "A" | "B" | "C";
  email: string;
  password: string;
};

async function ensureUserViaAuth(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<"signed_in" | "signed_up" | "needs_confirm"> {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.data.session) {
    await client.auth.signOut();
    return "signed_in";
  }
  const signUp = await client.auth.signUp({ email, password });
  if (signUp.error) {
    // User may exist with different password — try DB reset path.
    throw new Error(`signUp failed for ${email}: ${signUp.error.message}`);
  }
  if (signUp.data.session) {
    await client.auth.signOut();
    return "signed_up";
  }
  return "needs_confirm";
}

async function confirmAndEnsurePasswordViaDb(
  dbUrl: string,
  email: string,
  password: string,
): Promise<{ id: string; created: boolean }> {
  const { default: pg } = await import("pg");
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const existing = await client.query<{ id: string }>(
      `select id::text as id from auth.users where lower(email) = lower($1) limit 1`,
      [email],
    );
    if (existing.rows[0]?.id) {
      await client.query(
        `update auth.users
         set encrypted_password = crypt($2, gen_salt('bf')),
             email_confirmed_at = coalesce(email_confirmed_at, now()),
             updated_at = now()
         where id = $1::uuid`,
        [existing.rows[0].id, password],
      );
      // Ensure identity row exists for email provider (GoTrue).
      await client.query(
        `insert into auth.identities (
           id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
         )
         select gen_random_uuid(), u.id,
                jsonb_build_object('sub', u.id::text, 'email', u.email),
                'email', u.id::text, now(), now(), now()
         from auth.users u
         where u.id = $1::uuid
           and not exists (
             select 1 from auth.identities i
             where i.user_id = u.id and i.provider = 'email'
           )`,
        [existing.rows[0].id],
      );
      return { id: existing.rows[0].id, created: false };
    }

    const inserted = await client.query<{ id: string }>(
      `with u as (
         insert into auth.users (
           instance_id, id, aud, role, email, encrypted_password,
           email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
           created_at, updated_at, confirmation_token, recovery_token,
           email_change_token_new, email_change
         ) values (
           '00000000-0000-0000-0000-000000000000',
           gen_random_uuid(),
           'authenticated',
           'authenticated',
           lower($1),
           crypt($2, gen_salt('bf')),
           now(),
           '{"provider":"email","providers":["email"]}'::jsonb,
           '{}'::jsonb,
           now(), now(), '', '', '', ''
         )
         returning id
       ),
       i as (
         insert into auth.identities (
           id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
         )
         select gen_random_uuid(), u.id,
                jsonb_build_object('sub', u.id::text, 'email', lower($1)),
                'email', u.id::text, now(), now(), now()
         from u
         returning user_id
       )
       select id::text as id from u`,
      [email, password],
    );
    return { id: inserted.rows[0]!.id, created: true };
  } finally {
    await client.end();
  }
}

async function main() {
  loadEnvLocal();
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const dbUrl = (process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "").trim();

  // Repair truncated URL (e.g. https://ref...supabase.co) from DB host when possible.
  if (dbUrl.startsWith("postgres") && (!url || url.includes("..."))) {
    try {
      const dbHost = new URL(dbUrl.replace(/^postgresql:/, "http:")).hostname;
      const m = dbHost.match(/^db\.([^.]+)\.supabase\.co$/);
      if (m) {
        url = `https://${m[1]}.supabase.co`;
        process.env.NEXT_PUBLIC_SUPABASE_URL = url;
        upsertEnvLocal({ NEXT_PUBLIC_SUPABASE_URL: url });
        console.log(`repaired NEXT_PUBLIC_SUPABASE_URL host from DB ref`);
      }
    } catch {
      // keep as-is
    }
  }

  if (!url || !anonKey) {
    console.error("BLOCKED: NEXT_PUBLIC_SUPABASE_URL / ANON_KEY missing");
    process.exitCode = 2;
    return;
  }
  if (!dbUrl.startsWith("postgres")) {
    console.error("BLOCKED: SUPABASE_DB_URL required to confirm Preview Auth users");
    process.exitCode = 2;
    return;
  }
  if (!url.includes("supabase.co") && !url.includes("localhost")) {
    console.warn("WARN: URL host unexpected — aborting to avoid Production risk");
    process.exitCode = 2;
    return;
  }

  const stamp = Date.now().toString(36);
  const users: UserSpec[] = [
    {
      label: "A",
      email:
        process.env.CBAI_TEST_USER_A_EMAIL?.trim() ||
        `cbai.preview.a.${stamp}@example.com`,
      password: process.env.CBAI_TEST_USER_A_PASSWORD?.trim() || genPassword(),
    },
    {
      label: "B",
      email:
        process.env.CBAI_TEST_USER_B_EMAIL?.trim() ||
        `cbai.preview.b.${stamp}@example.com`,
      password: process.env.CBAI_TEST_USER_B_PASSWORD?.trim() || genPassword(),
    },
    {
      label: "C",
      email:
        process.env.CBAI_TEST_USER_C_EMAIL?.trim() ||
        `cbai.preview.c.${stamp}@example.com`,
      password: process.env.CBAI_TEST_USER_C_PASSWORD?.trim() || genPassword(),
    },
  ];

  console.log("=== provision Preview Auth users ===");
  console.log(`project host: ${new URL(url).host}`);

  const results: Record<string, { email: string; id: string; path: string }> = {};

  for (const u of users) {
    let path = "db";
    try {
      const authPath = await ensureUserViaAuth(url, anonKey, u.email, u.password);
      path = authPath;
    } catch {
      path = "auth_failed_then_db";
    }
    const db = await confirmAndEnsurePasswordViaDb(dbUrl, u.email, u.password);
    // Verify sign-in works
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await client.auth.signInWithPassword({
      email: u.email,
      password: u.password,
    });
    if (error || !data.user) {
      console.error(`FAIL User ${u.label}: cannot sign in after provision (${error?.message ?? "no user"})`);
      process.exitCode = 1;
      return;
    }
    await client.auth.signOut();
    results[u.label] = {
      email: u.email,
      id: data.user.id,
      path: `${path}/${db.created ? "created" : "updated"}`,
    };
    console.log(`User ${u.label}: OK id=${data.user.id.slice(0, 8)}… path=${results[u.label].path}`);
  }

  upsertEnvLocal({
    CBAI_TEST_USER_A_EMAIL: users[0]!.email,
    CBAI_TEST_USER_A_PASSWORD: users[0]!.password,
    CBAI_TEST_USER_B_EMAIL: users[1]!.email,
    CBAI_TEST_USER_B_PASSWORD: users[1]!.password,
    CBAI_TEST_USER_C_EMAIL: users[2]!.email,
    CBAI_TEST_USER_C_PASSWORD: users[2]!.password,
  });
  console.log("wrote CBAI_TEST_USER_* to .env.local (gitignored)");
  console.log("emails:", users.map((u) => `${u.label}=${u.email}`).join(" | "));
}

main().catch((err) => {
  console.error("provision failed:", err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
