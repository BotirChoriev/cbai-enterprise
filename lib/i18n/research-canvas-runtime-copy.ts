/** Localized runtime strings for Research Canvas discovery, compare, and decide stages. */

import { RESEARCH_CANVAS_EN } from "@/lib/i18n/platform-copy-research-canvas-en";
import { RESEARCH_CANVAS_UZ } from "@/lib/i18n/platform-copy-research-canvas-uz";
import { RESEARCH_CANVAS_RU } from "@/lib/i18n/platform-copy-research-canvas-ru";
import { RESEARCH_CANVAS_TR } from "@/lib/i18n/platform-copy-research-canvas-tr";

export type ResearchCanvasRuntimeCopy = {
  readonly ipBoundaryNotice: string;
  readonly visibilityPrivate: string;
  readonly visibilityTeam: string;
  readonly visibilityPublic: string;
  readonly sanitizedQueryLabel: string;
  readonly providerConfigured: string;
  readonly gapNoConnectedRecords: string;
  readonly gapRunSearchHint: string;
  readonly gapCompletenessLimitation: string;
  readonly matchedSanitizedConcepts: string;
  readonly foundInConnectedSources: string;
  readonly authorOnConnectedRecord: string;
  readonly affiliationOutdated: string;
  readonly noStrongOverlap: string;
  readonly sharedConcepts: string;
  readonly recordFocus: string;
  readonly replicationUnknown: string;
  readonly independentMeasurementRequired: string;
  readonly patentLegalReview: string;
  readonly noMeasurementPlan: string;
  readonly noConnectedOpenScience: string;
  readonly expertReviewRequired: string;
  readonly notDocumented: string;
  readonly humanDecisionBoundary: string;
  readonly smartIdeaDomainFact: string;
  readonly sourceRecordFact: string;
  readonly timelineFact: string;
  readonly confirmedInterpretation: string;
  readonly measurementEntry: string;
  readonly potentialContradiction: string;
  readonly optionRefineMeasurement: string;
  readonly optionLivingResearchObject: string;
  readonly optionResearchMission: string;
  readonly optionCollaborationNeed: string;
  readonly optionPauseExpertReview: string;
  readonly tradeoffRigor: string;
  readonly tradeoffOpenScience: string;
  readonly tradeoffMissionPublish: string;
  readonly noRecordsForComparison: string;
  readonly compareWith: string;
};

const RUNTIME_EN: ResearchCanvasRuntimeCopy = {
  ipBoundaryNotice:
    "Searching public databases does not create legal intellectual-property protection. Consider professional review for patents and licensing.",
  visibilityPrivate: "Private — device-local unless shared mode with real permissions is configured.",
  visibilityTeam:
    "Team/Organization — full secure sharing requires authenticated backend enforcement; device-local mode stores locally only.",
  visibilityPublic: "Public — publication requires explicit human action; nothing is auto-published.",
  sanitizedQueryLabel: "Sanitized query",
  providerConfigured: "configured",
  gapNoConnectedRecords: "No connected records yet",
  gapRunSearchHint: "Run a confirmed open-science search or import DOI metadata",
  gapCompletenessLimitation: "CBAI does not claim global completeness.",
  matchedSanitizedConcepts: "Matched sanitized search concepts",
  foundInConnectedSources: "Found in currently connected CBAI sources.",
  authorOnConnectedRecord: "Author on connected record",
  affiliationOutdated: "Employment and affiliation may be outdated.",
  noStrongOverlap: "No strong token overlap detected.",
  sharedConcepts: "Shared concepts",
  recordFocus: "Record focuses on",
  replicationUnknown: "Replication status unknown unless source states it.",
  independentMeasurementRequired: "Independent measurement required.",
  patentLegalReview: "Patentability requires professional legal review — CBAI does not provide legal opinions.",
  noMeasurementPlan: "No measurement plan defined.",
  noConnectedOpenScience: "No connected open-science records imported.",
  expertReviewRequired: "Expert review may be required.",
  notDocumented: "Not documented.",
  humanDecisionBoundary:
    "CBAI presents facts, analysis, uncertainty, and options. The human selects the final path.",
  smartIdeaDomainFact: 'Smart Idea "{title}" — domain: {domain}.',
  sourceRecordFact: "Source record: {title} ({provider}{doi}).",
  timelineFact: "Timeline: {date} — {title}.",
  confirmedInterpretation: "{field}: {value} (confirmed)",
  measurementEntry: "{measurand}: {result} {unit} — status {status} — {limitations}",
  potentialContradiction: "Potential contradiction: {title}",
  optionRefineMeasurement: "Refine measurement plan and collect raw data.",
  optionLivingResearchObject: "Create Living Research Object and link evidence.",
  optionResearchMission: "Create Research Mission and structured project.",
  optionCollaborationNeed: "Declare collaboration or funding need.",
  optionPauseExpertReview: "Pause and seek expert review.",
  tradeoffRigor: "More measurement rigor requires time, instruments, and calibration.",
  tradeoffOpenScience: "Open-science search covers connected metadata only — not all global research.",
  tradeoffMissionPublish: "Mission creation does not auto-publish private artifacts.",
  noRecordsForComparison: "No records selected for comparison.",
  compareWith: "Compare with: {title}",
};

