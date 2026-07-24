/** BUILD-008 — obyekt intellekti, tadqiqot mavzusi, boshqaruv, hisobotlar, graf UI, haqida, parolni tiklash (o'zbek). */

export const ENTITY_INTELLIGENCE_UZ = {
  fromSearch: 'Qidiruvdan: "{query}"',
  comparables: "Taqqoslanuvchilar",
  timelineDetail: "Vaqt chizig'i tafsilotlari",
  intelligenceContext: "Intellekt konteksti",
  relatedEntities: "Tegishli obyektlar",
  reports: "Hisobotlar",
  openQuestions: "Ochiq savollar",
  availableInformation: "Mavjud ma'lumot",
  missingInformation: "Yetishmayotgan ma'lumot →",
  noOfficialInformation: "Ushbu profil uchun hali rasmiy ma'lumot ulanmagan.",
  availableNow: "Hozir mavjud",
  sourceStatus: "Manba holati",
  sourcesConnected: "manba ulangan",
  sourcesConnectedSummary: "{connected} / {total} rasmiy manba{plural} ulangan",
  topicsListedAbove: " · yuqorida {count} mavzu{topicPlural} sanab o'tilgan",
  topicsAvailableNow: " · hozir {count} mavzu{topicPlural} mavjud",
  compareDefaultHeading: "Taqqoslash",
  compareDefaultDescription: "Ushbu profil uchun rasmiy ma'lumotlarni yonma-yon ko'rish.",
  generateReport: "Hisobot yaratish",
  hideReport: "Hisobotni yashirish",
  openReportsCenter: "Hisobotlar markazini ochish",
  entityTypeCountry: "Mamlakat",
  entityTypeCompany: "Kompaniya",
  entityTypeUniversity: "Universitet",
  factGovernment: "Hukumat",
  factFounded: "Tashkil etilgan",
  factOfficialWebsite: "Rasmiy veb-sayt",
  governanceLensTitle: "Boshqaruv intellekti — avval institutsional yozuv",
  governanceLensBody:
    "Hukumat ish maydonidan kirildi — quyidagi dalil vaqt chizig'i va institutsional qamrov hikoyali profildan oldin keladi.",
  investorLensTitle: "Iqtisodiy intellekt — avval taqqoslanuvchilar",
  investorLensBody:
    "Investor ish maydonidan kirildi — quyidagi taqqoslanuvchilar va ko'rsatkich qamrovi hikoyali profildan oldin keladi.",
} as const;

export const SOURCE_COVERAGE_UZ = {
  countryHeading: "Manba qamrovi",
  countryDescription:
    "CBAI Dalil infratuzilmasidagi rasmiy dalil manbalari — faqat ulanish holati, jonli API integratsiyasi yo'q.",
  companyHeading: "Rasmiy manba qamrovi",
  companyDescription:
    "Ushbu kompaniya profili uchun manba bo'yicha ulanish holati — jonli API integratsiyasi yo'q.",
  universityHeading: "Rasmiy manba qamrovi",
  universityDescription:
    "Ushbu universitet profili uchun manba bo'yicha ulanish holati — jonli API integratsiyasi yo'q.",
  publisher: "Nashriyot",
  confidence: "Ishonch",
  citation: "Iqtibos",
  supportedIndicators: "{count} qo'llab-quvvatlanadigan ko'rsatkich{plural}",
} as const;

