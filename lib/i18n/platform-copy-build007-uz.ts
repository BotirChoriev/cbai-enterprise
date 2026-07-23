/** BUILD-007 — yakuniy ishlab chiqarish siyosati (o'zbek). */

export const ACCOUNT_PAGE_UZ = {
  pageDescription:
    "Haqiqiy mahalliy hisob — Loyihalar, Xatcho'plar va So'nggi faoliyat brauzerdagi boshqa har qanday foydalanuvchidan alohida saqlanadi.",
  cloudAccount: "Bulutli hisob",
  deviceLocalAccount: "Qurilmadagi mahalliy hisob",
  cloudSignedInActive: "●",
  localSignedInActive: "●",
  modeCloud: "Bulutli hisob — qurilmalar bo'ylab sinxronlangan",
  modeLocal: "Qurilmadagi mahalliy hisob — faqat shu brauzer",
  modeSignedOut: "Tizimga kirilmagan",
  cloudNotice:
    "Bulutli hisob — haqiqiy server (Supabase) tomonidan tasdiqlangan. Loyihalar, Xatcho'plar va Hisobotlar ushbu email bilan kirgan har bir brauzer va qurilmada sinxronlanadi.",
  localNotice:
    "Qurilmadagi mahalliy hisob — hisob ma'lumotlari faqat shu brauzerda xeshlangan va tuzlangan. Hech narsa serverga yuborilmaydi. Sayt ma'lumotlarini tozalash bu hisobni olib tashlaydi.",
  emailNotConfirmed:
    "Emailingiz hali tasdiqlanmagan. Tasdiqlash havolasi uchun pochta qutingizni tekshiring — tasdiqlaguncha ba'zi bulut funksiyalari cheklangan bo'lishi mumkin.",
  resendConfirmation: "Tasdiqlash emailini qayta yuborish",
  resendConfirmationSent: "Tasdiqlash emaili yuborildi — pochta qutingizni tekshiring.",
  continueWorking: "Ishni davom ettirish",
  signOutCloud: "Bulutdan chiqish",
  signOut: "Chiqish",
  signIn: "Kirish",
  createCloudAccount: "Bulutli hisob yaratish",
  resetPassword: "Parolni tiklash",
  cloudSubtitle:
    "Haqiqiy, server tomonidan tasdiqlangan hisob — Loyihalar, Xatcho'plar va Hisobotlarni har bir qurilmada sinxronlang.",
  cloudNotConfigured:
    "Bulutli hisoblar hozircha ushbu joylashtirishda sozlanmagan (Supabase loyihasi ulanmagan). Quyida Qurilmadagi mahalliy hisobdan foydalanishingiz mumkin yoki yuborishni sinab ko'ring — ilova bulutga ulana olmasa, buni ochiq-oydin aytadi.",
  signInTab: "Kirish",
  createAccountTab: "Hisob yaratish",
  email: "Email",
  emailPlaceholder: "siz@example.com",
  password: "Parol",
  passwordSignUpPlaceholder: "Kamida 8 belgi",
  passwordSignInPlaceholder: "Parolingiz",
  forgotPassword: "Parolni unutdingizmi?",
  backToSignIn: "← Kirishga qaytish",
  pleaseWait: "Iltimos, kuting…",
  sendResetLink: "Tiklash havolasini yuborish",
  resetLinkSent: "Agar ushbu email uchun hisob mavjud bo'lsa, parolni tiklash havolasi yuborildi.",
  accountCreatedConfirmEmail:
    "Hisob yaratildi. Barcha bulut funksiyalari mavjud bo'lishidan oldin emailni tasdiqlash uchun pochtangizni tekshiring.",
  name: "Ism",
  namePlaceholder: "Ismingiz",
  organizationOptional: "Tashkilot (ixtiyoriy)",
  organizationPlaceholder: "masalan, universitet, kompaniya yoki agentlik",
  localSignInTitle: "Kirish",
  localCreateTitle: "Mahalliy hisob yaratish",
  localSubtitle:
    "Loyihalar, Xatcho'plar va So'nggi faoliyatni brauzerdagi boshqa har qanday foydalanuvchidan alohida saqlash uchun kiring. Faqat shu qurilmada qoladi — qurilmalar bo'ylab sinxronlash uchun Bulutli hisobdan foydalaning.",
  projects: "Loyihalar",
  bookmarks: "Xatcho'plar",
  memberSince: "A'zo bo'lgan sana",
  securityHeading: "Hisob xavfsizligi",
  securityBody:
    "Tizimga kirgan holda bulut parolingizni o'zgartiring. Bu parolni tiklashdagi bilan bir xil brauzer Supabase Auth yangilanishidan foydalanadi.",
  changePassword: "Parolni yangilash",
  newPassword: "Yangi parol",
  confirmNewPassword: "Yangi parolni tasdiqlang",
  passwordUpdated: "Parol yangilandi.",
  passwordChangeUnavailable:
    "Ushbu joylashtirishda parolni o'zgartirish mavjud emas — bulut Auth sozlanmagan, shuning uchun yangilanadigan sessiya yo'q.",
  sessionHeading: "Faol sessiya",
  sessionEmail: "{email} sifatida kirdingiz",
  sessionRestoring: "Oldingi bulut sessiyasi tiklanmoqda…",
  sessionRestored: "Sessiya ushbu brauzerda tiklandi.",
  sessionNoMultiDeviceRevoke:
    "Ushbu brauzer faqat joriy sessiyani ko'rsatadi. Boshqa qurilmalarni bekor qilish server admin API talab qiladi va brauzer mijozida mavjud emas.",
  profileHeading: "Bulut profili",
  profileBody:
    "Ko'rsatiladigan ism, til va avatar tizimga kirganda bulut profilingizga sinxronlanadi — va ushbu qurilmadagi Yordamchi sozlamalarida saqlanadi.",
  displayName: "Ko'rsatiladigan ism",
  preferredLanguage: "Afzal til",
  avatarMode: "Avatar",
  saveProfile: "Profilni saqlash",
  profileSaved: "Profil saqlandi.",
  profileSaveFailed: "Profilni bulutga saqlab bo'lmadi. Mahalliy sozlamalar baribir yangilandi.",
  cloudGateTitle: "Bulutli hisob kerak",
  cloudGateHeading: "Umumiy hamkorlik uchun tizimga kiring",
  cloudGateBody:
    "Tashkilot ish maydoni, tasdiqlar, faoliyat va bildirishnomalar tasdiqlangan bulutli hisobni talab qiladi. Qurilmadagi mahalliy kirish faqat shu brauzerdagi shaxsiy ish uchun.",
  cloudGateLocalOnly:
    "Siz qurilmadagi mahalliy hisob bilan kirdingiz. Umumiy hamkorlik bulutli hisobni talab qiladi — Hisob sahifasida kiring.",
  cloudGateRestoring: "Tiklangan bulut sessiyasi tekshirilmoqda…",
  cloudGateCta: "Hisobga o'tish",
} as const;