const RUNTIME_UZ: ResearchCanvasRuntimeCopy = {
  ipBoundaryNotice:
    "Ommaviy ma'lumot bazalarida qidirish huquqiy intellektual mulk himoyasini yaratmaydi. Patent va litsenziya uchun professional ko'rib chiqishni o'ylab ko'ring.",
  visibilityPrivate:
    "Private — umumiy rejim va haqiqiy ruxsatlar sozlanmaguncha qurilmada mahalliy saqlanadi.",
  visibilityTeam:
    "Jamoa/Tashkilot — to'liq xavfsiz ulashish autentifikatsiyalangan backend talab qiladi; mahalliy rejim faqat qurilmada saqlaydi.",
  visibilityPublic: "Public — nashr aniq inson harakati talab qiladi; hech narsa avtomatik nashr etilmaydi.",
  sanitizedQueryLabel: "Sanitize qilingan so'rov",
  providerConfigured: "sozlangan",
  gapNoConnectedRecords: "Ulangan yozuvlar hali yo'q",
  gapRunSearchHint: "Tasdiqlangan ochiq fan qidiruvi yoki DOI metadata import qiling",
  gapCompletenessLimitation: "CBAI global to'liqlik da'vo qilmaydi.",
  matchedSanitizedConcepts: "Sanitize qidiruv tushunchalari mos keldi",
  foundInConnectedSources: "Hozir ulangan CBAI manbalarida topildi.",
  authorOnConnectedRecord: "Ulangan yozuvdagi muallif",
  affiliationOutdated: "Ish joyi va affiliatsiya eskirgan bo'lishi mumkin.",
  noStrongOverlap: "Kuchli token mosligi aniqlanmadi.",
  sharedConcepts: "Umumiy tushunchalar",
  recordFocus: "Yozuv quyidagiga qaratilgan",
  replicationUnknown: "Manba aytmaguncha replikatsiya holati noma'lum.",
  independentMeasurementRequired: "Mustaqil o'lchov talab qilinadi.",
  patentLegalReview:
    "Patentlanish uchun professional huquqiy ko'rib chiqish kerak — CBAI huquqiy fikr bermaydi.",
  noMeasurementPlan: "O'lchov rejasi belgilanmagan.",
  noConnectedOpenScience: "Ulangan ochiq fan yozuvlari import qilinmagan.",
  expertReviewRequired: "Mutaxassis ko'rib chiqishi talab qilinishi mumkin.",
  notDocumented: "Hujjatlashtirilmagan.",
  humanDecisionBoundary:
    "CBAI faktlar, tahlil, noaniqlik va variantlarni taqdim etadi. Yakuniy yo'lni inson tanlaydi.",
  smartIdeaDomainFact: 'Smart Idea "{title}" — soha: {domain}.',
  sourceRecordFact: "Manba yozuvi: {title} ({provider}{doi}).",
  timelineFact: "Vaqt chizig'i: {date} — {title}.",
  confirmedInterpretation: "{field}: {value} (tasdiqlangan)",
  measurementEntry: "{measurand}: {result} {unit} — holat {status} — {limitations}",
  potentialContradiction: "Potensial ziddiyat: {title}",
  optionRefineMeasurement: "O'lchov rejasini aniqlashtiring va xom ma'lumot yig'ing.",
  optionLivingResearchObject: "Living Research Object yarating va dalillarni bog'lang.",
  optionResearchMission: "Research Mission va tuzilgan loyiha yarating.",
  optionCollaborationNeed: "Hamkorlik yoki moliyalashtirish ehtiyojini e'lon qiling.",
  optionPauseExpertReview: "To'xtating va mutaxassis ko'rib chiqishini so'rang.",
  tradeoffRigor: "Ko'proq o'lchov qat'iyligi vaqt, asbob va kalibrlash talab qiladi.",
  tradeoffOpenScience: "Ochiq fan qidiruvi faqat ulangan metadata — barcha global tadqiqot emas.",
  tradeoffMissionPublish: "Mission yaratish shaxsiy artefaktlarni avtomatik nashr etmaydi.",
  noRecordsForComparison: "Taqqoslash uchun yozuv tanlanmagan.",
  compareWith: "Taqqoslash: {title}",
};

export function getResearchCanvasRuntimeCopy(lang: string): ResearchCanvasRuntimeCopy {
  if (lang === "uz") return RUNTIME_UZ;
  return RUNTIME_EN;
}

export function researchCanvasUiCopy(lang: string) {
  if (lang === "uz") return RESEARCH_CANVAS_UZ;
  if (lang === "ru") return RESEARCH_CANVAS_RU;
  if (lang === "tr") return RESEARCH_CANVAS_TR;
  return RESEARCH_CANVAS_EN;
}
