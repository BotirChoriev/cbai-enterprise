/** BUILD-026 — Knowledge Brain and research completion i18n. */

export const KNOWLEDGE_BRAIN_RU = {
  eyebrow: "Состояние знаний",
  whatIsThis: "Что это",
  whyItMatters: "Почему важно",
  missionRelevance: "Связь с миссией",
  known: "Известно",
  unknown: "Неизвестно",
  conflict: "Конфликт",
  needsReview: "Требует проверки",
  howWeKnow: "Как мы знаем",
  provenance: "Происхождение",
  freshness: "Актуальность",
  supportingEvidence: "Поддерживающие доказательства",
  contradictingEvidence: "Противоречащие доказательства",
  missingEvidence: "Недостающие доказательства",
  limitations: "Ограничения",
  humanReviewRequired: "Перед выводами требуется проверка человеком.",
  noMission: "Начните миссию, чтобы связать доказательства и знания с проблемой.",
  emptyBucket: "В этой категории пока ничего не записано.",
  suggestedNext: "Рекомендуемый следующий шаг",
  sourceNotConnected:
    "Живые внешние каталоги не подключены — только каталог и локальные ссылки устройства.",
  evidenceStateKnownDetail: "Ссылки с отслеживаемыми метаданными источника.",
  evidenceStateUnknownDetail: "Отсутствующие источники или задокументированные пробелы.",
  evidenceStateConflictDetail: "Обнаружено расхождение между ссылками.",
  evidenceStateNeedsReviewDetail: "Рекомендуется проверка актуальности или валидации.",
} as const;

export const RESEARCH_TOPIC_COMPLETION_RU = {
  openQuestionsTitle: "Открытые исследовательские вопросы",
  openQuestionsNotConnected:
    "Записи открытых вопросов только в каталоге — живые базы исследований не подключены.",
  whyItMatters: "Почему важно",
  status: "Статус",
  futureEvidence: "Будущие доказательства",
  humanReviewRequired: "Требуется научная проверка человеком.",
  genericOpenQuestions:
    "Применяются общие категории вопросов — записи по теме ещё не настроены.",
  negativeResultsTitle: "Отрицательные результаты",
  negativeResultsNotConnected:
    "Записи отрицательных результатов только в каталоге — базы экспериментов не подключены.",
  futureWorkspaceSupport: "Поддержка будущего пространства",
  futureExperimentTypes: "Будущие типы экспериментов",
  negativeHumanReview:
    "Перед использованием отрицательного результата в решении требуется научная проверка.",
  genericNegativeResults:
    "Применяется общая готовность — записи по теме ещё не настроены.",
  evidenceReadinessEyebrow: "Исследовательские доказательства",
  evidenceReadinessTitle: "Готовность исследовательских доказательств",
  evidenceReadinessDetail:
    "Основные области доказательств — пока не подключены. Только информация каталога.",
  publications: "Публикации",
  experiments: "Эксперименты",
  laboratories: "Лаборатории",
  willSupport: "Будет поддерживать",
  currentLimitation: "Текущее ограничение",
  humanReviewBeforeDecision: "Перед использованием в решениях требуется проверка человеком.",
  publicationLimitationFallback: "Источники публикаций пока не подключены.",
  experimentLimitationFallback: "Записи экспериментов пока не подключены.",
  laboratoryLimitationFallback: "Записи лабораторий пока не подключены.",
  reportResearchQuestion: "Исследовательский вопрос",
  reportDomain: "Область",
  reportDescription: "Описание",
  reportEvidenceSummary:
    "{connected} элементов подключено · {supporting} поддерживающих · {counter} противоречащих.",
  reportNotes: "Исследовательские заметки",
  reportNotesEmpty: "Исследовательские заметки пока не записаны.",
} as const;

export const UNIVERSAL_INTENT_RU = {
  categoryStartMission: "Начать миссию",
  categoryContinueMission: "Продолжить миссию",
  categorySearchEntity: "Поиск",
  categoryOpenObject: "Открыть объект",
  categoryCompareEntities: "Сравнить на графе",
  categoryInspectEvidence: "Проверить доказательства",
  categoryOpenReasoning: "Открыть рассуждение",
  categoryReviewImpact: "Проверить влияние",
  categoryOpenReport: "Открыть отчёт",
  categoryContinueResearch: "Продолжить исследование",
  categoryUnrecognized: "Не распознано",
} as const;
