/** BUILD-008 — varlık istihbaratı, araştırma konusu, yönetişim, raporlar, graf UI, hakkında, parola sıfırlama (Türkçe). */

export const ENTITY_INTELLIGENCE_TR = {
  fromSearch: 'Aramadan: "{query}"',
  comparables: "Karşılaştırılabilirler",
  timelineDetail: "Zaman çizelgesi ayrıntısı",
  intelligenceContext: "İstihbarat Bağlamı",
  relatedEntities: "İlgili varlıklar",
  reports: "Raporlar",
  openQuestions: "Açık sorular",
  availableInformation: "Mevcut bilgi",
  missingInformation: "Eksik bilgi →",
  noOfficialInformation: "Bu profil için henüz resmi bilgi bağlı değil.",
  availableNow: "Şimdi mevcut",
  sourceStatus: "Kaynak durumu",
  sourcesConnected: "kaynak bağlı",
  sourcesConnectedSummary: "{connected} / {total} resmi kaynak{plural} bağlı",
  topicsListedAbove: " · yukarıda {count} konu{topicPlural} listelenmiş",
  topicsAvailableNow: " · şimdi {count} konu{topicPlural} mevcut",
  compareDefaultHeading: "Karşılaştır",
  compareDefaultDescription: "Bu profil için yan yana resmi bilgi.",
  generateReport: "Rapor oluştur",
  hideReport: "Raporu gizle",
  openReportsCenter: "Rapor Merkezini Aç",
  entityTypeCountry: "Ülke",
  entityTypeCompany: "Şirket",
  entityTypeUniversity: "Üniversite",
  factGovernment: "Hükümet",
  factFounded: "Kuruluş",
  factOfficialWebsite: "Resmi web sitesi",
  governanceLensTitle: "Yönetişim İstihbaratı — önce kurumsal kayıt",
  governanceLensBody:
    "Hükümet çalışma alanından girildi — aşağıdaki kanıt zaman çizelgesi ve kurumsal kapsama, anlatı profilinden önce gelir.",
  investorLensTitle: "Ekonomik İstihbarat — önce karşılaştırılabilirler",
  investorLensBody:
    "Yatırımcı çalışma alanından girildi — aşağıdaki karşılaştırılabilirler ve gösterge kapsamı, anlatı profilinden önce gelir.",
} as const;

export const SOURCE_COVERAGE_TR = {
  countryHeading: "Kaynak Kapsamı",
  countryDescription:
    "CBAI Kanıt Altyapısından resmi kanıt kaynakları — yalnızca bağlantı durumu, canlı API entegrasyonu yok.",
  companyHeading: "Resmi Kaynak Kapsamı",
  companyDescription:
    "Bu şirket profili için kaynak başına bağlantı durumu — canlı API entegrasyonu yok.",
  universityHeading: "Resmi Kaynak Kapsamı",
  universityDescription:
    "Bu üniversite profili için kaynak başına bağlantı durumu — canlı API entegrasyonu yok.",
  publisher: "Yayıncı",
  confidence: "Güven",
  citation: "Alıntı",
  supportedIndicators: "{count} desteklenen gösterge{plural}",
} as const;

export const ENTITY_RELATIONSHIPS_TR = {
  countryHeading: "İlişkiler",
  countryDescription:
    "Aynı ülke kaydındaki şirket ve üniversitelere doğrulanmış katalog bağlantıları.",
  countryEmpty:
    "Henüz doğrulanmış ilişki yok — katalogdaki bir şirket, üniversite veya araştırma konusu bu ülkeye referans verdiğinde bağlantılar görünür.",
  exploreCompanies: "Şirketleri Keşfet",
  exploreUniversities: "Üniversiteleri Keşfet",
  companyHeading: "Bilgi Grafiği",
  companyDescription:
    "Yerel kayıtlardan katalog türetilmiş komşuluk — ortaklık veya rakip iddiaları değil.",
  companyEmpty:
    "Henüz doğrulanmış ilişki yok — katalogdaki bir ülke, üniversite veya araştırma konusu bu şirkete referans verdiğinde bağlantılar görünür.",
  partnerClaims: "Ortak / rakip iddiaları",
  partnerClaimsNotShown: "Gösterilmiyor — bağlı ortaklık kanıtı gerekir.",
  universityHeading: "Bilgi Grafiği",
  universityDescription:
    "Yerel kayıtlardan katalog bağlantıları — sıralamalar veya istihdam puanları değil.",
  universityEmpty:
    "Henüz doğrulanmış ilişki yok — katalogdaki bir ülke, şirket veya araştırma konusu bu üniversiteye referans verdiğinde bağlantılar görünür.",
  researchPartnerships: "Araştırma merkezleri / ortaklıklar / burslar",
  researchPartnershipsNotShown: "Gösterilmiyor — bağlı bağlılık kanıtı gerekir.",
  relatedEntities: "İlgili Varlıklar",
  verifiedCatalog: "Doğrulanmış yerel katalog",
  evidenceMissing: "Kanıt eksik",
} as const;

