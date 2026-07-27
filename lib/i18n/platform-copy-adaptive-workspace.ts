/**
 * Localized copy for adaptive workspace templates and role discovery UI.
 */

export type AdaptiveWorkspaceCopy = {
  pageTitle: string;
  pageDescription: string;
  roleDiscoveryHeading: string;
  interpretationHeading: string;
  confirmCreate: string;
  saveDraft: string;
  cancel: string;
  editFields: string;
  privacyPrivate: string;
  privacyShared: string;
  privacyPublic: string;
  inferredLabel: string;
  missingLabel: string;
  draftStatus: string;
  firstActionConfirm: string;
  firstActionEvidence: string;
  firstActionNext: string;
  templateStudent: string;
  templateStudentDesc: string;
  templateResearcher: string;
  templateResearcherDesc: string;
  templateChemist: string;
  templateChemistDesc: string;
  chemistDiscoveryHint: string;
  templateAcademic: string;
  templateAcademicDesc: string;
  templateEconomist: string;
  templateEconomistDesc: string;
  templateGovernment: string;
  templateGovernmentDesc: string;
  templateInvestor: string;
  templateInvestorDesc: string;
  templateOrganization: string;
  templateOrganizationDesc: string;
  templateGeneral: string;
  templateGeneralDesc: string;
  fieldLearningObjective: string;
  fieldSubject: string;
  fieldAssignment: string;
  fieldReadingList: string;
  fieldStudyPlan: string;
  fieldDeadlines: string;
  fieldNotes: string;
  fieldMentorGroup: string;
  fieldFinalOutput: string;
  fieldResearchQuestion: string;
  fieldHypothesis: string;
  fieldMethodology: string;
  fieldEvidenceSources: string;
  fieldDataset: string;
  fieldUncertainty: string;
  fieldCollaborators: string;
  fieldReviewCheckpoints: string;
  fieldPublicationOutput: string;
  fieldOverview: string;
  fieldLiteratureSources: string;
  fieldThesisLibrary: string;
  fieldExperimentsMethodology: string;
  fieldMaterialsData: string;
  fieldEvidenceMap: string;
  fieldFindings: string;
  fieldOpenQuestions: string;
  fieldRisksSafety: string;
  fieldSupervisorCollaborators: string;
  fieldTasksMilestones: string;
  fieldReports: string;
  fieldProvenanceAudit: string;
  fieldTeachingObjective: string;
  fieldCourseTopic: string;
  fieldCurriculum: string;
  fieldAudience: string;
  fieldReferences: string;
  fieldSchedule: string;
  fieldAssessment: string;
  fieldClassOutput: string;
  fieldQuestionGeography: string;
  fieldIndicatorSet: string;
  fieldSourceInstitutions: string;
  fieldObservationPeriods: string;
  fieldRisks: string;
  fieldScenarios: string;
  fieldEvidenceUpdates: string;
  fieldReportOutput: string;
  fieldPublicServiceQuestion: string;
  fieldJurisdiction: string;
  fieldPolicyContext: string;
  fieldOfficialSources: string;
  fieldStakeholders: string;
  fieldLegalReview: string;
  fieldEvidenceGaps: string;
  fieldHumanDecisionOwner: string;
  fieldAnalysisQuestion: string;
  fieldEntitySector: string;
  fieldEvidenceCoverage: string;
  fieldRiskIndicators: string;
  fieldMissingEvidence: string;
  fieldNonAdvisory: string;
  fieldOrganizationGoal: string;
  fieldTeam: string;
  fieldProject: string;
  fieldResponsibilities: string;
  fieldEvidence: string;
  fieldMilestones: string;
  fieldMeetings: string;
  fieldDecisions: string;
  fieldDeliverables: string;
  fieldGoal: string;
  fieldContext: string;
  fieldTasks: string;
  fieldPeople: string;
  fieldDates: string;
  fieldNextAction: string;
  fieldOutput: string;
  discoveryTitle: string;
  discoveryDescription: string;
  discoveryEmpty: string;
  discoveryEmptyDetail: string;
  discoveryVsSearch: string;
  followAction: string;
  openAction: string;
};

