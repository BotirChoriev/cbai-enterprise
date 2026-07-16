/** BUILD-012 — Russian */

export const INTELLIGENCE_NETWORK_RU = {
  eyebrow: "Сеть интеллекта",
  description: "Представление реальных связей каталога с учётом миссии.",
  missionFocus: "Режим фокуса миссии",
  focusModes: "Режимы фокуса графа",
  modeMission: "Миссия",
  modeEvidence: "Доказательства",
  modeAll: "Полный каталог",
  connectedEntities: "Связанные объекты",
  supportingEvidence: "Ссылки на доказательства",
  missingEvidence: "Недостающие доказательства",
  unresolvedQuestions: "Нерешённые вопросы",
  impactConcern: "Риск воздействия",
  linkProjectEntities: "Связать объекты в проекте",
  contradiction: "Возможное противоречие",
  returnToMission: "Вернуться в центр миссии",
} as const;

export const OPERATOR_STATES_RU = {
  present: "Оператор присутствует",
  listening: "Слушает",
  transcribing: "Транскрипция",
  interpreting: "Интерпретация",
  clarificationRequired: "Требуется уточнение",
  showingEvidence: "Контекст доказательств",
  proposingAlternatives: "Альтернативы",
  waitingDecision: "Ожидание решения человека",
  executing: "Выполнение команды",
  success: "Подтверждено",
  warning: "Требуется внимание",
  unsupported: "Голос не поддерживается",
  permissionDenied: "Доступ к микрофону запрещён",
  error: "Требуется внимание",
  complete: "Завершено",
} as const;

export const MODULE_ACCOUNTABILITY_UI_RU = {
  eyebrow: "Ответственность модулей",
  title: "Что делает каждый модуль — и его ограничения",
  purpose: "Цель",
  input: "Реальный ввод",
  processing: "Обработка",
  output: "Вывод",
  evidenceDependency: "Зависимость от доказательств",
  limitations: "Ограничения",
  responsibleHuman: "Ответственный человек",
  maturity: "Зрелость",
  storage: "Хранение",
  nextAction: "Следующее действие",
  unregisteredWarning: "Маршрут не зарегистрирован в реестре.",
} as const;

export const CAPABILITY_PASSPORT_BUILD012_RU = {
  signalSource: "Источник активности",
  signalDate: "Дата",
  uncertaintyNotice: "Способность выводится из работы и может быть неполной или неверной.",
  visibilityNote: "Видимость локальна до подключения облака.",
  developmentDirection: "Развивается",
  inspectSignal: "Просмотр сигнала",
} as const;

export const MISSION_THREAD_BUILD012_RU = {
  openStage: "Открыть этап",
  stageMission: "Центр миссии",
  stageQuestion: "Вопросы проекта",
  stageEvidence: "Доказательства проекта",
  stageReasoning: "Заметки и рассуждения",
  stageCollaborators: "Необходимые способности",
  stageReport: "Отчёт проекта",
  stageImpact: "Оценка воздействия",
} as const;
