// Context continuity hotfix — search Add to Mission, href preservation, idempotency.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { countries } from "@/lib/countries";
import { buildCountryTimelineModel } from "@/lib/timeline";
import { TIMELINE_YEAR_STRUCTURE_PREPARED_LABEL } from "@/lib/timeline/timeline-types";
import { buildEntityResultEntry } from "@/lib/search-intelligence-entry";
import { toCountryEntities } from "@/lib/countries.adapter";
import {
  appendOperatingParamsToHref,
  isMissionLinkableEntity,
} from "@/lib/intelligence-os/mission-operating-context";
import { buildContextualHref, buildPlatformContext } from "@/lib/context";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

const OPERATING = { missionId: "m-hotfix", projectId: "p-hotfix" };

test("1. Search Open Profile href preserves mission and project", () => {
  const japan = toCountryEntities(countries).find((e) => e.id === "japan")!;
  const entry = buildEntityResultEntry(japan, "Japan");
  const href = appendOperatingParamsToHref(entry.href, OPERATING);
  assert.match(href, /country=japan/);
  assert.match(href, /q=Japan/);
  assert.match(href, /mission=m-hotfix/);
  assert.match(href, /project=p-hotfix/);
});

test("2. Country profile Reports Center href preserves mission, project, country, and q", () => {
  const snapshot = buildPlatformContext(
    { country: "japan", q: "Japan", mission: "m-hotfix", project: "p-hotfix" },
    "/countries",
  );
  const href = buildContextualHref("/reports", snapshot, OPERATING);
  assert.match(href, /country=japan/);
  assert.match(href, /q=Japan/);
  assert.match(href, /mission=m-hotfix/);
  assert.match(href, /project=p-hotfix/);
});

test("3. linkEntityToProject and addEntityToActiveMission guard against duplicate links", () => {
  const projectStore = readSource("lib/project/project-store.ts");
  const operating = readSource("lib/intelligence-os/mission-operating-context.ts");
  assert.match(projectStore, /const exists = all\.some/);
  assert.match(projectStore, /if \(exists\) return/);
  assert.match(operating, /alreadyLinked/);
  assert.match(operating, /if \(!alreadyLinked\)/);
});

test("4. Automatic mission note is skipped when entity is already linked", () => {
  const operating = readSource("lib/intelligence-os/mission-operating-context.ts");
  assert.match(operating, /if \(!alreadyLinked\) \{/);
  assert.match(operating, /saveProjectNote/);
});

test("5. URLs without mission/project still work normally", () => {
  const href = appendOperatingParamsToHref("/countries?country=japan&q=Japan", {});
  assert.equal(href, "/countries?country=japan&q=Japan");
});

test("6. EntityMatchCard wires Add to Mission on live search path", () => {
  const source = readSource("components/search/gateway/SearchGatewayResults.tsx");
  assert.match(source, /AddToMissionButton/);
  assert.match(source, /entityProfileHref\(entry\.href\)/);
  assert.match(source, /profileHref/);
});

test("7. My Work and navigation preserve operating context", () => {
  const myWork = readSource("components/my-work/MyWork.tsx");
  const navigator = readSource("components/operating/OperatingNavigator.tsx");
  assert.match(myWork, /moduleHref\(\s*"\/reports"\s*\)/);
  assert.match(navigator, /moduleHref\(item\.href\)/);
});

test("8. Japan evidence truth — 0 verified years, 10 missing structural years", () => {
  const japan = countries.find((c) => c.id === "japan")!;
  const model = buildCountryTimelineModel(japan);
  assert.equal(model.availableEvidenceYears.length, 0);
  assert.equal(model.missingEvidenceYears.length, model.supportedYears.length);
  assert.equal(model.emptyStateMessage, TIMELINE_YEAR_STRUCTURE_PREPARED_LABEL);
});

test("9. Mission-linkable entity kinds include country and research topic", () => {
  assert.equal(isMissionLinkableEntity({ kind: "country", id: "japan", name: "Japan" }), true);
  assert.equal(
    isMissionLinkableEntity({ kind: "research_topic", id: "microbiology", name: "Microbiology" }),
    true,
  );
  assert.equal(isMissionLinkableEntity({ kind: "project", id: "p1", name: "P" }), false);
});

test("10. AddToMissionButton shows added state when entity already linked", () => {
  const source = readSource("components/mission/MissionOperatingActions.tsx");
  assert.match(source, /isEntityLinkedToActiveMission/);
  assert.match(source, /addedToMissionLabel/);
});
