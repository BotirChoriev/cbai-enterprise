import type { CompassDirectionCopy } from "@/lib/i18n/dictionary-types";

export const COMPASS_COPY_RU: {
  default: CompassDirectionCopy;
  academic: CompassDirectionCopy;
  engineer: CompassDirectionCopy;
  investor: CompassDirectionCopy;
  government: CompassDirectionCopy;
} = {
  default: {
    discover: { label: "Обнаружить", description: "Ищите страны, компании, университеты и темы исследований." },
    research: { label: "Исследование", description: "Изучайте реальные темы исследований и их доказательства." },
    evidence: { label: "Доказательства", description: "Проверяйте статус официальных источников в профилях." },
    analyze: { label: "Анализ", description: "Организуйте доказательства, заметки и открытые вопросы." },
    organize: { label: "Организация", description: "Продолжите или начните проект для отслеживания работы." },
    report: { label: "Отчёт", description: "Создавайте и просматривайте реальные отчёты на основе доказательств." },
  },
  academic: {
    discover: { label: "Вопрос", description: "Начните с реального исследовательского вопроса." },
    research: { label: "Исследование", description: "Изучайте связанные темы исследований." },
    evidence: { label: "Доказательства", description: "Связывайте подтверждающие и противоречащие доказательства." },
    analyze: { label: "Заметки", description: "Документируйте находки в рабочем пространстве." },
    organize: { label: "Анализ", description: "Отслеживайте реальный прогресс проекта." },
    report: { label: "Отчёт", description: "Соберите находки в отчёт." },
  },
  engineer: {
    discover: { label: "Требование", description: "Ищите стандарты, системы и организации." },
    research: { label: "Стандарт", description: "Изучайте технические темы исследований." },
    evidence: { label: "Доказательства", description: "Проверяйте технические доказательства и источники." },
    analyze: { label: "Запись решения", description: "Документируйте оценку в заметках проекта." },
    organize: { label: "Проект", description: "Отслеживайте задачи и открытые вопросы." },
    report: { label: "Отчёт", description: "Создайте технический отчёт об оценке." },
  },
  investor: {
    discover: { label: "Рынок", description: "Ищите компании, страны и отрасли." },
    research: { label: "Организация", description: "Изучайте связанные компании и исследования." },
    evidence: { label: "Доказательства", description: "Проверяйте финансовые и доказательные источники." },
    analyze: { label: "Сравнение", description: "Сравнивайте организации бок о бок." },
    organize: { label: "Проект", description: "Отслеживайте инвестиционный анализ." },
    report: { label: "Отчёт", description: "Создайте инвестиционный отчёт." },
  },
  government: {
    discover: { label: "Страна", description: "Ищите страны и государственные учреждения." },
    research: { label: "Учреждение", description: "Изучайте связанные учреждения и исследования." },
    evidence: { label: "Показатель", description: "Проверяйте доказательства управления." },
    analyze: { label: "Сценарий", description: "Документируйте политический анализ в рабочем пространстве." },
    organize: { label: "Проект", description: "Отслеживайте политический обзор." },
    report: { label: "Отчёт", description: "Создайте политический отчёт." },
  },
};

export const PRODUCT_STATUS_RU = {
  live: { label: "Доступно", explanation: "Работает сегодня с реальными, подключёнными данными." },
  partial: { label: "Частично", explanation: "Часть реальных данных подключена; остальное ещё нет." },
  waiting_for_verified_data: { label: "Ожидание данных", explanation: "Готово, но проверенный источник ещё не подключён." },
  preview: { label: "Предпросмотр", explanation: "Ранняя ограниченная версия — не полная возможность." },
  restricted: { label: "Ограничено", explanation: "Доступно только в определённых контекстах или ролях." },
  not_connected: { label: "Не подключено", explanation: "Источник данных или интеграция ещё не подключены." },
  planned: { label: "Запланировано", explanation: "Запланировано на будущий релиз — ещё не построено." },
} as const;

export const ENTITIES_RU = {
  countriesDescription: "Обзор, доступная информация, недостающая информация и отчёты для каждой страны.",
  companiesDescription: "Обзор, доступная информация, недостающая информация и отчёты для каждой компании.",
  universitiesDescription: "Обзор, доступная информация, недостающая информация и отчёты для каждого университета.",
  noMatchFilters: "Нет результатов, соответствующих фильтрам.",
  clearFilters: "Сбросить фильтры",
  selected: "Выбрано",
  worldMapTitle: "Карта мировой разведки",
  worldMapShowing: "Карта мировой разведки — показано {name}",
  worldMapHeading: "У каких стран есть профили?",
  worldMapDescription:
    "Каждая страна в локальном реестре, сгруппированная по регионам, с реальным статусом данных. Выберите страну, чтобы открыть профиль.",
  worldMapSearchLabel: "Поиск по названию, коду или региону",
  worldMapSearchPlaceholder: "Поиск стран…",
  worldMapLegendAria: "Легенда статуса данных",
  worldMapResultsMatch: "{count} стран соответствуют «{query}»",
  worldMapResultsMatchOne: "1 страна соответствует «{query}»",
  worldMapNoMatch: "В локальном реестре нет стран, соответствующих «{query}».",
  share: "Поделиться",
  linkCopied: "Ссылка скопирована",
  linkCopyFailed: "Не удалось скопировать ссылку",
  entityNotFound:
    "Не найдено {entityLabel}, соответствующего «{requestedId}» — ссылка может быть устаревшей. Вместо этого показано {fallbackName}; используйте поиск или список ниже.",
} as const;

export const MY_WORK_RU = {
  title: "Моя работа",
  yourWork: "Работа {name}",
  restoringSession: "Восстановление сессии…",
  projectUnavailable: "Этот проект недоступен.",
  projectUnavailableBody:
    "Проекты сохраняются только в этом браузере — ссылка может быть с другого устройства или проект был удалён. Ваши реальные проекты перечислены ниже.",
  backToMyWork: "← Назад к Моей работе",
  localProfileNotSetUp: "Локальный профиль оператора ещё не настроен",
  savedToBrowser:
    "Сохранено в этом браузере — реальные проекты, исследования и точки входа в доказательства, без выдуманной активности.",
  signInPrompt: "Войти",
  signInOrCreate: "Войти или создать локальный аккаунт",
  signedInCloud: "Вход через облачный аккаунт {email} — проекты и закладки синхронизируются на всех устройствах.",
  signedInLocal: "Вход как {email} — проекты и закладки сохранены только на этом устройстве.",
  continueLinksHeading: "Продолжить",
  onboardingHeading: "Начать",
  pageDescription: "Дом миссии — прогресс, следующий шаг и последняя работа в одном месте.",
} as const;

export const SYSTEM_RU = {
  returnHome: "На главную",
  goBack: "Назад",
  search: "Поиск",
  continueProject: "Продолжить проект",
  tryAgain: "Повторить",
  feedback: "Обратная связь",
} as const;
