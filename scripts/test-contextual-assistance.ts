import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  deriveContextualAssistance,
  inferContextualDomain,
} from "@/lib/intelligence-os/contextual-assistance";

test("research material calls algorithm, cybernetics, and AI without taking a decision", () => {
  const result = deriveContextualAssistance({
    text: "My biology PhD experiment conflicts with the published molecular method",
    fileName: "living-molecules-phd.pdf",
    fileType: "application/pdf",
  });

  assert.equal(result.domain, "research");
  assert.deepEqual(result.suggestedEngines, ["algorithm", "cybernetics", "ai"]);
  assert.match(result.intent, /objective/i);
  assert.ok(result.evidenceGaps.length > 0);
  assert.ok(result.options.length > 0);
  assert.equal(JSON.stringify(result).toLowerCase().includes("best decision"), false);
});
test("feedback engine stays contextual when no monitoring signal exists", () => {
  const result = deriveContextualAssistance({
    text: "Help me structure a general goal",
  });

  assert.deepEqual(result.suggestedEngines, ["algorithm", "ai"]);
});

test("domain inference supports practical work contexts", () => {
  assert.equal(inferContextualDomain("motor diagnostic and repair"), "engineering");
  assert.equal(inferContextualDomain("production line stops unpredictably"), "engineering");
  assert.equal(inferContextualDomain("o‘simlik kasalligini rasm orqali tekshirish"), "agriculture");
  assert.equal(inferContextualDomain("company market strategy"), "business");
});

test("Uzbek problem analysis stays localized while preserving the same safe structure", () => {
  const result = deriveContextualAssistance({
    text: "Biologiya tajribamdagi natija metodga zid chiqdi",
    locale: "uz",
  });

  assert.equal(result.domain, "research");
  assert.match(result.intent, /tadqiqot maqsadini/i);
  assert.match(result.evidenceGaps.join(" "), /Inson tasdiqlagan/i);
  assert.match(result.options.join(" "), /Metodni ko‘rib chiqish/i);
  assert.equal(result.suggestedEngines.includes("ai"), true);
});

test("Living Problem Home activates a selectable path before human review", () => {
  const source = readFileSync("components/platform/LivingProblemHome.tsx", "utf8");
  assert.match(source, /data-state="active"/);
  assert.match(source, /setSelectedOption\(item\)/);
  assert.match(source, /disabled=\{!selectedOption\}/);
  assert.match(source, /if \(!selectedOption\) return/);
  assert.match(source, /nextAction: selectedOption/);
  assert.match(source, /assistance\.domain === "research"[\s\S]*\? "research"[\s\S]*: "general"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /\["Sezish", "Tizimlash", "Tekshirish", "Taqqoslash", "Inson qarori", "Amal", "Monitoring", "O‘rganish"\]/);
  assert.match(source, /Shu vaziyat haqida savol bering/);
  assert.match(source, /answerFollowUp/);
  assert.match(source, /assistance\.evidenceGaps\.join/);
});

test("twenty-persona domain coverage does not collapse specialist users into General", () => {
  const cases = [
    ["university student exam study plan", "education"],
    ["biology scientist research experiment", "research"],
    ["academic contradictory publications research program", "research"],
    ["politician comparing public transport policy", "public_policy"],
    ["artist planning an exhibition and curatorial path", "creative"],
    ["teacher whose class struggles with fractions", "education"],
    ["school pupil learning algebra", "education"],
    ["government official with a citizen service backlog", "public_policy"],
    ["military non-combat supply process", "public_safety"],
    ["doctor improving a clinic patient follow-up workflow", "healthcare"],
    ["citizen complaints lawful review that protects rights", "public_safety"],
    ["market business stock and customer demand", "business"],
    ["tailoring sewing order-delivery bottleneck", "operations"],
    ["restaurant kitchen food waste and slow service", "operations"],
    ["tomato crop disease field evidence", "agriculture"],
    ["production line machine diagnostic", "engineering"],
    ["company market launch strategy", "business"],
    ["child school learning motivation", "education"],
    ["journalist verifying a viral claim and primary source", "evidence"],
    ["nonprofit winter aid distribution fairness", "public_interest"],
  ] as const;

  for (const [text, expected] of cases) {
    assert.equal(inferContextualDomain(text), expected, text);
  }
});

test("heightened domains enforce explicit human authority and safe boundaries", () => {
  const medical = deriveContextualAssistance({ text: "doctor improving clinic patient follow-up" });
  const safety = deriveContextualAssistance({ text: "military non-combat supply process" });
  const policy = deriveContextualAssistance({ text: "politician comparing public policy" });

  assert.equal(medical.riskLevel, "heightened");
  assert.match(medical.humanBoundary, /licensed professional/i);
  assert.match(medical.humanBoundary, /no diagnosis or treatment decision/i);
  assert.equal(safety.riskLevel, "heightened");
  assert.match(safety.humanBoundary, /no tactical, coercive, or targeting decision/i);
  assert.equal(policy.riskLevel, "heightened");
  assert.match(policy.humanBoundary, /affected communities/i);
});

test("natural Uzbek role suffixes resolve the intended specialist context", () => {
  const cases = [
    ["Men talabaman, imtihonga tayyorlanish reja kerak", "education"],
    ["Men olimman, natijani tekshirmoqchiman", "research"],
    ["Men siyosatchiman, jamoat transporti siyosatini taqqoslayman", "public_policy"],
    ["Men rassomman, ko‘rgazma rejasini tuzaman", "creative"],
    ["Men shifokorman, klinika jarayonini yaxshilayman", "healthcare"],
    ["Men harbiyman, taktik bo‘lmagan ta’minot jarayonini ko‘raman", "public_safety"],
    ["Men jurnalistman, da’vo manbasini tekshiraman", "evidence"],
    ["Men tikuvchiman, buyurtma jarayonida tiqilinch bor", "operations"],
    ["Men oshpazman, oshxonada isrof ko‘p", "operations"],
    ["Men fermerman, ekinda kasallik belgisi bor", "agriculture"],
    ["Men muhandisman, mashina diagnostikasi kerak", "engineering"],
    ["Men tadbirkorman, bozor strategiyasini quraman", "business"],
    ["Men NNT koordinatori, yordam taqsimoti adolatli bo‘lsin", "public_interest"],
  ] as const;

  for (const [text, expected] of cases) {
    assert.equal(inferContextualDomain(text), expected, text);
  }
});
