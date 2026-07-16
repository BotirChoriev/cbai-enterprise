/** BUILD-023 — System Integration: research notes and evidence lifecycle copy. */

export const RESEARCH_NOTES_UZ = {
  notesEyebrow: "Tadqiqot eslatmalari",
  findingsEyebrow: "Xulosalar",
  notePlaceholder: "Tadqiqot eslatmasi yozing…",
  findingPlaceholder: "Xulosa yozing…",
  linkEvidenceOptional: "Dalil bilan bog‘lash (ixtiyoriy)",
  linkEntityOptional: "Ob’ekt bilan bog‘lash (ixtiyoriy)",
  addNote: "Eslatma qo‘shish",
  addFinding: "Xulosa qo‘shish",
  notesEmpty: "Hali eslatmalar yo‘q. Birinchisini quyida yozing.",
  findingsEmpty: "Hali xulosalar yo‘q. Birinchisini quyida yozing.",
  findingSaved: "Xulosa saqlandi.",
  evidenceLinked: "Dalil: {label}",
  entityLinked: "Ob’ekt: {name}",
} as const;

export const EVIDENCE_LIFECYCLE_COPY_UZ = {
  eyebrow: "Dalil hayot tsikli",
  empty: "Bu mavzu uchun hali kataloglangan dalillar yo‘q.",
  description:
    "Yig‘ilgan → Ko‘rib chiqilgan → Bog‘langan → Solishtirilgan → Havola qilingan → Hisobotga kiritilgan → Arxivlangan. Bir vaqtning o‘zida faqat bir bosqich — avtomatik yakunlanmaydi.",
  markAs: "{stage} deb belgilash",
  stageCollected: "Yig‘ilgan",
  stageReviewed: "Ko‘rib chiqilgan",
  stageLinked: "Bog‘langan",
  stageCompared: "Solishtirilgan",
  stageReferenced: "Havola qilingan",
  stageIncludedInReport: "Hisobotga kiritilgan",
  stageArchived: "Arxivlangan",
  activityMarked: "Dalil belgilandi: {stage}",
  activityNoteAdded: "Eslatma qo‘shildi",
  activityFindingRecorded: "Xulosa yozildi",
  activityEyebrow: "Ish maydoni faolligi",
  activityEmpty: "Ish maydoni faolligi hali qayd etilmagan.",
} as const;
