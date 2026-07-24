/** Investor Intelligence Workspace + shared workspace chrome — EN / UZ / RU / TR. */

export const WORKSPACE_SHARED_EN = {
  entityLinksHeading: "Entity links",
  entityLinksDescription:
    "Navigate to entity intelligence routes — registry facts and coverage status only. This workspace's working order carries over: the entity page opens with comparables and coverage first, not the narrative profile.",
  openLink: "Open",
  registryCount: "{count} entit{plural} in registry",
  topicsWithEvidence: "{connected} / {total} topic{topicPlural} with evidence",
  statusNoSourceConnected: "No source connected",
  statusNotYetAvailable: "Not yet available",
  statusReviewPending: "Review pending",
  statusAvailableNow: "Available now",
  statusLimitedEvidence: "Limited evidence",
  statusAvailableInformation: "Available information",
  registeredDomainFallback: "Registered indicator domain.",
} as const;

export const INVESTOR_WORKSPACE_EN = {
  versionLabel: "Investor workspace",
  heroTitle: "Investor Intelligence Workspace",
  heroSubtitle: "Evidence readiness for due diligence scoping",
  heroDescription:
    "Explore evidence readiness for countries, sectors, companies, universities, procurement, infrastructure, trade, and investment climate. No “invest here” recommendations — only source and indicator status.",
  metricEvidenceDomains: "Evidence domains",
  metricAvailableInformation: "Available information",
  metricSourcesConnected: "Sources connected",
  projectEntryDescription:
    "Track a real investment question against the macro, trade, and infrastructure evidence below — no scores or recommendations, just your own evidence, notes, and a report attached to one project.",
  sectionInvestmentEvidenceHeading: "Investment evidence",
  sectionInvestmentEvidenceDescription: "Macro, trade, procurement, and infrastructure topics.",
  sectionOfficialSourcesHeading: "Official sources",
  sectionOfficialSourcesDescription: "Official sources for investment review.",
  sectionOpportunityStatusHeading: "Opportunity status",
  sectionOpportunityStatusDescription: "Status by topic — information only, not recommendations.",
  ledgerAria:
    "Investor evidence ledger: {count} investment domains; tick length shows each domain's indicator-connection ratio",
  entityLinks: {
    countries: {
      label: "Countries",
      description: "Country registry facts and indicator coverage — no investment scores.",
    },
    companies: {
      label: "Companies",
      description: "Company registry and industry classification readiness — not market recommendations.",
    },
    universities: {
      label: "Universities",
      description: "University registry and research indicator status — not league tables.",
    },
  },
  domains: {
    economy: {
      title: "Economy",
      purpose: "Describe macroeconomic conditions from official statistics.",
    },
    investment: {
      title: "Investment",
      purpose: "Track investment-climate evidence from official fiscal and FDI sources.",
    },
    trade: {
      title: "Trade",
      purpose: "Document trade flows and tariff evidence from official customs statistics.",
    },
    industry: {
      title: "Industry",
      purpose: "Assess industrial structure from official sector and production data.",
    },
    infrastructure: {
      title: "Infrastructure",
      purpose: "Measure infrastructure assets from official infrastructure registries.",
    },
    energy: {
      title: "Energy",
      purpose: "Track energy supply and transition evidence from official agencies.",
    },
    employment: {
      title: "Employment",
      purpose: "Assess labour-market evidence from official statistics offices.",
    },
    "digital-development": {
      title: "Digital development",
      purpose: "Document digital infrastructure and connectivity from official ICT sources.",
    },
    "public-procurement": {
      title: "Public procurement",
      purpose: "Track procurement transparency from official portal records.",
    },
    "budget-transparency": {
      title: "Budget transparency",
      purpose: "Assess fiscal openness from official budget disclosure portals.",
    },
  },
  sourceCoverage: {
    "world-bank": "Global — macroeconomic, development, and infrastructure indicators",
    imf: "Global — fiscal, monetary, and balance-of-payments statistics",
    oecd: "Member economies — policy, trade, and investment statistics",
    "national-statistics-offices": "National — official statistics and census data",
    "official-procurement-portals": "National — public procurement disclosure",
    "national-open-budget-portals": "National — budget and fiscal transparency portals",
    "cbai-local-registry": "Device-local — CBAI registry and catalog status",
  },
} as const;

