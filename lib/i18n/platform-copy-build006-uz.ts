/** BUILD-006 extended copy — Uzbek */
export const ERRORS_PAGES_UZ = {
  notFoundEyebrow: "404",
  notFoundTitle: "Sahifa topilmadi",
  notFoundMessage:
    "Bu sahifa mavjud emas — ko‘chirilgan yoki havola eskirgan bo‘lishi mumkin. CBAI ning boshqa qismlari bir bosish uzoqligida.",
  errorEyebrow: "Kutilmagan xato",
  errorTitle: "Nimadir noto‘g‘ri ketdi",
  errorMessage:
    "Kutilmagan xato ushbu sahifani to‘xtatdi. Saqlangan ma’lumotlaringiz yo‘qolmadi — Loyihalar, qaydlar va dalillar brauzerda qoladi. Qayta urinib ko‘ring yoki ishlaydigan joyga qayting.",
  researchNotFoundEyebrow: "Topilmadi",
  researchNotFoundTitle: "Tadqiqot mavzusi topilmadi",
  researchNotFoundMessage:
    "Bu mavzu Tadqiqot katalogida yo‘q — nomi o‘zgartirilgan yoki havola eskirgan bo‘lishi mumkin. Mavjud mavzularni ko‘rib chiqing.",
} as const;

export const SEARCH_UZ = {
  hint: "Mamlakat, kompaniya yoki universitet qidiring.",
  ariaLabel: "Mamlakat, kompaniya yoki universitet qidirish",
  placeholder: "Yaponiya, Apple, Harvard University",
  submit: "Qidirish",
  publicIntelligence: "Ommaviy intellekt",
  partOf: "Qismi",
  availableToday: "bugun mavjud.",
  noResults: '"{query}" uchun mos mamlakat, kompaniya, universitet yoki tadqiqot mavzusi topilmadi.',
  noOpenableResults: '"{query}" uchun ochish mumkin bo‘lgan profil yoki bog‘langan mavzu topilmadi.',
  noResultsHint:
    "Qidiruv faqat mahalliy reyestrdagi nomlarni moslashtiradi — qisqaroq so‘z, imloni tekshiring yoki quyidagilardan boshlang:",
  tryExample: "Misolni sinab ko‘ring",
  exampleCountry: "Mamlakat",
  exampleCompany: "Kompaniya",
  exampleUniversity: "Universitet",
  exampleResearch: "Tadqiqot mavzusi",
  openProfile: "Profilni ochish",
  openProfileArrow: "Profilni ochish →",
  compareArrow: "Solishtirish →",
  openReportsArrow: "Hisobotlarni ochish →",
  createProjectArrow: "Loyiha yaratish →",
  matched: "Mos keldi: {name}",
  profilesPickOne: "{count} profil · ochish uchun birini tanlang",
  profilesPickMany: "{count} profil · ochish uchun birini tanlang",
  resultsFor: "Natijalar",
  groupCountries: "Mamlakatlar",
  groupCompanies: "Kompaniyalar",
  groupUniversities: "Universitetlar",
  groupResearch: "Tadqiqot mavzulari",
  groupProjects: "Loyihalar",
  opensTo: "Ochiladi",
  exampleSearchesAria: "Misol qidiruvlar",
  voiceSummary: "Ovozda o'qish",
  voiceSummaryStop: "To'xtatish",
} as const;

export const EVIDENCE_UZ = {
  description:
    "Mamlakat, kompaniya va universitet profillari bo‘yicha rasmiy manba holati va mavjud ma’lumot.",
  sourcesConnected: "Bog‘langan manbalar",
  informationConnected: "Bog‘langan ma’lumot",
  profilesAvailable: "Mavjud profillar",
} as const;

export const FILTERS_UZ = {
  searchCountries: "Mamlakatlarni qidirish…",
  searchCompanies: "Kompaniyalarni qidirish…",
  searchUniversities: "Universitetlarni qidirish…",
  allRegions: "Barcha hududlar",
  allIndustries: "Barcha sohalar",
  allCountries: "Barcha mamlakatlar",
  allTypes: "Barcha turlar",
  all: "Hammasi",
  industry: "Soha",
  countryLabel: "Mamlakat",
  resultCountry: "{count} mamlakat",
  resultCountries: "{count} mamlakat",
  resultCompany: "{count} kompaniya",
  resultCompanies: "{count} kompaniya",
  resultUniversity: "{count} universitet",
  resultUniversities: "{count} universitet",
  selected: "Tanlangan",
} as const;