export const ENTITY_RELATIONSHIPS_UZ = {
  countryHeading: "Munosabatlar",
  countryDescription:
    "Bir xil mamlakat reyestrida kompaniya va universitetlarga tasdiqlangan katalog havolalari.",
  countryEmpty:
    "Hali tasdiqlangan munosabatlar yo'q — katalogdagi kompaniya, universitet yoki tadqiqot mavzusi ushbu mamlakatga murojaat qilganda bog'lanishlar paydo bo'ladi.",
  exploreCompanies: "Kompaniyalarni o'rganish",
  exploreUniversities: "Universitetlarni o'rganish",
  companyHeading: "Bilim grafi",
  companyDescription:
    "Mahalliy reyestrlardan katalog asosida yaqinlik — hamkorlik yoki raqobatchi da'volari emas.",
  companyEmpty:
    "Hali tasdiqlangan munosabatlar yo'q — katalogdagi mamlakat, universitet yoki tadqiqot mavzusi ushbu kompaniyaga murojaat qilganda bog'lanishlar paydo bo'ladi.",
  partnerClaims: "Hamkor / raqobatchi da'volari",
  partnerClaimsNotShown: "Ko'rsatilmaydi — ulangan hamkorlik dalillari talab qilinadi.",
  universityHeading: "Bilim grafi",
  universityDescription:
    "Mahalliy reyestrlardan katalog havolalari — reytinglar yoki ishga joylashish ballari emas.",
  universityEmpty:
    "Hali tasdiqlangan munosabatlar yo'q — katalogdagi mamlakat, kompaniya yoki tadqiqot mavzusi ushbu universitetga murojaat qilganda bog'lanishlar paydo bo'ladi.",
  researchPartnerships: "Tadqiqot markazlari / hamkorliklar / stipendiyalar",
  researchPartnershipsNotShown: "Ko'rsatilmaydi — ulangan affillatsiya dalillari talab qilinadi.",
  relatedEntities: "Tegishli obyektlar",
  verifiedCatalog: "Tasdiqlangan mahalliy katalog",
  evidenceMissing: "Dalil yo'q",
} as const;

export const RESEARCH_TOPIC_UZ = {
  backToTopics: "← Tadqiqot mavzulariga qaytish",
  humanReviewNotice:
    "Ushbu mavzudagi har qanday ilmiy da'vo qarorni qo'llab-quvvatlashdan oldin inson ko'rib chiqishini talab qiladi.",
  experienceNotice:
    "Tadqiqot intellekti hozirda katalog ma'lumotlari va tasdiqlangan platforma modellaridan foydalanadi. Jonli ilmiy ma'lumot bazalari hali ulanmagan.",
  overviewEyebrow: "Tadqiqot ko'rinishi",
  quickOverview: "Tezkor ko'rinish",
  topicLabel: "Mavzu",
  domainLabel: "Soha",
  currentStatus: "Joriy holat",
  methods: "Usullar",
  evidenceTypes: "Dalil turlari",
  relatedTopics: "Tegishli mavzular",
  noRelatedTopics: "Katalog metadata dan tegishli mavzular yo'q.",
  humanReview: "Inson ko'rib chiqishi",
  humanReviewDetail: "Har qanday katalog bog'lanishi tadqiqot qarorini qo'llab-quvvatlashdan oldin talab qilinadi.",
  topicsHeading: "Tadqiqot mavzulari",
  topicCount: "{count} mavzu",
} as const;