export const REPORTS_CENTER_UZ = {
  continuingFor: "Ko'rib chiqish davom etmoqda",
  continuingBody: "Profil ko'rib chiqishingiz shu yerda davom etadi — quyida hisobot turini tanlang.",
  backToProfile: "← Profilga qaytish",
  pageDescription: "Bugun nimalarni ochishingiz mumkin — har bir hisobot turi uchun talab qilinadigan rasmiy ma'lumot.",
  whatCanIOpen: "Bugun nimani ochishim mumkin?",
  evidenceRequired: "Talab qilinadigan dalillar",
  openRelatedProfile: "Tegishli profilni ochish →",
  savedCount: "Saqlangan hisobotlaringiz ({count})",
  savedAt: "Saqlangan {date}",
  delete: "O'chirish",
} as const;

export const RESEARCH_WORKSPACE_UZ = {
  title: "Tadqiqot ish maydoni",
  backToResearch: "← Tadqiqot intellektiga qaytish",
  shellNotice:
    "Bu faqat o'qish uchun ish maydoni qobig'i. Jonli dalillar, hamkorlik va tahlil hali ulanmagan.",
  humanReviewNotice:
    "Kelajakdagi ish maydoni natijasi qarorni qo'llab-quvvatlashdan oldin inson ko'rib chiqishi talab qilinadi.",
  topicNotFoundPrefix: '"{topicId}" tadqiqot katalogida mavzu emas — havolani tekshiring yoki',
  browseAllTopics: "barcha tadqiqot mavzularini ko'ring",
  selectedTopic: "Tanlangan tadqiqot mavzusi:",
  continueReview: "— tadqiqot ko'rib chiqishini davom ettiring.",
  filterTopics: "Mavzularni filtrlash...",
  filterTopicsAria: "Tadqiqot mavzulari",
  statusShellAvailable: "Ish maydoni qobigi mavjud",
  statusFuture: "Kelajakdagi ish maydoni",
  statusNotConnected: "Hali ulanmagan",
  lifecycleDiscover: "Kashf etish",
  lifecycleDiscoverDesc: "Tadqiqot katalogi va mavzu profillarini ko'rib chiqing.",
  lifecycleUnderstand: "Tushunish",
  lifecycleUnderstandDesc: "Usullar, dalil turlari va bilim tashkil etilishini ko'rib chiqing.",
  lifecycleReviewEvidence: "Dalillarni ko'rib chiqish",
  lifecycleReviewEvidenceDesc:
    "Manbalar ulanganda dalillarni tuzilgan ko'rib chiqish — inson ko'rib chiqishi talab qilinadi.",
  lifecycleIdentifyGaps: "Bo'shliqlarni aniqlash",
  lifecycleIdentifyGapsDesc: "Ochiq savollar va salbiy natijalarni tuzilgan obyektlar sifatida kuzating.",
  lifecycleFutureCollaboration: "Kelajakdagi hamkorlik",
  lifecycleFutureCollaborationDesc: "Kelajakdagi hamkorlik maydoni — bugun faol emas.",
} as const;