export const RESEARCH_TOPIC_TR = {
  backToTopics: "← Araştırma konularına dön",
  humanReviewNotice:
    "Bu konudaki herhangi bir bilimsel iddia bir kararı desteklemeden önce insan incelemesi gerekir.",
  experienceNotice:
    "Araştırma İstihbaratı şu anda katalog bilgisi ve doğrulanmış platform modellerini kullanır. Canlı bilimsel veritabanları henüz bağlı değil.",
  overviewEyebrow: "Araştırma genel bakışı",
  quickOverview: "Hızlı genel bakış",
  topicLabel: "Konu",
  domainLabel: "Alan",
  currentStatus: "Mevcut durum",
  methods: "Yöntemler",
  evidenceTypes: "Kanıt türleri",
  relatedTopics: "İlgili konular",
  noRelatedTopics: "Katalog meta verilerinden ilgili konu yok.",
  humanReview: "İnsan incelemesi",
  humanReviewDetail: "Herhangi bir katalog bağlantısı araştırma kararını desteklemeden önce gerekir.",
  topicsHeading: "Araştırma konuları",
  topicCount: "{count} konu",
} as const;

export const GOVERNANCE_CENTER_TR = {
  totalRules: "Toplam kural",
  criticalRules: "Kritik kurallar",
  ruleCategories: "Kural kategorileri",
  validationStepsLabel: "Doğrulama adımları",
  reviewStandards: "İnceleme standartları",
  reviewStandardsBody: "Konuya göre gruplandırılmış platform kuralları — manuel inceleme tanımları.",
  ruleCount: "{count} kural{plural}",
  constitutionalPrinciples: "Anayasal İlkeler",
  constitutionalPrinciplesBody: "Tüm platform modüllerinin CBAI Anayasasından devraldığı üst ilkeler.",
  reviewProcess: "İnceleme süreci",
  reviewProcessBody: "Sürümler kullanıcılara ulaşmadan önce doğrulama adımları.",
  stepLabel: "Adım {order}",
  relatedTopics: "İlgili konular:",
  pillarsAria:
    "Yönetişim kural kaydı: {categories} kategori, {rules} kural; yükseklik her kategorinin gerçek kural sayısıyla orantılı",
  pillarsCaption:
    "Sütun yüksekliği CBAI kural kaydındaki yönetişim kategorisi başına kayıtlı kural sayısını gösterir — operasyonel performans değil.",
  complianceReportModel: "Uyumluluk Raporu Modeli",
  complianceReportBody:
    "Manuel denetimler ve gelecekteki CI çıktısı için yapısal şablon — burada kontrol yürütülmez.",
  passedRules: "Geçen kurallar",
  passedRulesDetail: "{count} — gelecekteki doğrulayıcılar tarafından doldurulacak",
  failedRules: "Başarısız kurallar",
  failedRulesDetail: "{count} — gelecekteki doğrulayıcılar tarafından doldurulacak",
  warnings: "Uyarılar",
  warningsDetail: "{count} — engellemeyen bulgular",
  recommendations: "Öneriler",
  recommendationsDetail: "{count} — düzeltme rehberi",
  moduleStatus: "Modül ID: {moduleId} · Durum: {status}",
  statusRegistered: "Kayıtlı",
  statusDeclared: "Beyan edildi — otomatik değil",
  categories: {
    constitution: { label: "Anayasa", purpose: "Üst platform ilkeleri — kanıt, tarafsızlık, sıfır demo politikası." },
    evidence: { label: "Kanıt", purpose: "Tüm istihbarat için kaynak, durum ve metodoloji gereksinimleri." },
    entity: { label: "Varlık", purpose: "Ülkeler, Şirketler ve Üniversiteler rotaları için Altın Kural kalıpları." },
    indicator: { label: "Gösterge", purpose: "Kayıt yaşam döngüsü, metodoloji blokları ve gelecekteki puanlama kuralları." },
    ui: { label: "UI", purpose: "Yüzey uyumu — sahte KPI, grafikler, güven veya yapay zeka ifadeleri yok." },
    persona: { label: "Persona", purpose: "Vatandaş, Yatırımcı, Hükümet, Öğrenci, Araştırmacı, Akademisyen için dürüst değer." },
  },
  validationStepContent: {
    "module-proposal": {
      title: "Modül Önerisi",
      description: "Yeni rota veya kütüphane, uygulamadan önce niyet, kapsam ve hedef personaları kaydeder.",
    },
    "standards-check": {
      title: "Standart Kontrolü",
      description: "CBAI Anayasal Standardı ve varlık/UI standartları paketine göre doğrulama.",
    },
    "evidence-check": {
      title: "Kanıt Kontrolü",
      description: "Kaynak atıfı, bağlantı durumu etiketleri ve metodoloji bloklarını onaylama.",
    },
    "persona-check": {
      title: "Persona Kontrolü",
      description: "Altı persona da dürüst mevcut değer ve gelecek yetenek metnini alır.",
    },
    "accessibility-check": {
      title: "Erişilebilirlik Kontrolü",
      description: "Mobile hazır, erişilebilir kurumsal okunabilirlik için gelecekteki WCAG doğrulaması.",
    },
    "release-review": {
      title: "Sürüm İncelemesi",
      description: "Üretim sürümünden önce manuel anayasa denetimi ve uyumluluk raporu onayı.",
    },
  },
  personas: {
    citizen: { title: "Vatandaş", protection: "UI kuralları sahte güven ve siyasi çerçeveyi engeller — vatandaşlar yalnızca dürüst kanıt durumunu görür." },
    investor: { title: "Yatırımcı", protection: "Kanıt kuralları, herhangi bir due diligence metriği görünmeden önce kaynak atıfı gerektirir." },
    government: { title: "Hükümet", protection: "Persona kuralları, hükümete yönelik modüllerde siyasi derecelendirmeler yerine boşluk analizi sağlar." },
    student: { title: "Öğrenci", protection: "Sıfır demo politikası eğitim rotalarında sahte lig tablolarını ve sıralamaları önler." },
    researcher: { title: "Araştırmacı", protection: "Anayasa, araştırma kapsamı için tekrarlanabilir gösterge ID'leri ve kaynak slug'ları zorunlu kılar." },
    academic: { title: "Akademisyen", protection: "Metodoloji-metriklerden önce kuralları, değerlendirmeler gönderilmeden önce alıntılanabilir metodoloji gerektirir." },
  },
  limits: {
    "no-automated-enforcement": {
      title: "Henüz otomatik uygulama yok",
      description: "Kurallar bildirimsel olarak kayıtlı — çalışma zamanı doğrulaması ve CI kapıları gelecekteki iş.",
    },
    "no-runtime-policy-changes": {
      title: "Çalışma zamanında politika değişikliği yok",
      description: "Bu merkez yönetişim mimarisini gösterir — kuralları veya politikaları canlı olarak değiştirmez.",
    },
    "no-hidden-ai": {
      title: "Gizli yapay zeka yok",
      description: "Yönetişim Kontrolü bir yapay zeka model paneli değil — sağlayıcı sağlığı, token metrikleri veya ajan anahtarları yok.",
    },
  },
} as const;

