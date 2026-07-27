/**
 * World and Me Intelligence Map UI copy — EN/UZ/RU/TR.
 */

export type WimCopy = {
  title: string;
  oneSentence: string;
  primaryQuestion: string;
  primaryAction: string;
  secondaryAction: string;
  moreActions: string;
  modeMap: string;
  modeRelationships: string;
  modeTimeline: string;
  modeCompare: string;
  modeMyWorld: string;
  navigator: string;
  canvas: string;
  contextRail: string;
  honestyBanner: string;
  noLiveSource: string;
  changeRadar: string;
  relationshipExplainer: string;
  linkToMyWork: string;
  viewEvidence: string;
  unknown: string;
  officialSource: string;
  cbaiInference: string;
  humanDecision: string;
  confirmBeforeCreate: string;
  exactlyOnce: string;
  consentRequired: string;
  giveConsent: string;
  resetConsent: string;
  filtersOpen: string;
  filtersClose: string;
  contextOpen: string;
  contextClose: string;
  voiceClearance: string;
  listFallback: string;
  whyRelevant: string;
  known: string;
  disputed: string;
  openQuestions: string;
  nextDecision: string;
  watchlist: string;
  importantChanges: string;
  myField: string;
  myGoals: string;
  myProjects: string;
  legacyGraph: string;
  noPath: string;
  compareHint: string;
  timelineHint: string;
};

const EN: WimCopy = {
  title: "World and Me — Live Intelligence Map",
  oneSentence: "See what changed in the world that matters to your work — evidence first, humans decide.",
  primaryQuestion: "What changed in the world that matters to my work?",
  primaryAction: "Link to My Work",
  secondaryAction: "View Evidence",
  moreActions: "More actions",
  modeMap: "Map",
  modeRelationships: "Relationships",
  modeTimeline: "Timeline",
  modeCompare: "Compare",
  modeMyWorld: "My World",
  navigator: "Intelligence navigator",
  canvas: "Intelligence canvas",
  contextRail: "Context",
  honestyBanner:
    "Registry and catalog relationships only until verified live sources connect. Missing stays empty — never decorative activity.",
  noLiveSource: "No verified live source is connected yet.",
  changeRadar: "World Change Radar",
  relationshipExplainer: "Relationship Explainer",
  linkToMyWork: "Link to My Work",
  viewEvidence: "View Evidence",
  unknown: "Unknown",
  officialSource: "Official / registry",
  cbaiInference: "CBAI inference",
  humanDecision: "Human decision",
  confirmBeforeCreate: "Confirmation required before create",
  exactlyOnce: "Created exactly once",
  consentRequired: "My World requires consent before personalizing context.",
  giveConsent: "Give consent for My World",
  resetConsent: "Reset My World consent",
  filtersOpen: "Open navigator",
  filtersClose: "Close navigator",
  contextOpen: "Open context",
  contextClose: "Close context",
  voiceClearance: "Voice stays a compact command layer — it does not cover the canvas.",
  listFallback: "Accessible list fallback",
  whyRelevant: "Why relevant",
  known: "Known",
  disputed: "Disputed",
  openQuestions: "Open questions",
  nextDecision: "Next human decision",
  watchlist: "Watchlist",
  importantChanges: "Important changes",
  myField: "My field",
  myGoals: "My goals",
  myProjects: "My projects",
  legacyGraph: "Legacy Knowledge Graph canvas",
  noPath: "No evidence-backed relationship path exists.",
  compareHint: "Select two to five entities. Compare typed dimensions — never a single universal score.",
  timelineHint: "Five-year view shows registry-backed gaps honestly. No interpolation as fact.",
};

