export type PdfCopy = {
  title: string;
  intro: string;
  privacy: string;
  choose: string;
  language: string;
  validate: string;
  cancel: string;
  validating: string;
  ready: string;
  unavailable: string;
  invalidType: string;
  tooLarge: string;
  empty: string;
  required: string;
  checksum: string;
  pageCount: string;
  notAvailable: string;
  localOnly: string;
};

const COPY: Record<"en" | "uz" | "ru" | "tr", PdfCopy> = {
  en: {
    title: "Secure PDF intake",
    intro: "Validate source metadata before creating a PDF review work card.",
    privacy: "Local-only: this file is not uploaded, persisted, or sent to a third party. Server extraction is not configured.",
    choose: "Choose PDF",
    language: "Original language",
    validate: "Validate locally",
    cancel: "Cancel",
    validating: "Computing checksum…",
    ready: "Metadata ready; extraction unavailable",
    unavailable: "Text, page references, and citations were not extracted.",
    invalidType: "Choose a valid PDF file.",
    tooLarge: "The PDF exceeds the 25 MB local validation limit.",
    empty: "The selected file is empty.",
    required: "Choose a PDF first.",
    checksum: "SHA-256 checksum",
    pageCount: "Page count",
    notAvailable: "Unavailable until extraction",
    localOnly: "Local metadata only",
  },
  uz: {
    title: "Xavfsiz PDF qabul qilish",
    intro: "PDF ko‘rib chiqish ish kartasini yaratishdan oldin manba metamaʼlumotlarini tekshiring.",
    privacy: "Faqat qurilmada: fayl yuklanmaydi, saqlanmaydi va uchinchi tomonga yuborilmaydi. Serverda ajratib olish sozlanmagan.",
    choose: "PDF tanlash",
    language: "Asl til",
    validate: "Qurilmada tekshirish",
    cancel: "Bekor qilish",
    validating: "Nazorat summasi hisoblanmoqda…",
    ready: "Metamaʼlumot tayyor; ajratib olish mavjud emas",
    unavailable: "Matn, sahifa havolalari va iqtiboslar ajratilmadi.",
    invalidType: "Yaroqli PDF faylini tanlang.",
    tooLarge: "PDF 25 MB mahalliy tekshiruv chegarasidan katta.",
    empty: "Tanlangan fayl bo‘sh.",
    required: "Avval PDF tanlang.",
    checksum: "SHA-256 nazorat summasi",
    pageCount: "Sahifalar soni",
    notAvailable: "Ajratib olinguncha mavjud emas",
    localOnly: "Faqat mahalliy metamaʼlumot",
  },
  ru: {
    title: "Безопасный приём PDF",
    intro: "Проверьте метаданные источника перед созданием рабочей карточки проверки PDF.",
    privacy: "Только локально: файл не загружается, не сохраняется и не передаётся третьим лицам. Серверное извлечение не настроено.",
    choose: "Выбрать PDF",
    language: "Язык оригинала",
    validate: "Проверить локально",
    cancel: "Отменить",
    validating: "Вычисляется контрольная сумма…",
    ready: "Метаданные готовы; извлечение недоступно",
    unavailable: "Текст, ссылки на страницы и цитаты не извлечены.",
    invalidType: "Выберите корректный PDF-файл.",
    tooLarge: "PDF превышает локальный лимит проверки 25 МБ.",
    empty: "Выбранный файл пуст.",
    required: "Сначала выберите PDF.",
    checksum: "Контрольная сумма SHA-256",
    pageCount: "Количество страниц",
    notAvailable: "Недоступно до извлечения",
    localOnly: "Только локальные метаданные",
  },
  tr: {
    title: "Güvenli PDF alımı",
    intro: "PDF inceleme çalışma kartı oluşturmadan önce kaynak meta verilerini doğrulayın.",
    privacy: "Yalnızca yerel: dosya yüklenmez, kalıcı olarak saklanmaz veya üçüncü tarafa gönderilmez. Sunucu tarafı çıkarma yapılandırılmamıştır.",
    choose: "PDF seç",
    language: "Özgün dil",
    validate: "Yerel olarak doğrula",
    cancel: "İptal",
    validating: "Sağlama toplamı hesaplanıyor…",
    ready: "Meta veri hazır; çıkarma kullanılamıyor",
    unavailable: "Metin, sayfa başvuruları ve alıntılar çıkarılmadı.",
    invalidType: "Geçerli bir PDF dosyası seçin.",
    tooLarge: "PDF, 25 MB yerel doğrulama sınırını aşıyor.",
    empty: "Seçilen dosya boş.",
    required: "Önce bir PDF seçin.",
    checksum: "SHA-256 sağlama toplamı",
    pageCount: "Sayfa sayısı",
    notAvailable: "Çıkarma yapılana kadar kullanılamaz",
    localOnly: "Yalnızca yerel meta veri",
  },
};

export function getPdfCopy(locale: string): PdfCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.en;
}