export const REPORTS_MODEL_TR = {
  statuses: {
    notAvailable: "Mevcut değil",
    registryFactsOnly: "Yalnızca kayıt gerçekleri",
    methodologyDefinitionsOnly: "Yalnızca metodoloji tanımları",
    insufficientEvidence: "Yetersiz Kanıt",
    evidenceSourceNotConnected: "Kanıt Kaynağı Bağlı Değil",
    partialLocalRegistry: "Kısmi — yerel kayıt",
    definedInFramework: "Çerçevede tanımlı",
    notApplicable: "Uygulanamaz",
    planned: "Planlandı",
  },
  evidenceRequired: {
    country: "{count} bağlı resmi kaynakları olan kayıtlı ülke göstergesi",
    company: "{count} bağlı resmi kaynakları olan kayıtlı şirket göstergesi",
    university: "{count} bağlı resmi kaynakları olan kayıtlı üniversite göstergesi",
    investor:
      "Resmi kaynaklar genelinde bağlı mali, tedarik ve şirket göstergeleri",
    government: "Metodoloji boşlukları belgelenmiş alan düzeyinde gösterge kapsamı",
    research: "Kaynak atıfı ve durum etiketleriyle dışa aktarılabilir gösterge kaydı",
    academic: "Sürüm referansıyla gösterge başına tam dört alanlı metodoloji",
  },
  reportTypes: {
    "country-intelligence": {
      title: "Ülke İstihbarat Raporu",
      description: "Bağlı kaynaklar ve gösterge metodolojisinden derlenen kanıta dayalı ülke profili.",
      audience: "Analistler, hükümet, araştırmacılar",
    },
    "company-intelligence": {
      title: "Şirket İstihbarat Raporu",
      description: "Şirket kayıt gerçekleri ve gösterge kapsamı — kanıt bağlanana kadar pazar puanları yok.",
      audience: "Yatırımcılar, analistler, tedarik",
    },
    "university-intelligence": {
      title: "Üniversite İstihbarat Raporu",
      description: "Üniversite kaydı ve eğitim göstergesi hazırlığı — lig tabloları değil.",
      audience: "Öğrenciler, akademisyenler, hükümet",
    },
    "investor-brief": {
      title: "Yatırımcı Özeti",
      description: "Due diligence kapsamı için varlıklar arası kanıt özeti — bağlı mali ve pazar kaynakları gerekir.",
      audience: "Yatırımcılar",
    },
    "government-brief": {
      title: "Hükümet Özeti",
      description: "Yayın önceliklendirmesi için alana göre kanıt boşluk analizi — siyasi derecelendirmeler değil.",
      audience: "Hükümet yetkilileri",
    },
    "research-brief": {
      title: "Araştırma Özeti",
      description: "Tekrarlanabilir kapsam için gösterge tanımları, kaynak slug'ları ve bağlantı durumu.",
      audience: "Araştırmacılar",
    },
    "academic-methodology": {
      title: "Akademik Metodoloji Raporu",
      description: "Küresel Gösterge Çerçevesinden alıntılanabilir gösterge metodoloji blokları ve kanıt gereksinimleri.",
      audience: "Akademisyenler",
    },
  },
  exportFuture: {
    pdf: { format: "PDF", description: "Doğrulanmış kanıt ve metodolojinin statik dışa aktarımı — hazırlık kriterleri karşılanana kadar oluşturulmaz." },
    csv: { format: "CSV", description: "Araştırma tekrarlanabilirliği için yapılandırılmış gösterge ve kaynak durumu dışa aktarımı." },
    api: { format: "API", description: "Rapor hazır verilere programatik erişim — yönetişim sürüm incelemesi gerekir." },
    mobile: { format: "Mobil", description: "Sürüm hattında erişilebilirlik doğrulamasından sonra mobil okunabilir rapor görünümleri." },
  },
  reportPersonas: {
    citizen: { title: "Vatandaş", usefulReports: ["Ülke İstihbarat Raporu", "Hükümet Özeti"] as const },
    investor: { title: "Yatırımcı", usefulReports: ["Şirket İstihbarat Raporu", "Yatırımcı Özeti"] as const },
    government: { title: "Hükümet", usefulReports: ["Hükümet Özeti", "Ülke İstihbarat Raporu"] as const },
    student: { title: "Öğrenci", usefulReports: ["Üniversite İstihbarat Raporu"] as const },
    researcher: { title: "Araştırmacı", usefulReports: ["Araştırma Özeti", "Ülke İstihbarat Raporu"] as const },
    academic: { title: "Akademisyen", usefulReports: ["Akademik Metodoloji Raporu", "Araştırma Özeti"] as const },
  },
  trustPillars: {
    "evidence-first": { title: "Önce Kanıt", description: "Raporlar yalnızca bağlı kaynaklardan derlenir — uydurma belgeler veya metrikler yok." },
    "source-attribution": { title: "Kaynak Atıfı", description: "Her rapor bölümü kayıtlı kaynak slug'larına ve doğrulama durumuna izlenecek." },
    "methodology-version": { title: "Metodoloji Sürümü", description: "Rapor başlıkları çerçeve ve metodoloji sürüm referanslarını içerecek." },
    reproducibility: { title: "Tekrarlanabilirlik", description: "Denetim için tasarlanmış dışa aktarma formatları — gösterge ID'leri, kaynaklar ve durum korunur." },
    "no-fabricated-metrics": { title: "Uydurma Metrik Yok", description: "Kanıt ve metodoloji mevcut olana kadar grafik, KPI, kullanım istatistikleri veya büyüme eğrileri yok." },
  },
  exportFutureHeading: "Dışa Aktarma Geleceği",
  noFakeAnalyticsNotice: "Sahte Analitik Bildirimi",
  personasHeading: "Personalar",
  trustHeading: "Güven",
} as const;

