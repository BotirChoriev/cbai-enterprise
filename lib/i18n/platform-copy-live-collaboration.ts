/**
 * Live Collaboration Rooms wizard + session chrome — EN/UZ/RU/TR.
 * Official titles and user content remain unchanged by locale.
 */

export type LcrCopy = {
  brand: string;
  title: string;
  oneSentence: string;
  primaryAction: string;
  secondaryOpenList: string;
  secondaryJoinLink: string;
  stepPurpose: string;
  stepPeople: string;
  stepTimeAccess: string;
  stepMaterialsConsent: string;
  next: string;
  back: string;
  confirmCreate: string;
  reviewHeading: string;
  reviewWillCreate: string;
  reviewWhoJoins: string;
  reviewWhatVisible: string;
  reviewMediaStored: string;
  reviewUnknown: string;
  reviewApprover: string;
  fieldTitle: string;
  fieldRoomType: string;
  fieldPurpose: string;
  fieldOutcome: string;
  fieldTopic: string;
  fieldHost: string;
  fieldModerator: string;
  fieldPresenters: string;
  fieldObservers: string;
  fieldApprover: string;
  fieldStartNow: string;
  fieldSchedule: string;
  fieldTimezone: string;
  fieldRecurrence: string;
  fieldAttendance: string;
  fieldAccess: string;
  fieldGuest: string;
  fieldWaiting: string;
  fieldLimit: string;
  fieldMaterialTitle: string;
  fieldMaterialSource: string;
  fieldConfidentiality: string;
  fieldIp: string;
  fieldRecording: string;
  fieldTranscript: string;
  fieldTranslationAudio: string;
  fieldPublicSession: string;
  fieldSpeak: string;
  fieldRead: string;
  fieldHear: string;
  confirmReviewCheckbox: string;
  emptyTitle: string;
  emptyBody: string;
  openRoom: string;
  multipartyHonest: string;
  publicHostingUnavailable: string;
  smsUnavailable: string;
  emailDeliveryUnavailable: string;
  phoneNotRequired: string;
  identityUnverified: string;
  identityGuest: string;
  identityMember: string;
  identitySimulated: string;
  navAgenda: string;
  navParticipants: string;
  navPresentations: string;
  navEvidence: string;
  navQuestions: string;
  navDiscussion: string;
  navTranslation: string;
  navDecisions: string;
  navActions: string;
  navFiles: string;
  stageTitle: string;
  stagePlaceholderVideo: string;
  stagePlaceholderScreen: string;
  stagePresenter: string;
  stageEvidence: string;
  railPurpose: string;
  railAgenda: string;
  railSpeaker: string;
  railOriginal: string;
  railTranslated: string;
  railEvidence: string;
  railContradictions: string;
  railUnknowns: string;
  railQuestions: string;
  railDecisions: string;
  railActions: string;
  railApproval: string;
  controlMic: string;
  controlCamera: string;
  controlShare: string;
  controlHand: string;
  controlTranslation: string;
  controlMore: string;
  controlLeave: string;
  devicePreflight: string;
  deviceUnavailable: string;
  leaveReleasesDevices: string;
  humanDecides: string;
  type_scientific_deliberation: string;
  type_project_presentation: string;
  type_live_laboratory: string;
  type_conference: string;
  type_collaboration: string;
  type_methodology_clinic: string;
  type_replication_session: string;
  type_public_presentation: string;
  type_expert_council: string;
  type_hybrid_meeting: string;
  type_meeting_hall: string;
  type_laboratory: string;
  type_practice: string;
  attendance_online: string;
  attendance_offline: string;
  attendance_hybrid: string;
  access_private: string;
  access_invite: string;
  access_link: string;
  access_public: string;
  validationRequired: string;
  createError: string;
};