export const WORKSPACE_SHARED_UZ = {
  entityLinksHeading: "Ob’ekt havolalari",
  entityLinksDescription:
    "Ob’ekt intellekti yo‘llariga o‘ting — faqat reyestr faktlari va qamrov holati. Bu ish maydonidagi tartib saqlanadi: ob’ekt sahifasi avvalo taqqoslash va qamrov bilan ochiladi, hikoya profili emas.",
  openLink: "Ochish",
  registryCount: "Reyestrda {count} ob’ekt",
  topicsWithEvidence: "Dalil bilan {connected} / {total} mavzu",
  statusNoSourceConnected: "Manba ulanmagan",
  statusNotYetAvailable: "Hali mavjud emas",
  statusReviewPending: "Ko‘rib chiqish kutilmoqda",
  statusAvailableNow: "Hozir mavjud",
  statusLimitedEvidence: "Cheklangan dalil",
  statusAvailableInformation: "Mavjud ma’lumot",
  registeredDomainFallback: "Ro‘yxatdan o‘tgan indikator sohasi.",
} as const;

export const INVESTOR_WORKSPACE_UZ = {
  versionLabel: "Investor ish maydoni",
  heroTitle: "Investor intellekt ish maydoni",
  heroSubtitle: "Tekshiruv doirasini aniqlash uchun dalil tayyorgarligi",
  heroDescription:
    "Mamlakatlar, sektorlar, kompaniyalar, universitetlar, xaridlar, infratuzilma, savdo va investitsiya muhiti bo‘yicha dalil tayyorgarligini o‘rganing. “Bu yerga investitsiya qiling” tavsiyalari yo‘q — faqat manba va indikator holati.",
  metricEvidenceDomains: "Dalil sohalari",
  metricAvailableInformation: "Mavjud ma’lumot",
  metricSourcesConnected: "Ulangan manbalar",
  projectEntryDescription:
    "Haqiqiy investitsiya savolingizni quyidagi makro, savdo va infratuzilma dalillari bilan kuzating — ballar yoki tavsiyalar yo‘q, faqat o‘z dalillaringiz, qaydlaringiz va bitta loyihaga biriktirilgan hisobot.",
  sectionInvestmentEvidenceHeading: "Investitsiya dalillari",
  sectionInvestmentEvidenceDescription: "Makroiqtisodiyot, savdo, xaridlar va infratuzilma mavzulari.",
  sectionOfficialSourcesHeading: "Rasmiy manbalar",
  sectionOfficialSourcesDescription: "Investitsiya ko‘rib chiqishi uchun rasmiy manbalar.",
  sectionOpportunityStatusHeading: "Imkoniyat holati",
  sectionOpportunityStatusDescription: "Mavzu bo‘yicha holat — faqat ma’lumot, tavsiya emas.",
  ledgerAria:
    "Investor dalil kitobi: {count} investitsiya sohasi; chiziq uzunligi har bir sohadagi indikator ulanish nisbatini ko‘rsatadi",
  entityLinks: {
    countries: {
      label: "Davlatlar",
      description: "Davlat reyestri faktlari va indikator qamrovi — investitsiya ballari yo‘q.",
    },
    companies: {
      label: "Kompaniyalar",
      description: "Kompaniya reyestri va sanoat tasnifi tayyorgarligi — bozor tavsiyalari emas.",
    },
    universities: {
      label: "Universitetlar",
      description: "Universitet reyestri va tadqiqot indikator holati — reyting jadvallari emas.",
    },
  },
  domains: {
    economy: {
      title: "Iqtisodiyot",
      purpose: "Rasmiy statistika asosida makroiqtisodiy holatni tavsiflash.",
    },
    investment: {
      title: "Investitsiya",
      purpose: "Rasmiy moliyaviy va TSI manbalaridan investitsiya muhiti dalilini kuzatish.",
    },
    trade: {
      title: "Savdo",
      purpose: "Rasmiy bojxona statistikasidan savdo oqimlari va bojlarni hujjatlashtirish.",
    },
    industry: {
      title: "Sanoat",
      purpose: "Rasmiy sektor va ishlab chiqarish ma’lumotlari asosida sanoat tuzilmasini baholash.",
    },
    infrastructure: {
      title: "Infratuzilma",
      purpose: "Rasmiy infratuzilma reyestrlaridan aktivlarni o‘lchash.",
    },
    energy: {
      title: "Energetika",
      purpose: "Rasmiy agentliklardan energiya ta’minoti va o‘tish dalilini kuzatish.",
    },
    employment: {
      title: "Bandlik",
      purpose: "Rasmiy statistika idoralari ma’lumotlari asosida mehnat bozori dalilini baholash.",
    },
    "digital-development": {
      title: "Raqamli rivojlanish",
      purpose: "Rasmiy AKT manbalaridan raqamli infratuzilma va aloqani hujjatlashtirish.",
    },
    "public-procurement": {
      title: "Davlat xaridlari",
      purpose: "Rasmiy portal yozuvlaridan xarid shaffofligini kuzatish.",
    },
    "budget-transparency": {
      title: "Byudjet shaffofligi",
      purpose: "Rasmiy byudjet ochiq portallaridan moliyaviy ochiqlikni baholash.",
    },
  },
  sourceCoverage: {
    "world-bank": "Global — makroiqtisodiyot, rivojlanish va infratuzilma indikatorlari",
    imf: "Global — moliyaviy, pul-kredit va to‘lov balansi statistikasi",
    oecd: "A’zo iqtisodiyoti — siyosat, savdo va investitsiya statistikasi",
    "national-statistics-offices": "Milliy — rasmiy statistika va ro‘yxatga olish ma’lumotlari",
    "official-procurement-portals": "Milliy — davlat xaridlari ochiq ma’lumotlari",
    "national-open-budget-portals": "Milliy — byudjet va moliyaviy shaffoflik portallari",
    "cbai-local-registry": "Qurilmada — CBAI reyestri va katalog holati",
  },
} as const;

