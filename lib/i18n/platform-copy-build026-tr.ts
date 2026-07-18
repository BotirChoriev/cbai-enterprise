/** BUILD-026 — Knowledge Brain and research completion i18n. */

export const KNOWLEDGE_BRAIN_TR = {
  eyebrow: "Bilgi durumu",
  whatIsThis: "Bu nedir",
  whyItMatters: "Neden önemli",
  missionRelevance: "Görev ilişkisi",
  known: "Bilinen",
  unknown: "Bilinmeyen",
  conflict: "Çelişki",
  needsReview: "İnceleme gerekli",
  howWeKnow: "Nasıl biliyoruz",
  provenance: "Köken",
  freshness: "Güncellik",
  supportingEvidence: "Destekleyen kanıtlar",
  contradictingEvidence: "Çelişen kanıtlar",
  missingEvidence: "Eksik kanıtlar",
  limitations: "Sınırlamalar",
  humanReviewRequired: "Sonuçlardan önce insan incelemesi gerekir.",
  noMission: "Kanıt ve bilgiyi bir soruna bağlamak için görev başlatın.",
  emptyBucket: "Bu kategoride henüz kayıt yok.",
  suggestedNext: "Önerilen sonraki adım",
  sourceNotConnected:
    "Canlı dış kataloglar bağlı değil — yalnızca katalog ve cihaz içi referanslar.",
  evidenceStateKnownDetail: "İzlenebilir kaynak meta verisiyle bağlantılar.",
  evidenceStateUnknownDetail: "Eksik kaynaklar veya belgelenmiş boşluklar.",
  evidenceStateConflictDetail: "Referanslar arasında uyumsuzluk tespit edildi.",
  evidenceStateNeedsReviewDetail: "Güncellik veya doğrulama için insan incelemesi önerilir.",
} as const;

export const RESEARCH_TOPIC_COMPLETION_TR = {
  openQuestionsTitle: "Açık araştırma soruları",
  openQuestionsNotConnected:
    "Açık soru kayıtları yalnızca katalogda — canlı araştırma veritabanları bağlı değil.",
  whyItMatters: "Neden önemli",
  status: "Durum",
  futureEvidence: "Gelecek kanıtlar",
  humanReviewRequired: "İnsan bilimsel incelemesi gerekli.",
  genericOpenQuestions:
    "Genel soru kategorileri uygulanır — konuya özel kayıtlar henüz yapılandırılmadı.",
  negativeResultsTitle: "Olumsuz sonuçlar",
  negativeResultsNotConnected:
    "Olumsuz sonuç kayıtları yalnızca katalogda — deney veritabanları bağlı değil.",
  futureWorkspaceSupport: "Gelecek çalışma alanı desteği",
  futureExperimentTypes: "Gelecek deney türleri",
  negativeHumanReview:
    "Olumsuz sonuç bir kararı desteklemeden önce bilimsel insan incelemesi gerekir.",
  genericNegativeResults:
    "Genel hazırlık uygulanır — konuya özel kayıtlar henüz yapılandırılmadı.",
  evidenceReadinessEyebrow: "Araştırma kanıtları",
  evidenceReadinessTitle: "Araştırma kanıt hazırlığı",
  evidenceReadinessDetail:
    "Temel kanıt alanları henüz bağlı değil. Yalnızca katalog bilgisi.",
  publications: "Yayınlar",
  experiments: "Deneyler",
  laboratories: "Laboratuvarlar",
  willSupport: "Destekleyecek",
  currentLimitation: "Mevcut sınırlama",
  humanReviewBeforeDecision: "Kararlarda kullanılmadan önce insan incelemesi gerekir.",
  publicationLimitationFallback: "Yayın kaynakları henüz bağlı değil.",
  experimentLimitationFallback: "Deney kayıtları henüz bağlı değil.",
  laboratoryLimitationFallback: "Laboratuvar kayıtları henüz bağlı değil.",
  reportResearchQuestion: "Araştırma sorusu",
  reportDomain: "Alan",
  reportDescription: "Açıklama",
  reportEvidenceSummary:
    "{connected} öğe bağlı · {supporting} destekleyen · {counter} karşı kanıt.",
  reportNotes: "Araştırma notları",
  reportNotesEmpty: "Henüz araştırma notu kaydedilmedi.",
} as const;

export const UNIVERSAL_INTENT_TR = {
  categoryStartMission: "Görev başlat",
  categoryContinueMission: "Göreve devam",
  categorySearchEntity: "Ara",
  categoryOpenObject: "Nesneyi aç",
  categoryCompareEntities: "Grafikte karşılaştır",
  categoryInspectEvidence: "Kanıtları incele",
  categoryOpenReasoning: "Akıl yürütmeyi aç",
  categoryReviewImpact: "Etkiyi incele",
  categoryOpenReport: "Raporu aç",
  categoryContinueResearch: "Araştırmaya devam",
  categoryUnrecognized: "Tanınmadı",
} as const;

export const MISSION_OPERATING_TR = {
  addToMission: "Göreve ekle",
  added: "{name} aktif görevinize eklendi.",
  addedToMissionLabel: "Göreve eklendi",
  addedToMission: "{name} zaten bu görevde.",
  alreadyLinked: "{name} zaten bu göreve bağlı.",
  noMission: "Varlık eklemek için önce bir görev başlatın.",
  noProject: "Varlık eklemeden önce göreve bir proje bağlayın.",
  startToAdd: "Eklemek için görev başlat",
  viewInMyWork: "Çalışmalarımda gör",
  problemPlaceholder: "Hangi sorunu anlamak veya çözmek istiyorsunuz?",
  problemTooShort: "Sorununuzu en az on karakterle açıklayın.",
  reasoningTitle: "Görev akıl yürütmesi",
  reasoningEmpty: "Akıl yürütme oluşturmak için Çalışmalarım'da kanıt veya not ekleyin.",
  reasoningHumanReview: "CBAI yollar önerir — son karar sizindir.",
  linkedEntities: "Bu görevdeki varlıklar",
  nextHonestAction: "Sonraki dürüst adım",
  notesLabel: "Notlar",
  questionsLabel: "Sorular",
  evidenceLabel: "Kanıt bağlantıları",
} as const;
