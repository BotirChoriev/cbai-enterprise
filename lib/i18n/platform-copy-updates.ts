/**
 * Localized copy for Global Updates, country clocks and verified-change watches.
 */

export type UpdatesCopy = {
  pageTitle: string;
  pageDescription: string;
  capabilityHeading: string;
  capabilityManualOnly: string;
  capabilityScheduled: string;
  capabilityLicensed: string;
  capabilityRequirement: string;
  clocksHeading: string;
  clocksDescription: string;
  clocksCapitalNote: string;
  clocksMultipleZones: string;
  clocksSource: string;
  clocksUnavailable: string;
  watchesHeading: string;
  watchesDescription: string;
  watchesEmpty: string;
  addWatch: string;
  removeWatch: string;
  watching: string;
  watchTargetCountry: string;
  watchTargetIndicator: string;
  watchTargetSource: string;
  watchTargetProject: string;
  watchTargetReport: string;
  watchTargetPublication: string;
  feedHeading: string;
  feedDescription: string;
  feedEmpty: string;
  feedEmptyDetail: string;
  channelOfficial: string;
  channelLicensedNews: string;
  channelUserItem: string;
  channelAiSummary: string;
  channelSystemAlert: string;
  channelUnavailable: string;
  eventWhatChanged: string;
  eventPreviousValue: string;
  eventNewValue: string;
  eventEffectiveAt: string;
  eventDetectedAt: string;
  eventEvidence: string;
  eventMarkRead: string;
  eventRead: string;
  refresh: string;
  lastChecked: string;
  neverChecked: string;
  notAdvice: string;
};

