/** BUILD-026 — Knowledge Brain and research completion i18n. */

export const KNOWLEDGE_BRAIN_UZ = {
  eyebrow: "Bilim holati",
  whatIsThis: "Bu nima",
  whyItMatters: "Nega muhim",
  missionRelevance: "Missiyaga aloqasi",
  known: "Ma'lum",
  unknown: "Noma'lum",
  conflict: "Ziddiyat",
  needsReview: "Ko'rib chiqish kerak",
  howWeKnow: "Qanday bilamiz",
  provenance: "Kelib chiqishi",
  freshness: "Yangiligi",
  supportingEvidence: "Qo'llab-quvvatlovchi dalillar",
  contradictingEvidence: "Qarshi dalillar",
  missingEvidence: "Yetishmayotgan dalillar",
  limitations: "Cheklovlar",
  humanReviewRequired: "Xulosa chiqarishdan oldin inson tekshiruvi talab qilinadi.",
  noMission: "Muammoga dalil va bilimni bog'lash uchun missiyani boshlang.",
  emptyBucket: "Bu toifada hali hech narsa qayd etilmagan.",
  suggestedNext: "Tavsiya etilgan keyingi qadam",
  sourceNotConnected:
    "Tashqi jonli kataloglar ulanmagan — faqat katalog va qurilma ichidagi havolalar.",
  evidenceStateKnownDetail: "Manba metadatasi bilan bog'langan havolalar.",
  evidenceStateUnknownDetail: "Yetishmayotgan manbalar yoki hujjatlashtirilgan bo'shliqlar.",
  evidenceStateConflictDetail: "Havolalar o'rtasida ziddiyat aniqlandi.",
  evidenceStateNeedsReviewDetail: "Yangiligi yoki tasdiqlash uchun inson tekshiruvi tavsiya etiladi.",
} as const;

export const RESEARCH_TOPIC_COMPLETION_UZ = {
  openQuestionsTitle: "Ochiq tadqiqot savollari",
  openQuestionsNotConnected:
    "Ochiq savol yozuvlari faqat katalogda — jonli tadqiqot bazalari ulanmagan.",
  whyItMatters: "Nega muhim",
  status: "Holat",
  futureEvidence: "Kelajakdagi dalillar",
  humanReviewRequired: "Insoniy ilmiy ko'rib chiqish talab qilinadi.",
  genericOpenQuestions:
    "Umumiy savol toifalari qo'llaniladi — mavzu bo'yicha yozuvlar hali sozlanmagan.",
  negativeResultsTitle: "Salbiy natijalar",
  negativeResultsNotConnected:
    "Salbiy natija yozuvlari faqat katalogda — tajriba bazalari ulanmagan.",
  futureWorkspaceSupport: "Kelajakdagi ish maydoni qo'llab-quvvatlash",
  futureExperimentTypes: "Kelajakdagi tajriba turlari",
  negativeHumanReview:
    "Salbiy natija qarorda ishlatilishidan oldin ilmiy inson tekshiruvi talab qilinadi.",
  genericNegativeResults:
    "Umumiy tayyorgarlik qo'llaniladi — mavzu bo'yicha yozuvlar hali sozlanmagan.",
  evidenceReadinessEyebrow: "Tadqiqot dalillari",
  evidenceReadinessTitle: "Tadqiqot dalillari tayyorgarligi",
  evidenceReadinessDetail:
    "Asosiy dalil sohalari hali ulanmagan. Faqat katalog ma'lumoti.",
  publications: "Nashrlar",
  experiments: "Tajribalar",
  laboratories: "Laboratoriyalar",
  willSupport: "Qo'llab-quvvatlaydi",
  currentLimitation: "Joriy cheklov",
  humanReviewBeforeDecision: "Qarorlarda ishlatishdan oldin inson tekshiruvi talab qilinadi.",
  publicationLimitationFallback: "Nashr manbalari hali ulanmagan.",
  experimentLimitationFallback: "Tajriba yozuvlari hali ulanmagan.",
  laboratoryLimitationFallback: "Laboratoriya yozuvlari hali ulanmagan.",
  reportResearchQuestion: "Tadqiqot savoli",
  reportDomain: "Soha",
  reportDescription: "Tavsif",
  reportEvidenceSummary:
    "{connected} element ulangan · {supporting} qo'llab-quvvatlovchi · {counter} qarshi dalil.",
  reportNotes: "Tadqiqot eslatmalari",
  reportNotesEmpty: "Tadqiqot eslatmalari hali qayd etilmagan.",
} as const;

export const UNIVERSAL_INTENT_UZ = {
  categoryStartMission: "Missiyani boshlash",
  categoryContinueMission: "Missiyani davom ettirish",
  categorySearchEntity: "Qidirish",
  categoryOpenObject: "Obyektni ochish",
  categoryCompareEntities: "Grafikda solishtirish",
  categoryInspectEvidence: "Dalillarni ko'rish",
  categoryOpenReasoning: "Mantiqni ochish",
  categoryReviewImpact: "Ta'sirni ko'rib chiqish",
  categoryOpenReport: "Hisobotni ochish",
  categoryContinueResearch: "Tadqiqotni davom ettirish",
  categoryUnrecognized: "Tanilmadi",
} as const;
