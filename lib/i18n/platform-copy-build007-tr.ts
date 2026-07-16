/** BUILD-007 — son üretim cilası (Türkçe). */

export const ACCOUNT_PAGE_TR = {
  pageDescription:
    "Gerçek bir yerel hesap — Projeleriniz, Yer İmleri ve Son Etkinlik, bu tarayıcıyı kullanan diğer herkesten ayrı kalır.",
  cloudAccount: "Bulut Hesabı",
  deviceLocalAccount: "Cihaza Özel Hesap",
  cloudSignedInActive: "●",
  localSignedInActive: "●",
  modeCloud: "Bulut Hesabı — cihazlar arasında senkronize",
  modeLocal: "Cihaza Özel Hesap — yalnızca bu tarayıcı",
  modeSignedOut: "Oturum Kapalı",
  cloudNotice:
    "Bulut hesabı — gerçek bir sunucu (Supabase) tarafından doğrulanır. Projeleriniz, Yer İmleriniz ve Raporlarınız bu e-posta ile giriş yaptığınız her tarayıcı ve cihazda senkronize olur.",
  localNotice:
    "Cihaza özel hesap — kimlik bilgileri yalnızca bu tarayıcıda hashlenir ve tuzlanır. Sunucuya hiçbir şey gönderilmez. Site verilerini temizlemek bu hesabı kaldırır.",
  emailNotConfirmed:
    "E-postanız henüz onaylanmadı. Onay bağlantısı için gelen kutunuzu kontrol edin — onaylayana kadar bazı bulut özellikleri sınırlı olabilir.",
  continueWorking: "Çalışmaya Devam Et",
  signOutCloud: "Buluttan Çık",
  signOut: "Çıkış Yap",
  signIn: "Giriş Yap",
  createCloudAccount: "Bulut hesabı oluştur",
  resetPassword: "Parolayı sıfırla",
  cloudSubtitle:
    "Gerçek, sunucu tarafından doğrulanmış hesap — Projelerinizi, Yer İmlerinizi ve Raporlarınızı her cihazda senkronize edin.",
  cloudNotConfigured:
    "Bulut hesapları bu dağıtımda henüz yapılandırılmadı (Supabase projesi bağlı değil). Aşağıdaki Cihaza Özel Hesabı kullanabilir veya göndermeyi deneyebilirsiniz — uygulama buluta ulaşamazsa bunu açıkça söyler.",
  signInTab: "Giriş Yap",
  createAccountTab: "Hesap Oluştur",
  email: "E-posta",
  emailPlaceholder: "siz@example.com",
  password: "Parola",
  passwordSignUpPlaceholder: "En az 8 karakter",
  passwordSignInPlaceholder: "Parolanız",
  forgotPassword: "Parolayı unuttunuz mu?",
  backToSignIn: "← Girişe dön",
  pleaseWait: "Lütfen bekleyin…",
  sendResetLink: "Sıfırlama Bağlantısı Gönder",
  resetLinkSent: "Bu e-posta için bir hesap varsa, parola sıfırlama bağlantısı gönderildi.",
  accountCreatedConfirmEmail:
    "Hesap oluşturuldu. Tüm bulut özellikleri kullanılabilir olmadan önce e-postanızı onaylamak için gelen kutunuzu kontrol edin.",
  name: "Ad",
  namePlaceholder: "Adınız",
  organizationOptional: "Kuruluş (isteğe bağlı)",
  organizationPlaceholder: "ör. bir üniversite, şirket veya ajans",
  localSignInTitle: "Giriş Yap",
  localCreateTitle: "Yerel hesap oluştur",
  localSubtitle:
    "Projelerinizi, Yer İmlerinizi ve Son Etkinliğinizi bu tarayıcıyı kullanan diğer herkesten ayrı tutmak için giriş yapın. Yalnızca bu cihazda kalır — cihazlar arası senkronizasyon için Bulut Hesabı kullanın.",
  projects: "Projeler",
  bookmarks: "Yer İmleri",
  memberSince: "Üyelik tarihi",
} as const;

