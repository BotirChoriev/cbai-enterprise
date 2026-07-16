/** BUILD-023 — System Integration: research notes and evidence lifecycle copy. */

export const RESEARCH_NOTES_TR = {
  notesEyebrow: "Araştırma notları",
  findingsEyebrow: "Bulgular",
  notePlaceholder: "Bir araştırma notu yazın…",
  findingPlaceholder: "Bir bulgu kaydedin…",
  linkEvidenceOptional: "Kanıtla bağla (isteğe bağlı)",
  linkEntityOptional: "Varlıkla bağla (isteğe bağlı)",
  addNote: "Not ekle",
  addFinding: "Bulgu ekle",
  notesEmpty: "Henüz not yok. İlkini aşağıya yazın.",
  findingsEmpty: "Henüz bulgu yok. İlkini aşağıya kaydedin.",
  findingSaved: "Bulgu kaydedildi.",
  evidenceLinked: "Kanıt: {label}",
  entityLinked: "Varlık: {name}",
} as const;

export const EVIDENCE_LIFECYCLE_COPY_TR = {
  eyebrow: "Kanıt yaşam döngüsü",
  empty: "Bu konu için henüz kataloglanmış kanıt yok.",
  description:
    "Toplandı → İncelendi → Bağlandı → Karşılaştırıldı → Referans verildi → Rapora eklendi → Arşivlendi. Her seferinde bir aşama — otomatik tamamlanmaz.",
  markAs: "{stage} olarak işaretle",
  stageCollected: "Toplandı",
  stageReviewed: "İncelendi",
  stageLinked: "Bağlandı",
  stageCompared: "Karşılaştırıldı",
  stageReferenced: "Referans verildi",
  stageIncludedInReport: "Rapora eklendi",
  stageArchived: "Arşivlendi",
  activityMarked: "Kanıt işaretlendi: {stage}",
  activityNoteAdded: "Not eklendi",
  activityFindingRecorded: "Bulgu kaydedildi",
  activityEyebrow: "Çalışma alanı etkinliği",
  activityEmpty: "Henüz çalışma alanı etkinliği kaydedilmedi.",
} as const;