export const GOVERNANCE_CENTER_UZ = {
  totalRules: "Jami qoidalar",
  criticalRules: "Kritik qoidalar",
  ruleCategories: "Qoida toifalari",
  validationStepsLabel: "Validatsiya bosqichlari",
  reviewStandards: "Ko'rib chiqish standartlari",
  reviewStandardsBody: "Platforma qoidalari mavzu bo'yicha guruhlangan — qo'lda ko'rib chiqish uchun ta'riflar.",
  ruleCount: "{count} qoida{plural}",
  constitutionalPrinciples: "Konstitutsiyaviy tamoyillar",
  constitutionalPrinciplesBody: "Barcha platforma modullari CBAI Konstitutsiyasidan meros oladigan oliy tamoyillar.",
  reviewProcess: "Ko'rib chiqish jarayoni",
  reviewProcessBody: "Relizlar foydalanuvchilarga yetishidan oldin validatsiya qilish bosqichlari.",
  stepLabel: "Bosqich {order}",
  relatedTopics: "Tegishli mavzular:",
  pillarsAria:
    "Boshqaruv qoidalari reestri: {categories} toifa, {rules} qoida, balandlik har bir toifaning haqiqiy qoida soniga mos",
  pillarsCaption:
    "Ustun balandligi CBAI qoidalar reestridagi har bir boshqaruv toifasining ro‘yxatdan o‘tgan qoidalar sonini ko‘rsatadi — operatsion samaradorlik emas.",
  complianceReportModel: "Moslik hisoboti modeli",
  complianceReportBody:
    "Qo'lda audit va kelajakdagi CI natijasi uchun tuzilmaviy shablon — bu yerda tekshiruvlar bajarilmaydi.",
  passedRules: "O'tgan qoidalar",
  passedRulesDetail: "{count} — kelajakdagi validatorlar to'ldiradi",
  failedRules: "Muvaffaqiyatsiz qoidalar",
  failedRulesDetail: "{count} — kelajakdagi validatorlar to'ldiradi",
  warnings: "Ogohlantirishlar",
  warningsDetail: "{count} — to'siq qo'ymaydigan topilmalar",
  recommendations: "Tavsiyalar",
  recommendationsDetail: "{count} — tuzatish bo'yicha yo'riqnoma",
  moduleStatus: "Modul ID: {moduleId} · Holat: {status}",
  statusRegistered: "Ro'yxatdan o'tgan",
  statusDeclared: "E'lon qilingan — avtomatlashtirilmagan",
  categories: {
    constitution: { label: "Konstitutsiya", purpose: "Oliy platforma tamoyillari — dalil, neytrallik, nol demo siyosati." },
    evidence: { label: "Dalil", purpose: "Barcha intellekt uchun manba, holat va metodologiya talablari." },
    entity: { label: "Obyekt", purpose: "Mamlakatlar, Kompaniyalar va Universitetlar yo'nalishlari uchun Oltin qoida namunalari." },
    indicator: { label: "Ko'rsatkich", purpose: "Reyestr hayot sikli, metodologiya bloklari va kelajakdagi baholash qoidalari." },
    ui: { label: "UI", purpose: "Yuzaga moslik — soxta KPI, diagrammalar, ishonch yoki SI so'zlari yo'q." },
    persona: { label: "Persona", purpose: "Fuqaro, Investor, Hukumat, Talaba, Tadqiqotchi, Akademik uchun halol qiymat." },
  },
  validationStepContent: {
    "module-proposal": {
      title: "Modul taklifi",
      description: "Yangi yo'nalish yoki kutubxona amalga oshirishdan oldin niyat, doira va maqsadli personalarni ro'yxatdan o'tkazadi.",
    },
    "standards-check": {
      title: "Standartlar tekshiruvi",
      description: "CBAI Konstitutsiyaviy standarti va obyekt/UI standartlar to'plamiga nisbatan tekshirish.",
    },
    "evidence-check": {
      title: "Dalil tekshiruvi",
      description: "Manba atributini, ulanish holati yorliqlarini va metodologiya bloklarini tasdiqlash.",
    },
    "persona-check": {
      title: "Persona tekshiruvi",
      description: "Barcha olti persona halol joriy qiymat va kelajakdagi imkoniyat matnini oladi.",
    },
    "accessibility-check": {
      title: "Qulaylik tekshiruvi",
      description: "Mobilga tayyor, qulay korporativ o'qiluvchanlik uchun kelajakdagi WCAG validatsiyasi.",
    },
    "release-review": {
      title: "Reliz ko'rib chiqishi",
      description: "Ishlab chiqarish relizidan oldin qo'lda konstitutsiya auditi va moslik hisoboti tasdiqlash.",
    },
  },
  personas: {
    citizen: { title: "Fuqaro", protection: "UI qoidalari soxta ishonch va siyosiy ramkani bloklaydi — fuqarolar faqat halol dalil holatini ko'radi." },
    investor: { title: "Investor", protection: "Dalil qoidalari har qanday due diligence ko'rsatkichlari paydo bo'lishidan oldin manba atributini talab qiladi." },
    government: { title: "Hukumat", protection: "Persona qoidalari hukumatga yo'naltirilgan modullarda siyosiy reytinglar o'rniga bo'shliq tahlilini ta'minlaydi." },
    student: { title: "Talaba", protection: "Nol demo siyosati ta'lim yo'nalishlarida soxta liga jadvallari va reytinglarni oldini oladi." },
    researcher: { title: "Tadqiqotchi", protection: "Konstitutsiya tadqiqot doirasini belgilash uchun takrorlanadigan ko'rsatkich ID va manba sluglarini majbur qiladi." },
    academic: { title: "Akademik", protection: "Metodologiya-metrikadan oldin qoidalari baholashlar chiqishidan oldin iqtibos qilinadigan metodologiyani talab qiladi." },
  },
  limits: {
    "no-automated-enforcement": {
      title: "Hali avtomatlashtirilgan majburiy qo'llash yo'q",
      description: "Qoidalar deklarativ tarzda ro'yxatdan o'tkazilgan — ish vaqtidagi validatsiya va CI darvozalari kelajakdagi ish.",
    },
    "no-runtime-policy-changes": {
      title: "Ish vaqtida siyosat o'zgarishlari yo'q",
      description: "Bu markaz boshqaruv arxitekturasini ko'rsatadi — u qoidalar yoki siyosatlarni jonli ravishda almashtirmaydi.",
    },
    "no-hidden-ai": {
      title: "Yashirin SI yo'q",
      description: "Boshqaruv nazorati SI model paneli emas — provayder holati, token metrikalari yoki agent kalitlari yo'q.",
    },
  },
} as const;