export const RESEARCH_HOME_UZ = {
  title: "Tadqiqot intellekti",
  subheadline:
    "Tadqiqot mavzulari, tajribalar, nashrlar, laboratoriyalar, universitetlar va dalillarni bog'lang.",
  searchPlaceholder: "Tadqiqot mavzulari, usullar, organizmlar, kasalliklar, texnologiyalar...",
  coreMessage:
    "Tadqiqot intellekti ijtimoiy lenta emas. Bu ilmiy ko'rib chiqish uchun tuzilgan dalil ish maydoni.",
  searchButton: "Tadqiqot qidirish",
  statusHeading: "Tadqiqot intellekti holati",
  availableToday: "Bugun mavjud",
  notAvailableYet: "Hali mavjud emas",
  openWorkspace: "Tadqiqot ish maydonini ochish",
  pageDescription:
    "Global tadqiqot tarmog'ida katalog tadqiqot mavzulari va metadata bog'lanishlarini o'rganing.",
  statusLabel: "Tadqiqot intellekti: Ishlab chiqilmoqda",
  workspaceEyebrow: "Tadqiqot ish maydoni",
  workspaceTitle: "Tuzilgan tadqiqot ish maydoni",
  workspaceBody:
    "Bitta mavzuni katalog, daftar, vaqt chizig'i va graf nuqtai nazaridan o'rganing — jonli dalillar ulanmaguncha faqat o'qish rejimi.",
  availableTodayItems: [
    "Ekotizim ko'rinishi va mahsulot yo'nalishi",
    "Tadqiqot mavzulari katalogi (faqat o'qish)",
    "Mavzu o'rganish kirish nuqtasi (ushbu sahifa)",
    "Ommaviy tadqiqot intellekti pozitsiyasi",
    "Ommaviy intellektdagi universitet profillariga havola",
  ],
  notAvailableYetItems: [
    "Jonli ilmiy ma'lumot bazalari",
    "Nashrlarni qidirish va to'liq matn",
    "Tadqiqotchi profillari va hamkorlik",
    "Jonli tajribalar va laboratoriya ma'lumotlari",
    "SI tomonidan yaratilgan tadqiqot xulosalari",
  ],
} as const;

export const GRAPH_PLATFORM_UZ = {
  eyebrow: "Bilim grafi",
  headline: "Asosiy intellekt navigatsiya qatlami",
  explanation:
    "Bilim grafi obyektlar tasdiqlangan mahalliy katalog munosabatlari orqali qanday bog'langanini tushuntiradi. Dalil qo'llab-quvvatlamasa, hech qachon bog'lanish sababini aytmaydi.",
  relationshipUnavailable: "Munosabat ma'lumotlari ulanmagan.",
  noSelectionPrompt:
    "Dalil holati, munosabatlar soni va ulangan yozuvlarni ko'rish uchun grafikda obyektni tanlang.",
  searchPlaceholder: "Nom yoki mamlakat bo'yicha qidirish…",
  registryNodes: "Reyestr tugunlari",
  verifiedEdges: "Tasdiqlangan bog'lanishlar",
  registryAvailable: "Reyestr mavjud",
  evidenceConnected: "Dalillar ulangan",
  evidenceUnavailable: "Dalillar mavjud emas",
  insufficientEvidence: "Dalillar yetarli emas",
  notConnected: "Dalil manbasi ulanmagan",
} as const;

