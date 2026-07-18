/** Canonical Uzbek/English/Russian/Turkish display terms — one label per concept. */

export const TERMINOLOGY_REGISTRY = {
  myWork: { en: "My Work", uz: "Mening ishlarim", ru: "Моя работа", tr: "Çalışmalarım" },
  research: { en: "Research", uz: "Tadqiqot", ru: "Исследования", tr: "Araştırma" },
  evidence: { en: "Evidence", uz: "Dalillar", ru: "Доказательства", tr: "Kanıtlar" },
  knowledge: { en: "Knowledge", uz: "Bilim", ru: "Знания", tr: "Bilgi" },
  reports: { en: "Reports", uz: "Hisobotlar", ru: "Отчёты", tr: "Raporlar" },
  trust: { en: "Trust", uz: "Ishonch", ru: "Доверие", tr: "Güven" },
  settings: { en: "Settings", uz: "Sozlamalar", ru: "Настройки", tr: "Ayarlar" },
  mission: { en: "Mission", uz: "Missiya", ru: "Миссия", tr: "Görev" },
  decisionSupportPackage: {
    en: "Decision Support Package",
    uz: "Qarorni qo'llab-quvvatlash paketi",
    ru: "Пакет поддержки решения",
    tr: "Karar destek paketi",
  },
  measurementPassport: {
    en: "Measurement Passport",
    uz: "O'lchov pasporti",
    ru: "Паспорт измерения",
    tr: "Ölçüm pasaportu",
  },
  unknown: { en: "Unknown", uz: "Noma'lum", ru: "Неизвестно", tr: "Bilinmiyor" },
  humanReviewRequired: {
    en: "Human review required",
    uz: "Inson tekshiruvi kerak",
    ru: "Требуется проверка человеком",
    tr: "İnsan incelemesi gerekli",
  },
  noConnectedRecords: {
    en: "No connected records",
    uz: "Ulangan yozuvlar mavjud emas",
    ru: "Нет подключённых записей",
    tr: "Bağlı kayıt yok",
  },
  technicalDetails: {
    en: "Technical details",
    uz: "Texnik tafsilotlar",
    ru: "Технические детали",
    tr: "Teknik ayrıntılar",
  },
  researchIntelligence: {
    en: "Research Intelligence",
    uz: "Tadqiqot intellekti",
    ru: "Исследовательская аналитика",
    tr: "Araştırma zekâsı",
  },
} as const;

export type TerminologyKey = keyof typeof TERMINOLOGY_REGISTRY;

export function terminologyLabel(key: TerminologyKey, lang: string): string {
  const entry = TERMINOLOGY_REGISTRY[key];
  if (lang === "uz") return entry.uz;
  if (lang === "ru") return entry.ru;
  if (lang === "tr") return entry.tr;
  return entry.en;
}

export function assertTerminologyConsistency(): string[] {
  const conflicts: string[] = [];
  for (const [key, entry] of Object.entries(TERMINOLOGY_REGISTRY)) {
    for (const locale of ["en", "uz", "ru", "tr"] as const) {
      if (!entry[locale]?.trim()) conflicts.push(`${key}.${locale} missing`);
    }
  }
  return conflicts;
}