export const REPORTS_CENTER_TR = {
  continuingFor: "İnceleme devam ediyor",
  continuingBody: "Profil incelemeniz burada devam ediyor — aşağıdan bir rapor türü seçin.",
  backToProfile: "← Profile dön",
  pageDescription: "Bugün neleri açabileceğiniz — her rapor türü için gerekli resmi bilgi.",
  whatCanIOpen: "Bugün neyi açabilirim?",
  evidenceRequired: "Gerekli kanıtlar",
  openRelatedProfile: "İlgili profili aç →",
  savedCount: "Kaydedilen Raporlarınız ({count})",
  savedAt: "Kaydedildi {date}",
  delete: "Sil",
} as const;

export const RESEARCH_WORKSPACE_TR = {
  title: "Araştırma Çalışma Alanı",
  backToResearch: "← Araştırma İstihbaratına Dön",
  shellNotice:
    "Bu salt okunur bir çalışma alanı kabuğudur. Canlı kanıtlar, iş birliği ve analiz henüz bağlı değil.",
  humanReviewNotice:
    "Gelecekteki çalışma alanı çıktısı bir kararı desteklemeden önce insan incelemesi gerekir.",
  topicNotFoundPrefix: '"{topicId}" araştırma kataloğunda bir konu değil — bağlantıyı kontrol edin veya',
  browseAllTopics: "tüm araştırma konularına göz atın",
  selectedTopic: "Seçilen araştırma konusu:",
  continueReview: "— araştırma incelemesine devam edin.",
  filterTopics: "Konuları filtrele...",
  filterTopicsAria: "Araştırma konuları",
  statusShellAvailable: "Çalışma alanı kabuğu mevcut",
  statusFuture: "Gelecek çalışma alanı",
  statusNotConnected: "Henüz bağlı değil",
  lifecycleDiscover: "Keşfet",
  lifecycleDiscoverDesc: "Araştırma kataloğunu ve konu profillerini inceleyin.",
  lifecycleUnderstand: "Anla",
  lifecycleUnderstandDesc: "Yöntemleri, kanıt türlerini ve bilgi organizasyonunu inceleyin.",
  lifecycleReviewEvidence: "Kanıtları İncele",
  lifecycleReviewEvidenceDesc:
    "Kaynaklar bağlandığında yapılandırılmış kanıt incelemesi — insan incelemesi gerekir.",
  lifecycleIdentifyGaps: "Boşlukları Belirle",
  lifecycleIdentifyGapsDesc: "Açık soruları ve negatif sonuçları yapılandırılmış nesneler olarak takip edin.",
  lifecycleFutureCollaboration: "Gelecek İş Birliği",
  lifecycleFutureCollaborationDesc: "Gelecek iş birliği alanı — bugün aktif değil.",
} as const;

export const RESEARCH_HOME_TR = {
  statusHeading: "Araştırma İstihbaratı durumu",
  availableToday: "Bugün mevcut",
  notAvailableYet: "Henüz mevcut değil",
  openWorkspace: "Araştırma Çalışma Alanını Aç",
  pageDescription:
    "Küresel Araştırma Ağı'nda katalog araştırma konularını ve meta veri bağlantılarını keşfedin.",
  statusLabel: "Araştırma İstihbaratı: Geliştiriliyor",
  workspaceEyebrow: "Araştırma çalışma alanı",
  workspaceTitle: "Yapılandırılmış araştırma çalışma alanı",
  workspaceBody:
    "Bir konuyu katalog, not defteri, zaman çizelgesi ve grafik perspektiflerinden keşfedin — canlı kanıtlar bağlanana kadar salt okunur kabuk.",
  availableTodayItems: [
    "Ekosistem vizyonu ve ürün yönü",
    "Araştırma konuları kataloğu (salt okunur)",
    "Konu keşfi giriş noktası (bu sayfa)",
    "Kamusal araştırma istihbaratı konumlandırması",
    "Kamusal İstihbarat'taki üniversite profillerine bağlantı",
  ],
  notAvailableYetItems: [
    "Canlı bilimsel veritabanları",
    "Yayın arama ve tam metin erişimi",
    "Araştırmacı profilleri ve iş birliği",
    "Canlı deneyler ve laboratuvar verileri",
    "Yapay zeka tarafından oluşturulan araştırma özetleri",
  ],
} as const;

