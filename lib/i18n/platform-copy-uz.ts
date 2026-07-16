import type { CompassDirectionCopy } from "@/lib/i18n/dictionary-types";

export const COMPASS_COPY_UZ: {
  default: CompassDirectionCopy;
  academic: CompassDirectionCopy;
  engineer: CompassDirectionCopy;
  investor: CompassDirectionCopy;
  government: CompassDirectionCopy;
} = {
  default: {
    discover: { label: "Kashf etish", description: "Mamlakatlar, kompaniyalar, universitetlar va tadqiqot mavzularini qidiring." },
    research: { label: "Tadqiqot", description: "Haqiqiy tadqiqot mavzulari va ularning dalillarini o‘rganing." },
    evidence: { label: "Dalil", description: "Profil bo‘yicha rasmiy manba holatini ko‘rib chiqing." },
    analyze: { label: "Tahlil", description: "Dalil, qaydlar va ochiq savollarni tartibga soling." },
    organize: { label: "Tashkil etish", description: "Ishingizni kuzatish uchun loyihani davom ettiring yoki boshlang." },
    report: { label: "Hisobot", description: "Haqiqiy, dalilga asoslangan hisobotlarni yarating va ko‘rib chiqing." },
  },
  academic: {
    discover: { label: "Savol", description: "Haqiqiy tadqiqot savolidan boshlang." },
    research: { label: "Tadqiqot", description: "Bog‘liq tadqiqot mavzularini o‘rganing." },
    evidence: { label: "Dalil", description: "Qo‘llab-quvvatlovchi va qarshi dalillarni bog‘lang." },
    analyze: { label: "Qaydlar", description: "Tadqiqot ish maydonida topilmalarni hujjatlashtiring." },
    organize: { label: "Tahlil", description: "Loyihangizning haqiqiy progressini kuzating." },
    report: { label: "Hisobot", description: "Topilmalaringizni hisobotga jamlang." },
  },
  engineer: {
    discover: { label: "Talab", description: "Standartlar, tizimlar va tashkilotlarni qidiring." },
    research: { label: "Standart", description: "Tegishli texnik tadqiqot mavzularini o‘rganing." },
    evidence: { label: "Dalil", description: "Bog‘langan texnik dalil va manbalarni ko‘rib chiqing." },
    analyze: { label: "Qaror qaydi", description: "Baholashingizni loyiha qaydlarida hujjatlashtiring." },
    organize: { label: "Loyiha", description: "Vazifalar va ochiq savollarni kuzating." },
    report: { label: "Hisobot", description: "Texnik baholash hisobotini yarating." },
  },
  investor: {
    discover: { label: "Bozor", description: "Kompaniyalar, mamlakatlar va sohalarni qidiring." },
    research: { label: "Tashkilot", description: "Bog‘liq kompaniyalar va tadqiqotlarni o‘rganing." },
    evidence: { label: "Dalil", description: "Bog‘langan moliyaviy va dalil manbalarini ko‘rib chiqing." },
    analyze: { label: "Solishtirish", description: "Tashkilotlarni yonma-yon solishtiring." },
    organize: { label: "Loyiha", description: "Investitsiya tahlilingizni kuzating." },
    report: { label: "Hisobot", description: "Investitsiya intellektual hisobotini yarating." },
  },
  government: {
    discover: { label: "Mamlakat", description: "Mamlakatlar va davlat muassasalarini qidiring." },
    research: { label: "Muassasa", description: "Bog‘liq muassasalar va tadqiqotlarni o‘rganing." },
    evidence: { label: "Ko‘rsatkich", description: "Bog‘langan boshqaruv dalillarini ko‘rib chiqing." },
    analyze: { label: "Stsenariy", description: "Siyosat tahlilini ish maydoningizda hujjatlashtiring." },
    organize: { label: "Loyiha", description: "Siyosat ko‘rib chiqishini kuzating." },
    report: { label: "Hisobot", description: "Siyosat intellektual hisobotini yarating." },
  },
};

export const PRODUCT_STATUS_UZ = {
  live: { label: "Mavjud", explanation: "Bugun haqiqiy, bog‘langan ma’lumotlar bilan ishlaydi." },
  partial: { label: "Qisman", explanation: "Ba’zi haqiqiy ma’lumotlar bog‘langan; boshqalari hali emas." },
  waiting_for_verified_data: { label: "Ma’lumot kutilmoqda", explanation: "Tayyor, lekin hali tasdiqlangan manba bog‘lanmagan." },
  preview: { label: "Ko‘rib chiqish", explanation: "Erta, cheklangan versiya — to‘liq imkoniyat hali emas." },
  restricted: { label: "Cheklangan", explanation: "Faqat ma’lum kontekst yoki rollarda mavjud." },
  not_connected: { label: "Bog‘lanmagan", explanation: "Hali ma’lumot manbasi yoki integratsiya bog‘lanmagan." },
  planned: { label: "Rejalashtirilgan", explanation: "Kelajakdagi reliz uchun rejalashtirilgan — hali qurilmagan." },
} as const;

export const ENTITIES_UZ = {
  countriesDescription: "Har bir mamlakat uchun umumiy ma’lumot, mavjud ma’lumot, yetishmayotgan ma’lumot va hisobotlar.",
  companiesDescription: "Har bir kompaniya uchun umumiy ma’lumot, mavjud ma’lumot, yetishmayotgan ma’lumot va hisobotlar.",
  universitiesDescription: "Har bir universitet uchun umumiy ma’lumot, mavjud ma’lumot, yetishmayotgan ma’lumot va hisobotlar.",
  noMatchFilters: "Filtrlaringizga mos natija topilmadi.",
  clearFilters: "Filtrlarni tozalash",
  selected: "Tanlangan",
  worldMapTitle: "Jahon intellektual xaritasi",
  worldMapShowing: "Jahon intellektual xaritasi — {name} ko‘rsatilmoqda",
} as const;

export const MY_WORK_UZ = {
  title: "Mening ishim",
  yourWork: "{name} ishi",
  restoringSession: "Sessiyangiz tiklanmoqda…",
  projectUnavailable: "Bu loyiha mavjud emas.",
  projectUnavailableBody:
    "Loyihalar faqat ushbu brauzerda saqlanadi — havola boshqa qurilmadan bo‘lishi yoki loyiha bu yerda o‘chirilgan bo‘lishi mumkin. Haqiqiy loyihalar quyida ko‘rsatilgan.",
  backToMyWork: "← Mening ishimga qaytish",
  localProfileNotSetUp: "Mahalliy Operator profili hali sozlanmagan",
  savedToBrowser:
    "Ushbu brauzerda saqlangan — haqiqiy loyihalar, tadqiqot va dalil kirish nuqtalari, hech qachon yasama faoliyat emas.",
  signInPrompt: "Kirish",
  signInOrCreate: "Kirish yoki mahalliy hisob yaratish",
  signedInCloud: "Bulutli hisob sifatida {email} — Loyihalar va Xatcho‘plar barcha qurilmalarda sinxronlanadi.",
  signedInLocal: "{email} sifatida kirilgan — Loyihalar va Xatcho‘plar ushbu qurilmada saqlanadi.",
  continueLinksHeading: "Davom etish",
  onboardingHeading: "Boshlash",
} as const;

export const SYSTEM_UZ = {
  returnHome: "Bosh sahifaga qaytish",
  goBack: "Orqaga",
  search: "Qidiruv",
  continueProject: "Loyihani davom ettirish",
  tryAgain: "Qayta urinish",
  feedback: "Fikr-mulohaza",
} as const;
