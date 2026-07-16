import type { CompassDirectionCopy } from "@/lib/i18n/dictionary-types";

export const COMPASS_COPY_TR: {
  default: CompassDirectionCopy;
  academic: CompassDirectionCopy;
  engineer: CompassDirectionCopy;
  investor: CompassDirectionCopy;
  government: CompassDirectionCopy;
} = {
  default: {
    discover: { label: "Keşfet", description: "Ülkeler, şirketler, üniversiteler ve araştırma konularını arayın." },
    research: { label: "Araştırma", description: "Gerçek araştırma konularını ve kanıtlarını keşfedin." },
    evidence: { label: "Kanıt", description: "Profillerdeki resmi kaynak durumunu inceleyin." },
    analyze: { label: "Analiz", description: "Kanıt, notlar ve açık soruları düzenleyin." },
    organize: { label: "Organize", description: "Çalışmanızı takip etmek için bir projeye devam edin veya başlayın." },
    report: { label: "Rapor", description: "Gerçek, kanıta dayalı raporlar oluşturun ve inceleyin." },
  },
  academic: {
    discover: { label: "Soru", description: "Gerçek bir araştırma sorusundan başlayın." },
    research: { label: "Araştırma", description: "İlgili araştırma konularını keşfedin." },
    evidence: { label: "Kanıt", description: "Destekleyici ve karşıt kanıtları bağlayın." },
    analyze: { label: "Notlar", description: "Bulguları araştırma çalışma alanında belgeleyin." },
    organize: { label: "Analiz", description: "Projenizin gerçek ilerlemesini takip edin." },
    report: { label: "Rapor", description: "Bulgularınızı bir raporda birleştirin." },
  },
  engineer: {
    discover: { label: "Gereksinim", description: "Standartları, sistemleri ve kuruluşları arayın." },
    research: { label: "Standart", description: "İlgili teknik araştırma konularını keşfedin." },
    evidence: { label: "Kanıt", description: "Bağlı teknik kanıt ve kaynakları inceleyin." },
    analyze: { label: "Karar kaydı", description: "Değerlendirmenizi proje notlarında belgeleyin." },
    organize: { label: "Proje", description: "Görevleri ve açık soruları takip edin." },
    report: { label: "Rapor", description: "Teknik değerlendirme raporunuzu oluşturun." },
  },
  investor: {
    discover: { label: "Pazar", description: "Şirketleri, ülkeleri ve sektörleri arayın." },
    research: { label: "Kuruluş", description: "İlgili şirketleri ve araştırmaları keşfedin." },
    evidence: { label: "Kanıt", description: "Bağlı finansal ve kanıt kaynaklarını inceleyin." },
    analyze: { label: "Karşılaştırma", description: "Kuruluşları yan yana karşılaştırın." },
    organize: { label: "Proje", description: "Yatırım analizinizi takip edin." },
    report: { label: "Rapor", description: "Yatırım istihbarat raporunuzu oluşturun." },
  },
  government: {
    discover: { label: "Ülke", description: "Ülkeleri ve kamu kurumlarını arayın." },
    research: { label: "Kurum", description: "İlgili kurumları ve araştırmaları keşfedin." },
    evidence: { label: "Gösterge", description: "Bağlı yönetişim kanıtlarını inceleyin." },
    analyze: { label: "Senaryo", description: "Politika analizini çalışma alanınızda belgeleyin." },
    organize: { label: "Proje", description: "Politika incelemenizi takip edin." },
    report: { label: "Rapor", description: "Politika istihbarat raporunuzu oluşturun." },
  },
};

export const PRODUCT_STATUS_TR = {
  live: { label: "Mevcut", explanation: "Bugün gerçek, bağlı verilerle çalışır." },
  partial: { label: "Kısmi", explanation: "Bazı gerçek veriler bağlı; diğer kısımlar henüz değil." },
  waiting_for_verified_data: { label: "Veri bekleniyor", explanation: "Hazır, ancak henüz doğrulanmış kaynak bağlı değil." },
  preview: { label: "Önizleme", explanation: "Erken, sınırlı sürüm — tam yetenek henüz değil." },
  restricted: { label: "Kısıtlı", explanation: "Yalnızca belirli bağlamlarda veya rollere açık." },
  not_connected: { label: "Bağlı değil", explanation: "Henüz veri kaynağı veya entegrasyon bağlı değil." },
  planned: { label: "Planlandı", explanation: "Gelecek sürüm için planlandı — henüz oluşturulmadı." },
} as const;

export const ENTITIES_TR = {
  countriesDescription: "Her ülke için genel bakış, mevcut bilgi, eksik bilgi ve raporlar.",
  companiesDescription: "Her şirket için genel bakış, mevcut bilgi, eksik bilgi ve raporlar.",
  universitiesDescription: "Her üniversite için genel bakış, mevcut bilgi, eksik bilgi ve raporlar.",
  noMatchFilters: "Filtrelerinizle eşleşen sonuç yok.",
  clearFilters: "Filtreleri temizle",
  selected: "Seçildi",
  worldMapTitle: "Dünya İstihbarat Haritası",
  worldMapShowing: "Dünya İstihbarat Haritası — {name} gösteriliyor",
} as const;

export const MY_WORK_TR = {
  title: "Çalışmalarım",
  yourWork: "{name} Çalışması",
  restoringSession: "Oturumunuz geri yükleniyor…",
  projectUnavailable: "Bu proje mevcut değil.",
  projectUnavailableBody:
    "Projeler yalnızca bu tarayıcıda kaydedilir — bağlantı başka bir cihazdan olabilir veya proje burada kaldırılmış olabilir. Gerçek projeleriniz aşağıda listelenir.",
  backToMyWork: "← Çalışmalarıma dön",
  localProfileNotSetUp: "Yerel Operatör profili henüz ayarlanmadı",
  savedToBrowser:
    "Bu tarayıcıda kaydedildi — gerçek projeler, araştırma ve kanıt giriş noktaları; sahte aktivite yok.",
  signInPrompt: "Giriş yap",
  signInOrCreate: "Giriş yap veya yerel hesap oluştur",
  signedInCloud: "Bulut hesabı olarak {email} — Projeler ve Yer İşaretleri tüm cihazlarda senkronize olur.",
  signedInLocal: "{email} olarak giriş yapıldı — Projeler ve Yer İşaretleri yalnızca bu cihazda kaydedilir.",
  continueLinksHeading: "Devam et",
  onboardingHeading: "Başla",
} as const;

export const SYSTEM_TR = {
  returnHome: "Ana sayfaya dön",
  goBack: "Geri",
  search: "Ara",
  continueProject: "Projeye devam et",
  tryAgain: "Tekrar dene",
  feedback: "Geri bildirim",
} as const;