export const GRAPH_PLATFORM_TR = {
  eyebrow: "Bilgi Grafiği",
  headline: "Temel istihbarat navigasyon katmanı",
  explanation:
    "Bilgi Grafiği, doğrulanmış yerel katalog ilişkilerini kullanarak varlıkların nasıl bağlandığını açıklar. Kanıt desteklemediği sürece bir bağlantının neden var olduğunu asla söylemez.",
  relationshipUnavailable: "İlişki verisi bağlı değil.",
  noSelectionPrompt:
    "Kanıt durumunu, ilişki sayısını ve bağlı kayıtları görmek için grafikte bir varlık seçin.",
  searchPlaceholder: "Ada veya ülkeye göre ara…",
  registryNodes: "Kayıt düğümleri",
  verifiedEdges: "Doğrulanmış kenarlar",
  registryAvailable: "Kayıt mevcut",
  evidenceConnected: "Kanıt bağlı",
  evidenceUnavailable: "Kanıt kullanılamıyor",
  insufficientEvidence: "Yetersiz Kanıt",
  notConnected: "Kanıt Kaynağı Bağlı Değil",
} as const;

export const TRUST_DATA_SOURCES_TR = {
  un: "Ülke düzeyinde kurumsal ve antlaşma raporlaması.",
  worldBank: "Ülke ve ekonomik göstergeler.",
  imf: "Finansal ve makroekonomik raporlama.",
  who: "Sağlık sistemi kapsamı.",
  unesco: "Eğitim ve araştırma istatistikleri.",
  ilo: "İşgücü piyasası istatistikleri.",
  itu: "Dijital bağlantı istatistikleri.",
  oecd: "Ekonomik iş birliği ve kalkınma verileri.",
  ocp: "Kamu alımı şeffaflığı.",
  nationalStats: "Ülke bazında resmi istatistikler.",
  procurement: "Ülke bazında alım açıklamaları.",
  financeAudit: "Ülke bazında bütçe şeffaflığı.",
} as const;

export const PREVIEW_PAGES_TR = {
  inDevelopmentEyebrow: "Geliştiriliyor",
  agentsTitle: "Yapay Zeka Ajanları",
  agentsDescription: "Bu platform için planlanan ajan yetenekleri — henüz kullanılamıyor.",
  agentsCapabilities: "Ajan Yetenekleri",
  workflowsTitle: "İş Akışları",
  workflowsDescription: "İş akışı oluşturucu yakında — henüz kullanılamıyor.",
  workflowsHeading: "İş akışı oluşturucu yakında",
  workflowsBody:
    "İnsan onaylı kapılarla otomatik iş akışlarını tasarlayın, dağıtın ve izleyin.",
  coreTitle: "CBAI Core",
  coreDescription:
    "Temel çıkarım ve ajan orkestrasyonu bu dağıtımda aktif değil. Canlı kayıt istihbaratı için aşağıdaki modülleri kullanın.",
  governancePreview:
    "Yönetişim çalışma alanı — erken önizleme. Kanıt modülleri bağlanana kadar derinlik sınırlıdır.",
  investorPreview:
    "Yatırımcı çalışma alanı — erken önizleme. Yatırım önerisi üretilmez.",
  citizenPreview:
    "Vatandaş çalışma alanı — erken önizleme. Yalnızca kamuya açık bilgi — profesyonel tavsiye değildir.",
} as const;

export const VALIDATION_TR = {
  passwordsDoNotMatch: "Parolalar eşleşmiyor.",
  requiredField: "Bu alan zorunludur.",
} as const;

export const ASSISTANT_VOICE_TR = {
  savedToWorkspace: '"{name}" çalışma alanınıza kaydedildi.',
  nothingToSaveYet: "Henüz kaydedilecek bir şey yok — önce bir ülke, şirket veya üniversite profili açın.",
  uploadNotAvailable: "Dosya yükleme bağlı bir alım hattı gerektirir — henüz kullanılamıyor.",
  speechDetected: "Konuşma algılandı — transkripti aşağıda inceleyin.",
  commandCenterAria: "CBAI Kişisel Operatör komut merkezi",
  contextPrefix: "Bağlam:",
  operatorContextTitle: "Operatör bağlamı: {name}",
} as const;