const COPY: Record<"en" | "uz" | "ru" | "tr", AdaptiveWorkspaceCopy> = {
  en: {
    pageTitle: "My Workspace",
    pageDescription:
      "A confirmed personal workspace built from what you told CheckBalanceAI.Global. Templates are starting structures — every field stays editable.",
    roleDiscoveryHeading: "Prepare a workspace that fits you",
    interpretationHeading: "Check this interpretation before anything is saved",
    confirmCreate: "Confirm and create",
    saveDraft: "Save as draft",
    cancel: "Cancel",
    editFields: "Edit inferred fields",
    privacyPrivate: "Private",
    privacyShared: "Shared with selected people",
    privacyPublic: "Public",
    inferredLabel: "Inferred — editable",
    missingLabel: "Still needed",
    draftStatus: "Draft — not created yet",
    firstActionConfirm: "Confirm and create the workspace",
    firstActionEvidence: "Attach required evidence sources",
    firstActionNext: "Set the first next action",
    templateStudent: "Student Workspace",
    templateStudentDesc: "Learning objective, subject, assignment, evidence, plan, and output.",
    templateResearcher: "Researcher / Scientist Workspace",
    templateResearcherDesc: "Question, hypothesis, methodology, evidence, uncertainty, and publication path.",
    templateChemist: "Chemist / Laboratory Scientist Workspace",
    templateChemistDesc:
      "Overview, research question, hypothesis, literature, thesis library, experiments, materials, evidence map, findings, risks, collaborators, tasks, reports, and provenance.",
    chemistDiscoveryHint:
      "Tell me your research field, thesis or project title, objective, experimental/theoretical/review type, current stage, available files, preferred language, and privacy. Nothing is saved until you confirm.",
    templateAcademic: "Academic / Educator Workspace",
    templateAcademicDesc: "Teaching objective, course materials, audience, schedule, and assessment.",
    templateEconomist: "Economist Workspace",
    templateEconomistDesc: "Question, geography, indicators, official sources, scenarios, and report.",
    templateGovernment: "Government / Public Administration Workspace",
    templateGovernmentDesc: "Public-service question, jurisdiction, official sources, and human decision owner.",
    templateInvestor: "Investor / Analyst Workspace",
    templateInvestorDesc: "Analysis question, coverage, risks, missing evidence, and non-advisory disclaimer.",
    templateOrganization: "Organization Workspace",
    templateOrganizationDesc: "Goal, team, project, milestones, meetings, and deliverables.",
    templateGeneral: "General Workspace",
    templateGeneralDesc: "Goal, context, tasks, evidence, people, dates, and next action.",
    fieldLearningObjective: "Learning objective",
    fieldSubject: "Subject / course",
    fieldAssignment: "Assignment or research question",
    fieldReadingList: "Reading / evidence list",
    fieldStudyPlan: "Study plan",
    fieldDeadlines: "Deadlines",
    fieldNotes: "Notes",
    fieldMentorGroup: "Mentor / group",
    fieldFinalOutput: "Final output",
    fieldResearchQuestion: "Research question",
    fieldHypothesis: "Hypothesis",
    fieldMethodology: "Methodology",
    fieldEvidenceSources: "Evidence and sources",
    fieldDataset: "Dataset / experiment links",
    fieldUncertainty: "Uncertainty and limitations",
    fieldCollaborators: "Collaborators",
    fieldReviewCheckpoints: "Review checkpoints",
    fieldPublicationOutput: "Publication / report output",
    fieldOverview: "Overview",
    fieldLiteratureSources: "Literature and sources",
    fieldThesisLibrary: "Thesis / document library",
    fieldExperimentsMethodology: "Experiments or methodology",
    fieldMaterialsData: "Materials / data",
    fieldEvidenceMap: "Evidence map",
    fieldFindings: "Findings",
    fieldOpenQuestions: "Open questions",
    fieldRisksSafety: "Risks and safety",
    fieldSupervisorCollaborators: "Supervisor / collaborators",
    fieldTasksMilestones: "Tasks and milestones",
    fieldReports: "Reports",
    fieldProvenanceAudit: "Provenance and audit history",
    fieldTeachingObjective: "Teaching or academic objective",
    fieldCourseTopic: "Course / topic",
    fieldCurriculum: "Curriculum / materials",
    fieldAudience: "Student or audience context",
    fieldReferences: "References",
    fieldSchedule: "Schedule",
    fieldAssessment: "Assessment / review",
    fieldClassOutput: "Publication or class output",
    fieldQuestionGeography: "Question and geography",
    fieldIndicatorSet: "Indicator set",
    fieldSourceInstitutions: "Source institutions",
    fieldObservationPeriods: "Observation periods",
    fieldRisks: "Risks and uncertainty",
    fieldScenarios: "Scenarios",
    fieldEvidenceUpdates: "Evidence updates",
    fieldReportOutput: "Report output",
    fieldPublicServiceQuestion: "Public-service question",
    fieldJurisdiction: "Jurisdiction",
    fieldPolicyContext: "Policy or service context",
    fieldOfficialSources: "Official sources",
    fieldStakeholders: "Stakeholders",
    fieldLegalReview: "Legal / review requirements",
    fieldEvidenceGaps: "Evidence gaps",
    fieldHumanDecisionOwner: "Human decision owner",
    fieldAnalysisQuestion: "Analysis question",
    fieldEntitySector: "Entity / sector / geography",
    fieldEvidenceCoverage: "Evidence coverage",
    fieldRiskIndicators: "Risk indicators",
    fieldMissingEvidence: "Missing evidence",
    fieldNonAdvisory: "Non-advisory disclaimer",
    fieldOrganizationGoal: "Organization goal",
    fieldTeam: "Team",
    fieldProject: "Project",
    fieldResponsibilities: "Responsibilities",
    fieldEvidence: "Evidence",
    fieldMilestones: "Milestones",
    fieldMeetings: "Meetings",
    fieldDecisions: "Decisions",
    fieldDeliverables: "Deliverables",
    fieldGoal: "Goal",
    fieldContext: "Context",
    fieldTasks: "Tasks",
    fieldPeople: "People",
    fieldDates: "Dates",
    fieldNextAction: "Next action",
    fieldOutput: "Output",
    discoveryTitle: "Global Activity",
    discoveryDescription:
      "Guided exploration of opted-in public projects, research, reports, groups, and media. Use Search for direct retrieval across known objects. Private work never appears here.",
    discoveryEmpty: "No public activity is available yet.",
    discoveryEmptyDetail:
      "Only content that an owner explicitly marked Public can appear. Popularity, views, and reactions are never fabricated. Prefer Search when you already know what to find.",
    discoveryVsSearch:
      "Search retrieves known objects directly. Global Activity explores relationships among opted-in public work.",
    followAction: "Follow",
    openAction: "Open",
  },
  uz: {
    pageTitle: "Mening ish maydonim",
    pageDescription:
      "CheckBalanceAI.Global ga aytganlaringiz asosida tasdiqlangan shaxsiy ish maydoni. Andozalar boshlang‘ich tuzilma — har bir maydon tahrirlanadi.",
    roleDiscoveryHeading: "Sizga mos ish maydonini tayyorlash",
    interpretationHeading: "Hech narsa saqlanmasidan oldin ushbu talqinni tekshiring",
    confirmCreate: "Tasdiqlash va yaratish",
    saveDraft: "Qoralama sifatida saqlash",
    cancel: "Bekor qilish",
    editFields: "Taxminiy maydonlarni tahrirlash",
    privacyPrivate: "Shaxsiy",
    privacyShared: "Tanlangan odamlar bilan ulashilgan",
    privacyPublic: "Ommaviy",
    inferredLabel: "Taxminiy — tahrirlanadi",
    missingLabel: "Hali kerak",
    draftStatus: "Qoralama — hali yaratilmagan",
    firstActionConfirm: "Ish maydonini tasdiqlang va yarating",
    firstActionEvidence: "Kerakli dalil manbalarini ulang",
    firstActionNext: "Birinchi keyingi qadamni belgilang",
    templateStudent: "Talaba ish maydoni",
    templateStudentDesc: "O‘quv maqsadi, fan, topshiriq, dalillar, reja va natija.",
    templateResearcher: "Tadqiqotchi / olim ish maydoni",
    templateResearcherDesc: "Savol, gipoteza, metodologiya, dalillar, noaniqlik va nashr yo‘li.",
    templateChemist: "Kimyogar / laboratoriya olimi ish maydoni",
    templateChemistDesc:
      "Umumiy ko‘rinish, tadqiqot savoli, gipoteza, adabiyot, dissertatsiya kutubxonasi, tajribalar, materiallar, dalillar xaritasi, topilmalar, xavflar, hamkorlar, vazifalar, hisobotlar va kelib chiqish.",
    chemistDiscoveryHint:
      "Tadqiqot sohasi, dissertatsiya yoki loyiha nomi, maqsad, eksperimental/nazariy/sharhlov turi, bosqich, mavjud fayllar, til va maxfiylikni ayting. Tasdiqlamaguncha hech narsa saqlanmaydi.",
    templateAcademic: "Akademik / o‘qituvchi ish maydoni",
    templateAcademicDesc: "O‘qitish maqsadi, materiallar, auditoriya, jadval va baholash.",
    templateEconomist: "Iqtisodchi ish maydoni",
    templateEconomistDesc: "Savol, geografiya, ko‘rsatkichlar, rasmiy manbalar, senariylar va hisobot.",
    templateGovernment: "Davlat / davlat boshqaruvi ish maydoni",
    templateGovernmentDesc: "Davlat xizmati savoli, yurisdiksiya, rasmiy manbalar va inson qaror egasi.",
    templateInvestor: "Investor / tahlilchi ish maydoni",
    templateInvestorDesc: "Tahlil savoli, qamrov, risklar, yetishmayotgan dalillar va maslahat emas ogohlantirishi.",
    templateOrganization: "Tashkilot ish maydoni",
    templateOrganizationDesc: "Maqsad, jamoa, loyiha, bosqichlar, uchrashuvlar va natijalar.",
    templateGeneral: "Umumiy ish maydoni",
    templateGeneralDesc: "Maqsad, kontekst, vazifalar, dalillar, odamlar, sanalar va keyingi qadam.",
    fieldLearningObjective: "O‘quv maqsadi",
    fieldSubject: "Fan / kurs",
    fieldAssignment: "Topshiriq yoki tadqiqot savoli",
    fieldReadingList: "O‘qish / dalillar ro‘yxati",
    fieldStudyPlan: "O‘qish rejasi",
    fieldDeadlines: "Muddatlar",
    fieldNotes: "Eslatmalar",
    fieldMentorGroup: "Mentor / guruh",
    fieldFinalOutput: "Yakuniy natija",
    fieldResearchQuestion: "Tadqiqot savoli",
    fieldHypothesis: "Gipoteza",
    fieldMethodology: "Metodologiya",
    fieldEvidenceSources: "Dalillar va manbalar",
    fieldDataset: "Ma’lumotlar to‘plami / tajriba havolalari",
    fieldUncertainty: "Noaniqlik va cheklovlar",
    fieldCollaborators: "Hamkorlar",
    fieldReviewCheckpoints: "Ko‘rib chiqish bosqichlari",
    fieldPublicationOutput: "Nashr / hisobot natijasi",
    fieldOverview: "Umumiy ko‘rinish",
    fieldLiteratureSources: "Adabiyot va manbalar",
    fieldThesisLibrary: "Dissertatsiya / hujjat kutubxonasi",
    fieldExperimentsMethodology: "Tajribalar yoki metodologiya",
    fieldMaterialsData: "Materiallar / ma’lumotlar",
    fieldEvidenceMap: "Dalillar xaritasi",
    fieldFindings: "Topilmalar",
    fieldOpenQuestions: "Ochiq savollar",
    fieldRisksSafety: "Xavflar va xavfsizlik",
    fieldSupervisorCollaborators: "Rahbar / hamkorlar",
    fieldTasksMilestones: "Vazifalar va bosqichlar",
    fieldReports: "Hisobotlar",
    fieldProvenanceAudit: "Kelib chiqish va audit tarixi",
    fieldTeachingObjective: "O‘qitish yoki akademik maqsad",
    fieldCourseTopic: "Kurs / mavzu",
    fieldCurriculum: "O‘quv dasturi / materiallar",
    fieldAudience: "Talaba yoki auditoriya konteksti",
    fieldReferences: "Manbalar",
    fieldSchedule: "Jadval",
    fieldAssessment: "Baholash / ko‘rib chiqish",
    fieldClassOutput: "Nashr yoki dars natijasi",
    fieldQuestionGeography: "Savol va geografiya",
    fieldIndicatorSet: "Ko‘rsatkichlar to‘plami",
    fieldSourceInstitutions: "Manba institutlari",
    fieldObservationPeriods: "Kuzatuv davrlari",
    fieldRisks: "Risklar va noaniqlik",
    fieldScenarios: "Senariylar",
    fieldEvidenceUpdates: "Dalillar yangilanishlari",
    fieldReportOutput: "Hisobot natijasi",
    fieldPublicServiceQuestion: "Davlat xizmati savoli",
    fieldJurisdiction: "Yurisdiksiya",
    fieldPolicyContext: "Siyosat yoki xizmat konteksti",
    fieldOfficialSources: "Rasmiy manbalar",
    fieldStakeholders: "Manfaatdor tomonlar",
    fieldLegalReview: "Huquqiy / ko‘rib chiqish talablari",
    fieldEvidenceGaps: "Dalillar bo‘shliqlari",
    fieldHumanDecisionOwner: "Inson qaror egasi",
    fieldAnalysisQuestion: "Tahlil savoli",
    fieldEntitySector: "Subyekt / sektor / geografiya",
    fieldEvidenceCoverage: "Dalillar qamrovi",
    fieldRiskIndicators: "Risk ko‘rsatkichlari",
    fieldMissingEvidence: "Yetishmayotgan dalillar",
    fieldNonAdvisory: "Maslahat emas ogohlantirishi",
    fieldOrganizationGoal: "Tashkilot maqsadi",
    fieldTeam: "Jamoa",
    fieldProject: "Loyiha",
    fieldResponsibilities: "Mas’uliyatlar",
    fieldEvidence: "Dalillar",
    fieldMilestones: "Bosqichlar",
    fieldMeetings: "Uchrashuvlar",
    fieldDecisions: "Qarorlar",
    fieldDeliverables: "Natijalar",
    fieldGoal: "Maqsad",
    fieldContext: "Kontekst",
    fieldTasks: "Vazifalar",
    fieldPeople: "Odamlar",
    fieldDates: "Sanalar",
    fieldNextAction: "Keyingi qadam",
    fieldOutput: "Natija",
    discoveryTitle: "Global faoliyat",
    discoveryDescription:
      "Opt-in ommaviy loyihalar, tadqiqotlar, hisobotlar, guruhlar va medialarni yo‘naltirilgan tarzda o‘rganing. Ma’lum obyektlarni to‘g‘ridan-to‘g‘ri topish uchun Qidiruvdan foydalaning. Shaxsiy ish bu yerda ko‘rinmaydi.",
    discoveryEmpty: "Hali ommaviy faoliyat yo‘q.",
    discoveryEmptyDetail:
      "Faqat egasi aniq Ommaviy deb belgilagan mazmun chiqadi. Mashhurlik, ko‘rishlar va reaksiyalar uydirilmaydi. Nima kerakligini bilsangiz, Qidiruvni afzal ko‘ring.",
    discoveryVsSearch:
      "Qidiruv ma’lum obyektlarni to‘g‘ridan-to‘g‘ri topadi. Global faoliyat opt-in ommaviy ishlar orasidagi bog‘lanishlarni o‘rganadi.",
    followAction: "Kuzatish",
    openAction: "Ochish",
  },
  ru: {
    pageTitle: "Моё рабочее пространство",
    pageDescription:
      "Подтверждённое личное рабочее пространство на основе того, что вы сообщили CheckBalanceAI.Global. Шаблоны — только стартовая структура; каждое поле можно изменить.",
    roleDiscoveryHeading: "Подготовить подходящее рабочее пространство",
    interpretationHeading: "Проверьте эту интерпретацию до любого сохранения",
    confirmCreate: "Подтвердить и создать",
    saveDraft: "Сохранить как черновик",
    cancel: "Отмена",
    editFields: "Изменить выведенные поля",
    privacyPrivate: "Личное",
    privacyShared: "Доступно выбранным людям",
    privacyPublic: "Публичное",
    inferredLabel: "Выведено — можно изменить",
    missingLabel: "Ещё нужно",
    draftStatus: "Черновик — ещё не создано",
    firstActionConfirm: "Подтвердите и создайте рабочее пространство",
    firstActionEvidence: "Подключите необходимые источники доказательств",
    firstActionNext: "Задайте первое следующее действие",
    templateStudent: "Рабочее пространство студента",
    templateStudentDesc: "Учебная цель, предмет, задание, доказательства, план и результат.",
    templateResearcher: "Рабочее пространство исследователя / учёного",
    templateResearcherDesc: "Вопрос, гипотеза, методология, доказательства, неопределённость и путь к публикации.",
    templateChemist: "Рабочее пространство химика / лабораторного учёного",
    templateChemistDesc:
      "Обзор, исследовательский вопрос, гипотеза, литература, библиотека диссертации, эксперименты, материалы, карта доказательств, результаты, риски, сотрудники, задачи, отчёты и происхождение.",
    chemistDiscoveryHint:
      "Укажите область, название диссертации или проекта, цель, тип (эксперимент/теория/обзор), этап, доступные файлы, язык и конфиденциальность. Ничего не сохраняется до подтверждения.",
    templateAcademic: "Рабочее пространство преподавателя / академика",
    templateAcademicDesc: "Учебная цель, материалы, аудитория, расписание и оценка.",
    templateEconomist: "Рабочее пространство экономиста",
    templateEconomistDesc: "Вопрос, география, показатели, официальные источники, сценарии и отчёт.",
    templateGovernment: "Рабочее пространство государственного управления",
    templateGovernmentDesc: "Вопрос госслужбы, юрисдикция, официальные источники и владелец решения.",
    templateInvestor: "Рабочее пространство инвестора / аналитика",
    templateInvestorDesc: "Аналитический вопрос, покрытие, риски, пробелы в доказательствах и отказ от консультации.",
    templateOrganization: "Рабочее пространство организации",
    templateOrganizationDesc: "Цель, команда, проект, этапы, встречи и результаты.",
    templateGeneral: "Общее рабочее пространство",
    templateGeneralDesc: "Цель, контекст, задачи, доказательства, люди, даты и следующий шаг.",
    fieldLearningObjective: "Учебная цель",
    fieldSubject: "Предмет / курс",
    fieldAssignment: "Задание или исследовательский вопрос",
    fieldReadingList: "Список чтения / доказательств",
    fieldStudyPlan: "План учёбы",
    fieldDeadlines: "Сроки",
    fieldNotes: "Заметки",
    fieldMentorGroup: "Наставник / группа",
    fieldFinalOutput: "Итоговый результат",
    fieldResearchQuestion: "Исследовательский вопрос",
    fieldHypothesis: "Гипотеза",
    fieldMethodology: "Методология",
    fieldEvidenceSources: "Доказательства и источники",
    fieldDataset: "Набор данных / ссылки на эксперимент",
    fieldUncertainty: "Неопределённость и ограничения",
    fieldCollaborators: "Участники",
    fieldReviewCheckpoints: "Контрольные точки проверки",
    fieldPublicationOutput: "Публикация / отчёт",
    fieldOverview: "Обзор",
    fieldLiteratureSources: "Литература и источники",
    fieldThesisLibrary: "Библиотека диссертации / документов",
    fieldExperimentsMethodology: "Эксперименты или методология",
    fieldMaterialsData: "Материалы / данные",
    fieldEvidenceMap: "Карта доказательств",
    fieldFindings: "Результаты",
    fieldOpenQuestions: "Открытые вопросы",
    fieldRisksSafety: "Риски и безопасность",
    fieldSupervisorCollaborators: "Руководитель / сотрудники",
    fieldTasksMilestones: "Задачи и этапы",
    fieldReports: "Отчёты",
    fieldProvenanceAudit: "Происхождение и аудит",
    fieldTeachingObjective: "Учебная или академическая цель",
    fieldCourseTopic: "Курс / тема",
    fieldCurriculum: "Программа / материалы",
    fieldAudience: "Контекст аудитории",
    fieldReferences: "Ссылки",
    fieldSchedule: "Расписание",
    fieldAssessment: "Оценка / проверка",
    fieldClassOutput: "Публикация или результат занятия",
    fieldQuestionGeography: "Вопрос и география",
    fieldIndicatorSet: "Набор показателей",
    fieldSourceInstitutions: "Институты-источники",
    fieldObservationPeriods: "Периоды наблюдения",
    fieldRisks: "Риски и неопределённость",
    fieldScenarios: "Сценарии",
    fieldEvidenceUpdates: "Обновления доказательств",
    fieldReportOutput: "Отчёт",
    fieldPublicServiceQuestion: "Вопрос государственной службы",
    fieldJurisdiction: "Юрисдикция",
    fieldPolicyContext: "Контекст политики или услуги",
    fieldOfficialSources: "Официальные источники",
    fieldStakeholders: "Заинтересованные стороны",
    fieldLegalReview: "Юридические / обзорные требования",
    fieldEvidenceGaps: "Пробелы в доказательствах",
    fieldHumanDecisionOwner: "Владелец человеческого решения",
    fieldAnalysisQuestion: "Аналитический вопрос",
    fieldEntitySector: "Объект / сектор / география",
    fieldEvidenceCoverage: "Покрытие доказательствами",
    fieldRiskIndicators: "Индикаторы риска",
    fieldMissingEvidence: "Недостающие доказательства",
    fieldNonAdvisory: "Отказ от консультации",
    fieldOrganizationGoal: "Цель организации",
    fieldTeam: "Команда",
    fieldProject: "Проект",
    fieldResponsibilities: "Обязанности",
    fieldEvidence: "Доказательства",
    fieldMilestones: "Этапы",
    fieldMeetings: "Встречи",
    fieldDecisions: "Решения",
    fieldDeliverables: "Результаты",
    fieldGoal: "Цель",
    fieldContext: "Контекст",
    fieldTasks: "Задачи",
    fieldPeople: "Люди",
    fieldDates: "Даты",
    fieldNextAction: "Следующий шаг",
    fieldOutput: "Результат",
    discoveryTitle: "Глобальная активность",
    discoveryDescription:
      "Направляемое изучение публичных проектов, исследований, отчётов, групп и медиа с явным согласием. Для прямого поиска известных объектов используйте Поиск. Личная работа здесь не появляется.",
    discoveryEmpty: "Публичной активности пока нет.",
    discoveryEmptyDetail:
      "Появляется только контент, который владелец явно сделал публичным. Популярность, просмотры и реакции не выдумываются. Если вы уже знаете, что искать — откройте Поиск.",
    discoveryVsSearch:
      "Поиск находит известные объекты напрямую. Глобальная активность исследует связи среди публичной работы с согласием.",
    followAction: "Следить",
    openAction: "Открыть",
  },
  tr: {
    pageTitle: "Çalışma alanım",
    pageDescription:
      "CheckBalanceAI.Global’e söylediklerinize göre onaylanmış kişisel çalışma alanı. Şablonlar başlangıç yapısıdır — her alan düzenlenebilir.",
    roleDiscoveryHeading: "Size uygun bir çalışma alanı hazırlayın",
    interpretationHeading: "Herhangi bir kayıt yapılmadan önce bu yorumu kontrol edin",
    confirmCreate: "Onayla ve oluştur",
    saveDraft: "Taslak olarak kaydet",
    cancel: "İptal",
    editFields: "Çıkarılan alanları düzenle",
    privacyPrivate: "Özel",
    privacyShared: "Seçili kişilerle paylaşıldı",
    privacyPublic: "Herkese açık",
    inferredLabel: "Çıkarım — düzenlenebilir",
    missingLabel: "Hâlâ gerekli",
    draftStatus: "Taslak — henüz oluşturulmadı",
    firstActionConfirm: "Çalışma alanını onaylayın ve oluşturun",
    firstActionEvidence: "Gerekli kanıt kaynaklarını ekleyin",
    firstActionNext: "İlk sonraki adımı belirleyin",
    templateStudent: "Öğrenci çalışma alanı",
    templateStudentDesc: "Öğrenme hedefi, ders, ödev, kanıt, plan ve çıktı.",
    templateResearcher: "Araştırmacı / bilim insanı çalışma alanı",
    templateResearcherDesc: "Soru, hipotez, yöntem, kanıt, belirsizlik ve yayın yolu.",
    templateChemist: "Kimyager / laboratuvar bilim insanı çalışma alanı",
    templateChemistDesc:
      "Genel bakış, araştırma sorusu, hipotez, literatür, tez kütüphanesi, deneyler, malzemeler, kanıt haritası, bulgular, riskler, işbirlikçiler, görevler, raporlar ve köken.",
    chemistDiscoveryHint:
      "Araştırma alanı, tez veya proje başlığı, hedef, deneysel/teorik/inceleme türü, aşama, mevcut dosyalar, dil ve gizlilik bilgisini verin. Onaylamadan hiçbir şey kaydedilmez.",
    templateAcademic: "Akademisyen / eğitmen çalışma alanı",
    templateAcademicDesc: "Öğretim hedefi, materyaller, kitle, program ve değerlendirme.",
    templateEconomist: "Ekonomist çalışma alanı",
    templateEconomistDesc: "Soru, coğrafya, göstergeler, resmî kaynaklar, senaryolar ve rapor.",
    templateGovernment: "Kamu yönetimi çalışma alanı",
    templateGovernmentDesc: "Kamu hizmeti sorusu, yargı yetkisi, resmî kaynaklar ve insan karar sahibi.",
    templateInvestor: "Yatırımcı / analist çalışma alanı",
    templateInvestorDesc: "Analiz sorusu, kapsam, riskler, eksik kanıt ve tavsiye değildir uyarısı.",
    templateOrganization: "Kuruluş çalışma alanı",
    templateOrganizationDesc: "Hedef, ekip, proje, kilometre taşları, toplantılar ve teslimler.",
    templateGeneral: "Genel çalışma alanı",
    templateGeneralDesc: "Hedef, bağlam, görevler, kanıt, kişiler, tarihler ve sonraki adım.",
    fieldLearningObjective: "Öğrenme hedefi",
    fieldSubject: "Ders / konu",
    fieldAssignment: "Ödev veya araştırma sorusu",
    fieldReadingList: "Okuma / kanıt listesi",
    fieldStudyPlan: "Çalışma planı",
    fieldDeadlines: "Son tarihler",
    fieldNotes: "Notlar",
    fieldMentorGroup: "Mentor / grup",
    fieldFinalOutput: "Nihai çıktı",
    fieldResearchQuestion: "Araştırma sorusu",
    fieldHypothesis: "Hipotez",
    fieldMethodology: "Yöntem",
    fieldEvidenceSources: "Kanıt ve kaynaklar",
    fieldDataset: "Veri seti / deney bağlantıları",
    fieldUncertainty: "Belirsizlik ve sınırlamalar",
    fieldCollaborators: "İşbirlikçiler",
    fieldReviewCheckpoints: "İnceleme kontrol noktaları",
    fieldPublicationOutput: "Yayın / rapor çıktısı",
    fieldOverview: "Genel bakış",
    fieldLiteratureSources: "Literatür ve kaynaklar",
    fieldThesisLibrary: "Tez / belge kütüphanesi",
    fieldExperimentsMethodology: "Deneyler veya yöntem",
    fieldMaterialsData: "Malzemeler / veriler",
    fieldEvidenceMap: "Kanıt haritası",
    fieldFindings: "Bulgular",
    fieldOpenQuestions: "Açık sorular",
    fieldRisksSafety: "Riskler ve güvenlik",
    fieldSupervisorCollaborators: "Danışman / işbirlikçiler",
    fieldTasksMilestones: "Görevler ve kilometre taşları",
    fieldReports: "Raporlar",
    fieldProvenanceAudit: "Köken ve denetim geçmişi",
    fieldTeachingObjective: "Öğretim veya akademik hedef",
    fieldCourseTopic: "Ders / konu",
    fieldCurriculum: "Müfredat / materyaller",
    fieldAudience: "Öğrenci veya kitle bağlamı",
    fieldReferences: "Referanslar",
    fieldSchedule: "Program",
    fieldAssessment: "Değerlendirme / inceleme",
    fieldClassOutput: "Yayın veya sınıf çıktısı",
    fieldQuestionGeography: "Soru ve coğrafya",
    fieldIndicatorSet: "Gösterge seti",
    fieldSourceInstitutions: "Kaynak kurumlar",
    fieldObservationPeriods: "Gözlem dönemleri",
    fieldRisks: "Riskler ve belirsizlik",
    fieldScenarios: "Senaryolar",
    fieldEvidenceUpdates: "Kanıt güncellemeleri",
    fieldReportOutput: "Rapor çıktısı",
    fieldPublicServiceQuestion: "Kamu hizmeti sorusu",
    fieldJurisdiction: "Yargı yetkisi",
    fieldPolicyContext: "Politika veya hizmet bağlamı",
    fieldOfficialSources: "Resmî kaynaklar",
    fieldStakeholders: "Paydaşlar",
    fieldLegalReview: "Hukuki / inceleme gereksinimleri",
    fieldEvidenceGaps: "Kanıt boşlukları",
    fieldHumanDecisionOwner: "İnsan karar sahibi",
    fieldAnalysisQuestion: "Analiz sorusu",
    fieldEntitySector: "Varlık / sektör / coğrafya",
    fieldEvidenceCoverage: "Kanıt kapsamı",
    fieldRiskIndicators: "Risk göstergeleri",
    fieldMissingEvidence: "Eksik kanıt",
    fieldNonAdvisory: "Tavsiye değildir uyarısı",
    fieldOrganizationGoal: "Kuruluş hedefi",
    fieldTeam: "Ekip",
    fieldProject: "Proje",
    fieldResponsibilities: "Sorumluluklar",
    fieldEvidence: "Kanıt",
    fieldMilestones: "Kilometre taşları",
    fieldMeetings: "Toplantılar",
    fieldDecisions: "Kararlar",
    fieldDeliverables: "Teslimler",
    fieldGoal: "Hedef",
    fieldContext: "Bağlam",
    fieldTasks: "Görevler",
    fieldPeople: "Kişiler",
    fieldDates: "Tarihler",
    fieldNextAction: "Sonraki adım",
    fieldOutput: "Çıktı",
    discoveryTitle: "Küresel etkinlik",
    discoveryDescription:
      "Açık onaylı herkese açık projeler, araştırmalar, raporlar, gruplar ve medyayı rehberli keşfedin. Bilinen nesneleri doğrudan bulmak için Aramayı kullanın. Özel çalışma burada görünmez.",
    discoveryEmpty: "Henüz herkese açık etkinlik yok.",
    discoveryEmptyDetail:
      "Yalnızca sahibinin açıkça Herkese açık yaptığı içerik görünür. Popülerlik, görüntülenme ve tepkiler uydurulmaz. Ne aradığınızı biliyorsanız Aramayı tercih edin.",
    discoveryVsSearch:
      "Arama bilinen nesneleri doğrudan getirir. Küresel etkinlik, açık onaylı herkese açık çalışmalar arasındaki ilişkileri keşfeder.",
    followAction: "İzle",
    openAction: "Aç",
  },
};

export function getAdaptiveWorkspaceCopy(locale: string): AdaptiveWorkspaceCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.en;
}
