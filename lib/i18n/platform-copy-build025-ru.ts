/** BUILD-025 — Living Intelligence completion: research panels, project home, canvas lead. */

export const CANVAS_COMPLETION_RU = {
  homeIntelligenceLead: "Расскажите CBAI, что вы хотите понять или изменить.",
} as const;

export const RESEARCH_TOPIC_PANELS_RU = {
  insightsAtGlance: "Краткий обзор",
  insightsAriaLabel: "Сводка по теме",
  insightsAvailableToday: "Доступно сегодня",
  insightsFutureEvidence: "Будущие доказательства",
  insightsKnowledgeGaps: "Пробелы в знаниях",
  insightsOpenQuestions: "Открытые вопросы",
  supportingCounterEyebrow: "Поддерживающие и противоречащие доказательства",
  supportingCounterDetail:
    "Только реальные доказательства — противоречащие показываются только при проверенной связи. Ни одна колонка не означает вывод.",
  supportingEvidence: "Поддерживающие доказательства",
  counterEvidence: "Противоречащие доказательства",
  noSupportingEvidence: "Поддерживающие доказательства пока не подключены.",
  noCounterEvidence:
    "Противоречащие доказательства пока не подключены — это не означает их отсутствие, только отсутствие проверки в каталоге.",
  evidenceStatusLabel: "Статус: {status}",
  methodsEyebrow: "Методы",
  methodsTitle: "Связанные методы",
  methodsDetail: "Методы темы в каталоге — не записи живых исследований.",
  relatedCompaniesTitle: "Связанные компании",
  relatedCompaniesEmpty: "Компании, связанные с этой темой, пока не найдены.",
  relatedCompaniesNote:
    "Компании по предметной области темы — не заявление о спонсорстве или финансировании.",
  missionWorkspaceEyebrow: "Рабочее пространство исследовательской миссии",
  missionWorkspaceHeading: "{topic}: что известно, что нет",
  missionWorkspaceDetail:
    "Только из существующего каталога и рабочего пространства доказательств — без выдуманных результатов.",
  missionSection: "Исследовательская миссия",
  knownInformation: "Известная информация",
  unknowns: "Неизвестное",
  evidenceGaps: "Пробелы в доказательствах",
  recommendedNextAction: "Рекомендуемое следующее действие",
  notEnoughEvidence: "Недостаточно доступных доказательств.",
  missionStatement: "Исследовать {topic} в области {domain}, используя доступные каталожные доказательства.",
  knownClassified: "Классифицировано в области {domain}.",
  knownMethods: "Документированные методы: {methods}.",
  knownEvidenceTypes: "Признанные категории доказательств: {types}.",
  knownCatalogStatus: "Статус каталога: {status}.",
  unknownLiveFindings:
    "Живые результаты по категориям доказательств пока неизвестны — официальный источник для {topic} не подключён.",
  unknownReviewRequired:
    "{count} {categoryWord} требуют научной проверки человеком, прежде чем что-либо можно оценить.",
  categoryWordSingular: "категория доказательств",
  categoryWordPlural: "категории доказательств",
  gapSourceNotConnected: "{label} — источник не подключён.",
  reviewNotStarted: "Обзор не начат.",
  futureWorkspaceEyebrow: "Будущее рабочее пространство",
  futureWorkspaceTitle: "Будущее исследовательское пространство",
  futureWorkspaceDetail:
    "Тема будет поддерживать следующее при подключении источников — сегодня ничего не активно.",
  futureLiterature: "Исследовательская литература",
  futureExperiments: "Эксперименты и воспроизведение",
  futureLaboratory: "Лаборатории и оборудование",
  futureResearchers: "Проверенные исследователи и участники",
  futureOpenQuestions: "Открытые вопросы",
  futureEvidenceDiscussions: "Обсуждения доказательств",
  futureAiNotebook: "AI-блокнот",
  futureOpenQuestionsItem: "Отслеживать нерешённые вопросы и пробелы доказательств по теме",
  futureEvidenceDiscussionsItem: "Структурированные обсуждения доказательств, связанные с профилем темы",
  futureAiNotebookItem: "Исследовательский блокнот для каталожных заметок и наблюдений после проверки",
  futureReplicationStatus: "Документировать статус воспроизведения при подключении записей исследований",
  futureNegativeResults: "Отслеживать отрицательные результаты без преувеличения выводов",
  futureEquipmentInventories: "Инвентарь оборудования и метаданные проекта для профиля лаборатории",
  futureAffiliations: "Институциональные связи при подключении официальных источников",
  researcherReadiness: "Готовность исследователей",
  researcherReadinessDetail:
    "Проверенные исследователи будут поддержаны в будущем пространстве — аффилиации, области и источники проверки пока не подключены.",
  futureHumanReview: "Возможности будущего пространства требуют проверки человеком перед поддержкой решений.",
  evidenceReviewEyebrow: "Доказательства и рабочий процесс обзора",
  evidenceReviewDetail:
    "Доступная информация по теме — от категорий доказательств до готовности обзора и следующего действия.",
  availableEvidence: "Доступные доказательства",
  availableEvidenceNav: "Доступные каталожные доказательства",
  selectedEvidence: "Выбранные доказательства",
  selectedEvidenceDetail: "Детали выбранных доказательств",
  noCatalogEvidence: "Категории каталожных доказательств не перечислены.",
  noEvidenceToSelect: "Нет доступной категории доказательств для выбора.",
  futureEvidenceConnection: "Будущее подключение доказательств",
  reviewReadiness: "Готовность обзора",
  nextResearchAction: "Следующее исследовательское действие",
  reviewReadinessNav: "Готовность обзора и следующие действия",
  statusCatalogEvidence: "Каталожные доказательства",
  statusSourceNotConnected: "Источник не подключён",
  statusHumanReviewRequired: "Требуется научная проверка человеком",
} as const;

export const PROJECT_HOME_COMPLETION_RU = {
  backToMyWork: "← Моя работа",
  questionObjectivesEyebrow: "Исследовательский вопрос и цели",
  researchQuestionLabel: "Исследовательский вопрос",
  objectivesLabel: "Цели",
  questionFieldPlaceholder: "Какой вопрос отвечает этот проект?",
  entityKindCountry: "Страна",
  entityKindCompany: "Компания",
  entityKindUniversity: "Университет",
  entityKindResearchTopic: "Тема исследования",
  entitySelectPlaceholder: "Выберите…",
  linkEntity: "Связать объект",
  bookmarksEyebrow: "Закладки",
  bookmarksEmpty:
    "Связанные объекты проекта пока не в закладках — нажмите ☆ рядом со связанным объектом выше.",
  trustMethodologyEyebrow: "Доверие и методология",
  trustMethodologyIntro:
    "CBAI предоставляет проектную аналитику на основе доказательств. Каждая связь, заметка и ссылка добавлены пользователем — никогда не выведены и не сфабрикованы.",
  removeBookmark: "Удалить закладку {name}",
  addBookmark: "Добавить {name} в закладки",
  unlinkEntity: "Отвязать {name}",
} as const;

export const COMMAND_FEEDBACK_COMPLETION_RU = {
  searchUnrecognized: 'Искать «{input}» →',
  uploadLabel: "Загрузить",
} as const;