export const SETTINGS_UZ = {
  description: "CBAI shaxsiy Operatoringiz — ushbu brauzerda saqlangan.",
  operatorReady: 'CBAI shaxsiy Operatoringiz tayyor — "{name}" sifatida brauzerda saqlangan.',
  operatorNotReady: "CBAI shaxsiy Operatoringiz hali sozlanmagan — faollashtirish uchun ismingizni kiriting.",
  identityHeading: "Shaxsiy Operator identifikatsiyasi",
  yourName: "Ismingiz",
  yourNamePlaceholder: "masalan, Botir",
  operatorName: "Operator nomi",
  workspaceRole: "Ish maydoni roli",
  avatar: "Avatar",
  voiceLanguageHeading: "Ovoz va til",
  showVoiceInput: "Buyruq markazida ovozli kiritishni ko‘rsatish",
  preferredLanguage: "Afzal til",
  futureTranslationLanguage: "Kelajakdagi tarjima tili",
  speechLanguage: "Nutq tili (ovozni tanish)",
  speechEnUs: "Ingliz (Amerika Qo‘shma Shtatlari)",
  speechEnGb: "Ingliz (Buyuk Britaniya)",
  languageNotAvailable: " (hali mavjud emas)",
  languageHonestyNote:
    "Ingliz, Oʻzbek, Русский va Türkçe bugun ushbu platforma interfeysida to‘liq joriy etilgan. Yuqoridagi boshqa til variantlari saqlangan afzalliklar — jim o‘rniga halol ravishda mavjud emas deb belgilangan. Ovozni tanish (nutqni matnga) hozir faqat ingliz tilini qo‘llab-quvvatlaydi, interfeys tilidan qat’i nazar.",
  contextHeading: "Kontekst",
  country: "Mamlakat",
  countryNotSet: "Belgilanmagan",
  organization: "Tashkilot",
  organizationPlaceholder: "Ixtiyoriy",
  timezone: "Vaqt mintaqasi",
  notificationsHeading: "Bildirishnoma afzalliklari",
  notificationsHonesty:
    "Afzalliklar saqlanadi, lekin hozircha hech qanday bildirishnoma yetkazish ushbu platformaga ulanmagan — ulanganmaguncha hech narsa yuborilmaydi.",
  notifyEvidenceUpdates: "Dalil yangilanishlari",
  notifyMissionActivity: "Missiya faoliyati",
  notifyWeeklySummary: "Haftalik xulosa",
  themeHeading: "Interfeys mavzusi",
  themeNote:
    "Tizim qurilmangizning haqiqiy yorug‘/qorong‘i afzalligiga amal qiladi. Yorug‘ va Chuqur aniq qayta belgilash bo‘lib, ushbu profilga saqlanadi.",
  accessibilityHeading: "Qulaylik sozlamalari",
  reduceMotion: "Harakatni kamaytirish",
  increaseContrast: "Kontrastni oshirish",
  largerText: "Kattaroq matn",
  interfaceLanguage: "Interfeys tili",
  voiceLanguage: "Ovoz tanish tili",
  accessibility: "Qulaylik",
  saveProfile: "Profilni saqlash",
  resetProfile: "Ushbu brauzerda Shaxsiy Operatorni tiklash",
} as const;

export const DASHBOARD_UZ = {
  description: "Ommaviy intellekt — bugun CBAI da nima mavjud.",
} as const;

