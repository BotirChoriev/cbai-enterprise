export type ProvenanceCopy = {
  sourcesUsed: string;
  source: string;
  freshness: string;
  lastVerified: string;
  dateUnavailable: string;
  coverage: string;
  limitations: string;
  methodology: string;
  close: string;
  officialSource: string;
  retrievedEvidence: string;
  userProvided: string;
  deterministicLabel: string;
  aiSummary: string;
  inference: string;
  unresolvedQuestion: string;
  current: string;
  aging: string;
  stale: string;
  updateExpected: string;
  unavailable: string;
  verificationRequired: string;
};

const COPY: Record<"en" | "uz" | "ru" | "tr", ProvenanceCopy> = {
  en: {
    sourcesUsed: "Which sources did CBAI use?",
    source: "Source",
    freshness: "Freshness",
    lastVerified: "Last verified",
    dateUnavailable: "Update date unavailable",
    coverage: "Evidence coverage",
    limitations: "Known limitations",
    methodology: "Verification method",
    close: "Close source details",
    officialSource: "Official source material",
    retrievedEvidence: "Retrieved evidence",
    userProvided: "User-provided content",
    deterministicLabel: "Platform label",
    aiSummary: "AI-generated summary",
    inference: "Inference",
    unresolvedQuestion: "Unresolved question",
    current: "Current",
    aging: "Aging",
    stale: "Stale",
    updateExpected: "Update expected",
    unavailable: "Unavailable",
    verificationRequired: "Verification required",
  },
  uz: {
    sourcesUsed: "CBAI qaysi manbalardan foydalandi?",
    source: "Manba",
    freshness: "Yangiligi",
    lastVerified: "Oxirgi tekshiruv",
    dateUnavailable: "Yangilanish sanasi mavjud emas",
    coverage: "Dalillar qamrovi",
    limitations: "Maʼlum cheklovlar",
    methodology: "Tekshirish usuli",
    close: "Manba tafsilotlarini yopish",
    officialSource: "Rasmiy manba materiali",
    retrievedEvidence: "Topilgan dalil",
    userProvided: "Foydalanuvchi bergan mazmun",
    deterministicLabel: "Platforma belgisi",
    aiSummary: "AI yaratgan xulosa",
    inference: "Xulosa chiqarish",
    unresolvedQuestion: "Ochiq savol",
    current: "Dolzarb",
    aging: "Eskirib bormoqda",
    stale: "Eskirgan",
    updateExpected: "Yangilanish kutilmoqda",
    unavailable: "Mavjud emas",
    verificationRequired: "Tekshiruv talab qilinadi",
  },
  ru: {
    sourcesUsed: "Какие источники использовал CBAI?",
    source: "Источник",
    freshness: "Актуальность",
    lastVerified: "Последняя проверка",
    dateUnavailable: "Дата обновления недоступна",
    coverage: "Покрытие доказательствами",
    limitations: "Известные ограничения",
    methodology: "Метод проверки",
    close: "Закрыть сведения об источнике",
    officialSource: "Материал официального источника",
    retrievedEvidence: "Найденное доказательство",
    userProvided: "Материал пользователя",
    deterministicLabel: "Метка платформы",
    aiSummary: "Резюме, созданное ИИ",
    inference: "Вывод",
    unresolvedQuestion: "Открытый вопрос",
    current: "Актуально",
    aging: "Устаревает",
    stale: "Устарело",
    updateExpected: "Ожидается обновление",
    unavailable: "Недоступно",
    verificationRequired: "Требуется проверка",
  },
  tr: {
    sourcesUsed: "CBAI hangi kaynakları kullandı?",
    source: "Kaynak",
    freshness: "Güncellik",
    lastVerified: "Son doğrulama",
    dateUnavailable: "Güncelleme tarihi kullanılamıyor",
    coverage: "Kanıt kapsamı",
    limitations: "Bilinen sınırlamalar",
    methodology: "Doğrulama yöntemi",
    close: "Kaynak ayrıntılarını kapat",
    officialSource: "Resmî kaynak materyali",
    retrievedEvidence: "Erişilen kanıt",
    userProvided: "Kullanıcı tarafından sağlanan içerik",
    deterministicLabel: "Platform etiketi",
    aiSummary: "Yapay zekâ tarafından oluşturulan özet",
    inference: "Çıkarım",
    unresolvedQuestion: "Çözümlenmemiş soru",
    current: "Güncel",
    aging: "Güncelliğini yitiriyor",
    stale: "Güncel değil",
    updateExpected: "Güncelleme bekleniyor",
    unavailable: "Kullanılamıyor",
    verificationRequired: "Doğrulama gerekli",
  },
};

export function getProvenanceCopy(locale: string): ProvenanceCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.en;
}
