/** BUILD-023 — System Integration: research notes and evidence lifecycle copy. */

export const RESEARCH_NOTES_RU = {
  notesEyebrow: "Исследовательские заметки",
  findingsEyebrow: "Выводы",
  notePlaceholder: "Напишите заметку…",
  findingPlaceholder: "Запишите вывод…",
  linkEvidenceOptional: "Связать с доказательством (необязательно)",
  linkEntityOptional: "Связать с объектом (необязательно)",
  addNote: "Добавить заметку",
  addFinding: "Добавить вывод",
  notesEmpty: "Заметок пока нет. Напишите первую ниже.",
  findingsEmpty: "Выводов пока нет. Запишите первый ниже.",
  findingSaved: "Вывод сохранён.",
  evidenceLinked: "Доказательство: {label}",
  entityLinked: "Объект: {name}",
} as const;

export const EVIDENCE_LIFECYCLE_COPY_RU = {
  eyebrow: "Жизненный цикл доказательств",
  empty: "Для этой темы пока нет каталогизированных доказательств.",
  description:
    "Собрано → Проверено → Связано → Сравнено → Упомянуто → Включено в отчёт → Архивировано. Переход только на один этап — автоматически не завершается.",
  markAs: "Отметить как {stage}",
  stageCollected: "Собрано",
  stageReviewed: "Проверено",
  stageLinked: "Связано",
  stageCompared: "Сравнено",
  stageReferenced: "Упомянуто",
  stageIncludedInReport: "Включено в отчёт",
  stageArchived: "Архивировано",
  activityMarked: "Доказательство отмечено: {stage}",
  activityNoteAdded: "Заметка добавлена",
  activityFindingRecorded: "Вывод записан",
  activityEyebrow: "Активность рабочего пространства",
  activityEmpty: "Активность рабочего пространства пока не зафиксирована.",
} as const;