export const WORKSPACE_SHARED_RU = {
  entityLinksHeading: "Ссылки на объекты",
  entityLinksDescription:
    "Переход к маршрутам объектной аналитики — только факты реестра и статус покрытия. Порядок работы сохраняется: страница объекта открывается с сопоставлениями и покрытием, а не с нарративным профилем.",
  openLink: "Открыть",
  registryCount: "{count} объект{plural} в реестре",
  topicsWithEvidence: "{connected} / {total} тем{topicPlural} с доказательствами",
  statusNoSourceConnected: "Источник не подключён",
  statusNotYetAvailable: "Пока недоступно",
  statusReviewPending: "Ожидает проверки",
  statusAvailableNow: "Доступно сейчас",
  statusLimitedEvidence: "Ограниченные доказательства",
  statusAvailableInformation: "Доступная информация",
  registeredDomainFallback: "Зарегистрированная область индикаторов.",
} as const;

export const INVESTOR_WORKSPACE_RU = {
  versionLabel: "Рабочее пространство инвестора",
  heroTitle: "Рабочее пространство инвестиционной аналитики",
  heroSubtitle: "Готовность доказательств для определения объёма due diligence",
  heroDescription:
    "Изучите готовность доказательств по странам, секторам, компаниям, университетам, закупкам, инфраструктуре, торговле и инвестиционному климату. Без рекомендаций «инвестируйте сюда» — только статус источников и индикаторов.",
  metricEvidenceDomains: "Области доказательств",
  metricAvailableInformation: "Доступная информация",
  metricSourcesConnected: "Подключённые источники",
  projectEntryDescription:
    "Отслеживайте реальный инвестиционный вопрос на фоне макро-, торговых и инфраструктурных доказательств ниже — без оценок или рекомендаций, только ваши доказательства, заметки и отчёт в одном проекте.",
  sectionInvestmentEvidenceHeading: "Инвестиционные доказательства",
  sectionInvestmentEvidenceDescription: "Макроэкономика, торговля, закупки и инфраструктура.",
  sectionOfficialSourcesHeading: "Официальные источники",
  sectionOfficialSourcesDescription: "Официальные источники для инвестиционного обзора.",
  sectionOpportunityStatusHeading: "Статус возможностей",
  sectionOpportunityStatusDescription: "Статус по темам — только информация, не рекомендации.",
  ledgerAria:
    "Журнал доказательств инвестора: {count} инвестиционных областей; длина отметки — доля подключённых индикаторов",
  entityLinks: {
    countries: {
      label: "Страны",
      description: "Факты реестра стран и покрытие индикаторами — без инвестиционных баллов.",
    },
    companies: {
      label: "Компании",
      description: "Реестр компаний и готовность отраслевой классификации — не рыночные рекомендации.",
    },
    universities: {
      label: "Университеты",
      description: "Реестр университетов и статус исследовательских индикаторов — не рейтинговые таблицы.",
    },
  },
  domains: {
    economy: { title: "Экономика", purpose: "Описание макроэкономических условий по официальной статистике." },
    investment: { title: "Инвестиции", purpose: "Отслеживание доказательств инвестклимата из официальных фискальных и ПИИ источников." },
    trade: { title: "Торговля", purpose: "Документирование торговых потоков по таможенной статистике." },
    industry: { title: "Промышленность", purpose: "Оценка промышленной структуры по официальным отраслевым данным." },
    infrastructure: { title: "Инфраструктура", purpose: "Измерение инфраструктурных активов по официальным реестрам." },
    energy: { title: "Энергетика", purpose: "Отслеживание доказательств энергоснабжения из официальных агентств." },
    employment: { title: "Занятость", purpose: "Оценка рынка труда по данным статистических ведомств." },
    "digital-development": { title: "Цифровое развитие", purpose: "Документирование цифровой инфраструктуры из официальных ИКТ источников." },
    "public-procurement": { title: "Госзакупки", purpose: "Отслеживание прозрачности закупок по официальным порталам." },
    "budget-transparency": { title: "Прозрачность бюджета", purpose: "Оценка фискальной открытости по порталам раскрытия бюджета." },
  },
  sourceCoverage: {
    "world-bank": "Глобально — макроэкономика, развитие и инфраструктурные индикаторы",
    imf: "Глобально — фискальная, монетарная статистика и платёжный баланс",
    oecd: "Экономики-члены — политика, торговля и инвестиционная статистика",
    "national-statistics-offices": "Национально — официальная статистика и перепись",
    "official-procurement-portals": "Национально — раскрытие государственных закупок",
    "national-open-budget-portals": "Национально — порталы бюджетной прозрачности",
    "cbai-local-registry": "На устройстве — реестр и статус каталога CBAI",
  },
} as const;