export const REPORTS_MODEL_UZ = {
  statuses: {
    notAvailable: "Mavjud emas",
    registryFactsOnly: "Faqat reyestr faktlari",
    methodologyDefinitionsOnly: "Faqat metodologiya ta'riflari",
    insufficientEvidence: "Dalil yetarli emas",
    evidenceSourceNotConnected: "Dalil manbasi ulanmagan",
    partialLocalRegistry: "Qisman — mahalliy reyestr",
    definedInFramework: "Freymvorkda belgilangan",
    notApplicable: "Qo'llanmaydi",
    planned: "Rejalashtirilgan",
  },
  evidenceRequired: {
    country: "{count} ulangan rasmiy manbalari bo'lgan ro'yxatdan o'tgan mamlakat ko'rsatkichlari",
    company: "{count} ulangan rasmiy manbalari bo'lgan ro'yxatdan o'tgan kompaniya ko'rsatkichlari",
    university: "{count} ulangan rasmiy manbalari bo'lgan ro'yxatdan o'tgan universitet ko'rsatkichlari",
    investor:
      "Rasmiy manbalar bo'ylab ulangan moliyaviy, xarid va kompaniya ko'rsatkichlari",
    government: "Metodologiya bo'shliqlari hujjatlashtirilgan soha darajasidagi ko'rsatkich qamrovi",
    research: "Manba atributi va holat yorliqlari bilan eksport qilinadigan ko'rsatkich reyestri",
    academic: "Versiya havolasi bilan har bir ko'rsatkich uchun to'liq to'rt maydonli metodologiya",
  },
  reportTypes: {
    "country-intelligence": {
      title: "Mamlakat intellekti hisoboti",
      description: "Ulangan manbalar va ko'rsatkich metodologiyasidan tuzilgan dalilga asoslangan mamlakat profili.",
      audience: "Tahlilchilar, hukumat, tadqiqotchilar",
    },
    "company-intelligence": {
      title: "Kompaniya intellekti hisoboti",
      description: "Kompaniya reyestri faktlari va ko'rsatkich qamrovi — dalil ulanmaguncha bozor ballari yo'q.",
      audience: "Investorlar, tahlilchilar, xarid",
    },
    "university-intelligence": {
      title: "Universitet intellekti hisoboti",
      description: "Universitet reyestri va ta'lim ko'rsatkichlari tayyorgarligi — liga jadvallari emas.",
      audience: "Talabalar, akademiklar, hukumat",
    },
    "investor-brief": {
      title: "Investor qisqacha ma'lumotnomasi",
      description: "Due diligence doirasini belgilash uchun obyektlararo dalil xulosasi — ulangan moliyaviy va bozor manbalari talab qilinadi.",
      audience: "Investorlar",
    },
    "government-brief": {
      title: "Hukumat qisqacha ma'lumotnomasi",
      description: "Nashr ustuvorligini belgilash uchun soha bo'yicha dalil bo'shliqlari tahlili — siyosiy reytinglar emas.",
      audience: "Hukumat xodimlari",
    },
    "research-brief": {
      title: "Tadqiqot qisqacha ma'lumotnomasi",
      description: "Takrorlanadigan doira belgilash uchun ko'rsatkich ta'riflari, manba sluglari va ulanish holati.",
      audience: "Tadqiqotchilar",
    },
    "academic-methodology": {
      title: "Akademik metodologiya hisoboti",
      description: "Global Ko'rsatkich Freymvorkidan iqtibos qilinadigan metodologiya bloklari va dalil talablari.",
      audience: "Akademiklar",
    },
  },
  exportFuture: {
    pdf: { format: "PDF", description: "Tasdiqlangan dalil va metodologiyaning statik eksporti — tayyorlik mezonlari bajarilmaguncha yaratilmaydi." },
    csv: { format: "CSV", description: "Tadqiqot takrorlanuvchanligi uchun tuzilgan ko'rsatkich va manba holati eksporti." },
    api: { format: "API", description: "Hisobotga tayyor ma'lumotlarga dasturiy kirish — boshqaruv reliz ko'rib chiqishini talab qiladi." },
    mobile: { format: "Mobil", description: "Reliz pipelineida qulaylik validatsiyasidan keyin mobil o'qiladigan hisobot ko'rinishlari." },
  },
  reportPersonas: {
    citizen: { title: "Fuqaro", usefulReports: ["Mamlakat intellekti hisoboti", "Hukumat qisqacha ma'lumotnomasi"] as const },
    investor: { title: "Investor", usefulReports: ["Kompaniya intellekti hisoboti", "Investor qisqacha ma'lumotnomasi"] as const },
    government: { title: "Hukumat", usefulReports: ["Hukumat qisqacha ma'lumotnomasi", "Mamlakat intellekti hisoboti"] as const },
    student: { title: "Talaba", usefulReports: ["Universitet intellekti hisoboti"] as const },
    researcher: { title: "Tadqiqotchi", usefulReports: ["Tadqiqot qisqacha ma'lumotnomasi", "Mamlakat intellekti hisoboti"] as const },
    academic: { title: "Akademik", usefulReports: ["Akademik metodologiya hisoboti", "Tadqiqot qisqacha ma'lumotnomasi"] as const },
  },
  trustPillars: {
    "evidence-first": { title: "Avval dalil", description: "Hisobotlar faqat ulangan manbalardan tuziladi — soxta hujjatlar yoki metrikalar yo'q." },
    "source-attribution": { title: "Manba atributi", description: "Har bir hisobot bo'limi ro'yxatdan o'tgan manba sluglari va tasdiqlash holatiga bog'lanadi." },
    "methodology-version": { title: "Metodologiya versiyasi", description: "Hisobot sarlavhalarida freymvork va metodologiya versiya havolalari bo'ladi." },
    reproducibility: { title: "Takrorlanuvchanlik", description: "Audit uchun mo'ljallangan eksport formatlari — ko'rsatkich ID, manbalar va holat saqlanadi." },
    "no-fabricated-metrics": { title: "Soxta metrikalar yo'q", description: "Dalil va metodologiya paydo bo'lguncha diagrammalar, KPI, foydalanish statistikasi yoki o'sish egri chiziqlari yo'q." },
  },
  exportFutureHeading: "Eksport kelajagi",
  noFakeAnalyticsNotice: "Soxta analitika ogohlantirishi",
  personasHeading: "Personalar",
  trustHeading: "Ishonch",
} as const;

