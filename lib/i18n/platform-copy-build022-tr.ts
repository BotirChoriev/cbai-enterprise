/** BUILD-022 — Product Excellence: mission home and research dashboard copy. */

export const MISSION_HOME_TR = {
  eyebrow: "Görev ilerlemesi",
  stagesComplete: "{total} aşamadan {complete} tamamlandı",
  resumeProject: "Projeye devam et",
  noMissionTitle: "Henüz aktif görev yok",
  noMissionBody: "Sorunu ana sayfada adlandırın — ilerleme, kanıt ve raporlar burada görünür.",
  startMission: "Göreve başla",
  lastActivity: "Son etkinlik",
} as const;

export const RESEARCH_DASHBOARD_TR = {
  eyebrow: "Araştırma özeti",
  progress: "İlerleme",
  progressValue: "{complete}/{total} aşama",
  progressUnavailable: "Kullanılamıyor",
  evidenceConnected: "Bağlı kanıt",
  missingEvidence: "Eksik kanıt",
  openTasks: "Açık görevler",
  recentNotes: "Son notlar",
  noNotesYet: "Henüz not yok.",
  relatedReports: "İlgili raporlar",
  reportAvailable: "1 rapor türü mevcut",
  savedStatus: "Kayıt durumu",
  savedToBookmarks: "Yer imlerine kaydedildi",
  notSavedYet: "Henüz kaydedilmedi",
} as const;

export const SAVED_EVIDENCE_TR = {
  eyebrow: "Kaydedilen kanıt",
  description: "Araştırma konularından yer imlerine eklenen kanıt — projeye eklenenlerden ayrı.",
  empty: "Bu görev için henüz kanıt yok. Bir araştırma konusundan yer imi ekleyin.",
  exploreAction: "Araştırma konularını aç",
  remove: "Kaldır",
  fromTopic: "Kaynak: {topic}",
  removeAria: '"{name}" kaydedilen kanıttan kaldır',
} as const;

export const PROJECT_PANEL_TR = {
  evidenceEmpty: "Bu görev için henüz kanıt yok. Devam etmek için bir kaynak ekleyin.",
  evidenceAdded: "Kanıt bağlandı.",
  timelineEmpty: "Henüz etkinlik yok. Kanıt, not ve raporlar burada görünür.",
  timelineEyebrow: "Zaman çizelgesi",
  evidenceEyebrow: "Kanıt",
  evidenceLead: "Projeye eklediğiniz kaynaklar — otomatik değil.",
  evidenceTitlePlaceholder: "Kanıt başlığı",
  evidenceUrlPlaceholder: "Kaynak URL (isteğe bağlı)",
  linkEntityOptional: "Varlığa bağla (isteğe bağlı)",
  addEvidence: "Kanıt ekle",
} as const;