export const MY_WORK_EXT_TR = {
  continueWorking: "Çalışmaya Devam Et",
  recentlyViewed: "Son Görüntülenenler",
  reportsSection: "Raporlar",
  reportsCenterLink: "Rapor Merkezi",
  reportsCenterDetail: "Profil ve karşılaştırma incelemesi için {count} rapor türü tanımlı.",
  evidenceReviews: "Kanıt İncelemeleri",
  evidenceReviewsEmpty:
    "Kişisel inceleme geçmişi henüz bağlı değil. Platform genelinde {total} kanıt kaynağından {connected} tanesi bağlı — açın",
  evidenceLink: "Kanıt",
  evidenceReviewsSuffix: "mevcut durumu incelemek için.",
  savedWork: "Kaydedilen Çalışma",
  signInBrowserHint: "bu tarayıcıyı kullanan diğerlerinden çalışmanızı ayırmak için.",
  signInAccountHint:
    "Projelerinizi ve Yer İşaretlerinizi bu tarayıcıyı kullanan diğerlerinden ayırmak için.",
  continueResearchWorkspace: "Araştırmaya devam et",
  continueResearchWorkspaceDetail: "Kaldığınız yerden kanıt incelemesi ve notlara devam edin.",
  continueResearchCatalog: "Araştırma Kataloğu",
  continueResearchCatalogDetail: "Araştırma konularını, görevleri ve kanıt durumunu gözden geçirin.",
  continueEvidence: "Kanıt",
  continueEvidenceDetail: "Profiller genelinde resmi kaynak durumunu inceleyin.",
  onboardingExploreResearch: "Araştırmayı Keşfet",
  onboardingExploreCountries: "Ülkeleri Keşfet",
  onboardingSearchEvidence: "Kanıt Ara",
  onboardingConfigureOperator: "Tercihleri ayarla",
  onboardingOpenTrust: "Güven Merkezini Aç",
  loading: "Yükleniyor…",
} as const;

export const RESEARCH_CATALOG_TR = {
  catalogEyebrow: "Araştırma konuları kataloğu",
  catalogTitle: "Araştırma alanlarını ve konularını gözden geçirin",
  catalogDescription:
    "Her araştırma konusu için ayrıntı sayfalarıyla yapılandırılmış salt okunur katalog. Canlı veritabanları, yayınlar veya araştırmacı profilleri bağlı değil.",
  filterLabel: "Araştırma konularını filtrele",
  filterPlaceholder: "Konu, yöntem, alan veya kanıt türüne göre filtrele...",
  showingCount: "{total} konudan {filtered} tanesi gösteriliyor",
  noMatch: "Filtrenize uyan araştırma konusu yok.",
  tryDifferent: "Farklı bir alan veya arama terimi deneyin.",
  clearFilters: "Filtreleri temizle",
  methods: "Yöntemler",
  evidenceTypes: "Kanıt türleri",
  futureWorkspace: "Gelecek çalışma alanı",
  openTopic: "Konuyu aç",
  topicStatus: {
    catalog_available: "Katalogda mevcut",
    workspace_not_available: "Çalışma alanı mevcut değil",
    evidence_not_connected: "Kanıt bağlı değil",
  },
} as const;

