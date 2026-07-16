/**
 * Translation dictionary shape (Global Language Foundation + Multilingual Voice Commands mission).
 *
 * One reusable, namespaced translation system — not four separate hardcoded interfaces. Every
 * language dictionary (lib/i18n/dictionaries/*.ts) must satisfy this exact type, so a missing key
 * in any non-English dictionary is a real TypeScript compile error, not a silent runtime gap.
 * Namespaces match Phase 6 of the mission that added this: common, navigation, home, project,
 * research, evidence, countries, companies, universities, reports, trust, account, assistant,
 * errors.
 */

export type RoleCardText = {
  title: string;
  description: string;
  firstAction: string;
  /** A real, working Operator command phrase for this role — must be a phrase that
   * resolveAssistantCommand() actually resolves (see lib/assistant/assistant-commands.ts),
   * never an invented example. */
  sampleCommand: string;
};

export type ProjectTypeCopy = {
  label: string;
  description: string;
};

export type TranslationDictionary = {
  roles: {
    scientistAcademic: RoleCardText;
    professorResearcher: RoleCardText;
    student: RoleCardText;
    engineer: RoleCardText;
    laboratorySpecialist: RoleCardText;
    governmentLeader: RoleCardText;
    economist: RoleCardText;
    investorBusiness: RoleCardText;
    legalProfessional: RoleCardText;
    socialSector: RoleCardText;
    generalUser: RoleCardText;
  };
  common: {
    loading: string;
    save: string;
    saving: string;
    saved: string;
    retry: string;
    cancel: string;
    close: string;
    continue: string;
    open: string;
    viewAll: string;
    viewAllCapabilities: string;
    tryCommand: string;
    learnMore: string;
    generate: string;
    delete: string;
    confirm: string;
    yes: string;
    no: string;
    noResults: string;
  };
  navigation: {
    home: string;
    myWork: string;
    search: string;
    explore: string;
    reports: string;
    trust: string;
    settings: string;
    countries: string;
    companies: string;
    universities: string;
    research: string;
    evidence: string;
    account: string;
    more: string;
    intelligenceCabinet: string;
    ecosystems: string;
    intelligence: string;
    government: string;
    investor: string;
    citizen: string;
    dashboard: string;
    reasoning: string;
    knowledgeGraph: string;
    governance: string;
    researchWorkspace: string;
    startWithSearch: string;
    startWithSearchBody: string;
    openSearch: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    firstScreenMessage: string;
    supportingMessage: string;
    commandPlaceholder: string;
    commandListening: string;
    commandProcessing: string;
    workContextsHeading: string;
    projectsHeading: string;
    feedHeading: string;
    feedEmptyTitle: string;
    feedExploreResearch: string;
    feedSearchEvidence: string;
    feedOpenCountries: string;
    quickActions: string;
    newProject: string;
    feedYourProjectActivity: string;
    feedYourSavedReports: string;
    feedSavedReport: string;
    feedEvidenceAndEntities: string;
    destOpenMyWork: string;
    destSearchIntelligence: string;
    destExploreCountries: string;
    destReviewEvidence: string;
    destExploreResearch: string;
    destExploreCompanies: string;
    destExploreUniversities: string;
    destResearchWorkspace: string;
    destReviewStandards: string;
    destInvestorWorkspace: string;
    destReviewInstitutions: string;
    destGovernmentWorkspace: string;
    destOpenReports: string;
    destOpenDashboard: string;
    destOpenTrust: string;
    destCitizenWorkspace: string;
    operatingEnvironmentLabel: string;
    intelligenceSessionLabel: string;
    intelligenceSessionActive: string;
    roleSectionHeadline: string;
    compassHeading: string;
    trustHomeHeading: string;
    trustHomeSubtitle: string;
    entrySkipHint: string;
    entrySkipAriaLabel: string;
  };
  project: {
    createProject: string;
    continueProject: string;
    openProject: string;
    generateReport: string;
    noProjectsTitle: string;
    noProjectsBody: string;
    lastActivity: string;
    nextStep: string;
    openTasks: string;
    status: {
      active: string;
      paused: string;
      completed: string;
      archived: string;
    };
    visibility: {
      private: string;
      team: string;
      public: string;
    };
    taskStatus: {
      todo: string;
      inProgress: string;
      done: string;
    };
    tasks: {
      heading: string;
      newTaskPlaceholder: string;
      addTask: string;
      noTasksYet: string;
      markAs: string;
    };
    types: {
      researchProject: ProjectTypeCopy;
      countryAnalysis: ProjectTypeCopy;
      companyAnalysis: ProjectTypeCopy;
      universityStudy: ProjectTypeCopy;
      policyAnalysis: ProjectTypeCopy;
      investmentAnalysis: ProjectTypeCopy;
      technologyAssessment: ProjectTypeCopy;
      evidenceReview: ProjectTypeCopy;
    };
    catalog: {
      recentProjects: string;
      pinnedProjects: string;
      noProjectsCreatedYet: string;
      suggestedNextStep: string;
      continueAction: string;
      startA: string;
      start: string;
    };
    form: {
      heading: string;
      primaryEntityLabel: string;
      titleLabel: string;
      titlePlaceholder: string;
      typeLabel: string;
      statusLabel: string;
      descriptionLabel: string;
      descriptionPlaceholder: string;
      tagsLabel: string;
      tagsPlaceholder: string;
      visibilityLabel: string;
      submit: string;
      requiredError: string;
      visibilityError: string;
    };
  };
  research: {
    title: string;
    openTopic: string;
    noTopics: string;
  };
  evidence: {
    title: string;
    findEvidence: string;
    connected: string;
    missing: string;
  };
  countries: {
    title: string;
    openCountry: string;
  };
  companies: {
    title: string;
    openCompany: string;
  };
  universities: {
    title: string;
    openUniversity: string;
  };
  reports: {
    title: string;
    saveToMyReports: string;
    myReports: string;
    noReports: string;
  };
  trust: {
    title: string;
    constitution: string;
    methodology: string;
    humanDecision: string;
    privacy: string;
    knownLimitations: string;
    pillars: {
      sourcesBeforeConclusions: { title: string; description: string };
      uncertaintyVisible: { title: string; description: string };
      explainableRecommendations: { title: string; description: string };
      comparableAlternatives: { title: string; description: string };
      consequencesShown: { title: string; description: string };
      aiNeverTheSource: { title: string; description: string };
      historyPreserved: { title: string; description: string };
      humansDecide: { title: string; description: string };
    };
  };
  account: {
    signIn: string;
    signUp: string;
    signOut: string;
    cloudAccount: string;
    deviceLocalAccount: string;
    signedOut: string;
  };
  assistant: {
    greetingSignedOut: string;
    greetingReturning: string;
    operatorReadyWorkspace: string;
    operatorReadySignedOut: string;
    nextStepCompleteSetup: string;
    nextStepContinueViewing: string;
    nextStepOpenWorkspace: string;
    continuingEyebrow: string;
    continuingEntitySubtitle: string;
    timeOfDayMorning: string;
    timeOfDayAfternoon: string;
    timeOfDayEvening: string;
    micReady: string;
    micRequesting: string;
    micListening: string;
    micSpeechDetected: string;
    micProcessing: string;
    micUnsupportedCommand: string;
    micPermissionDenied: string;
    micUnsupportedBrowser: string;
    micNetworkError: string;
    micTextFallback: string;
    commandUnderstood: string;
    editTranscript: string;
    contextualViewingEntity: string;
    contextualProjectActions: string;
    openEvidence: string;
    viewReports: string;
    exploreUniversities: string;
    relatedUniversities: string;
    relatedCompanies: string;
    continueWorkspace: string;
    reviewQuestions: string;
    openNotes: string;
    addEvidence: string;
    generateReport: string;
    readyWhenYouAre: string;
    openNextStep: string;
  };
  errors: {
    generic: string;
    notFound: string;
    couldNotSave: string;
    tryAgain: string;
  };
  /** Translated mirror of lib/project/project-guide.ts's 7 real guide steps — previously
   * English-only because the step text only ever lived buried inside a small card (ProjectList).
   * BUILD-009's continuity-first homepage promotes this same real text to the primary headline,
   * so it now needs to be real in every language, not just English. */
  projectGuide: {
    addQuestionSuggestion: string;
    addQuestionDetail: string;
    defineObjectivesSuggestion: string;
    defineObjectivesDetail: string;
    collectEvidenceSuggestion: string;
    collectEvidenceDetail: string;
    linkEntitySuggestion: string;
    linkEntityDetail: string;
    documentFindingsSuggestion: string;
    documentFindingsDetail: string;
    generateReportSuggestion: string;
    generateReportDetail: string;
    readySuggestion: string;
    readyDetail: string;
  };
  /** Translated mirror of lib/assistant/assistant-profile.ts WORKSPACE_ROLE_LABELS — one real
   * label per WorkspaceRole, used anywhere that label is shown to the user (e.g. the homepage
   * greeting subtitle), instead of the English-only Record previously read from directly. */
  workspaceRoles: {
    citizen: string;
    student: string;
    researcher: string;
    professor: string;
    academic: string;
    engineer: string;
    investor: string;
    company: string;
    university: string;
    research_center: string;
    government: string;
    administrator: string;
    economist: string;
    legal: string;
    social_sector: string;
  };
};

export type TranslationNamespace = keyof TranslationDictionary;