export const REPORTS_COMMON_UZ = {
  countryReportEyebrow: "Mamlakat intellektual hisoboti",
  companyReportEyebrow: "Kompaniya intellektual hisoboti",
  universityReportEyebrow: "Universitet intellektual hisoboti",
  projectReportEyebrow: "Loyiha intellektual hisoboti",
  researchReportEyebrow: "Tadqiqot intellektual hisoboti",
  generated: "Yaratilgan {date}",
  overview: "Umumiy ko‘rinish",
  region: "Hudud",
  capital: "Poytaxt",
  government: "Hukumat",
  officialWebsite: "Rasmiy veb-sayt",
  noVerifiedInfo: "Tasdiqlangan ma’lumot mavjud emas.",
  evidence: "Dalil",
  evidenceSummary:
    "{total} rasmiy manbadan {connected} tasi bog‘langan · {indicators} ko‘rsatkich · {questions} ochiq savol.",
  connectedEvidence: "Bog‘langan dalil",
  missingEvidence: "Yetishmayotgan dalil",
  noSourcesConnected: "Hali rasmiy manbalar bog‘lanmagan.",
  noMissingSources: "Yetishmayotgan manba yo‘q — kuzatiladigan barcha manbalar bog‘langan.",
  research: "Tadqiqot",
  organizations: "Tashkilotlar",
  relatedCompanies: "Bog‘liq kompaniyalar",
  relatedUniversities: "Bog‘liq universitetlar",
  projects: "Loyihalar",
  noRelatedCompanies: "Joriy katalogda bog‘liq kompaniyalar yo‘q.",
  noRelatedUniversities: "Joriy katalogda bog‘liq universitetlar yo‘q.",
  noProjectsLinked: "Hali ushbu obyektga bog‘langan loyihalar yo‘q.",
  createProjectFor: "+ {name} uchun loyiha yaratish →",
  methodology: "Metodologiya",
  trustStatement: "Ishonch bayonoti",
  limitations: "Cheklovlar",
} as const;

