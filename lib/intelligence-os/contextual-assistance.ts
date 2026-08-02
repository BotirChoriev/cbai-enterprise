export type ContextualEngineId = "algorithm" | "cybernetics" | "ai";

export type ContextualDomain =
  | "research"
  | "education"
  | "healthcare"
  | "public_policy"
  | "public_safety"
  | "creative"
  | "operations"
  | "evidence"
  | "public_interest"
  | "engineering"
  | "agriculture"
  | "business"
  | "general";

export type ContextualAssistance = {
  readonly domain: ContextualDomain;
  readonly intent: string;
  readonly signals: readonly string[];
  readonly evidenceGaps: readonly string[];
  readonly options: readonly string[];
  readonly suggestedEngines: readonly ContextualEngineId[];
  readonly humanBoundary: string;
  readonly riskLevel: "standard" | "heightened";
};

type AssistanceLocale = "en" | "uz";

const localizedAssistance = {
  en: {
    intent: {
      research: "Clarify the research objective before interpreting the material",
      education: "Define the learning need, learner context, and observable outcome",
      healthcare: "Define the care-process problem without replacing clinical judgment",
      public_policy: "Define the public outcome, affected groups, authority, and constraints",
      public_safety: "Define the lawful non-tactical process and accountable human authority",
      creative: "Clarify the creative intent, audience, constraints, and decision criteria",
      operations: "Map the workflow, bottleneck, owner, and measurable operating outcome",
      evidence: "Separate the claim from evidence, provenance, counter-evidence, and uncertainty",
      public_interest: "Define the public-interest objective, eligibility rules, fairness, and accountability",
      engineering: "Define the fault, constraints, and acceptable outcome",
      agriculture: "Identify the observed condition and the decision that must be made",
      business: "Define the operating objective, constraints, and decision owner",
      general: "Clarify what outcome matters and what decision is required",
    },
    material: ["Material is attached but not yet interpreted", "No supporting material is attached yet"],
    signals: {
      research: "Research method and result claims require separation",
      education: "Learning observations must be separated from assumptions about the learner",
      healthcare: "Workflow evidence must remain separate from diagnosis or individual treatment advice",
      public_policy: "Stakeholder impact, legal authority, and uncertainty must remain visible",
      public_safety: "Rights, legal authority, auditability, and operational sensitivity must remain visible",
      creative: "Creative intent must be separated from audience, budget, and production constraints",
      operations: "Observed delay or waste must be separated from suspected cause",
      evidence: "Claims, allegations, primary sources, and independent corroboration require separation",
      public_interest: "Need, eligibility, privacy, and distribution fairness require separate evidence",
      engineering: "Observed behavior must be separated from suspected cause",
      agriculture: "Visible symptoms need environmental and time context",
      business: "Operating signals need an owner and time window",
      general: "The current situation still needs structured context",
    },
    gaps: {
      research: ["Human-confirmed objective", "Method, controls, units, and source provenance"],
      education: ["Learner and educator input", "Baseline, accessibility needs, and observable learning evidence"],
      healthcare: ["Authorized clinical/process owner", "Privacy-safe workflow evidence and applicable clinical governance"],
      public_policy: ["Legal authority and affected groups", "Cost, distributional impact, counter-evidence, and implementation constraints"],
      public_safety: ["Lawful authority, rights safeguards, and oversight", "No classified, tactical, or personally sensitive material"],
      creative: ["Creative brief and audience", "Budget, venue, rights, accessibility, and production constraints"],
      operations: ["Time-stamped workflow measurements", "Owner, capacity, quality, safety, and cost constraints"],
      evidence: ["Primary-source provenance", "Independent corroboration, counter-evidence, and publication risk"],
      public_interest: ["Transparent eligibility criteria", "Privacy, accessibility, fairness, and grievance safeguards"],
      engineering: ["Measurements and operating conditions", "Safety constraints and diagnostic history"],
      agriculture: ["Location, crop stage, and recent conditions", "Laboratory or field confirmation"],
      business: ["Decision owner and success measure", "Verified internal and external evidence"],
      general: ["Human-confirmed objective", "Verified evidence and important constraints"],
    },
    options: {
      research: ["Review the method", "Compare repeat-experiment paths"],
      education: ["Map the learning gap with learner and educator input", "Compare support and practice plans"],
      healthcare: ["Map the care workflow and missed handoffs", "Compare process improvements for licensed review"],
      public_policy: ["Build evidence-backed policy scenarios", "Compare a reversible pilot with broader implementation"],
      public_safety: ["Map the authorized non-tactical workflow", "Compare accountable service improvements with oversight"],
      creative: ["Clarify the creative brief", "Compare concept and production paths"],
      operations: ["Map the end-to-end workflow", "Compare bottleneck improvements using measured evidence"],
      evidence: ["Build a source-verification chain", "Compare the claim with counter-evidence before publication"],
      public_interest: ["Define transparent eligibility and prioritization", "Compare fair delivery and monitoring paths"],
      engineering: ["Run a diagnostic sequence", "Compare repair or redesign paths"],
      agriculture: ["Request field evidence", "Compare treatment and monitoring paths"],
      business: ["Build operating scenarios", "Compare cost, risk, and reversibility"],
      general: ["Structure the problem", "Collect evidence before comparing paths"],
    },
    boundary: {
      research: "A qualified human reviews the method, evidence, and research decision.",
      education: "The learner, educator, or guardian retains the learning decision; CBAI does not label ability.",
      healthcare: "A licensed professional retains clinical authority; CBAI provides no diagnosis or treatment decision.",
      public_policy: "Authorized public officials and affected communities retain the decision; impacts and dissent stay visible.",
      public_safety: "Authorized humans retain legal authority; CBAI provides no tactical, coercive, or targeting decision.",
      creative: "The artist retains creative authorship and final judgment.",
      operations: "The accountable operator approves changes after safety and quality review.",
      evidence: "A human editor or investigator verifies publication and legal risk before release.",
      public_interest: "Accountable humans approve eligibility and distribution; privacy and appeal rights remain protected.",
      engineering: "A qualified human approves any safety-relevant diagnostic, repair, or design action.",
      agriculture: "A qualified human confirms field or laboratory evidence before treatment.",
      business: "The accountable owner approves the business decision and accepts its risk.",
      general: "A human decision owner confirms the objective, evidence, and next action.",
    },
  },
  uz: {
    intent: {
      research: "Materialni talqin qilishdan oldin tadqiqot maqsadini aniqlashtirish",
      education: "Ta’lim ehtiyoji, o‘quvchi konteksti va kuzatiladigan natijani aniqlash",
      healthcare: "Klinik hukmni almashtirmasdan tibbiy xizmat jarayoni muammosini aniqlash",
      public_policy: "Jamoat natijasi, ta’sirlangan guruhlar, vakolat va cheklovlarni aniqlash",
      public_safety: "Qonuniy, taktik bo‘lmagan jarayon va javobgar inson vakolatini aniqlash",
      creative: "Ijodiy maqsad, auditoriya, cheklovlar va tanlov mezonlarini aniqlash",
      operations: "Jarayon, tiqilinch, mas’ul va o‘lchanadigan operatsion natijani xaritalash",
      evidence: "Da’voni dalil, kelib chiqish, qarshi dalil va noaniqlikdan ajratish",
      public_interest: "Jamoat manfaatidagi maqsad, mezonlar, adolat va hisobdorlikni aniqlash",
      engineering: "Nosozlik, cheklovlar va maqbul natijani aniqlash",
      agriculture: "Kuzatilgan holat va qabul qilinishi kerak bo‘lgan qarorni aniqlash",
      business: "Operatsion maqsad, cheklovlar va qaror egasini aniqlash",
      general: "Qaysi natija muhimligi va qanday qaror kerakligini aniqlashtirish",
    },
    material: ["Material biriktirilgan, ammo hali talqin qilinmagan", "Tasdiqlovchi material hali biriktirilmagan"],
    signals: {
      research: "Tadqiqot metodi va natija da’volari alohida tekshirilishi kerak",
      education: "O‘quv kuzatuvlari o‘quvchi haqidagi taxminlardan ajratilishi kerak",
      healthcare: "Jarayon dalili tashxis yoki individual davolash tavsiyasidan ajratilishi kerak",
      public_policy: "Manfaatdor guruhlar ta’siri, qonuniy vakolat va noaniqlik ochiq qolishi kerak",
      public_safety: "Huquqlar, qonuniy vakolat, audit va operatsion maxfiylik ochiq qolishi kerak",
      creative: "Ijodiy maqsad auditoriya, budjet va ishlab chiqarish cheklovlaridan ajratilishi kerak",
      operations: "Kuzatilgan kechikish yoki isrof taxmin qilingan sababdan ajratilishi kerak",
      evidence: "Da’vo, ayblov, birlamchi manba va mustaqil tasdiq alohida tekshirilishi kerak",
      public_interest: "Ehtiyoj, mezonlar, maxfiylik va taqsimot adolati alohida dalil talab qiladi",
      engineering: "Kuzatilgan xatti-harakat taxmin qilingan sababdan ajratilishi kerak",
      agriculture: "Ko‘rinadigan belgilar uchun muhit va vaqt konteksti kerak",
      business: "Operatsion signallar uchun mas’ul va vaqt oralig‘i kerak",
      general: "Joriy vaziyatga hali tizimlangan kontekst kerak",
    },
    gaps: {
      research: ["Inson tasdiqlagan maqsad", "Metod, nazorat, birliklar va manba kelib chiqishi"],
      education: ["O‘quvchi va pedagog fikri", "Boshlang‘ich holat, inklyuziv ehtiyoj va kuzatiladigan ta’lim dalili"],
      healthcare: ["Vakolatli klinik yoki jarayon egasi", "Maxfiylikni saqlagan jarayon dalili va klinik boshqaruv"],
      public_policy: ["Qonuniy vakolat va ta’sirlangan guruhlar", "Xarajat, taqsimot ta’siri, qarshi dalil va joriy etish cheklovlari"],
      public_safety: ["Qonuniy vakolat, huquq kafolatlari va nazorat", "Maxfiy, taktik yoki shaxsiy sezgir ma’lumot kiritilmasligi"],
      creative: ["Ijodiy brief va auditoriya", "Budjet, joy, huquqlar, inklyuzivlik va ishlab chiqarish cheklovlari"],
      operations: ["Vaqt belgili jarayon o‘lchovlari", "Mas’ul, quvvat, sifat, xavfsizlik va xarajat cheklovlari"],
      evidence: ["Birlamchi manba kelib chiqishi", "Mustaqil tasdiq, qarshi dalil va nashr riski"],
      public_interest: ["Shaffof muvofiqlik mezonlari", "Maxfiylik, inklyuzivlik, adolat va shikoyat kafolatlari"],
      engineering: ["O‘lchovlar va ish sharoitlari", "Xavfsizlik cheklovlari va diagnostika tarixi"],
      agriculture: ["Joylashuv, ekin bosqichi va so‘nggi sharoitlar", "Laboratoriya yoki dala tasdig‘i"],
      business: ["Qaror egasi va muvaffaqiyat mezoni", "Tekshirilgan ichki va tashqi dalillar"],
      general: ["Inson tasdiqlagan maqsad", "Tekshirilgan dalil va muhim cheklovlar"],
    },
    options: {
      research: ["Metodni ko‘rib chiqish", "Takroriy tajriba yo‘llarini taqqoslash"],
      education: ["O‘quvchi va pedagog bilan bilim bo‘shlig‘ini xaritalash", "Yordam va mashq rejalarini taqqoslash"],
      healthcare: ["Tibbiy xizmat jarayoni va uzilgan aloqalarni xaritalash", "Litsenziyali ko‘rib chiqish uchun jarayon yaxshilanishlarini taqqoslash"],
      public_policy: ["Dalilga tayangan siyosat ssenariylarini qurish", "Qaytariladigan pilotni keng joriy etish bilan taqqoslash"],
      public_safety: ["Vakolatli, taktik bo‘lmagan jarayonni xaritalash", "Nazorat ostidagi hisobdor xizmat yaxshilanishlarini taqqoslash"],
      creative: ["Ijodiy briefni aniqlashtirish", "Konsept va ishlab chiqarish yo‘llarini taqqoslash"],
      operations: ["Jarayonni boshidan oxirigacha xaritalash", "O‘lchangan dalil bilan tiqilinch yaxshilanishlarini taqqoslash"],
      evidence: ["Manbani tekshirish zanjirini qurish", "Nashrdan oldin da’voni qarshi dalil bilan taqqoslash"],
      public_interest: ["Shaffof muvofiqlik va ustuvorlikni aniqlash", "Adolatli yetkazish va monitoring yo‘llarini taqqoslash"],
      engineering: ["Diagnostika ketma-ketligini bajarish", "Ta’mirlash yoki qayta loyihalash yo‘llarini taqqoslash"],
      agriculture: ["Dala dalillarini so‘rash", "Davolash va monitoring yo‘llarini taqqoslash"],
      business: ["Operatsion ssenariylarni qurish", "Xarajat, risk va qaytaruvchanlikni taqqoslash"],
      general: ["Muammoni tizimlashtirish", "Yo‘llarni taqqoslashdan oldin dalil yig‘ish"],
    },
    boundary: {
      research: "Malakali inson metod, dalil va tadqiqot qarorini ko‘rib chiqadi.",
      education: "Ta’lim qarori o‘quvchi, pedagog yoki vasiyda qoladi; CBAI qobiliyatga yorliq qo‘ymaydi.",
      healthcare: "Klinik vakolat litsenziyali mutaxassisda qoladi; CBAI tashxis yoki davolash qarorini bermaydi.",
      public_policy: "Vakolatli amaldorlar va ta’sirlangan hamjamiyat qaror beradi; ta’sir va e’tirozlar ko‘rinadi.",
      public_safety: "Qonuniy vakolat insonda qoladi; CBAI taktik, majburlovchi yoki nishonlash qarorini bermaydi.",
      creative: "Ijodiy mualliflik va yakuniy hukm rassomda qoladi.",
      operations: "Javobgar operator xavfsizlik va sifat tekshiruvidan keyin o‘zgarishni tasdiqlaydi.",
      evidence: "Nashrdan oldin inson muharrir yoki tergovchi dalil va huquqiy riskni tekshiradi.",
      public_interest: "Muvofiqlik va taqsimotni javobgar inson tasdiqlaydi; maxfiylik va shikoyat huquqi saqlanadi.",
      engineering: "Xavfsizlikka ta’sirli diagnostika, ta’mir yoki dizayn amalini malakali inson tasdiqlaydi.",
      agriculture: "Davolashdan oldin dala yoki laboratoriya dalilini malakali inson tasdiqlaydi.",
      business: "Biznes qarori va uning riskini javobgar egasi tasdiqlaydi.",
      general: "Maqsad, dalil va keyingi amalni inson qaror egasi tasdiqlaydi.",
    },
  },
} as const;

