/** Voice action outcome copy — EN/UZ/RU/TR. */

export const VOICE_ACTION_OUTCOME_EN = {
  understood_and_executed: "Completed after successful execution",
  understood_confirmation_required: "Understood — confirmation required before saving",
  understood_missing_information: "Understood — one more detail is needed",
  understood_capability_degraded: "Understood — this capability is partially available",
  understood_capability_unavailable: "Understood — this capability is not available yet",
  unsupported_command: "Command not recognized",
  navigation_failed: "Navigation did not complete",
  creation_failed: "Creation did not succeed",
  upload_failed: "Upload did not succeed",
  nextContinue: "Continue with your current work",
  nextConfirm: "Review the draft and confirm",
  nextAnswer: "Answer the focused question",
  nextAlternative: "Choose a real alternative that is available now",
  nextStay: "Stay on this page or retry navigation",
  nextClarify: "Clarify what you want to open or create",
} as const;

export const VOICE_ACTION_OUTCOME_UZ = {
  understood_and_executed: "Muvaffaqiyatli bajarilgandan keyin yakunlandi",
  understood_confirmation_required: "Tushunildi — saqlashdan oldin tasdiq kerak",
  understood_missing_information: "Tushunildi — yana bitta tafsilot kerak",
  understood_capability_degraded: "Tushunildi — bu imkoniyat qisman mavjud",
  understood_capability_unavailable: "Tushunildi — bu imkoniyat hali mavjud emas",
  unsupported_command: "Buyruq tanilmadi",
  navigation_failed: "Navigatsiya yakunlanmadi",
  creation_failed: "Yaratish muvaffaqiyatsiz",
  upload_failed: "Yuklash muvaffaqiyatsiz",
  nextContinue: "Joriy ishingizni davom ettiring",
  nextConfirm: "Qoralamani ko‘rib chiqing va tasdiqlang",
  nextAnswer: "Kerakli savolga javob bering",
  nextAlternative: "Hozir mavjud real muqobilni tanlang",
  nextStay: "Shu sahifada qoling yoki navigatsiyani qayta urinib ko‘ring",
  nextClarify: "Nimani ochish yoki yaratishni aniqlang",
} as const;

export const VOICE_ACTION_OUTCOME_RU = {
  understood_and_executed: "Завершено после успешного выполнения",
  understood_confirmation_required: "Понято — перед сохранением нужно подтверждение",
  understood_missing_information: "Понято — нужна ещё одна деталь",
  understood_capability_degraded: "Понято — возможность доступна частично",
  understood_capability_unavailable: "Понято — возможность пока недоступна",
  unsupported_command: "Команда не распознана",
  navigation_failed: "Переход не завершён",
  creation_failed: "Создание не удалось",
  upload_failed: "Загрузка не удалась",
  nextContinue: "Продолжите текущую работу",
  nextConfirm: "Проверьте черновик и подтвердите",
  nextAnswer: "Ответьте на уточняющий вопрос",
  nextAlternative: "Выберите доступную альтернативу",
  nextStay: "Оставайтесь на странице или повторите переход",
  nextClarify: "Уточните, что открыть или создать",
} as const;

export const VOICE_ACTION_OUTCOME_TR = {
  understood_and_executed: "Başarılı yürütmeden sonra tamamlandı",
  understood_confirmation_required: "Anlaşıldı — kaydetmeden önce onay gerekli",
  understood_missing_information: "Anlaşıldı — bir ayrıntı daha gerekli",
  understood_capability_degraded: "Anlaşıldı — bu özellik kısmen kullanılabilir",
  understood_capability_unavailable: "Anlaşıldı — bu özellik henüz kullanılamıyor",
  unsupported_command: "Komut tanınmadı",
  navigation_failed: "Gezinme tamamlanmadı",
  creation_failed: "Oluşturma başarısız",
  upload_failed: "Yükleme başarısız",
  nextContinue: "Mevcut işinize devam edin",
  nextConfirm: "Taslağı gözden geçirip onaylayın",
  nextAnswer: "Odaklı soruyu yanıtlayın",
  nextAlternative: "Şu an kullanılabilir gerçek bir alternatif seçin",
  nextStay: "Bu sayfada kalın veya gezinmeyi yeniden deneyin",
  nextClarify: "Ne açmak veya oluşturmak istediğinizi netleştirin",
} as const;

export type VoiceActionOutcomeCopy = {
  readonly understood_and_executed: string;
  readonly understood_confirmation_required: string;
  readonly understood_missing_information: string;
  readonly understood_capability_degraded: string;
  readonly understood_capability_unavailable: string;
  readonly unsupported_command: string;
  readonly navigation_failed: string;
  readonly creation_failed: string;
  readonly upload_failed: string;
  readonly nextContinue: string;
  readonly nextConfirm: string;
  readonly nextAnswer: string;
  readonly nextAlternative: string;
  readonly nextStay: string;
  readonly nextClarify: string;
};

export function getVoiceActionOutcomeCopy(locale: string): VoiceActionOutcomeCopy {
  if (locale === "uz") return VOICE_ACTION_OUTCOME_UZ;
  if (locale === "ru") return VOICE_ACTION_OUTCOME_RU;
  if (locale === "tr") return VOICE_ACTION_OUTCOME_TR;
  return VOICE_ACTION_OUTCOME_EN;
}