export const GRAPH_UI_UZ = {
  entityDetails: "Obyekt tafsilotlari",
  clear: "Tozalash",
  searchEntities: "Obyektlarni qidirish",
  entityType: "Obyekt turi",
  allTypes: "Barcha turlar",
  evidenceStatus: "Dalil holati",
  relationshipCount: "Munosabatlar soni",
  availableSources: "Mavjud manbalar",
  openModule: "{type} modulini ochish",
  connectedEntities: "Ulangan obyektlar",
  evidenceSummary: "Dalil xulosasi",
  relationshipStatus: "Munosabat holati",
  evidenceAvailable: "Dalil mavjud",
  evidenceMissing: "Dalil yo'q",
  entityEvidenceStatus: "Obyekt dalil holati",
  neighborCount: "{count} qo'shni{plural}",
  evidenceRelationships: "Dalil munosabatlari",
  availableInformation: "Mavjud ma'lumot",
  futureEvidence: "Kelajakdagi dalil",
  legend: "Afsona",
  activeEntityTypes: "Faol obyekt turlari",
  verifiedRelationships: "Tasdiqlangan munosabatlar",
  plannedTypes: "Rejalashtirilgan turlar",
  futureTypeCount: "{count} kelajakdagi obyekt turi{plural} tayyorlangan — graf indeksida yo'q",
  entityTypes: {
    country: { label: "Mamlakatlar", note: "Mahalliy mamlakat reyestri tugunlari." },
    company: { label: "Kompaniyalar", note: "Mahalliy kompaniya katalog tugunlari." },
    university: { label: "Universitetlar", note: "Mahalliy universitet reyestri tugunlari." },
    government: { label: "Hukumat muassasalari", note: "Kelajakdagi obyekt turi — dalil manbasi ulanmagan." },
    industry: { label: "Sohalar", note: "Kelajakdagi obyekt turi — sektor tugunlari ulanmagan." },
    infrastructure: { label: "Infratuzilma", note: "Kelajakdagi obyekt turi — graf indeksida yo'q." },
    "natural-resources": { label: "Tabiiy resurslar", note: "Kelajakdagi obyekt turi — graf indeksida yo'q." },
    procurement: { label: "Xarid", note: "Kelajakdagi obyekt turi — graf indeksida yo'q." },
    "research-center": { label: "Tadqiqot markazlari", note: "Kelajakdagi obyekt turi — munosabat ma'lumotlari ulanmagan." },
    future: { label: "Kelajakdagi obyekt turlari", note: "Sxema tayyorlangan — reyestrlar ulanganda tugunlar paydo bo'ladi." },
  },
  relationshipTypes: {
    "located-in": { label: "Joylashgan", description: "Mahalliy katalog maydonlaridan obyekt bosh ofisi yoki kampus mamlakati." },
    "registered-in": { label: "Ro'yxatdan o'tgan", description: "Obyekt mamlakat reyestri profili ostida ro'yxatdan o'tgan." },
    "belongs-to": { label: "Tegishli", description: "Bir mamlakatdagi kompaniya va universitetlar o'rtasidagi katalog bog'lanishi." },
    "collaborates-with": { label: "Hamkorlik qiladi", description: "Tasdiqlangan hamkorlik dalillari talab qilinadi — CBAI tomonidan xulosa qilinmaydi." },
    "evidence-available": { label: "Dalil mavjud", description: "Ulangan mahalliy reyestr ma'lumotlaridan olingan munosabat." },
    "evidence-missing": { label: "Dalil yo'q", description: "Munosabat turi e'lon qilingan, lekin manba ulanmagan." },
  },
  evidenceLabels: {
    localPlatformRegistry: "Mahalliy platforma reyestri",
    partnershipVerification: "Hamkorlik tasdiqlash — xulosa qilinmaydi",
  },
} as const;

