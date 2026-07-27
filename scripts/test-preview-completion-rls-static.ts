/**
 * Static RLS / migration inventory checks for Preview Completion (no live Supabase).
 * Live multi-user RLS remains EXTERNAL_BLOCKED without credentials.
 */

import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { test } from "node:test";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

test("0008 object storage and messages migration exists with RLS enabled", () => {
  const file = path.join(ROOT, "supabase/migrations/0008_object_storage_and_messages.sql");
  assert.ok(existsSync(file));
  const sql = readFileSync(file, "utf8");
  assert.match(sql, /create table if not exists public\.storage_objects/);
  assert.match(sql, /create table if not exists public\.messages/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /activity_events_no_client_insert/);
  assert.match(sql, /sender_user_id = auth\.uid\(\)/);
});

test("prior migrations 0001-0008 remain present (forward-only)", () => {
  const files = readdirSync(path.join(ROOT, "supabase/migrations"));
  for (const n of ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008"]) {
    assert.ok(files.some((f) => f.startsWith(n)), `missing migration prefix ${n}`);
  }
});