const DOMAIN_PATTERNS: ReadonlyArray<{
  readonly domain: ContextualDomain;
  readonly pattern: RegExp;
}> = [
  {
    domain: "research",
    pattern:
      /\b(phd|thesis|dissertation|research|experiment|laboratory|lab|biology|molecule|molecular|chemistry|methodology|scientist|academic|olim(?:man|miz)?|akademik(?:man|miz)?|ilmiy|tadqiqot|tajriba|laboratoriya|biologiya|molekula)\b/i,
  },
  {
    domain: "public_safety",
    pattern:
      /\b(military|non-combat|police|law enforcement|public safety|classified|tactical|lawful|legal authority|protects rights|military base|harbiy(?:man|miz)?|iiv(?: xodimi)?|ichki ishlar|huquqni muhofaza|qonuniy|huquqlarni himoya|maxfiy|taktik)\b/i,
  },
  {
    domain: "healthcare",
    pattern:
      /\b(doctor|clinic|clinical|patient|hospital|medical|healthcare|physician|nurse|shifokor(?:man|miz)?|klinika|bemor|kasalxona|tibbiy|hamshira)\b/i,
  },
  {
    domain: "public_policy",
    pattern:
      /\b(politician|policy|public transport|public administration|government official|citizen service|public service|siyosatchi(?:man|miz)?|siyosat|davlat amaldori(?:man|miz)?|jamoat transporti|fuqaro xizmati|davlat xizmati)\b/i,
  },
  {
    domain: "education",
    pattern:
      /\b(student|exam|study plan|teacher|class|learning|school|pupil|algebra|fractions|learner|education|talaba(?:man|miz)?|imtihon|o['‘’]?qituvchi(?:man|miz)?|sinf|o['‘’]?quvchi(?:man|miz)?|maktab|ta['’]?lim|algebra)\b/i,
  },
  {
    domain: "evidence",
    pattern:
      /\b(journalist|journalism|viral claim|allegation|fact-check|publication|primary source|jurnalist(?:man|miz)?|virusli da['’]?vo|ayblov|fakt.?chek|nashr|birlamchi manba)\b/i,
  },
  {
    domain: "public_interest",
    pattern:
      /\b(nonprofit|ngo|humanitarian|winter aid|aid distribution|charity|nnt(?: koordinatori)?|nodavlat|insonparvarlik|qishki yordam|xayriya|yordam taqsimoti)\b/i,
  },
  {
    domain: "creative",
    pattern:
      /\b(artist|art|exhibition|curatorial|creative|gallery|designer|rassom(?:man|miz)?|san['’]?at|ko['‘’]?rgazma|kurator|ijodiy|galereya|dizayner)\b/i,
  },
  {
    domain: "operations",
    pattern:
      /\b(workflow|bottleneck|backlog|tailor|tailoring|sewing|kitchen|restaurant|food waste|slow service|supply process|order delivery|jarayon|tiqilinch|navbat|tikuvchi(?:man|miz)?|tikuv|oshpaz(?:man|miz)?|oshxona|restoran|oziq.?ovqat isrofi|xizmat sekin|ta['’]?minot)\b/i,
  },
  {
    domain: "engineering",
    pattern:
      /\b(engineer|engineering|mechanic|machine|manufacturing|production line|motor|bridge|construction|architecture|drone|diagnostic|muhandis(?:man|miz)?|muhandislik|mexanik|mashina|ishlab chiqarish|dvigatel|ko['’]?prik|qurilish|arxitekt)\b/i,
  },
  {
    domain: "agriculture",
    pattern:
      /(agronom|agriculture|plant|crop|soil|disease|farmer|fermer(?:man|miz)?|o['‘’]?simlik|ekin|tuproq|kasallik)/i,
  },
  {
    domain: "business",
    pattern:
      /\b(company|business|market|customer|operations|strategy|kompaniya|biznes|bozorchi(?:man|miz)?|bozor|tadbirkor(?:man|miz)?|mijoz|strategiya)\b/i,
  },
];

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function inferContextualDomain(input: string): ContextualDomain {
  const normalized = clean(input);
  return DOMAIN_PATTERNS.find((candidate) => candidate.pattern.test(normalized))?.domain ?? "general";
}

function intentFor(domain: ContextualDomain, locale: AssistanceLocale): string {
  return localizedAssistance[locale].intent[domain];
}

function domainSignals(domain: ContextualDomain, hasMaterial: boolean, locale: AssistanceLocale): readonly string[] {
  const messages = localizedAssistance[locale];
  return [messages.material[hasMaterial ? 0 : 1], messages.signals[domain]];
}

function domainGaps(domain: ContextualDomain, locale: AssistanceLocale): readonly string[] {
  return localizedAssistance[locale].gaps[domain];
}

function domainOptions(domain: ContextualDomain, locale: AssistanceLocale): readonly string[] {
  return localizedAssistance[locale].options[domain];
}

export function deriveContextualAssistance(input: {
  readonly text: string;
  readonly fileName?: string | null;
  readonly fileType?: string | null;
  readonly locale?: AssistanceLocale;
}): ContextualAssistance {
  const materialDescription = [input.text, input.fileName, input.fileType].filter(Boolean).join(" ");
  const domain = inferContextualDomain(materialDescription);
  const lower = materialDescription.toLowerCase();
  const hasMaterial = Boolean(input.fileName);
  const locale = input.locale ?? "en";
  const needsFeedback =
    hasMaterial ||
    /\b(monitor|measurement|result|change|feedback|sensor|device|experiment|o['‘’]?lchov|natija|kuzat|qurilma|tajriba)\b/i.test(
      lower,
    );

  return {
    domain,
    intent: intentFor(domain, locale),
    signals: domainSignals(domain, hasMaterial, locale),
    evidenceGaps: domainGaps(domain, locale),
    options: domainOptions(domain, locale),
    suggestedEngines: needsFeedback
      ? ["algorithm", "cybernetics", "ai"]
      : ["algorithm", "ai"],
    humanBoundary: localizedAssistance[locale].boundary[domain],
    riskLevel:
      domain === "healthcare" || domain === "public_policy" || domain === "public_safety"
        ? "heightened"
        : "standard",
  };
}