const EN: LcrCopy = {
  brand: "CBAI",
  title: "Live Collaboration Rooms",
  oneSentence:
    "Consent-aware rooms for scientific meetings, labs, presentations, and hybrid collaboration — CBAI structures; humans decide.",
  primaryAction: "Create a room",
  secondaryOpenList: "Your rooms",
  secondaryJoinLink: "Join with link or code",
  stepPurpose: "Purpose",
  stepPeople: "People",
  stepTimeAccess: "Time & access",
  stepMaterialsConsent: "Materials & consent",
  next: "Continue",
  back: "Back",
  confirmCreate: "Confirm and create room",
  reviewHeading: "Final review",
  reviewWillCreate: "What will be created",
  reviewWhoJoins: "Who can join",
  reviewWhatVisible: "What participants can see",
  reviewMediaStored: "Media / transcript storage",
  reviewUnknown: "What remains unknown",
  reviewApprover: "Who must approve outcomes",
  fieldTitle: "Room title",
  fieldRoomType: "Room type",
  fieldPurpose: "Question or problem",
  fieldOutcome: "Expected outcome",
  fieldTopic: "Topic / domain",
  fieldHost: "Host display name",
  fieldModerator: "Moderator",
  fieldPresenters: "Presenters (comma-separated)",
  fieldObservers: "Observers note",
  fieldApprover: "Final human approver",
  fieldStartNow: "Start now",
  fieldSchedule: "Schedule start",
  fieldTimezone: "Timezone",
  fieldRecurrence: "Recurrence",
  fieldAttendance: "Attendance mode",
  fieldAccess: "Access",
  fieldGuest: "Guest policy",
  fieldWaiting: "Waiting room",
  fieldLimit: "Participant limit (optional)",
  fieldMaterialTitle: "Material title",
  fieldMaterialSource: "File, DOI, ORCID, or URL",
  fieldConfidentiality: "Confidentiality",
  fieldIp: "Intellectual-property status",
  fieldRecording: "Allow local recording retention",
  fieldTranscript: "Allow transcript retention",
  fieldTranslationAudio: "Allow synthetic translated audio",
  fieldPublicSession: "Configure as public presentation",
  fieldSpeak: "I speak",
  fieldRead: "I read",
  fieldHear: "I listen",
  confirmReviewCheckbox: "I reviewed purpose, people, access, consent, and approval — create this room",
  emptyTitle: "No rooms yet",
  emptyBody: "Start with purpose, then people, time, and consent. Nothing is created until you confirm.",
  openRoom: "Open room",
  multipartyHonest:
    "Multi-party live audio/video is not available in this Preview. Host capture uses Voice Operator; other participants may be simulated for translation UX.",
  publicHostingUnavailable: "Public hosting/delivery is planned — no live public URL is generated yet.",
  smsUnavailable: "SMS invitations require a connected provider — unavailable here.",
  emailDeliveryUnavailable: "Email delivery is not connected — drafts stay local until a provider exists.",
  phoneNotRequired: "Phone number is never required.",
  identityUnverified: "Unverified guest",
  identityGuest: "Invited guest",
  identityMember: "Verified CBAI member",
  identitySimulated: "AI simulated (labeled)",
  navAgenda: "Agenda",
  navParticipants: "Participants",
  navPresentations: "Presentations",
  navEvidence: "Evidence",
  navQuestions: "Questions",
  navDiscussion: "Discussion",
  navTranslation: "Translation",
  navDecisions: "Decisions",
  navActions: "Action items",
  navFiles: "Files",
  stageTitle: "Live stage",
  stagePlaceholderVideo: "Participant video grid — unavailable (Preview)",
  stagePlaceholderScreen: "Screen sharing — browser permission required; multiparty relay unavailable",
  stagePresenter: "Presenter stage",
  stageEvidence: "Evidence argument canvas",
  railPurpose: "Room purpose",
  railAgenda: "Current agenda item",
  railSpeaker: "Current speaker",
  railOriginal: "Original",
  railTranslated: "Translation",
  railEvidence: "Cited evidence",
  railContradictions: "Contradictions",
  railUnknowns: "Unknowns",
  railQuestions: "Open questions",
  railDecisions: "Decisions",
  railActions: "Action items",
  railApproval: "Next human approval",
  controlMic: "Microphone",
  controlCamera: "Camera",
  controlShare: "Share screen",
  controlHand: "Raise hand",
  controlTranslation: "Translation",
  controlMore: "More",
  controlLeave: "Leave room",
  devicePreflight: "Device preflight",
  deviceUnavailable: "Unavailable in this Preview",
  leaveReleasesDevices: "Leaving releases microphone and camera tracks.",
  humanDecides: "CBAI structures and explains; the human decides.",
  type_scientific_deliberation: "Scientific deliberation",
  type_project_presentation: "Project presentation",
  type_live_laboratory: "Live laboratory",
  type_conference: "Conference",
  type_collaboration: "Collaboration",
  type_methodology_clinic: "Methodology clinic",
  type_replication_session: "Replication session",
  type_public_presentation: "Public presentation",
  type_expert_council: "Expert council",
  type_hybrid_meeting: "Hybrid meeting",
  type_meeting_hall: "Meeting hall",
  type_laboratory: "Laboratory",
  type_practice: "Practice",
  attendance_online: "Online",
  attendance_offline: "Offline",
  attendance_hybrid: "Hybrid",
  access_private: "Private",
  access_invite: "Invite only",
  access_link: "Link",
  access_public: "Public",
  validationRequired: "Complete required fields before continuing.",
  createError: "Room was not created. Confirm the review step and try again.",
};