export const TRUST_DATA_SOURCES_UZ = {
  un: "Mamlakat darajasidagi institutsional va shartnoma hisobotlari.",
  worldBank: "Mamlakat va iqtisodiy ko'rsatkichlar.",
  imf: "Moliyaviy va makroiqtisodiy hisobotlar.",
  who: "Sog'liqni saqlash tizimi qamrovi.",
  unesco: "Ta'lim va tadqiqot statistikasi.",
  ilo: "Mehnat bozori statistikasi.",
  itu: "Raqamli aloqa statistikasi.",
  oecd: "Iqtisodiy hamkorlik va rivojlanish ma'lumotlari.",
  ocp: "Davlat xaridlari shaffofligi.",
  nationalStats: "Mamlakat bo'yicha rasmiy statistika.",
  procurement: "Mamlakat bo'yicha xaridlar oshkor etilishi.",
  financeAudit: "Mamlakat bo'yicha byudjet shaffofligi.",
} as const;

export const PREVIEW_PAGES_UZ = {
  inDevelopmentEyebrow: "Ishlab chiqilmoqda",
  agentsTitle: "SI agentlari",
  agentsDescription: "Ushbu platforma uchun rejalashtirilgan agent imkoniyatlari — hali mavjud emas.",
  agentsCapabilities: "Agent imkoniyatlari",
  workflowsTitle: "Ish jarayonlari",
  workflowsDescription: "Ish jarayoni yaratuvchisi tez orada — hali mavjud emas.",
  workflowsHeading: "Ish jarayoni yaratuvchisi tez orada",
  workflowsBody:
    "Inson tasdiqlash darvozalari bilan avtomatlashtirilgan ish jarayonlarini loyihalang, joylashtiring va kuzating.",
  coreTitle: "CBAI Core",
  coreDescription:
    "Asosiy inferens va agent orkestratsiyasi ushbu joylashtirishda faol emas. Jonli reyestr intellekti uchun quyidagi modullardan foydalaning.",
  governancePreview:
    "Boshqaruv ish maydoni — erta ko'rib chiqish. Dalil modullari ulanmaguncha chuqurlik cheklangan.",
  investorPreview:
    "Investor ish maydoni — erta ko'rib chiqish. Hech qanday investitsiya tavsiyasi berilmaydi.",
  citizenPreview:
    "Fuqaro ish maydoni — erta ko'rib chiqish. Faqat ommaviy ma'lumot — professional maslahat emas.",
} as const;

export const VALIDATION_UZ = {
  passwordsDoNotMatch: "Parollar mos kelmaydi.",
  requiredField: "Bu maydon majburiy.",
} as const;

export const ASSISTANT_VOICE_UZ = {
  savedToWorkspace: '"{name}" ish maydoningizga saqlandi.',
  nothingToSaveYet: "Hali saqlash uchun hech narsa yo'q — avval mamlakat, kompaniya yoki universitet profilini oching.",
  uploadNotAvailable: "Fayl yuklash ulangan qabul qilish tizimini talab qiladi — hali mavjud emas.",
  speechDetected: "Nutq aniqlandi — transkriptni quyida ko'rib chiqing.",
  commandCenterAria: "CBAI shaxsiy operator buyruq markazi",
  contextPrefix: "Kontekst:",
  operatorContextTitle: "Operator konteksti: {name}",
} as const;