export const GRAPH_EXTENDED_TR = {
  whatCanILearn: "Ne öğrenebilirim?",
  personaGuidanceAria: "Bilgi grafiği persona rehberi",
  pipelineAria: "Bilgi grafiği Varlıktan Karar Zekasına nasıl bağlanır",
  pipelineStages: ["Varlık", "İlişki", "Kanıt", "Akıl Yürütme", "Karar Zekası"] as const,
  personas: {
    citizen: {
      title: "Vatandaş",
      whatCanILearn:
        "Hangi kamu kurumları ve şirketler üniversitelerle ülke kaydı üzerinden bağlantılı — popülerlik puanları olmadan.",
    },
    investor: {
      title: "Yatırımcı",
      whatCanILearn:
        "Yalnızca katalog düzeyinde varlık yakınlığı. Yatırım veya ortaklık iddiaları bağlı finansal kanıt gerektirir.",
    },
    government: {
      title: "Hükümet",
      whatCanILearn:
        "Bağlandığında ülke kaydından hükümet formu etiketleri. Grafik gezinmesinden siyasi öneriler yok.",
    },
    student: {
      title: "Öğrenci",
      whatCanILearn:
        "Üniversite konumu ve aynı ülkedeki şirket listeleri — sıralama veya istihdam puanları değil.",
    },
    researcher: {
      title: "Araştırmacı",
      whatCanILearn: "Her kenar için kanıt durumuyla dışa aktarılabilir ilişki listesi.",
    },
    academic: {
      title: "Akademisyen",
      whatCanILearn: "CBAI'nin katalog türevli bağlantıları doğrulanmış iş birliği kanıtlarından nasıl ayırdığı.",
    },
  },
  trustPillars: {
    evidence: {
      title: "Kanıt",
      description:
        "Kenarlar yalnızca yerel kayıtlar doğrulanabilir bağlantı sağladığında vardır. Çıkarımsal veya ağırlıklı ilişkiler yok.",
    },
    methodology: {
      title: "Metodoloji",
      description:
        "Graf oluşturucu düğümleri varlık adaptörlerinden, kenarları katalog kurallarından türetir — yapay zeka kümelemesi değil.",
    },
    neutrality: {
      title: "Tarafsızlık",
      description: "Graf yol önermez, varlıkları sıralamaz veya ortaklıkları onaylamaz.",
    },
    transparency: {
      title: "Şeffaflık",
      description:
        "Her ilişki durumu gösterir: katalogdan kanıt mevcut veya gelecek türler için kanıt eksik.",
    },
  },
} as const;

export const ENTITY_UI_TR = {
  notAssessed: "Değerlendirilmedi",
  notAvailable: "Mevcut değil",
  notConnected: "Bağlı değil",
  officialWebsite: "Resmi web sitesi",
  publicationDate: "Yayın tarihi",
  openSourceLink: "Açık kaynak bağlantısı",
  connected: "Bağlı",
  planned: "Planlandı",
  noVerifiedData: "Doğrulanmış veri yok.",
  noVerifiedInfo: "Doğrulanmış bilgi mevcut değil.",
  benchmarkCountry: "Tam profili okumadan önce bu ülkeyi kayıttaki diğerleriyle karşılaştırın.",
  benchmarkCompany: "Tam profili okumadan önce bu şirketi kayıttaki diğerleriyle karşılaştırın.",
  noRelationshipsCountry:
    "Henüz doğrulanmış ilişki yok — katalogdaki bir şirket, üniversite veya araştırma konusu bu ülkeye atıfta bulunduğunda bağlantılar görünür.",
  noRelationshipsCompany:
    "Henüz doğrulanmış ilişki yok — katalogdaki bir ülke, üniversite veya araştırma konusu bu şirkete atıfta bulunduğunda bağlantılar görünür.",
  searchCountries: "Ülkeleri ara…",
  dataStatusLegend: "Veri durumu açıklaması",
  searchResults: "Arama sonuçları",
} as const;

export const PROJECT_UI_TR = {
  researchQuestion: "Araştırma Sorusu",
  objectives: "Hedefler",
  notes: "Notlar",
  tasks: "Görevler",
  openQuestions: "Açık Sorular",
  timeline: "Zaman Çizelgesi",
  entities: "Varlıklar",
  noResearchQuestion: "Henüz araştırma sorusu kaydedilmedi.",
  noObjectives: "Henüz hedefler kaydedilmedi.",
  noEntitiesLinked: "Bu projeye henüz varlık bağlanmadı.",
  noRelatedCountry: "Mevcut katalogda ilgili ülke yok.",
  noEvidence: "Henüz kanıt eklenmedi.",
  noNotes: "Henüz not kaydedilmedi.",
  noTasks: "Henüz görev eklenmedi.",
  noOpenQuestions: "Şu anda açık soru yok.",
  noTimeline: "Zaman çizelgesi etkinliği kaydedilmedi.",
} as const;

export const GOVERNANCE_PAGE_TR = {
  title: "Yönetişim",
  description: "Kanıta dayalı kararlar için platform kuralları, standartları ve inceleme süreci.",
  previewNotice:
    "Yönetişim kontrol merkezi — erken önizleme. Kurallar ve inceleme iş akışları henüz tam bağlı değil.",
} as const;