const UZ: LcrCopy = {
  ...EN,
  title: "Jonli hamkorlik xonalari",
  oneSentence:
    "Ilmiy yig‘ilish, laboratoriya, taqdimot va gibrid hamkorlik uchun rozilikka asoslangan xonalar — CBAI tuzadi; inson qaror qiladi.",
  primaryAction: "Xona yaratish",
  secondaryOpenList: "Xonalarimiz",
  secondaryJoinLink: "Havola yoki kod bilan kirish",
  stepPurpose: "Maqsad",
  stepPeople: "Ishtirokchilar",
  stepTimeAccess: "Vaqt va kirish",
  stepMaterialsConsent: "Materiallar va rozilik",
  next: "Davom etish",
  back: "Orqaga",
  confirmCreate: "Tasdiqlab xona yaratish",
  reviewHeading: "Yakuniy ko‘rib chiqish",
  reviewWillCreate: "Nima yaratiladi",
  reviewWhoJoins: "Kim qo‘shilishi mumkin",
  reviewWhatVisible: "Ishtirokchilar nima ko‘radi",
  reviewMediaStored: "Media / transkript saqlash",
  reviewUnknown: "Nima noma’lum qoladi",
  reviewApprover: "Natijani kim tasdiqlaydi",
  fieldTitle: "Xona sarlavhasi",
  fieldRoomType: "Xona turi",
  fieldPurpose: "Savol yoki muammo",
  fieldOutcome: "Kutilayotgan natija",
  fieldTopic: "Mavzu / soha",
  fieldHost: "Mezbon ismi",
  fieldModerator: "Moderator",
  fieldPresenters: "Taqdimotchilar (vergul bilan)",
  fieldObservers: "Kuzatuvchilar haqida",
  fieldApprover: "Yakuniy inson tasdiqlovchi",
  fieldStartNow: "Hozir boshlash",
  fieldSchedule: "Rejalashtirilgan boshlanish",
  fieldTimezone: "Vaqt mintaqasi",
  fieldRecurrence: "Takrorlash",
  fieldAttendance: "Ishtirok usuli",
  fieldAccess: "Kirish",
  fieldGuest: "Mehmon siyosati",
  fieldWaiting: "Kutish xonasi",
  fieldLimit: "Ishtirokchi limiti (ixtiyoriy)",
  fieldMaterialTitle: "Material sarlavhasi",
  fieldMaterialSource: "Fayl, DOI, ORCID yoki URL",
  fieldConfidentiality: "Maxfiylik",
  fieldIp: "Intellektual mulk holati",
  fieldRecording: "Mahalliy yozuvni saqlashga ruxsat",
  fieldTranscript: "Transkriptni saqlashga ruxsat",
  fieldTranslationAudio: "Sintetik tarjima audiosiga ruxsat",
  fieldPublicSession: "Ommaviy taqdimot sifatida sozlash",
  fieldSpeak: "Men gapiraman",
  fieldRead: "Men o‘qiyman",
  fieldHear: "Men eshitaman",
  confirmReviewCheckbox:
    "Maqsad, ishtirokchilar, kirish, rozilik va tasdiqni ko‘rib chiqdim — xonani yarating",
  emptyTitle: "Hali xona yo‘q",
  emptyBody: "Avval maqsad, keyin odamlar, vaqt va rozilik. Tasdiqlamasdan hech narsa yaratilmaydi.",
  openRoom: "Xonani ochish",
  multipartyHonest:
    "Ko‘p tomonlama jonli audio/video ushbu Previewda mavjud emas. Mezbon yozuvi Ovoz Operatoridan; boshqa ishtirokchilar tarjima UX uchun simulyatsiya qilinishi mumkin.",
  publicHostingUnavailable: "Ommaviy hosting rejalashtirilgan — jonli ommaviy URL hali yaratilmaydi.",
  smsUnavailable: "SMS takliflar uchun provayder kerak — bu yerda mavjud emas.",
  emailDeliveryUnavailable: "Email yetkazish ulanmagan — qoralamalar mahalliy qoladi.",
  phoneNotRequired: "Telefon raqami hech qachon majburiy emas.",
  identityUnverified: "Tasdiqlanmagan mehmon",
  identityGuest: "Taklif qilingan mehmon",
  identityMember: "Tasdiqlangan CBAI a’zosi",
  identitySimulated: "AI simulyatsiya (belgilangan)",
  navAgenda: "Kun tartibi",
  navParticipants: "Ishtirokchilar",
  navPresentations: "Taqdimotlar",
  navEvidence: "Dalillar",
  navQuestions: "Savollar",
  navDiscussion: "Muhokama",
  navTranslation: "Tarjima",
  navDecisions: "Qarorlar",
  navActions: "Harakatlar",
  navFiles: "Fayllar",
  stageTitle: "Jonli sahna",
  stagePlaceholderVideo: "Ishtirokchi video paneli — mavjud emas (Preview)",
  stagePlaceholderScreen: "Ekran ulashish — brauzer ruxsati; multiparty relay yo‘q",
  stagePresenter: "Taqdimotchi sahna",
  stageEvidence: "Dalil argument canvas",
  railPurpose: "Xona maqsadi",
  railAgenda: "Joriy kun tartibi",
  railSpeaker: "Joriy so‘zlovchi",
  railOriginal: "Asl",
  railTranslated: "Tarjima",
  railEvidence: "Keltirilgan dalillar",
  railContradictions: "Ziddiyatlar",
  railUnknowns: "Noma’lumlar",
  railQuestions: "Ochiq savollar",
  railDecisions: "Qarorlar",
  railActions: "Harakatlar",
  railApproval: "Keyingi inson tasdig‘i",
  controlMic: "Mikrofon",
  controlCamera: "Kamera",
  controlShare: "Ekranni ulashish",
  controlHand: "Qo‘l ko‘tarish",
  controlTranslation: "Tarjima",
  controlMore: "Yana",
  controlLeave: "Xonadan chiqish",
  devicePreflight: "Qurilma tekshiruvi",
  deviceUnavailable: "Ushbu Previewda mavjud emas",
  leaveReleasesDevices: "Chiqish mikrofon va kamera treklarini to‘xtatadi.",
  humanDecides: "CBAI tuzadi va tushuntiradi; inson qaror qiladi.",
  type_scientific_deliberation: "Ilmiy muhokama",
  type_project_presentation: "Loyiha taqdimoti",
  type_live_laboratory: "Jonli laboratoriya",
  type_conference: "Konferensiya",
  type_collaboration: "Hamkorlik",
  type_methodology_clinic: "Metodologiya klinikasi",
  type_replication_session: "Takrorlash sessiyasi",
  type_public_presentation: "Ommaviy taqdimot",
  type_expert_council: "Ekspert kengashi",
  type_hybrid_meeting: "Gibrid yig‘ilish",
  type_meeting_hall: "Yig‘ilish zali",
  type_laboratory: "Laboratoriya",
  type_practice: "Mashq",
  attendance_online: "Onlayn",
  attendance_offline: "Oflayn",
  attendance_hybrid: "Gibrid",
  access_private: "Maxfiy",
  access_invite: "Faqat taklif",
  access_link: "Havola",
  access_public: "Ommaviy",
  validationRequired: "Davom etishdan oldin majburiy maydonlarni to‘ldiring.",
  createError: "Xona yaratilmadi. Ko‘rib chiqishni tasdiqlang va qayta urinib ko‘ring.",
};