export const GRAPH_UI_TR = {
  entityDetails: "Varlık Ayrıntıları",
  clear: "Temizle",
  searchEntities: "Varlıkları Ara",
  entityType: "Varlık Türü",
  allTypes: "Tüm Türler",
  evidenceStatus: "Kanıt Durumu",
  relationshipCount: "İlişki Sayısı",
  availableSources: "Mevcut Kaynaklar",
  openModule: "{type} Modülünü Aç",
  connectedEntities: "Bağlı Varlıklar",
  evidenceSummary: "Kanıt Özeti",
  relationshipStatus: "İlişki durumu",
  evidenceAvailable: "Kanıt Mevcut",
  evidenceMissing: "Kanıt Eksik",
  entityEvidenceStatus: "Varlık kanıt durumu",
  neighborCount: "{count} komşu{plural}",
  evidenceRelationships: "Kanıt İlişkileri",
  availableInformation: "Mevcut Bilgi",
  futureEvidence: "Gelecek Kanıt",
  legend: "Açıklama",
  activeEntityTypes: "Aktif Varlık Türleri",
  verifiedRelationships: "Doğrulanmış İlişkiler",
  plannedTypes: "Planlanan Türler",
  futureTypeCount: "{count} gelecek varlık türü{plural} hazırlandı — grafik indeksinde değil",
  entityTypes: {
    country: { label: "Ülkeler", note: "Yerel ülke kaydı düğümleri." },
    company: { label: "Şirketler", note: "Yerel şirket katalog düğümleri." },
    university: { label: "Üniversiteler", note: "Yerel üniversite kaydı düğümleri." },
    government: { label: "Hükümet Kurumları", note: "Gelecek varlık türü — kanıt kaynağı bağlı değil." },
    industry: { label: "Sektörler", note: "Gelecek varlık türü — sektör düğümleri bağlı değil." },
    infrastructure: { label: "Altyapı", note: "Gelecek varlık türü — grafik indeksinde değil." },
    "natural-resources": { label: "Doğal Kaynaklar", note: "Gelecek varlık türü — grafik indeksinde değil." },
    procurement: { label: "Tedarik", note: "Gelecek varlık türü — grafik indeksinde değil." },
    "research-center": { label: "Araştırma Merkezleri", note: "Gelecek varlık türü — ilişki verisi bağlı değil." },
    future: { label: "Gelecek Varlık Türleri", note: "Şema hazırlandı — kayıtlar bağlandığında düğümler görünür." },
  },
  relationshipTypes: {
    "located-in": { label: "Konum", description: "Yerel katalog alanlarından varlık merkez veya kampüs ülkesi." },
    "registered-in": { label: "Kayıtlı", description: "Varlık bir ülke kaydı profili altında listelenmiş." },
    "belongs-to": { label: "Ait", description: "Aynı ülkedeki şirketler ve üniversiteler arasında katalog ilişkisi." },
    "collaborates-with": { label: "İş Birliği Yapar", description: "Doğrulanmış ortaklık kanıtı gerekir — CBAI tarafından çıkarılmaz." },
    "evidence-available": { label: "Kanıt Mevcut", description: "Bağlı yerel kayıt verilerinden türetilen ilişki." },
    "evidence-missing": { label: "Kanıt Eksik", description: "İlişki türü beyan edildi ancak kaynak bağlı değil." },
  },
  evidenceLabels: {
    localPlatformRegistry: "Yerel platform kaydı",
    partnershipVerification: "Ortaklık doğrulaması — çıkarılmaz",
  },
} as const;

