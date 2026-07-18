// Unified Mission OS operating context — URL params, research activation, Japan timeline regression.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { countries } from "@/lib/countries";
import { buildCountryTimelineModel } from "@/lib/timeline";
import { TIMELINE_YEAR_STRUCTURE_PREPARED_LABEL } from "@/lib/timeline/timeline-types";
import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import {
  ACTIVATED_RESEARCH_TOPIC_PATH,
  buildOperatingHref,
  mergeQueryParams,
  parseOperatingParams,
  serializeOperatingParams,
} from "@/lib/intelligence-os/mission-operating-context";
import { CONTEXT_PARAM_KEYS } from "@/lib/context/context-types";
import { buildContextualHref } from "@/lib/context/context-navigation";
import { buildPlatformContext } from "@/lib/context/context-builder";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Operating URL params round-trip mission and project", () => {
  const params = new URLSearchParams("mission=m1&project=p1&country=japan");
  const operating = parseOperatingParams(params);
  assert.equal(operating.missionId, "m1");
  assert.equal(operating.projectId, "p1");
  const serialized = serializeOperatingParams(operating);
  assert.equal(serialized.mission, "m1");
  assert.equal(serialized.project, "p1");
});

test("2. mergeQueryParams preserves mission context across routes", () => {
  const href = buildOperatingHref(
    "/reports",
    serializeOperatingParams({ missionId: "m1", projectId: "p1" }),
    { country: "japan", q: "Japan" },
  );
  assert.match(href, /mission=m1/);
  assert.match(href, /project=p1/);
  assert.match(href, /country=japan/);
  assert.equal(mergeQueryParams({ a: "1" }, { b: "2" }), "?a=1&b=2");
});

test("3. buildContextualHref merges platform and operating params", () => {
  const snapshot = buildPlatformContext({}, "/evidence");
  const href = buildContextualHref("/evidence", snapshot, {
    missionId: "m-test",
    projectId: "p-test",
  });
  assert.match(href, /mission=m-test/);
  assert.match(href, /project=p-test/);
});

test("4. CONTEXT_PARAM_KEYS includes mission and project", () => {
  const keys = Object.values(CONTEXT_PARAM_KEYS);
  assert.ok(keys.includes("mission"));
  assert.ok(keys.includes("project"));
});

test("5. Activated research topic is microbiology workflow", () => {
  assert.equal(ACTIVATED_RESEARCH_TOPIC_PATH, "/research/microbiology");
  const assistant = resolveAssistantCommand("continue research");
  assert.equal(assistant?.href, "/research/microbiology");
});

test("6. Operator commands for unified workflow exist", () => {
  assert.equal(resolveAssistantCommand("start mission")?.href, "/?create=1");
  assert.equal(resolveAssistantCommand("open reasoning")?.href, "/reasoning");
  assert.match(resolveAssistantCommand("search japan")!.href, /country=japan/);
  assert.equal(resolveAssistantCommand("show missing evidence")?.href, "/knowledge");
  assert.equal(resolveAssistantCommand("what should i do next")?.href, "/my-work");
});

test("7. Japan timeline never fabricates verified year-level evidence", () => {
  const japan = countries.find((c) => c.id === "japan")!;
  const model = buildCountryTimelineModel(japan);
  assert.equal(model.availableEvidenceYears.length, 0);
  assert.equal(model.emptyStateMessage, TIMELINE_YEAR_STRUCTURE_PREPARED_LABEL);
});

test("8. Add to Mission UI wired on search and entity profiles", () => {
  const searchGateway = readSource("components/search/gateway/SearchGatewayResults.tsx");
  const searchCard = readSource("components/search/gateway/SearchResultCard.tsx");
  const country = readSource("components/countries/CountryIntelligencePanel.tsx");
  const company = readSource("components/companies/CompanyIntelligencePanel.tsx");
  const university = readSource("components/universities/UniversityIntelligencePanel.tsx");
  assert.match(searchGateway, /AddToMissionButton/);
  assert.match(searchCard, /AddToMissionButton/);
  for (const src of [country, company, university]) {
    assert.match(src, /AddToMissionButton/);
  }
});

test("9. PlatformContextProvider preserves mission/project in navigation", () => {
  const provider = readSource("components/platform/context/PlatformContextProvider.tsx");
  assert.match(provider, /mission/);
  assert.match(provider, /project/);
});

test("10. Home QuickStartMissionForm creates real mission entry point", () => {
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /QuickStartMissionForm/);
  const operating = readSource("lib/intelligence-os/mission-operating-context.ts");
  assert.match(operating, /startMissionFromProblem/);
});