export const MY_WORK_EXT_UZ = {
  continueWorking: "Ishni davom ettirish",
  recentlyViewed: "Yaqinda ko'rilgan",
  reportsSection: "Hisobotlar",
  reportsCenterLink: "Hisobotlar markazi",
  reportsCenterDetail: "Profil va taqqoslash ko'rib chiqishi uchun {count} hisobot turi belgilangan.",
  evidenceReviews: "Dalil ko'rib chiqishlari",
  evidenceReviewsEmpty:
    "Shaxsiy ko'rib chiqish tarixi hali ulanmagan. Platforma bo'yicha {connected}/{total} dalil manbasi ulangan — oching",
  evidenceLink: "Dalillar",
  evidenceReviewsSuffix: "joriy holatni ko'rib chiqish uchun.",
  savedWork: "Saqlangan ish",
  signInBrowserHint: "bu brauzerdan foydalanayotgan boshqalardan ishingizni ajratib saqlash uchun.",
  signInAccountHint:
    "o'z Loyihalar va Xatcho'plaringizni bu brauzerdan foydalanayotgan boshqalardan ajratib saqlash uchun.",
  continueResearchWorkspace: "Tadqiqotni davom ettirish",
  continueResearchWorkspaceDetail: "Dalil ko'rib chiqishi va eslatmalarni qoldirgan joyingizdan davom eting.",
  continueResearchCatalog: "Tadqiqot katalogi",
  continueResearchCatalogDetail: "Tadqiqot mavzulari, missiyalar va dalil holatini ko'ring.",
  continueEvidence: "Dalillar",
  continueEvidenceDetail: "Profillar bo'yicha rasmiy manba holatini ko'rib chiqing.",
  onboardingExploreResearch: "Tadqiqotni o'rganish",
  onboardingExploreCountries: "Mamlakatlarni o'rganish",
  onboardingSearchEvidence: "Dalillarni qidirish",
  onboardingConfigureOperator: "Sozlamalarni ochish",
  onboardingOpenTrust: "Ishonch markazini ochish",
  loading: "Yuklanmoqda…",
} as const;

export const RESEARCH_CATALOG_UZ = {
  catalogEyebrow: "Tadqiqot mavzulari katalogi",
  catalogTitle: "Tadqiqot sohalari va mavzularini ko'ring",
  catalogDescription:
    "Har bir tadqiqot mavzusi uchun batafsil sahifalar bilan tuzilgan faqat o'qish katalogi. Jonli ma'lumot bazalari, nashrlar yoki tadqiqotchi profillari ulanmagan.",
  filterLabel: "Tadqiqot mavzularini filtrlash",
  filterPlaceholder: "Mavzu, usul, soha yoki dalil turi bo'yicha filtrlash...",
  showingCount: "{total} ta mavzudan {filtered} tasi ko'rsatilmoqda",
  noMatch: "Filtrga mos tadqiqot mavzulari topilmadi.",
  tryDifferent: "Boshqa soha yoki qidiruv so'zini sinab ko'ring.",
  clearFilters: "Filtrlarni tozalash",
  methods: "Usullar",
  evidenceTypes: "Dalil turlari",
  futureWorkspace: "Kelajakdagi ish maydoni",
  openTopic: "Mavzuni ochish",
  topicStatus: {
    catalog_available: "Katalogda mavjud",
    workspace_not_available: "Ish maydoni mavjud emas",
    evidence_not_connected: "Dalillar ulanmagan",
  },
} as const;

export const GRAPH_EXTENDED_UZ = {
  whatCanILearn: "Nima o'rganishim mumkin?",
  personaGuidanceAria: "Bilim grafi personasi bo'yicha yo'riqnoma",
  pipelineAria: "Bilim grafi Obyektdan Qaror intellektigacha qanday bog'lanadi",
  pipelineStages: ["Obyekt", "Munosabat", "Dalil", "Mantiq", "Qaror intellekti"] as const,
  personas: {
    citizen: {
      title: "Fuqaro",
      whatCanILearn:
        "Qaysi davlat muassasalari va kompaniyalar universitetlar bilan mamlakat reyestri orqali bog'langan — mashhurlik ballarisiz.",
    },
    investor: {
      title: "Investor",
      whatCanILearn:
        "Faqat katalog darajasidagi obyekt yaqinligi. Investitsiya yoki hamkorlik da'volari ulangan moliyaviy dalillarni talab qiladi.",
    },
    government: {
      title: "Hukumat",
      whatCanILearn:
        "Bog'langan bo'lsa, mamlakat reyestridan hukumat shakli yorliqlari. Graf bo'ylab siyosiy tavsiyalar yo'q.",
    },
    student: {
      title: "Talaba",
      whatCanILearn:
        "Universitet joylashuvi va bir mamlakatdagi kompaniyalar ro'yxati — reyting yoki ishga joylashish ballari emas.",
    },
    researcher: {
      title: "Tadqiqotchi",
      whatCanILearn: "Har bir bog'lanish uchun dalil holati bilan eksport qilinadigan munosabatlar ro'yxati.",
    },
    academic: {
      title: "Akademik",
      whatCanILearn: "CBAI katalogdan olingan bog'lanishlarni tasdiqlangan hamkorlik dalillaridan qanday ajratadi.",
    },
  },
  trustPillars: {
    evidence: {
      title: "Dalil",
      description:
        "Bog'lanishlar faqat mahalliy reyestrlar tekshiriladigan aloqani ta'minlaganda mavjud. Xulosa qilingan yoki og'irlikli munosabatlar yo'q.",
    },
    methodology: {
      title: "Metodologiya",
      description:
        "Graf quruvchi tugunlarni obyekt adapterlaridan, bog'lanishlarni katalog qoidalaridan oladi — SI klasterlash emas.",
    },
    neutrality: {
      title: "Neytrallik",
      description: "Graf yo'llarni tavsiya qilmaydi, obyektlarni reytinglamaydi yoki hamkorlikni tasdiqlamaydi.",
    },
    transparency: {
      title: "Shaffoflik",
      description:
        "Har bir munosabat holatini ko'rsatadi: katalogdan dalil mavjud yoki kelajak turlar uchun dalil yo'q.",
    },
  },
} as const;