const UZ: WimCopy = {
  title: "Dunyo va Men — Jonli intellekt xaritasi",
  oneSentence: "Ishingizga tegishli dunyodagi o‘zgarishlarni ko‘ring — avvalo dalil, qarorni inson qabul qiladi.",
  primaryQuestion: "Ishimga tegishli dunyoda nima o‘zgardi?",
  primaryAction: "Mening ishimga bog‘lash",
  secondaryAction: "Dalilni ko‘rish",
  moreActions: "Boshqa amallar",
  modeMap: "Xarita",
  modeRelationships: "Aloqalar",
  modeTimeline: "Vaqt chizig‘i",
  modeCompare: "Taqqoslash",
  modeMyWorld: "Mening dunyom",
  navigator: "Intellekt navigatori",
  canvas: "Intellekt tuvali",
  contextRail: "Kontekst",
  honestyBanner:
    "Tasdiqlangan jonli manbalar ulanmaguncha faqat reyestr va katalog aloqalari. Yetishmovchilik bo‘sh — hech qachon dekorativ faollik yo‘q.",
  noLiveSource: "Hali tasdiqlangan jonli manba ulanmagan.",
  changeRadar: "Dunyo o‘zgarishlari radari",
  relationshipExplainer: "Aloqa tushuntiruvchi",
  linkToMyWork: "Mening ishimga bog‘lash",
  viewEvidence: "Dalilni ko‘rish",
  unknown: "Noma’lum",
  officialSource: "Rasmiy / reyestr",
  cbaiInference: "CBAI xulosasi",
  humanDecision: "Inson qarori",
  confirmBeforeCreate: "Yaratishdan oldin tasdiq kerak",
  exactlyOnce: "Faqat bir marta yaratildi",
  consentRequired: "Mening dunyom shaxsiylashtirishdan oldin rozilik talab qiladi.",
  giveConsent: "Mening dunyom uchun rozilik berish",
  resetConsent: "Rozilikni qayta o‘rnatish",
  filtersOpen: "Navigatori ochish",
  filtersClose: "Navigatori yopish",
  contextOpen: "Kontekstni ochish",
  contextClose: "Kontekstni yopish",
  voiceClearance: "Ovoz ixcham buyruq qatlami — tuvalni yopmaydi.",
  listFallback: "Qulay ro‘yxat alternativasi",
  whyRelevant: "Nima uchun muhim",
  known: "Ma’lum",
  disputed: "Bahsli",
  openQuestions: "Ochiq savollar",
  nextDecision: "Keyingi inson qarori",
  watchlist: "Kuzatuv ro‘yxati",
  importantChanges: "Muhim o‘zgarishlar",
  myField: "Mening soham",
  myGoals: "Mening maqsadlarim",
  myProjects: "Mening loyihalarim",
  legacyGraph: "Eski Bilim grafi tuvali",
  noPath: "Dalilga asoslangan aloqa yo‘li mavjud emas.",
  compareHint: "Ikki–beshta ob’ektni tanlang. Tipik o‘lchovlar — hech qachon bitta umumiy ball emas.",
  timelineHint: "Besh yillik ko‘rinish bo‘shliqlarni halol ko‘rsatadi. Fakt sifatida interpolatsiya yo‘q.",
};

const RU: WimCopy = {
  title: "Мир и Я — Живая карта интеллекта",
  oneSentence: "Смотрите, что изменилось в мире и важно для вашей работы — сначала доказательства, решение за человеком.",
  primaryQuestion: "Что изменилось в мире, что важно для моей работы?",
  primaryAction: "Связать с Моей работой",
  secondaryAction: "Смотреть доказательства",
  moreActions: "Другие действия",
  modeMap: "Карта",
  modeRelationships: "Связи",
  modeTimeline: "Лента времени",
  modeCompare: "Сравнение",
  modeMyWorld: "Мой мир",
  navigator: "Навигатор интеллекта",
  canvas: "Холст интеллекта",
  contextRail: "Контекст",
  honestyBanner:
    "Пока нет проверенных живых источников — только реестр и каталог. Пропуск остаётся пустым — без декоративной активности.",
  noLiveSource: "Проверенный живой источник ещё не подключён.",
  changeRadar: "Радар изменений мира",
  relationshipExplainer: "Объяснение связи",
  linkToMyWork: "Связать с Моей работой",
  viewEvidence: "Смотреть доказательства",
  unknown: "Неизвестно",
  officialSource: "Официальный / реестр",
  cbaiInference: "Вывод CBAI",
  humanDecision: "Решение человека",
  confirmBeforeCreate: "Перед созданием требуется подтверждение",
  exactlyOnce: "Создано ровно один раз",
  consentRequired: "«Мой мир» требует согласия перед персонализацией.",
  giveConsent: "Дать согласие для «Мой мир»",
  resetConsent: "Сбросить согласие",
  filtersOpen: "Открыть навигатор",
  filtersClose: "Закрыть навигатор",
  contextOpen: "Открыть контекст",
  contextClose: "Закрыть контекст",
  voiceClearance: "Голос — компактный слой команд и не перекрывает холст.",
  listFallback: "Доступный список как запасной вариант",
  whyRelevant: "Почему важно",
  known: "Известно",
  disputed: "Спорно",
  openQuestions: "Открытые вопросы",
  nextDecision: "Следующее решение человека",
  watchlist: "Список наблюдения",
  importantChanges: "Важные изменения",
  myField: "Моя область",
  myGoals: "Мои цели",
  myProjects: "Мои проекты",
  legacyGraph: "Прежний холст графа знаний",
  noPath: "Нет пути связи, подтверждённого доказательствами.",
  compareHint: "Выберите 2–5 сущностей. Сравнивайте типизированные измерения — не единый универсальный балл.",
  timelineHint: "Пятилетний вид честно показывает пробелы. Без интерполяции как факта.",
};