const COPY: Record<"en" | "uz" | "ru" | "tr", UpdatesCopy> = {
  en: {
    pageTitle: "Global updates and watches",
    pageDescription:
      "Verified source changes for the countries, indicators and reports you follow. CBAI does not scrape news and does not generate updates that no source published.",
    capabilityHeading: "Update capability",
    capabilityManualOnly:
      "Manual refresh only. No scheduled detection job and no licensed news feed is configured, so nothing arrives in the background.",
    capabilityScheduled: "Scheduled detection is configured.",
    capabilityLicensed: "A licensed update feed is connected.",
    capabilityRequirement:
      "Required to enable background updates: a licensed publication feed or an official-source polling job, plus a reviewed change-detection service.",
    clocksHeading: "Country local time",
    clocksDescription: "Local time in the capital of each country in the registry.",
    clocksCapitalNote: "Capital city local time",
    clocksMultipleZones: "This country observes more than one time zone.",
    clocksSource: "Time zone rules: IANA Time Zone Database",
    clocksUnavailable: "This time zone cannot be resolved by your browser.",
    watchesHeading: "Your watches",
    watchesDescription:
      "A watch records what you want to be told about. It never creates an update on its own.",
    watchesEmpty: "You are not watching anything yet.",
    addWatch: "Watch verified changes",
    removeWatch: "Stop watching",
    watching: "Watching",
    watchTargetCountry: "Country",
    watchTargetIndicator: "Indicator",
    watchTargetSource: "Evidence source",
    watchTargetProject: "Project",
    watchTargetReport: "Report",
    watchTargetPublication: "Official publication",
    feedHeading: "Verified updates",
    feedDescription:
      "Each entry states what changed, the verified values, the source and both the effective and detected dates.",
    feedEmpty: "No verified change has been detected.",
    feedEmptyDetail:
      "This list stays empty until a real detection run reports a change. An empty list means nothing was detected, not that nothing changed.",
    channelOfficial: "Official update",
    channelLicensedNews: "Licensed news",
    channelUserItem: "Your item",
    channelAiSummary: "AI summary",
    channelSystemAlert: "System alert",
    channelUnavailable: "Not configured",
    eventWhatChanged: "What changed",
    eventPreviousValue: "Previous verified value",
    eventNewValue: "New verified value",
    eventEffectiveAt: "Effective date",
    eventDetectedAt: "Detected",
    eventEvidence: "Open supporting evidence",
    eventMarkRead: "Mark as read",
    eventRead: "Read",
    refresh: "Check for updates now",
    lastChecked: "Last checked",
    neverChecked: "Not checked yet in this session",
    notAdvice: "Update information only. This is not investment, legal or policy advice.",
  },
  uz: {
    pageTitle: "Global yangilanishlar va kuzatuvlar",
    pageDescription:
      "Siz kuzatayotgan davlatlar, koʻrsatkichlar va hisobotlar boʻyicha tasdiqlangan manba oʻzgarishlari. CBAI yangiliklarni qirib olmaydi va hech bir manba eʼlon qilmagan yangilanishni yaratmaydi.",
    capabilityHeading: "Yangilanish imkoniyati",
    capabilityManualOnly:
      "Faqat qoʻlda yangilash. Rejalashtirilgan aniqlash vazifasi ham, litsenziyalangan yangiliklar oqimi ham ulanmagan, shuning uchun fon rejimida hech narsa kelmaydi.",
    capabilityScheduled: "Rejalashtirilgan aniqlash sozlangan.",
    capabilityLicensed: "Litsenziyalangan yangilanish oqimi ulangan.",
    capabilityRequirement:
      "Fon rejimidagi yangilanishlar uchun kerak: litsenziyalangan nashr oqimi yoki rasmiy manbani davriy tekshirish vazifasi va koʻrib chiqilgan oʻzgarishlarni aniqlash xizmati.",
    clocksHeading: "Davlatdagi mahalliy vaqt",
    clocksDescription: "Registrdagi har bir davlat paytaxtidagi mahalliy vaqt.",
    clocksCapitalNote: "Paytaxtdagi mahalliy vaqt",
    clocksMultipleZones: "Bu davlatda bir nechta vaqt mintaqasi mavjud.",
    clocksSource: "Vaqt mintaqasi qoidalari: IANA Time Zone Database",
    clocksUnavailable: "Brauzeringiz bu vaqt mintaqasini aniqlay olmadi.",
    watchesHeading: "Kuzatuvlaringiz",
    watchesDescription:
      "Kuzatuv nima haqida xabar berish kerakligini qayd etadi. U oʻzi yangilanish yaratmaydi.",
    watchesEmpty: "Siz hali hech narsani kuzatmayapsiz.",
    addWatch: "Tasdiqlangan oʻzgarishlarni kuzatish",
    removeWatch: "Kuzatishni toʻxtatish",
    watching: "Kuzatilmoqda",
    watchTargetCountry: "Davlat",
    watchTargetIndicator: "Koʻrsatkich",
    watchTargetSource: "Dalil manbasi",
    watchTargetProject: "Loyiha",
    watchTargetReport: "Hisobot",
    watchTargetPublication: "Rasmiy nashr",
    feedHeading: "Tasdiqlangan yangilanishlar",
    feedDescription:
      "Har bir yozuv nima oʻzgarganini, tasdiqlangan qiymatlarni, manbani hamda kuchga kirish va aniqlanish sanalarini koʻrsatadi.",
    feedEmpty: "Tasdiqlangan hech qanday oʻzgarish aniqlanmadi.",
    feedEmptyDetail:
      "Haqiqiy tekshiruv oʻzgarish haqida xabar bermaguncha bu roʻyxat boʻsh qoladi. Boʻsh roʻyxat hech narsa aniqlanmaganini bildiradi, hech narsa oʻzgarmaganini emas.",
    channelOfficial: "Rasmiy yangilanish",
    channelLicensedNews: "Litsenziyalangan yangilik",
    channelUserItem: "Sizning yozuvingiz",
    channelAiSummary: "AI xulosasi",
    channelSystemAlert: "Tizim ogohlantirishi",
    channelUnavailable: "Sozlanmagan",
    eventWhatChanged: "Nima oʻzgardi",
    eventPreviousValue: "Avvalgi tasdiqlangan qiymat",
    eventNewValue: "Yangi tasdiqlangan qiymat",
    eventEffectiveAt: "Kuchga kirgan sana",
    eventDetectedAt: "Aniqlangan",
    eventEvidence: "Tasdiqlovchi dalilni ochish",
    eventMarkRead: "Oʻqilgan deb belgilash",
    eventRead: "Oʻqilgan",
    refresh: "Hozir yangilanishlarni tekshirish",
    lastChecked: "Oxirgi tekshiruv",
    neverChecked: "Bu sessiyada hali tekshirilmagan",
    notAdvice:
      "Faqat yangilanish maʼlumoti. Bu investitsiya, huquqiy yoki siyosat boʻyicha maslahat emas.",
  },
  ru: {
    pageTitle: "Глобальные обновления и подписки",
    pageDescription:
      "Проверенные изменения источников по странам, показателям и отчётам, за которыми вы следите. CBAI не собирает новости автоматически и не создаёт обновления, которых не публиковал ни один источник.",
    capabilityHeading: "Возможности обновления",
    capabilityManualOnly:
      "Только обновление вручную. Ни запланированная проверка, ни лицензированный новостной поток не настроены, поэтому в фоновом режиме ничего не поступает.",
    capabilityScheduled: "Запланированная проверка настроена.",
    capabilityLicensed: "Подключён лицензированный поток обновлений.",
    capabilityRequirement:
      "Для фоновых обновлений требуются: лицензированный поток публикаций либо задача периодического опроса официального источника, а также проверенный сервис обнаружения изменений.",
    clocksHeading: "Местное время в стране",
    clocksDescription: "Местное время в столице каждой страны реестра.",
    clocksCapitalNote: "Местное время столицы",
    clocksMultipleZones: "В этой стране действует более одного часового пояса.",
    clocksSource: "Правила часовых поясов: IANA Time Zone Database",
    clocksUnavailable: "Ваш браузер не может определить этот часовой пояс.",
    watchesHeading: "Ваши подписки",
    watchesDescription:
      "Подписка фиксирует, о чём вы хотите узнавать. Сама она обновлений не создаёт.",
    watchesEmpty: "Вы пока ни за чем не следите.",
    addWatch: "Следить за проверенными изменениями",
    removeWatch: "Отменить подписку",
    watching: "Отслеживается",
    watchTargetCountry: "Страна",
    watchTargetIndicator: "Показатель",
    watchTargetSource: "Источник доказательств",
    watchTargetProject: "Проект",
    watchTargetReport: "Отчёт",
    watchTargetPublication: "Официальная публикация",
    feedHeading: "Проверенные обновления",
    feedDescription:
      "Каждая запись показывает, что изменилось, проверенные значения, источник, а также дату вступления в силу и дату обнаружения.",
    feedEmpty: "Проверенных изменений не обнаружено.",
    feedEmptyDetail:
      "Список остаётся пустым, пока реальная проверка не сообщит об изменении. Пустой список означает, что ничего не обнаружено, а не что ничего не изменилось.",
    channelOfficial: "Официальное обновление",
    channelLicensedNews: "Лицензированные новости",
    channelUserItem: "Ваша запись",
    channelAiSummary: "Резюме ИИ",
    channelSystemAlert: "Системное оповещение",
    channelUnavailable: "Не настроено",
    eventWhatChanged: "Что изменилось",
    eventPreviousValue: "Предыдущее проверенное значение",
    eventNewValue: "Новое проверенное значение",
    eventEffectiveAt: "Дата вступления в силу",
    eventDetectedAt: "Обнаружено",
    eventEvidence: "Открыть подтверждающие доказательства",
    eventMarkRead: "Отметить как прочитанное",
    eventRead: "Прочитано",
    refresh: "Проверить обновления сейчас",
    lastChecked: "Последняя проверка",
    neverChecked: "В этой сессии проверка ещё не выполнялась",
    notAdvice:
      "Только информация об обновлениях. Это не инвестиционная, юридическая или политическая рекомендация.",
  },
  tr: {
    pageTitle: "Küresel güncellemeler ve izlemeler",
    pageDescription:
      "İzlediğiniz ülkeler, göstergeler ve raporlar için doğrulanmış kaynak değişiklikleri. CBAI haber kazımaz ve hiçbir kaynağın yayımlamadığı güncellemeyi üretmez.",
    capabilityHeading: "Güncelleme yeteneği",
    capabilityManualOnly:
      "Yalnızca elle yenileme. Zamanlanmış bir tespit görevi de lisanslı bir haber akışı da yapılandırılmadı; bu nedenle arka planda hiçbir şey gelmez.",
    capabilityScheduled: "Zamanlanmış tespit yapılandırıldı.",
    capabilityLicensed: "Lisanslı bir güncelleme akışı bağlı.",
    capabilityRequirement:
      "Arka plan güncellemeleri için gerekli olanlar: lisanslı bir yayın akışı veya resmî kaynak yoklama görevi ve incelenmiş bir değişiklik tespit hizmeti.",
    clocksHeading: "Ülkedeki yerel saat",
    clocksDescription: "Kayıttaki her ülkenin başkentindeki yerel saat.",
    clocksCapitalNote: "Başkentteki yerel saat",
    clocksMultipleZones: "Bu ülkede birden fazla saat dilimi uygulanır.",
    clocksSource: "Saat dilimi kuralları: IANA Time Zone Database",
    clocksUnavailable: "Tarayıcınız bu saat dilimini çözümleyemiyor.",
    watchesHeading: "İzlemeleriniz",
    watchesDescription:
      "Bir izleme, neyden haberdar olmak istediğinizi kaydeder. Kendiliğinden güncelleme oluşturmaz.",
    watchesEmpty: "Henüz hiçbir şeyi izlemiyorsunuz.",
    addWatch: "Doğrulanmış değişiklikleri izle",
    removeWatch: "İzlemeyi bırak",
    watching: "İzleniyor",
    watchTargetCountry: "Ülke",
    watchTargetIndicator: "Gösterge",
    watchTargetSource: "Kanıt kaynağı",
    watchTargetProject: "Proje",
    watchTargetReport: "Rapor",
    watchTargetPublication: "Resmî yayın",
    feedHeading: "Doğrulanmış güncellemeler",
    feedDescription:
      "Her kayıt neyin değiştiğini, doğrulanmış değerleri, kaynağı ve hem yürürlük hem tespit tarihini belirtir.",
    feedEmpty: "Doğrulanmış bir değişiklik tespit edilmedi.",
    feedEmptyDetail:
      "Gerçek bir tespit çalışması değişiklik bildirene kadar bu liste boş kalır. Boş liste hiçbir şeyin tespit edilmediğini gösterir, hiçbir şeyin değişmediğini değil.",
    channelOfficial: "Resmî güncelleme",
    channelLicensedNews: "Lisanslı haber",
    channelUserItem: "Sizin kaydınız",
    channelAiSummary: "Yapay zekâ özeti",
    channelSystemAlert: "Sistem uyarısı",
    channelUnavailable: "Yapılandırılmadı",
    eventWhatChanged: "Ne değişti",
    eventPreviousValue: "Önceki doğrulanmış değer",
    eventNewValue: "Yeni doğrulanmış değer",
    eventEffectiveAt: "Yürürlük tarihi",
    eventDetectedAt: "Tespit edildi",
    eventEvidence: "Destekleyici kanıtı aç",
    eventMarkRead: "Okundu olarak işaretle",
    eventRead: "Okundu",
    refresh: "Güncellemeleri şimdi denetle",
    lastChecked: "Son denetim",
    neverChecked: "Bu oturumda henüz denetlenmedi",
    notAdvice:
      "Yalnızca güncelleme bilgisi. Bu bir yatırım, hukuk veya politika tavsiyesi değildir.",
  },
};

export function getUpdatesCopy(locale: string): UpdatesCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.en;
}