export const ENTITY_UI_UZ = {
  notAssessed: "Baholanmagan",
  notAvailable: "Mavjud emas",
  notConnected: "Ulanmagan",
  officialWebsite: "Rasmiy veb-sayt",
  publicationDate: "Nashr sanasi",
  openSourceLink: "Ochiq manba havolasi",
  connected: "Ulangan",
  planned: "Rejalashtirilgan",
  noVerifiedData: "Tasdiqlangan ma'lumot yo'q.",
  noVerifiedInfo: "Tasdiqlangan ma'lumot mavjud emas.",
  benchmarkCountry: "To'liq profilni o'qishdan oldin ushbu mamlakatni reyestrdagi boshqalar bilan taqqoslang.",
  benchmarkCompany: "To'liq profilni o'qishdan oldin ushbu kompaniyani reyestrdagi boshqalar bilan taqqoslang.",
  noRelationshipsCountry:
    "Hali tasdiqlangan munosabatlar yo'q — katalogdagi kompaniya, universitet yoki tadqiqot mavzusi ushbu mamlakatga murojaat qilganda bog'lanishlar paydo bo'ladi.",
  noRelationshipsCompany:
    "Hali tasdiqlangan munosabatlar yo'q — katalogdagi mamlakat, universitet yoki tadqiqot mavzusi ushbu kompaniyaga murojaat qilganda bog'lanishlar paydo bo'ladi.",
  searchCountries: "Mamlakatlarni qidirish…",
  dataStatusLegend: "Ma'lumot holati afsonasi",
  searchResults: "Qidiruv natijalari",
} as const;

export const PROJECT_UI_UZ = {
  researchQuestion: "Tadqiqot savoli",
  objectives: "Maqsadlar",
  notes: "Eslatmalar",
  tasks: "Vazifalar",
  openQuestions: "Ochiq savollar",
  timeline: "Vaqt chizig'i",
  entities: "Obyektlar",
  noResearchQuestion: "Hali tadqiqot savoli qayd etilmagan.",
  noObjectives: "Hali maqsadlar qayd etilmagan.",
  noEntitiesLinked: "Ushbu loyihaga hali obyektlar bog'lanmagan.",
  noRelatedCountry: "Joriy katalogda bog'liq mamlakat yo'q.",
  noEvidence: "Hali dalil qo'shilmagan.",
  noNotes: "Hali eslatmalar qayd etilmagan.",
  noTasks: "Hali vazifalar qo'shilmagan.",
  noOpenQuestions: "Hozir ochiq savollar yo'q.",
  noTimeline: "Vaqt chizig'i faoliyati qayd etilmagan.",
} as const;

export const GOVERNANCE_PAGE_UZ = {
  title: "Boshqaruv",
  description: "Dalilga asoslangan qarorlar uchun platforma qoidalari, standartlari va ko'rib chiqish jarayoni.",
  previewNotice:
    "Boshqaruv nazorat markazi — erta ko'rib chiqish. Qoidalar va ko'rib chiqish ish jarayonlari hali to'liq ulanmagan.",
} as const;
