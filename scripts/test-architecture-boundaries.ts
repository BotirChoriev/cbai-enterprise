/**
 * Architecture boundary regression tests (Stage 1 Slice 1 + 5).
 * Scans source for forbidden import directions — no runtime product changes.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  CANONICAL_OWNERS,
  DEPENDENCY_RULES,
  QUARANTINED_OWNERSHIP_PATHS,
} from "@/lib/canonical-contracts";

const ROOT = process.cwd();

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "out" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

function relativePosix(abs: string): string {
  return abs.slice(ROOT.length + 1).split("\\").join("/");
}

function isOrphanIntelligenceImport(line: string): boolean {
  // Match @/lib/intelligence/... or @/lib/intelligence' or "@/lib/intelligence"
  // but NOT @/lib/intelligence-os
  if (line.includes("@/lib/intelligence-os")) return false;
  return /from\s+["']@\/lib\/intelligence(\/|["'])/.test(line) || /import\s*\(\s*["']@\/lib\/intelligence(\/|["'])/.test(line);
}

function filesMatchingPrefixes(prefixes: readonly string[]): string[] {
  const out: string[] = [];
  for (const p of prefixes) {
    walk(join(ROOT, p.replace(/\/$/, "")), out);
  }
  return out.filter((abs) => {
    const rel = relativePosix(abs);
    return prefixes.some((prefix) => rel.startsWith(prefix));
  });
}

test("canonical ownership registry is non-empty and includes quarantine", () => {
  assert.ok(CANONICAL_OWNERS.length >= 10);
  assert.ok(CANONICAL_OWNERS.some((o) => o.capability === "orphan_intelligence_engine"));
  assert.ok(CANONICAL_OWNERS.some((o) => o.capability === "platform_actions"));
});

test("dependency rules forbid orphan intelligence from app/components", () => {
  const rule = DEPENDENCY_RULES.find((r) => r.id === "no-app-orphan-intelligence");
  assert.ok(rule);
  const violations: string[] = [];
  for (const file of filesMatchingPrefixes(rule!.fromPrefixes)) {
    const text = readFileSync(file, "utf8");
    for (const line of text.split("\n")) {
      if (isOrphanIntelligenceImport(line)) {
        violations.push(`${relativePosix(file)}: ${line.trim()}`);
      }
    }
  }
  assert.deepEqual(violations, [], violations.join("\n"));
});

test("platform-actions / voice / FDE do not import orphan intelligence", () => {
  const ids = [
    "no-platform-actions-from-orphan-intelligence",
    "no-voice-operator-from-orphan-intelligence",
    "no-fde-from-orphan-intelligence",
  ];
  const violations: string[] = [];
  for (const id of ids) {
    const rule = DEPENDENCY_RULES.find((r) => r.id === id);
    assert.ok(rule, id);
    for (const file of filesMatchingPrefixes(rule!.fromPrefixes)) {
      const text = readFileSync(file, "utf8");
      for (const line of text.split("\n")) {
        if (isOrphanIntelligenceImport(line)) {
          violations.push(`[${id}] ${relativePosix(file)}: ${line.trim()}`);
        }
      }
    }
  }
  assert.deepEqual(violations, [], violations.join("\n"));
});

test("quarantine markers list intelligence evidence/graph duplicates", () => {
  assert.ok(QUARANTINED_OWNERSHIP_PATHS.some((q) => q.path === "lib/intelligence/evidence"));
  assert.ok(QUARANTINED_OWNERSHIP_PATHS.some((q) => q.path === "lib/intelligence/graph"));
  const evidenceIdx = readFileSync("lib/intelligence/evidence/index.ts", "utf8");
  const graphIdx = readFileSync("lib/intelligence/graph/index.ts", "utf8");
  const rootIdx = readFileSync("lib/intelligence/index.ts", "utf8");
  assert.match(evidenceIdx, /QUARANTINED/);
  assert.match(graphIdx, /QUARANTINED/);
  assert.match(rootIdx, /QUARANTINED/);
});

test("intelligence-os imports remain allowed (not orphan)", () => {
  const sample = readFileSync("components/mission/MissionContextProvider.tsx", "utf8");
  assert.match(sample, /@\/lib\/intelligence-os/);
  assert.equal(isOrphanIntelligenceImport('import { x } from "@/lib/intelligence-os/mission.types";'), false);
  assert.equal(isOrphanIntelligenceImport('import { x } from "@/lib/intelligence/engine";'), true);
});
