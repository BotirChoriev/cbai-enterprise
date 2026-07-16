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
  statusHeading: "Tadqiqot intellekti holati",
  availableToday: "Bugun mavjud",
  notAvailableYet: "Hali mavjud emas",
  openWorkspace: "Tadqiqot ish maydonini ochish",
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
} as const;