const RU: LcrCopy = {
  ...EN,
  title: "Живые комнаты сотрудничества",
  oneSentence:
    "Комнаты с согласием для научных встреч, лабораторий, презентаций и гибридной работы — CBAI структурирует; человек решает.",
  primaryAction: "Создать комнату",
  secondaryOpenList: "Ваши комнаты",
  secondaryJoinLink: "Войти по ссылке или коду",
  stepPurpose: "Цель",
  stepPeople: "Участники",
  stepTimeAccess: "Время и доступ",
  stepMaterialsConsent: "Материалы и согласие",
  next: "Далее",
  back: "Назад",
  confirmCreate: "Подтвердить и создать",
  reviewHeading: "Итоговая проверка",
  reviewWillCreate: "Что будет создано",
  reviewWhoJoins: "Кто может войти",
  reviewWhatVisible: "Что видят участники",
  reviewMediaStored: "Хранение медиа / расшифровки",
  reviewUnknown: "Что остаётся неизвестным",
  reviewApprover: "Кто утверждает итог",
  fieldTitle: "Название комнаты",
  fieldRoomType: "Тип комнаты",
  fieldPurpose: "Вопрос или проблема",
  fieldOutcome: "Ожидаемый результат",
  fieldTopic: "Тема / область",
  fieldHost: "Имя ведущего",
  fieldModerator: "Модератор",
  fieldPresenters: "Докладчики (через запятую)",
  fieldObservers: "Заметка о наблюдателях",
  fieldApprover: "Финальный утверждающий",
  fieldStartNow: "Начать сейчас",
  fieldSchedule: "Начало по расписанию",
  fieldTimezone: "Часовой пояс",
  fieldRecurrence: "Повтор",
  fieldAttendance: "Формат участия",
  fieldAccess: "Доступ",
  fieldGuest: "Гостевая политика",
  fieldWaiting: "Зал ожидания",
  fieldLimit: "Лимит участников (необяз.)",
  fieldMaterialTitle: "Название материала",
  fieldMaterialSource: "Файл, DOI, ORCID или URL",
  fieldConfidentiality: "Конфиденциальность",
  fieldIp: "Статус ИС",
  fieldRecording: "Разрешить локальную запись",
  fieldTranscript: "Разрешить хранение расшифровки",
  fieldTranslationAudio: "Разрешить синтетическое аудио перевода",
  fieldPublicSession: "Настроить как публичную презентацию",
  fieldSpeak: "Я говорю",
  fieldRead: "Я читаю",
  fieldHear: "Я слушаю",
  confirmReviewCheckbox: "Я проверил цель, людей, доступ, согласие и утверждение — создать комнату",
  emptyTitle: "Комнат пока нет",
  emptyBody: "Сначала цель, затем люди, время и согласие. Без подтверждения ничего не создаётся.",
  openRoom: "Открыть комнату",
  multipartyHonest:
    "Многостороннее аудио/видео недоступно в этом Preview. Захват ведущего — через Voice Operator; другие участники могут быть смоделированы.",
  publicHostingUnavailable: "Публичный хостинг запланирован — живой публичный URL пока не создаётся.",
  smsUnavailable: "SMS-приглашения требуют провайдера — здесь недоступны.",
  emailDeliveryUnavailable: "Доставка email не подключена — черновики остаются локальными.",
  phoneNotRequired: "Номер телефона никогда не обязателен.",
  identityUnverified: "Непроверенный гость",
  identityGuest: "Приглашённый гость",
  identityMember: "Проверенный участник CBAI",
  identitySimulated: "ИИ-симуляция (помечена)",
  navAgenda: "Повестка",
  navParticipants: "Участники",
  navPresentations: "Презентации",
  navEvidence: "Доказательства",
  navQuestions: "Вопросы",
  navDiscussion: "Обсуждение",
  navTranslation: "Перевод",
  navDecisions: "Решения",
  navActions: "Действия",
  navFiles: "Файлы",
  stageTitle: "Живая сцена",
  stagePlaceholderVideo: "Сетка видео — недоступна (Preview)",
  stagePlaceholderScreen: "Демонстрация экрана — нужно разрешение; multiparty недоступен",
  stagePresenter: "Сцена докладчика",
  stageEvidence: "Холст аргументов по доказательствам",
  railPurpose: "Цель комнаты",
  railAgenda: "Текущий пункт повестки",
  railSpeaker: "Текущий спикер",
  railOriginal: "Оригинал",
  railTranslated: "Перевод",
  railEvidence: "Цитируемые доказательства",
  railContradictions: "Противоречия",
  railUnknowns: "Неизвестное",
  railQuestions: "Открытые вопросы",
  railDecisions: "Решения",
  railActions: "Действия",
  railApproval: "Следующее утверждение человеком",
  controlMic: "Микрофон",
  controlCamera: "Камера",
  controlShare: "Демонстрация",
  controlHand: "Поднять руку",
  controlTranslation: "Перевод",
  controlMore: "Ещё",
  controlLeave: "Выйти",
  devicePreflight: "Проверка устройств",
  deviceUnavailable: "Недоступно в этом Preview",
  leaveReleasesDevices: "Выход останавливает треки микрофона и камеры.",
  humanDecides: "CBAI структурирует и объясняет; человек решает.",
  type_scientific_deliberation: "Научная дискуссия",
  type_project_presentation: "Презентация проекта",
  type_live_laboratory: "Живая лаборатория",
  type_conference: "Конференция",
  type_collaboration: "Сотрудничество",
  type_methodology_clinic: "Методологическая клиника",
  type_replication_session: "Сессия репликации",
  type_public_presentation: "Публичная презентация",
  type_expert_council: "Экспертный совет",
  type_hybrid_meeting: "Гибридная встреча",
  type_meeting_hall: "Зал заседаний",
  type_laboratory: "Лаборатория",
  type_practice: "Практика",
  attendance_online: "Онлайн",
  attendance_offline: "Офлайн",
  attendance_hybrid: "Гибрид",
  access_private: "Закрытый",
  access_invite: "Только по приглашению",
  access_link: "Ссылка",
  access_public: "Публичный",
  validationRequired: "Заполните обязательные поля перед продолжением.",
  createError: "Комната не создана. Подтвердите проверку и повторите.",
};

