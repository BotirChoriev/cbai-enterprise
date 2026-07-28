export type ProfessionTemplateId = "painter" | "cook" | "scientist" | "academic" | "general";

export type LocalizedLabel = { readonly en: string; readonly uz: string };

export type ProfessionTemplate = {
  readonly id: ProfessionTemplateId;
  readonly label: LocalizedLabel;
  readonly workspaceTitle: LocalizedLabel;
  readonly modules: readonly {
    readonly id: string;
    readonly label: LocalizedLabel;
    readonly route: string;
  }[];
  readonly starterTasks: readonly {
    readonly id: string;
    readonly label: LocalizedLabel;
  }[];
  readonly signals: readonly string[];
};

export type ProfessionInterpretation = {
  readonly templateId: ProfessionTemplateId;
  readonly profession: string;
  readonly confidence: "explicit" | "likely" | "unsure";
  readonly followUp: string | null;
  readonly originalText: string;
};

const TEMPLATES: readonly ProfessionTemplate[] = [
  {
    id: "painter",
    label: { en: "Painter / finishing specialist", uz: "Malyar / pardozlash ustasi" },
    workspaceTitle: { en: "Painter’s daily desk", uz: "Malyarning kundalik stoli" },
    modules: [
      { id: "orders", label: { en: "Jobs & customers", uz: "Buyurtma va mijozlar" }, route: "/my-work" },
      { id: "materials", label: { en: "Materials & cost", uz: "Material va xarajat" }, route: "/evidence" },
      { id: "quality", label: { en: "Photo & quality proof", uz: "Foto va sifat dalili" }, route: "/evidence" },
      { id: "risks", label: { en: "Safety & delays", uz: "Xavfsizlik va kechikish" }, route: "/problems" },
    ],
    starterTasks: [
      { id: "scope", label: { en: "Confirm today’s room and surface", uz: "Bugungi xona va yuzani tasdiqlash" } },
      { id: "materials", label: { en: "Check paint and material quantity", uz: "Bo‘yoq va material miqdorini tekshirish" } },
      { id: "proof", label: { en: "Record before/after photo evidence", uz: "Oldin/keyin foto-dalilini qayd etish" } },
    ],
    signals: ["malyar", "bo'yoqchi", "boyoqchi", "painter", "decorator", "finishing"],
  },
  {
    id: "cook",
    label: { en: "Cook / chef", uz: "Oshpaz / chef" },
    workspaceTitle: { en: "Kitchen daily desk", uz: "Oshxona kundalik stoli" },
    modules: [
      { id: "menu", label: { en: "Menu & orders", uz: "Menyu va buyurtmalar" }, route: "/my-work" },
      { id: "inventory", label: { en: "Inventory & cost", uz: "Mahsulot va tannarx" }, route: "/evidence" },
      { id: "safety", label: { en: "Safety & allergens", uz: "Xavfsizlik va allergenlar" }, route: "/trust" },
      { id: "quality", label: { en: "Quality & feedback", uz: "Sifat va fikrlar" }, route: "/reports" },
    ],
    starterTasks: [
      { id: "menu", label: { en: "Confirm today’s menu and orders", uz: "Bugungi menyu va buyurtmalarni tasdiqlash" } },
      { id: "stock", label: { en: "Check stock and missing ingredients", uz: "Qoldiq va yetishmayotgan mahsulotni tekshirish" } },
      { id: "safety", label: { en: "Review allergens and food safety", uz: "Allergen va oziq-ovqat xavfsizligini ko‘rish" } },
    ],
    signals: ["oshpaz", "pazanda", "chef", "cook", "cooking", "kitchen"],
  },
  {
    id: "scientist",
    label: { en: "Scientist / researcher", uz: "Olim / tadqiqotchi" },
    workspaceTitle: { en: "Research daily desk", uz: "Tadqiqot kundalik stoli" },
    modules: [
      { id: "question", label: { en: "Research question", uz: "Tadqiqot savoli" }, route: "/research" },
      { id: "method", label: { en: "Method & experiment", uz: "Metod va tajriba" }, route: "/research/workspace" },
      { id: "evidence", label: { en: "Evidence & contradictions", uz: "Dalil va qarama-qarshilik" }, route: "/evidence" },
      { id: "report", label: { en: "Findings & report", uz: "Natija va hisobot" }, route: "/reports" },
    ],
    starterTasks: [
      { id: "question", label: { en: "Confirm today’s research question", uz: "Bugungi tadqiqot savolini tasdiqlash" } },
      { id: "method", label: { en: "Record method and expected observation", uz: "Metod va kutilgan kuzatuvni qayd etish" } },
      { id: "evidence", label: { en: "Connect one verified source or result", uz: "Bitta tekshirilgan manba yoki natijani ulash" } },
    ],
    signals: ["olim", "tadqiqotchi", "kimyogar", "scientist", "researcher", "chemist", "phd"],
  },
  {
    id: "academic",
    label: { en: "Academic / professor", uz: "Akademik / professor" },
    workspaceTitle: { en: "Academic daily desk", uz: "Akademikning kundalik stoli" },
    modules: [
      { id: "research", label: { en: "Research & PhD", uz: "Tadqiqot va PhD" }, route: "/research" },
      { id: "publications", label: { en: "Papers & sources", uz: "Maqolalar va manbalar" }, route: "/evidence" },
      { id: "teaching", label: { en: "Teaching & students", uz: "Darslar va talabalar" }, route: "/my-work" },
      { id: "collaboration", label: { en: "Academic collaboration", uz: "Ilmiy hamkorlik" }, route: "/rooms" },
      { id: "reports", label: { en: "Progress & reports", uz: "Progress va hisobotlar" }, route: "/reports" },
    ],
    starterTasks: [
      { id: "focus", label: { en: "Confirm today’s academic focus", uz: "Bugungi akademik yo‘nalishni tasdiqlash" } },
      { id: "evidence", label: { en: "Review one research or teaching evidence item", uz: "Bitta tadqiqot yoki dars dalilini ko‘rib chiqish" } },
      { id: "decision", label: { en: "Record the next human decision or review", uz: "Keyingi inson qarori yoki tekshiruvini qayd etish" } },
    ],
    signals: ["akademik", "professor", "academic", "lecturer", "o'qituvchi", "oqituvchi"],
  },
  {
    id: "general",
    label: { en: "Personal work", uz: "Shaxsiy ish" },
    workspaceTitle: { en: "My daily desk", uz: "Mening kundalik stolim" },
    modules: [
      { id: "today", label: { en: "Today", uz: "Bugun" }, route: "/my-work" },
      { id: "problem", label: { en: "Problems", uz: "Muammolar" }, route: "/problems" },
      { id: "evidence", label: { en: "Evidence", uz: "Dalillar" }, route: "/evidence" },
      { id: "review", label: { en: "Review", uz: "Hisobot" }, route: "/reports" },
    ],
    starterTasks: [
      { id: "outcome", label: { en: "Define today’s desired result", uz: "Bugungi kerakli natijani aniqlash" } },
      { id: "priority", label: { en: "Choose the first priority", uz: "Birinchi ustuvor vazifani tanlash" } },
      { id: "proof", label: { en: "Decide how completion will be verified", uz: "Bajarilganini qanday tekshirishni belgilash" } },
    ],
    signals: [],
  },
];

export function getProfessionTemplate(id: ProfessionTemplateId): ProfessionTemplate {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[TEMPLATES.length - 1]!;
}

export function interpretProfession(text: string): ProfessionInterpretation {
  const normalized = text.trim().toLocaleLowerCase();
  const template =
    TEMPLATES.find((candidate) => candidate.signals.some((signal) => normalized.includes(signal))) ??
    getProfessionTemplate("general");
  const isGenericCraft =
    /(usta|craftsman|tradesperson|hunarmand)/i.test(normalized) && template.id === "general";
  const explicit = template.id !== "general";

  return {
    templateId: template.id,
    profession: explicit ? template.label.uz : text.trim() || template.label.uz,
    confidence: explicit ? "explicit" : normalized ? "likely" : "unsure",
    followUp: isGenericCraft
      ? "Qanday ustasiz? Masalan: malyar, elektrik, duradgor."
      : explicit
        ? "Asosiy maqsadingiz yoki hozirgi muammoingiz nima?"
        : "Kasbingiz yoki kundalik ishingizni aniqroq ayting.",
    originalText: text.trim(),
  };
}

export function localized(value: LocalizedLabel, locale: string): string {
  return locale === "uz" ? value.uz : value.en;
}
