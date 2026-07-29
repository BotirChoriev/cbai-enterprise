import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCompanyOnboardingDraft,
  confirmCompanyOnboardingDraft,
  suggestOrganizationKind,
} from "@/lib/company-onboarding/company-onboarding";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

test("organization kind suggestions are explainable and deterministic", () => {
  assert.equal(suggestOrganizationKind("We operate an independent laboratory", "other"), "independent_laboratory");
  assert.equal(suggestOrganizationKind("Biz ishlab chiqarish kompaniyasimiz", "other"), "company");
  assert.equal(suggestOrganizationKind("No recognizable signal", "ngo"), "ngo");
});

test("draft keeps unknowns visible and blocks incomplete activation", () => {
  const draft = buildCompanyOnboardingDraft({
    statement: "We need a shared workspace.",
    name: "",
    kind: "company",
    missionStatement: "",
    website: "",
  });
  assert.equal(draft.readyForHumanConfirmation, false);
  assert.ok(draft.unknowns.includes("organization_name"));
  assert.ok(draft.unknowns.includes("operating_purpose"));
  assert.equal(confirmCompanyOnboardingDraft(draft, true), null);
});

test("complete draft still requires explicit human confirmation", () => {
  const draft = buildCompanyOnboardingDraft({
    statement: "We are a laboratory improving sample quality.",
    name: "Human Confirmed Lab",
    kind: "other",
    missionStatement: "Reduce invalid samples while keeping the laboratory director accountable.",
    website: "",
  });
  assert.equal(draft.readyForHumanConfirmation, true);
  assert.equal(draft.suggestedKind, "independent_laboratory");
  assert.equal(confirmCompanyOnboardingDraft(draft, false), null);
  assert.deepEqual(confirmCompanyOnboardingDraft(draft, true), {
    statement: "We are a laboratory improving sample quality.",
    name: "Human Confirmed Lab",
    kind: "independent_laboratory",
    missionStatement: "Reduce invalid samples while keeping the laboratory director accountable.",
    website: "",
  });
});

test("onboarding UI sends voice context but never voice-confirms creation", () => {
  const ui = source("components/organization/CompanyOnboardingFlow.tsx");
  assert.match(ui, /voice\.setTextInput/);
  assert.match(ui, /voice\.openDock/);
  assert.match(ui, /confirmCompanyOnboardingDraft\(draft, true\)/);
  assert.doesNotMatch(ui, /sendTextMessage\(\).*onConfirm|startListening\(\).*onConfirm/s);
});

test("organization mutation is only called from confirmed onboarding callback", () => {
  const page = source("components/organization/OrganizationPageClient.tsx");
  assert.match(page, /<CompanyOnboardingFlow busy=\{busy\} onConfirm=\{createOrg\}/);
  assert.match(page, /createOrg = \(input: CompanyOnboardingInput\)/);
  assert.match(page, /missionStatement: input\.missionStatement/);
});