export const ABOUT_PAGE_UZ = {
  title: "CBAI haqida",
  pageDescription: "CBAI nima, nima uchun mavjud va qanday tamoyillarga amal qiladi.",
  whoWeAreEyebrow: "Biz kim",
  purposeHeadline: "Ma'lumotga kirish qiyin qism bo'lishdan to'xtadi.",
  purposeBody:
    "Uni tushunish esa yo'q. Har kim bir mamlakat iqtisodiyoti, kompaniya ta'siri yoki tadqiqot sohasi haqida soniyalar ichida minglab hujjatlarni topishi mumkin. Kamdan-kam kim o'sha to'plamdan nima haqiqatan ma'lum, nima yetishmayotgani va unga asoslangan qaror aslida nimaga tayanayotganini ayta oladi. Ma'lumotga ega bo'lish va uni tushunish o'rtasidagi bu bo'shliq — CBAI yopish uchun mavjud muammo.",
  whatIsEyebrow: "CBAI nima",
  whatIsHeadline:
    "CBAI Intellekt operatsion tizimi — u dalillarni bog'laydi, nima ma'lum va nima yetishmayotganini kuzatadi va tadqiqot, iqtisodiyot va boshqaruv bo'ylab aniqroq, yaxshiroq qo'llab-quvvatlangan qarorlarga erishishga yordam beradi.",
  whatIsBody:
    "Sahifalar qaytaradigan qidiruv tizimi emas. Javob yaratadigan chat oynasi ham emas. CBAI ishchi muhit: haqiqiy mamlakat, kompaniya, universitet va tadqiqot profillari; nima tasdiqlangan va nima yo'qligini ajratadigan haqiqiy dalil tizimi; savol va topilmalarni bir joyda saqlaydigan haqiqiy loyihalar; va faqat xulosa emas, mulohazani ko'rsatadigan haqiqiy hisobotlar.",
  whyEyebrow: "Nima uchun CBAI mavjud",
  whyHeadline: "Muammo hech qachon ma'lumot kam emas edi. U juda ko'p va aloqasiz edi.",
  whyClosing:
    "Bularning hech biri yangi muammo emas. Yangi narsa — ularni bitta muammo sifatida ko'rish: dalil bir marta bog'lanadigan va tegishli bo'lgan har joyda qayta ishlatiladigan yagona joy qurish.",
  philosophyEyebrow: "Bizning falsafa",
  philosophyHeadline: "CBAI o'ziga qo'yadigan o'n ikkita tamoyil — shiorlar emas, ish qoidalari.",
  differentEyebrow: "CBAI ni nima ajratadi",
  differentHeadline: "Mavjud narsaning yaxshiroq versiyasi emas. Boshqa toifadagi vosita.",
  audiencesEyebrow: "CBAI kim uchun",
  audiencesHeadline: "Qaror qilishdan oldin tushunish kerak bo'lgan odamlar uchun qurilgan.",
  workflowEyebrow: "Qanday ishlaydi",
  workflowHeadline: "Savoldan avtomatlashtirilgan javobga emas, savoldan aniqroq tushunishga.",
  ecosystemsEyebrow: "Uchta intellekt ekotizimi",
  ecosystemsHeadline: "Bitta dalil yadrosi, u bilan ishlashning uch yo'li.",
  manifestoEyebrow: "Nimaga ishonamiz",
  manifestoHeadline: "Yigirma ish tamoyili — marketing matni emas.",
  enterCBAI: "CBAI ga kirish →",
  trySearch: "Qidiruvni sinab ko'rish →",
  openTrust: "Ishonch markazini ochish →",
  exploreResearch: "Tadqiqotni o'rganish →",
} as const;

export const RESET_PASSWORD_PAGE_UZ = {
  pageDescription: "Bulutli hisob parolini tiklashni yakunlang.",
  passwordUpdated: "Parol yangilandi",
  passwordUpdatedBody: "Bulutli hisob parolingiz o'zgartirildi. Endi u bilan kirishingiz mumkin.",
  chooseNewPassword: "Yangi parol tanlang",
  chooseNewPasswordBody:
    "Bu faqat emailingizga yuborilgan haqiqiy parolni tiklash havolasiga ergashganingizda ishlaydi. Agar bu sahifani to'g'ridan-to'g'ri ochgan bo'lsangiz, quyidagi so'rov muvaffaqiyatsiz bo'ladi.",
  newPassword: "Yangi parol",
  confirmNewPassword: "Yangi parolni tasdiqlang",
  setNewPassword: "Yangi parol o'rnatish",
  minPasswordLength: "Parol kamida {length} belgidan iborat bo'lishi kerak.",
} as const;