const TR: WimCopy = {
  title: "Dünya ve Ben — Canlı istihbarat haritası",
  oneSentence: "İşiniz için önemli dünya değişimlerini görün — önce kanıt, kararı insan verir.",
  primaryQuestion: "İşim için önemli olan dünyada ne değişti?",
  primaryAction: "Çalışmama bağla",
  secondaryAction: "Kanıtı gör",
  moreActions: "Diğer eylemler",
  modeMap: "Harita",
  modeRelationships: "İlişkiler",
  modeTimeline: "Zaman çizelgesi",
  modeCompare: "Karşılaştır",
  modeMyWorld: "Dünyam",
  navigator: "İstihbarat gezgini",
  canvas: "İstihbarat tuvali",
  contextRail: "Bağlam",
  honestyBanner:
    "Doğrulanmış canlı kaynaklar bağlanana kadar yalnızca kayıt ve katalog. Eksik boş kalır — dekoratif etkinlik yok.",
  noLiveSource: "Henüz doğrulanmış canlı kaynak bağlı değil.",
  changeRadar: "Dünya değişim radarı",
  relationshipExplainer: "İlişki açıklayıcı",
  linkToMyWork: "Çalışmama bağla",
  viewEvidence: "Kanıtı gör",
  unknown: "Bilinmiyor",
  officialSource: "Resmî / kayıt",
  cbaiInference: "CBAI çıkarımı",
  humanDecision: "İnsan kararı",
  confirmBeforeCreate: "Oluşturmadan önce onay gerekir",
  exactlyOnce: "Tam olarak bir kez oluşturuldu",
  consentRequired: "Dünyam kişiselleştirmeden önce onay ister.",
  giveConsent: "Dünyam için onay ver",
  resetConsent: "Onayı sıfırla",
  filtersOpen: "Gezgini aç",
  filtersClose: "Gezgini kapat",
  contextOpen: "Bağlamı aç",
  contextClose: "Bağlamı kapat",
  voiceClearance: "Ses kompakt komut katmanıdır — tuvali örtmez.",
  listFallback: "Erişilebilir liste alternatifi",
  whyRelevant: "Neden önemli",
  known: "Bilinen",
  disputed: "Tartışmalı",
  openQuestions: "Açık sorular",
  nextDecision: "Sonraki insan kararı",
  watchlist: "İzleme listesi",
  importantChanges: "Önemli değişiklikler",
  myField: "Alanım",
  myGoals: "Hedeflerim",
  myProjects: "Projelerim",
  legacyGraph: "Eski bilgi grafiği tuvali",
  noPath: "Kanıta dayalı ilişki yolu yok.",
  compareHint: "2–5 varlık seçin. Tipik boyutlarla karşılaştırın — tek evrensel puan yok.",
  timelineHint: "Beş yıllık görünüm boşlukları dürüstçe gösterir. Gerçek gibi interpolasyon yok.",
};

export const WIM_COPY_LOCALES = ["en", "uz", "ru", "tr"] as const;
const BY: Record<(typeof WIM_COPY_LOCALES)[number], WimCopy> = { en: EN, uz: UZ, ru: RU, tr: TR };

export function getWimCopy(locale: string): WimCopy {
  const key = (locale || "en").toLowerCase().slice(0, 2) as (typeof WIM_COPY_LOCALES)[number];
  return BY[key] ?? EN;
}