const TR: LcrCopy = {
  ...EN,
  title: "Canlı İşbirliği Odaları",
  oneSentence:
    "Bilimsel toplantılar, laboratuvarlar, sunumlar ve hibrit işbirliği için onay temelli odalar — CBAI yapılandırır; insan karar verir.",
  primaryAction: "Oda oluştur",
  secondaryOpenList: "Odalarınız",
  secondaryJoinLink: "Bağlantı veya kodla katıl",
  stepPurpose: "Amaç",
  stepPeople: "Kişiler",
  stepTimeAccess: "Zaman ve erişim",
  stepMaterialsConsent: "Materyal ve onay",
  next: "Devam",
  back: "Geri",
  confirmCreate: "Onayla ve oluştur",
  reviewHeading: "Son inceleme",
  reviewWillCreate: "Ne oluşturulacak",
  reviewWhoJoins: "Kim katılabilir",
  reviewWhatVisible: "Katılımcılar ne görür",
  reviewMediaStored: "Medya / transkript saklama",
  reviewUnknown: "Ne bilinmiyor kalır",
  reviewApprover: "Sonucu kim onaylar",
  fieldTitle: "Oda başlığı",
  fieldRoomType: "Oda türü",
  fieldPurpose: "Soru veya sorun",
  fieldOutcome: "Beklenen sonuç",
  fieldTopic: "Konu / alan",
  fieldHost: "Ev sahibi adı",
  fieldModerator: "Moderatör",
  fieldPresenters: "Sunucular (virgülle)",
  fieldObservers: "Gözlemci notu",
  fieldApprover: "Son insan onaylayıcı",
  fieldStartNow: "Şimdi başlat",
  fieldSchedule: "Planlanan başlangıç",
  fieldTimezone: "Saat dilimi",
  fieldRecurrence: "Tekrar",
  fieldAttendance: "Katılım biçimi",
  fieldAccess: "Erişim",
  fieldGuest: "Misafir politikası",
  fieldWaiting: "Bekleme odası",
  fieldLimit: "Katılımcı limiti (isteğe bağlı)",
  fieldMaterialTitle: "Materyal başlığı",
  fieldMaterialSource: "Dosya, DOI, ORCID veya URL",
  fieldConfidentiality: "Gizlilik",
  fieldIp: "Fikri mülkiyet durumu",
  fieldRecording: "Yerel kayda izin ver",
  fieldTranscript: "Transkript saklamaya izin ver",
  fieldTranslationAudio: "Sentetik çeviri sesine izin ver",
  fieldPublicSession: "Herkese açık sunum olarak ayarla",
  fieldSpeak: "Konuştuğum dil",
  fieldRead: "Okuduğum dil",
  fieldHear: "Dinlediğim dil",
  confirmReviewCheckbox: "Amaç, kişiler, erişim, onay ve onayı inceledim — odayı oluştur",
  emptyTitle: "Henüz oda yok",
  emptyBody: "Önce amaç, sonra kişiler, zaman ve onay. Onaylamadan hiçbir şey oluşturulmaz.",
  openRoom: "Odayı aç",
  multipartyHonest:
    "Çok taraflı canlı ses/görüntü bu Preview’da yok. Ev sahibi yakalama Voice Operator ile; diğerleri çeviri UX için simüle edilebilir.",
  publicHostingUnavailable: "Herkese açık barındırma planlandı — canlı genel URL henüz üretilmez.",
  smsUnavailable: "SMS davetleri sağlayıcı gerektirir — burada yok.",
  emailDeliveryUnavailable: "E-posta teslimi bağlı değil — taslaklar yerel kalır.",
  phoneNotRequired: "Telefon numarası asla zorunlu değildir.",
  identityUnverified: "Doğrulanmamış misafir",
  identityGuest: "Davetli misafir",
  identityMember: "Doğrulanmış CBAI üyesi",
  identitySimulated: "YZ simülasyonu (etiketli)",
  navAgenda: "Gündem",
  navParticipants: "Katılımcılar",
  navPresentations: "Sunumlar",
  navEvidence: "Kanıt",
  navQuestions: "Sorular",
  navDiscussion: "Tartışma",
  navTranslation: "Çeviri",
  navDecisions: "Kararlar",
  navActions: "Eylemler",
  navFiles: "Dosyalar",
  stageTitle: "Canlı sahne",
  stagePlaceholderVideo: "Katılımcı video ızgarası — yok (Preview)",
  stagePlaceholderScreen: "Ekran paylaşımı — izin gerekir; multiparty yok",
  stagePresenter: "Sunucu sahnesi",
  stageEvidence: "Kanıt argüman tuvali",
  railPurpose: "Oda amacı",
  railAgenda: "Güncel gündem maddesi",
  railSpeaker: "Güncel konuşmacı",
  railOriginal: "Orijinal",
  railTranslated: "Çeviri",
  railEvidence: "Atıf yapılan kanıt",
  railContradictions: "Çelişkiler",
  railUnknowns: "Bilinmeyenler",
  railQuestions: "Açık sorular",
  railDecisions: "Kararlar",
  railActions: "Eylemler",
  railApproval: "Sonraki insan onayı",
  controlMic: "Mikrofon",
  controlCamera: "Kamera",
  controlShare: "Ekranı paylaş",
  controlHand: "El kaldır",
  controlTranslation: "Çeviri",
  controlMore: "Diğer",
  controlLeave: "Odadan ayrıl",
  devicePreflight: "Cihaz ön kontrolü",
  deviceUnavailable: "Bu Preview’da yok",
  leaveReleasesDevices: "Ayrılmak mikrofon ve kamera izlerini durdurur.",
  humanDecides: "CBAI yapılandırır ve açıklar; insan karar verir.",
  type_scientific_deliberation: "Bilimsel müzakere",
  type_project_presentation: "Proje sunumu",
  type_live_laboratory: "Canlı laboratuvar",
  type_conference: "Konferans",
  type_collaboration: "İşbirliği",
  type_methodology_clinic: "Metodoloji kliniği",
  type_replication_session: "Tekrar oturumu",
  type_public_presentation: "Herkese açık sunum",
  type_expert_council: "Uzman konseyi",
  type_hybrid_meeting: "Hibrit toplantı",
  type_meeting_hall: "Toplantı salonu",
  type_laboratory: "Laboratuvar",
  type_practice: "Alıştırma",
  attendance_online: "Çevrimiçi",
  attendance_offline: "Çevrimdışı",
  attendance_hybrid: "Hibrit",
  access_private: "Özel",
  access_invite: "Yalnızca davet",
  access_link: "Bağlantı",
  access_public: "Herkese açık",
  validationRequired: "Devam etmeden önce zorunlu alanları doldurun.",
  createError: "Oda oluşturulmadı. İncelemeyi onaylayıp yeniden deneyin.",
};

export function getLcrCopy(language: string): LcrCopy {
  if (language === "uz") return UZ;
  if (language === "ru") return RU;
  if (language === "tr") return TR;
  return EN;
}

export function roomTypeLabel(copy: LcrCopy, type: string): string {
  const key = `type_${type}` as keyof LcrCopy;
  const value = copy[key];
  return typeof value === "string" ? value : type;
}