export const WORKSPACE_SHARED_TR = {
  entityLinksHeading: "Varlık bağlantıları",
  entityLinksDescription:
    "Varlık zekâsı rotalarına gidin — yalnızca kayıt gerçekleri ve kapsam durumu. Bu çalışma alanının düzeni korunur: varlık sayfası anlatı profili değil, önce karşılaştırmalar ve kapsamla açılır.",
  openLink: "Aç",
  registryCount: "Kayıtta {count} varlık",
  topicsWithEvidence: "Kanıt olan {connected} / {total} konu",
  statusNoSourceConnected: "Kaynak bağlı değil",
  statusNotYetAvailable: "Henüz mevcut değil",
  statusReviewPending: "İnceleme bekliyor",
  statusAvailableNow: "Şimdi mevcut",
  statusLimitedEvidence: "Sınırlı kanıt",
  statusAvailableInformation: "Mevcut bilgi",
  registeredDomainFallback: "Kayıtlı gösterge alanı.",
} as const;

export const INVESTOR_WORKSPACE_TR = {
  versionLabel: "Yatırımcı çalışma alanı",
  heroTitle: "Yatırımcı zekâ çalışma alanı",
  heroSubtitle: "Due diligence kapsamı için kanıt hazırlığı",
  heroDescription:
    "Ülkeler, sektörler, şirketler, üniversiteler, tedarik, altyapı, ticaret ve yatırım iklimi için kanıt hazırlığını inceleyin. “Buraya yatırım yapın” önerileri yok — yalnızca kaynak ve gösterge durumu.",
  metricEvidenceDomains: "Kanıt alanları",
  metricAvailableInformation: "Mevcut bilgi",
  metricSourcesConnected: "Bağlı kaynaklar",
  projectEntryDescription:
    "Gerçek bir yatırım sorusunu aşağıdaki makro, ticaret ve altyapı kanıtlarına karşı izleyin — puan veya öneri yok; yalnızca kendi kanıtlarınız, notlarınız ve tek bir projeye bağlı rapor.",
  sectionInvestmentEvidenceHeading: "Yatırım kanıtları",
  sectionInvestmentEvidenceDescription: "Makro, ticaret, tedarik ve altyapı konuları.",
  sectionOfficialSourcesHeading: "Resmî kaynaklar",
  sectionOfficialSourcesDescription: "Yatırım incelemesi için resmî kaynaklar.",
  sectionOpportunityStatusHeading: "Fırsat durumu",
  sectionOpportunityStatusDescription: "Konuya göre durum — yalnızca bilgi, öneri değil.",
  ledgerAria:
    "Yatırımcı kanıt defteri: {count} yatırım alanı; çizgi uzunluğu her alanın gösterge bağlantı oranını gösterir",
  entityLinks: {
    countries: {
      label: "Ülkeler",
      description: "Ülke kayıt gerçekleri ve gösterge kapsamı — yatırım puanı yok.",
    },
    companies: {
      label: "Şirketler",
      description: "Şirket kaydı ve sektör sınıflandırma hazırlığı — piyasa önerisi değil.",
    },
    universities: {
      label: "Üniversiteler",
      description: "Üniversite kaydı ve araştırma gösterge durumu — sıralama tabloları değil.",
    },
  },
  domains: {
    economy: { title: "Ekonomi", purpose: "Resmî istatistiklerle makroekonomik koşulları tanımlar." },
    investment: { title: "Yatırım", purpose: "Resmî mali ve DYY kaynaklarından yatırım iklimi kanıtını izler." },
    trade: { title: "Ticaret", purpose: "Resmî gümrük istatistiklerinden ticaret akışlarını belgeler." },
    industry: { title: "Sanayi", purpose: "Resmî sektör verileriyle sanayi yapısını değerlendirir." },
    infrastructure: { title: "Altyapı", purpose: "Resmî altyapı kayıtlarından varlıkları ölçer." },
    energy: { title: "Enerji", purpose: "Resmî kurumlardan enerji arzı kanıtını izler." },
    employment: { title: "İstihdam", purpose: "Resmî istatistik kurumlarından işgücü piyasası kanıtını değerlendirir." },
    "digital-development": { title: "Dijital gelişim", purpose: "Resmî BİT kaynaklarından dijital altyapıyı belgeler." },
    "public-procurement": { title: "Kamu tedariki", purpose: "Resmî portallardan tedarik şeffaflığını izler." },
    "budget-transparency": { title: "Bütçe şeffaflığı", purpose: "Resmî bütçe açıklama portallarından mali açıklığı değerlendirir." },
  },
  sourceCoverage: {
    "world-bank": "Küresel — makroekonomi, kalkınma ve altyapı göstergeleri",
    imf: "Küresel — mali, parasal ve ödemeler dengesi istatistikleri",
    oecd: "Üye ekonomiler — politika, ticaret ve yatırım istatistikleri",
    "national-statistics-offices": "Ulusal — resmî istatistik ve sayım verileri",
    "official-procurement-portals": "Ulusal — kamu tedarik açıklamaları",
    "national-open-budget-portals": "Ulusal — bütçe ve mali şeffaflık portalları",
    "cbai-local-registry": "Cihazda — CBAI kayıt ve katalog durumu",
  },
} as const;
