/**
 * P0 — Maximum update depth / useSyncExternalStore snapshot stability.
 * Fails if local evidence getSnapshot / getServerSnapshot allocate new identities
 * on every call (the /evidence infinite-loop root cause).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  LOCAL_EVIDENCE_STORAGE_KEY,
  confirmLocalEvidence,
  emptyEvidenceDraft,
  getEmptyLocalEvidenceSnapshot,
  getLocalEvidenceSnapshot,
  loadLocalEvidenceRecords,
  resetLocalEvidenceSnapshotCacheForTests,
  subscribeLocalEvidence,
} from "@/lib/evidence/local-evidence-store";

const ROOT = process.cwd();

function installMemoryLocalStorage(): {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
} {
  const map = new Map<string, string>();
  const storage = {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
    removeItem(key: string) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
  };
  (globalThis as { window?: unknown; localStorage?: typeof storage }).window = {
    localStorage: storage,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return true;
    },
  };
  (globalThis as { localStorage?: typeof storage }).localStorage = storage;
  return storage;
}

test("getServerSnapshot identity is stable across calls", () => {
  const a = getEmptyLocalEvidenceSnapshot();
  const b = getEmptyLocalEvidenceSnapshot();
  assert.equal(a, b);
  assert.equal(a.length, 0);
});

test("client getSnapshot returns same reference until storage content changes", () => {
  const storage = installMemoryLocalStorage();
  resetLocalEvidenceSnapshotCacheForTests();
  storage.removeItem(LOCAL_EVIDENCE_STORAGE_KEY);

  const emptyA = getLocalEvidenceSnapshot();
  const emptyB = getLocalEvidenceSnapshot();
  assert.equal(emptyA, emptyB);
  assert.equal(emptyA, getEmptyLocalEvidenceSnapshot());

  const confirmed = confirmLocalEvidence({
    ...emptyEvidenceDraft({ locale: "en", routePath: "/evidence" }),
    title: "P0 snapshot fixture",
    sourceLabel: "fixture-source",
    provenance: "test-provenance",
    claim: "stable-snapshot-claim",
  });
  assert.ok(confirmed);

  const afterWriteA = getLocalEvidenceSnapshot();
  const afterWriteB = getLocalEvidenceSnapshot();
  assert.equal(afterWriteA, afterWriteB);
  assert.notEqual(afterWriteA, emptyA);
  assert.equal(afterWriteA.length, 1);

  // loadLocalEvidenceRecords must share the cached identity (no fresh alloc).
  assert.equal(loadLocalEvidenceRecords(), afterWriteA);
});

test("repeated getSnapshot calls share identity without notify storm", () => {
  installMemoryLocalStorage();
  resetLocalEvidenceSnapshotCacheForTests();

  const confirmed = confirmLocalEvidence({
    ...emptyEvidenceDraft({ locale: "en", routePath: "/evidence" }),
    title: "Echo check",
    sourceLabel: "src",
    provenance: "prov",
  });
  assert.ok(confirmed);

  const snap = getLocalEvidenceSnapshot();
  let notifyCount = 0;
  const unsubscribe = subscribeLocalEvidence(() => {
    notifyCount += 1;
  });
  for (let i = 0; i < 50; i += 1) {
    assert.equal(getLocalEvidenceSnapshot(), snap);
  }
  assert.equal(notifyCount, 0);
  unsubscribe();
});

test("EvidenceExplorer wires stable store snapshots (no inline unstable getSnapshot)", () => {
  const source = readFileSync(join(ROOT, "components/evidence/EvidenceExplorer.tsx"), "utf8");
  assert.match(source, /getLocalEvidenceSnapshot/);
  assert.match(source, /getEmptyLocalEvidenceSnapshot/);
  assert.match(source, /subscribeLocalEvidence/);
  assert.match(
    source,
    /useSyncExternalStore\(\s*subscribeLocalEvidence,\s*getLocalEvidenceSnapshot,\s*getEmptyLocalEvidenceSnapshot,\s*\)/,
  );
  assert.doesNotMatch(source, /useSyncExternalStore\([\s\S]*\(\)\s*=>\s*\[\]/);
});