export const ABOUT_PAGE_TR = {
  title: "Hakkında",
  pageDescription: "CBAI nedir, neden var ve hangi ilkelere bağlı kalır.",
  whoWeAreEyebrow: "Biz kimiz",
  purposeHeadline: "Bilgiye erişim zor kısım olmaktan çıktı.",
  purposeBody:
    "Anlamak ise çıkmadı. Herkes bir ülkenin ekonomisi, bir şirketin maruziyeti veya bir araştırma alanı hakkında saniyeler içinde binlerce belge bulabilir. Neredeyse hiç kimse o yığın içinden neyin gerçekten bilindiğini, neyin eksik olduğunu ve üzerine kurulan bir kararın gerçekte neye dayandığını söyleyemez. Bilgiye sahip olmak ile onu anlamak arasındaki bu boşluk — CBAI'nin kapatmak için var olduğu sorundur.",
  whatIsEyebrow: "CBAI nedir",
  whatIsHeadline:
    "CBAI bir İstihbarat İşletim Sistemidir — kanıtları bağlar, neyin bilindiğini ve neyin eksik olduğunu izler ve insanların araştırma, ekonomi ve yönetişim genelinde daha net, daha iyi desteklenmiş kararlara ulaşmasına yardımcı olur.",
  whatIsBody:
    "Sayfa döndüren bir arama motoru değil. Cevap üreten bir sohbet penceresi de değil. CBAI bir çalışma ortamıdır: gerçek ülke, şirket, üniversite ve araştırma profilleri; doğrulananı doğrulanmayandan ayıran gerçek bir kanıt sistemi; bir soruyu ve bulgularını bir arada tutan gerçek projeler; ve yalnızca sonucu değil, akıl yürütmeyi gösteren gerçek raporlar.",
  whyEyebrow: "CBAI neden var",
  whyHeadline: "Sorun asla çok az bilgi olması değildi. Çok fazla ve kopuk olmasıydı.",
  whyClosing:
    "Bunların hiçbiri yeni bir sorun değil. Yeni olan, bunları tek bir sorun olarak ele almak — kanıtların bir kez bağlandığı ve ilgili olduğu her yerde yeniden kullanıldığı tek bir yer inşa etmek.",
  philosophyEyebrow: "Felsefemiz",
  philosophyHeadline: "CBAI'nin kendine bağlı kaldığı on iki ilke — slogan değil, çalışma kuralları.",
  differentEyebrow: "CBAI'yi farklı kılan",
  differentHeadline: "Mevcut olanın daha iyi bir versiyonu değil. Farklı bir araç kategorisi.",
  audiencesEyebrow: "CBAI kimler için",
  audiencesHeadline: "Karar vermeden önce anlaması gereken insanlar için inşa edildi.",
  workflowEyebrow: "Nasıl çalışır",
  workflowHeadline: "Sorudan otomatik cevaba değil, sorudan daha net anlayışa.",
  ecosystemsEyebrow: "Üç istihbarat ekosistemi",
  ecosystemsHeadline: "Tek kanıt çekirdeği, onunla çalışmanın üç yolu.",
  manifestoEyebrow: "Neye inanıyoruz",
  manifestoHeadline: "Yirmi çalışma inancı — pazarlama metni değil.",
  enterCBAI: "CBAI'ye Gir →",
  trySearch: "Aramayı Dene →",
  openTrust: "Güven Merkezini Aç →",
  exploreResearch: "Araştırmayı Keşfet →",
} as const;

export const RESET_PASSWORD_PAGE_TR = {
  pageDescription: "Bulut hesabı parola sıfırlamasını tamamlayın.",
  passwordUpdated: "Parola güncellendi",
  passwordUpdatedBody: "Bulut hesabı parolanız değiştirildi. Artık bununla giriş yapabilirsiniz.",
  chooseNewPassword: "Yeni parola seçin",
  chooseNewPasswordBody:
    "Bu yalnızca e-postanıza gönderilen gerçek bir parola sıfırlama bağlantısını takip ettiyseniz çalışır. Bu sayfayı doğrudan açtıysanız, aşağıdaki istek başarısız olacaktır.",
  newPassword: "Yeni parola",
  confirmNewPassword: "Yeni parolayı onaylayın",
  setNewPassword: "Yeni Parola Belirle",
  minPasswordLength: "Parola en az {length} karakter olmalıdır.",
} as const;
