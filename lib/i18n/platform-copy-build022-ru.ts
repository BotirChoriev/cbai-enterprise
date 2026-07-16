/** BUILD-022 — Product Excellence: mission home and research dashboard copy. */

export const MISSION_HOME_RU = {
  eyebrow: "Прогресс миссии",
  stagesComplete: "{complete} из {total} этапов завершено",
  resumeProject: "Продолжить проект",
  noMissionTitle: "Активной миссии пока нет",
  noMissionBody: "Опишите проблему на главной — здесь появятся прогресс, доказательства и отчёты.",
  startMission: "Начать миссию",
  lastActivity: "Последняя активность",
} as const;

export const RESEARCH_DASHBOARD_RU = {
  eyebrow: "Сводка исследования",
  progress: "Прогресс",
  progressValue: "{complete}/{total} этапов",
  progressUnavailable: "Недоступно",
  evidenceConnected: "Подключённые доказательства",
  missingEvidence: "Недостающие доказательства",
  openTasks: "Открытые задачи",
  recentNotes: "Недавние заметки",
  noNotesYet: "Заметок пока нет.",
  relatedReports: "Связанные отчёты",
  reportAvailable: "Доступен 1 тип отчёта",
  savedStatus: "Статус сохранения",
  savedToBookmarks: "Сохранено в закладках",
  notSavedYet: "Ещё не сохранено",
} as const;

export const SAVED_EVIDENCE_RU = {
  eyebrow: "Сохранённые доказательства",
  description:
    "Доказательства из тем исследования — отдельно от доказательств, добавленных в проект.",
  empty: "Для этой миссии доказательств пока нет. Добавьте закладку из темы исследования.",
  exploreAction: "Открыть темы исследования",
  remove: "Удалить",
  fromTopic: "Из: {topic}",
  removeAria: 'Удалить «{name}» из сохранённых доказательств',
} as const;

export const PROJECT_PANEL_RU = {
  evidenceEmpty: "Для этой миссии доказательств пока нет. Добавьте один проверенный источник.",
  evidenceAdded: "Доказательство связано.",
  timelineEmpty: "Активности пока нет. Здесь появятся доказательства, заметки и отчёты.",
  timelineEyebrow: "Хронология",
  evidenceEyebrow: "Доказательства",
  evidenceLead: "Источники, которые вы добавляете в проект — не автоматически.",
  evidenceTitlePlaceholder: "Название доказательства",
  evidenceUrlPlaceholder: "URL источника (необязательно)",
  linkEntityOptional: "Связать с объектом (необязательно)",
  addEvidence: "Добавить доказательство",
} as const;
