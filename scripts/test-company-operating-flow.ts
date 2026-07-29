import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

test("company operating flow preserves the human decision sequence", () => {
  const flow = source("components/organization/CompanyOperatingFlow.tsx");
  for (const stage of ["identity", "people", "problem", "evidence", "decision", "monitoring"]) {
    assert.match(flow, new RegExp(`copy\\.${stage}`));
  }
  assert.match(flow, /AI structures the work; accountable people decide/);
  assert.match(flow, /AI ishni tizimlaydi; mas’ul insonlar qaror beradi/);
});

test("company operating flow reports only live organization counts", () => {
  const flow = source("components/organization/CompanyOperatingFlow.tsx");
  assert.match(flow, /memberCount/);
  assert.match(flow, /pendingInvitationCount/);
  assert.match(flow, /auditEventCount/);
  assert.doesNotMatch(flow, /Math\.random|mock|placeholderCount/i);
});

test("company operating flow keeps voice and core decision routes available", () => {
  const flow = source("components/organization/CompanyOperatingFlow.tsx");
  assert.match(flow, /openDock/);
  for (const route of ["/?openProblem=1", "/evidence", "/rooms", "/governance"]) {
    assert.ok(flow.includes(`href="${route}"`));
  }
});

test("organization page uses a purpose-built company intelligence hero", () => {
  const page = source("app/(dashboard)/organization/page.tsx");
  assert.match(page, /company-collaborative-intelligence-os/);
  assert.match(page, /The authorized human decides/);
  assert.match(page, /Vakolatli inson qaror beradi/);
});

test("mobile living context and voice controls occupy separate bottom corners", () => {
  const toggle = source("components/operating/LivingContextMobileToggle.tsx");
  const styles = source("app/globals.css");
  assert.match(toggle, /bottom-4 left-4 right-auto/);
  assert.match(toggle, /max-w-\[calc\(100vw-14rem\)\]/);
  assert.match(styles, /\.cbai-voice-dock-closed \{/);
  assert.match(styles, /inset: auto max\(1rem, env\(safe-area-inset-right\)\)/);
});