export const TRUST_PAGE_UZ = {
  pageDescription:
    "CBAI qanday ishonch qozonadi — konstitutsiya, metodologiya va siyosatlar uchun bitta joy.",
  homeLink: "Bosh sahifa",
  homeLinkHint: "ishonch xulosasi.",
  sectionsNav: "Ishonch bo‘limlari",
  verificationIntro:
    "Har bir profil va mavzu to‘rt halol yorliqdan biriga ega — har doim to‘liq jumla, hech qachon yolg‘iz so‘z yoki rang emas:",
  constitution: {
    title: "Konstitutsiya",
    body: [
      "Odamlarga dalillar yordamida yaxshiroq qarorlar qabul qilishga yordam bering. Hech qachon manipulyatsiya qilmang. Hech qachon to‘qib chiqarmang. Hech qachon siyosiy bo‘lmang. Har doim tushuntiring. Har doim shaffof bo‘ling.",
      "Boshqaruv hujjati: CBAI Konstitutsiyasi v1.",
    ],
  },
  methodology: {
    title: "Metodologiya",
    body: ["Har qanday xulosa berilishidan oldin dalillar bog‘lanadi va ko‘rib chiqiladi — hech qachon aksincha emas."],
  },
  verificationModel: {
    title: "Tasdiqlash modeli",
    body: [
      "Har bir profil va mavzu to‘rt halol yorliqdan biriga ega — har doim to‘liq jumla, hech qachon yolg‘iz so‘z yoki rang emas:",
    ],
  },
  evidencePolicy: {
    title: "Dalil siyosati",
    body: [
      "Ushbu platformadagi har bir da’vo bog‘langan, nomlangan manbaga qaytishi yoki yetishmayotgan deb belgilanishi kerak.",
      "Manbalar xulosalardan oldin keladi. Haqiqiy manba bog‘lanmaguncha hech qanday da’vo tasdiqlangan deb taqdim etilmaydi.",
      "Noaniqlik ko‘rinadi. Dalil qisman yoki yetishmasa, platforma buni aytadi — hech qachon ishonchli til ortida bo‘shliqlarni yashirmaydi.",
    ],
  },
  dataSources: {
    title: "Ma’lumot manbalari",
    body: [
      "Ushbu platforma bog‘lanishi mo‘ljallangan rasmiy manbalar, toifalar bo‘yicha:",
      "Manba faqat undan haqiqiy, tekshiriladigan ma’lumot profilga bog‘langanda bog‘langan deb hisoblanadi — faqat toifadan taxmin qilinmaydi.",
    ],
  },
  humanDecision: {
    title: "Inson qarori",
    body: [
      "Insonlar qaror qiladi. CBAI dalillarni bog‘laydi va variantlarni tushuntiradi — insoniy hukmni hech qachon almashtirmaydi.",
      "Ushbu platforma ishlab chiqaradigan har bir mulohaza natijasi har doim true bo‘lgan inson-qarori-talab qilinadi bayrog‘iga ega — avtomatlashtirilgan test bilan tasdiqlangan, tasodifga qoldirilmagan.",
    ],
  },
  privacy: {
    title: "Maxfiylik",
    body: [
      "Ikki hisob turi mavjud: Qurilmadagi mahalliy hisob (faqat ushbu brauzerda saqlanadi, hech qayerga yuborilmaydi) va, sozlangan bo‘lsa, Supabase bilan ta’minlangan haqiqiy Bulutli hisob.",
      "Bulutdagi har bir jadvalda qator darajasidagi xavfsizlik qo‘llaniladi: faqat o‘z tizimga kirgan sessiyangiz yozuvlaringizni o‘qishi, yozishi yoki o‘chirishi mumkin.",
      "Analitika, kuzatuv skripti va uchinchi tomon hech qachon bu ma’lumotlarni olmaydi.",
      "To‘liq maxfiylik siyosati tijoriy yoki ommaviy ishga tushirishdan oldin, huquqiy ko‘rib chiqish tugagach e’lon qilinadi.",
    ],
  },
  termsOfUse: {
    title: "Foydalanish shartlari",
    body: [
      "Bu haqiqiy joriy xulq-atvorning minimal, halol bayonidir — yurist tomonidan tayyorlangan Xizmat ko‘rsatish shartlarining o‘rnini bosmaydi.",
      "CBAI «boricha» taqdim etiladi — aniqlik, to‘liqlik yoki ma’lum maqsadga mosligi kafolati yo‘q.",
      "Haqiqiy qaror uchun ishonishdan oldin har qanday ma’lumotni tekshirish sizning mas’uliyatingiz.",
      "Qurilmadagi mahalliy hisoblar va mahalliy saqlangan ma’lumotlar brauzer xotirasi tozalansa yo‘qolishi mumkin.",
      "Bulutli hisobni o‘chirish haqiqiy o‘z-o‘zidan xizmat oqimi qurilmaguncha ushbu joylashtirish operatoriga murojaat qilishni talab qilishi mumkin.",
    ],
  },
  copyright: {
    title: "Mualliflik huquqi",
    body: [
      "CBAI ushbu platformada keltirilgan uchinchi tomon ma’lumotlari, bayroqlari, logotiplari, nashrlari, ma’lumot to‘plamlari yoki hukumat materiallariga egalik qilmaydi.",
      "Asl CBAI platforma kontenti va dizayni CBAI mulki hisoblanadi.",
    ],
  },
  knownLimitations: {
    title: "Ma’lum cheklovlar",
    body: [
      "Bugungi qamrov ataylab haqiqiy holatda ko‘rsatiladi: ko‘pchilik profillarda hozircha faqat oz sonli rasmiy manbalar bog‘langan.",
      "Qurilmadagi mahalliy hisoblarda server tasdiqlash va qurilmalararo sinxronizatsiya yo‘q.",
      "Boshqaruv, Investor va Fuqaro ish maydonlari hamda Bilim grafi va Mulohaza ko‘rinishlari hali dastlabki bosqichda — joriy chuqurlikni oldindan ko‘rish sifatida qabul qiling.",
    ],
  },
  transparency: {
    title: "Shaffoflik bayonoti",
    body: [
      "CBAI nima bog‘langan, nima yetishmayotgan va nima hali ishlab chiqilmoqda — dalil qo‘llab-quvvatlaganidan ortiq hech narsani ko‘rsatmaydi.",
      "Hozircha hech qanday qo‘llab-quvvatlash yoki aloqa kanali ulanmagan.",
    ],
  },
} as const;

export const GRAPH_UZ = {
  description: "Platforma obyektlari o‘rtasidagi tasdiqlangan munosabatlarni ko‘ring.",
  graphByRole: "Rol bo‘yicha graf",
  howItWorks: "Qanday ishlaydi",
  trust: "Ishonch",
} as const;

export const REASONING_UZ = {
  description: "Rasmiy ma’lumot qarorlardan oldin qanday ko‘rib chiqilishini tushunish.",
  extendedDescription:
    "Qarorlardan oldin dalillar qanday ko‘rib chiqilishi — aniq bosqichlar va mavzu bo‘yicha bog‘liq ma’lumot.",
  reviewSteps: "Ko‘rib chiqish bosqichlari",
  topicAreas: "Mavzu sohalari",
  informationConnected: "Ulangan ma’lumot",
  sourcesConnected: "Ulangan manbalar",
} as const;
