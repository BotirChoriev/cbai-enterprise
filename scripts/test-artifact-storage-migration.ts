import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sql = readFileSync(
  new URL("../supabase/migrations/0013_artifact_intelligence_storage.sql", import.meta.url),
  "utf8",
);

test("artifact storage is private, PDF-only, and owner-prefixed", () => {
  assert.match(sql, /'cbai-artifacts'[\s\S]*false[\s\S]*application\/pdf/i);
  assert.match(sql, /storage\.foldername\(name\)\)\[1\]\s*=\s*auth\.uid\(\)::text/i);
  assert.doesNotMatch(sql, /to\s+anon[\s\S]*create policy/i);
});

test("quarantine cannot be bypassed by authenticated clients", () => {
  assert.match(sql, /scan_status\s*=\s*'pending'/i);
  assert.match(sql, /artifact_security_fields_are_processor_owned/i);
  assert.match(sql, /artifact_transition_requires_processor/i);
  assert.match(sql, /scan_status\s*=\s*'clean'/i);
  assert.match(sql, /revoke insert, update, delete on public\.document_artifact_sections from authenticated/i);
});

test("human confirmation is allowed only after clean processor review", () => {
  assert.match(sql, /old\.processing_status\s*=\s*'needs_human_review'/i);
  assert.match(sql, /new\.processing_status\s*=\s*'human_confirmed'/i);
  assert.match(sql, /old\.scan_status\s*=\s*'clean'/i);
  assert.match(sql, /new\.human_confirmed_at is not null/i);
});
