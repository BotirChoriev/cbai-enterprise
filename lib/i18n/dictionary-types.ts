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

export type CompassDirectionCopy = {
  discover: { label: string; description: string };
  research: { label: string; description: string };
  evidence: { label: string; description: string };
  analyze: { label: string; description: string };
  organize: { label: string; description: string };
  report: { label: string; description: string };
};

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
  productStatus: {
    live: { label: string; explanation: string };
    partial: { label: string; explanation: string };
    waiting_for_verified_data: { label: string; explanation: string };
    preview: { label: string; explanation: string };
    restricted: { label: string; explanation: string };
    not_connected: { label: string; explanation: string };
    planned: { label: string; explanation: string };
  };
  entities: {
    countriesDescription: string;
    companiesDescription: string;
    universitiesDescription: string;
    noMatchFilters: string;
    clearFilters: string;
    selected: string;
    worldMapTitle: string;
    worldMapShowing: string;
  };
  compass: {
    default: CompassDirectionCopy;
    academic: CompassDirectionCopy;
    engineer: CompassDirectionCopy;
    investor: CompassDirectionCopy;
    government: CompassDirectionCopy;
  };
  myWork: {
    title: string;
    yourWork: string;
    restoringSession: string;
    projectUnavailable: string;
    projectUnavailableBody: string;
    backToMyWork: string;
    localProfileNotSetUp: string;
    savedToBrowser: string;
    signInPrompt: string;
    signInOrCreate: string;
    signedInCloud: string;
    signedInLocal: string;
    continueLinksHeading: string;
    onboardingHeading: string;
    pageDescription: string;
  };
  system: {
    returnHome: string;
    goBack: string;
    search: string;
    continueProject: string;
    tryAgain: string;
    feedback: string;
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
  errorsPages: {
    notFoundEyebrow: string;
    notFoundTitle: string;
    notFoundMessage: string;
    errorEyebrow: string;
    errorTitle: string;
    errorMessage: string;
    researchNotFoundEyebrow: string;
    researchNotFoundTitle: string;
    researchNotFoundMessage: string;
  };
  search: {
    hint: string;
    ariaLabel: string;
    placeholder: string;
    submit: string;
    publicIntelligence: string;
    partOf: string;
    availableToday: string;
    noResults: string;
    noOpenableResults: string;
    noResultsHint: string;
    tryExample: string;
    exampleCountry: string;
    exampleCompany: string;
    exampleUniversity: string;
    exampleResearch: string;
    openProfile: string;
    openProfileArrow: string;
    compareArrow: string;
    openReportsArrow: string;
    createProjectArrow: string;
    matched: string;
    profilesPickOne: string;
    profilesPickMany: string;
    resultsFor: string;
    groupCountries: string;
    groupCompanies: string;
    groupUniversities: string;
    groupResearch: string;
    groupProjects: string;
    opensTo: string;
    exampleSearchesAria: string;
  };
  filters: {
    searchCountries: string;
    searchCompanies: string;
    searchUniversities: string;
    allRegions: string;
    allIndustries: string;
    allCountries: string;
    allTypes: string;
    all: string;
    industry: string;
    countryLabel: string;
    resultCountry: string;
    resultCountries: string;
    resultCompany: string;
    resultCompanies: string;
    resultUniversity: string;
    resultUniversities: string;
    selected: string;
  };
  settingsPage: {
    description: string;
    operatorReady: string;
    operatorNotReady: string;
    identityHeading: string;
    yourName: string;
    yourNamePlaceholder: string;
    operatorName: string;
    workspaceRole: string;
    avatar: string;
    voiceLanguageHeading: string;
    showVoiceInput: string;
    preferredLanguage: string;
    futureTranslationLanguage: string;
    speechLanguage: string;
    speechEnUs: string;
    speechEnGb: string;
    languageNotAvailable: string;
    languageHonestyNote: string;
    contextHeading: string;
    country: string;
    countryNotSet: string;
    organization: string;
    organizationPlaceholder: string;
    timezone: string;
    notificationsHeading: string;
    notificationsHonesty: string;
    notifyEvidenceUpdates: string;
    notifyMissionActivity: string;
    notifyWeeklySummary: string;
    themeHeading: string;
    themeNote: string;
    accessibilityHeading: string;
    reduceMotion: string;
    increaseContrast: string;
    largerText: string;
    interfaceLanguage: string;
    voiceLanguage: string;
    accessibility: string;
    saveProfile: string;
    resetProfile: string;
  };
  dashboardPage: {
    description: string;
  };
  reportsCommon: {
    countryReportEyebrow: string;
    companyReportEyebrow: string;
    universityReportEyebrow: string;
    projectReportEyebrow: string;
    researchReportEyebrow: string;
    generated: string;
    overview: string;
    region: string;
    capital: string;
    government: string;
    officialWebsite: string;
    noVerifiedInfo: string;
    evidence: string;
    evidenceSummary: string;
    connectedEvidence: string;
    missingEvidence: string;
    noSourcesConnected: string;
    noMissingSources: string;
    research: string;
    organizations: string;
    relatedCompanies: string;
    relatedUniversities: string;
    projects: string;
    noRelatedCompanies: string;
    noRelatedUniversities: string;
    noProjectsLinked: string;
    createProjectFor: string;
    methodology: string;
    trustStatement: string;
    limitations: string;
  };
  trustPage: {
    pageDescription: string;
    homeLink: string;
    homeLinkHint: string;
    sectionsNav: string;
    verificationIntro: string;
    constitution: { title: string; body: readonly string[] };
    methodology: { title: string; body: readonly string[] };
    verificationModel: { title: string; body: readonly string[] };
    evidencePolicy: { title: string; body: readonly string[] };
    dataSources: { title: string; body: readonly string[] };
    humanDecision: { title: string; body: readonly string[] };
    privacy: { title: string; body: readonly string[] };
    termsOfUse: { title: string; body: readonly string[] };
    copyright: { title: string; body: readonly string[] };
    knownLimitations: { title: string; body: readonly string[] };
    transparency: { title: string; body: readonly string[] };
  };
  graphPage: {
    description: string;
    graphByRole: string;
    howItWorks: string;
    trust: string;
  };
  reasoningPage: {
    description: string;
    extendedDescription: string;
    reviewSteps: string;
    topicAreas: string;
    informationConnected: string;
    sourcesConnected: string;
  };
  evidenceExplorer: {
    description: string;
    sourcesConnected: string;
    informationConnected: string;
    profilesAvailable: string;
  };
  accountPage: {
    pageDescription: string;
    cloudAccount: string;
    deviceLocalAccount: string;
    cloudSignedInActive: string;
    localSignedInActive: string;
    modeCloud: string;
    modeLocal: string;
    modeSignedOut: string;
    cloudNotice: string;
    localNotice: string;
    emailNotConfirmed: string;
    continueWorking: string;
    signOutCloud: string;
    signOut: string;
    signIn: string;
    createCloudAccount: string;
    resetPassword: string;
    cloudSubtitle: string;
    cloudNotConfigured: string;
    signInTab: string;
    createAccountTab: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordSignUpPlaceholder: string;
    passwordSignInPlaceholder: string;
    forgotPassword: string;
    backToSignIn: string;
    pleaseWait: string;
    sendResetLink: string;
    resetLinkSent: string;
    accountCreatedConfirmEmail: string;
    name: string;
    namePlaceholder: string;
    organizationOptional: string;
    organizationPlaceholder: string;
    localSignInTitle: string;
    localCreateTitle: string;
    localSubtitle: string;
    projects: string;
    bookmarks: string;
    memberSince: string;
  };
  reportsCenter: {
    continuingFor: string;
    continuingBody: string;
    backToProfile: string;
    pageDescription: string;
    whatCanIOpen: string;
    evidenceRequired: string;
    openRelatedProfile: string;
    savedCount: string;
    savedAt: string;
    delete: string;
  };
  researchWorkspace: {
    title: string;
    backToResearch: string;
    shellNotice: string;
    humanReviewNotice: string;
    topicNotFoundPrefix: string;
    browseAllTopics: string;
    selectedTopic: string;
    continueReview: string;
    filterTopics: string;
    filterTopicsAria: string;
    statusShellAvailable: string;
    statusFuture: string;
    statusNotConnected: string;
    lifecycleDiscover: string;
    lifecycleDiscoverDesc: string;
    lifecycleUnderstand: string;
    lifecycleUnderstandDesc: string;
    lifecycleReviewEvidence: string;
    lifecycleReviewEvidenceDesc: string;
    lifecycleIdentifyGaps: string;
    lifecycleIdentifyGapsDesc: string;
    lifecycleFutureCollaboration: string;
    lifecycleFutureCollaborationDesc: string;
  };
  researchHome: {
    statusHeading: string;
    availableToday: string;
    notAvailableYet: string;
    openWorkspace: string;
    pageDescription: string;
    statusLabel: string;
    workspaceEyebrow: string;
    workspaceTitle: string;
    workspaceBody: string;
    availableTodayItems: readonly string[];
    notAvailableYetItems: readonly string[];
  };
  graphPlatform: {
    eyebrow: string;
    headline: string;
    explanation: string;
    relationshipUnavailable: string;
    noSelectionPrompt: string;
    searchPlaceholder: string;
    registryNodes: string;
    verifiedEdges: string;
    registryAvailable: string;
    evidenceConnected: string;
    evidenceUnavailable: string;
    insufficientEvidence: string;
    notConnected: string;
  };
  trustDataSources: {
    un: string;
    worldBank: string;
    imf: string;
    who: string;
    unesco: string;
    ilo: string;
    itu: string;
    oecd: string;
    ocp: string;
    nationalStats: string;
    procurement: string;
    financeAudit: string;
  };
  previewPages: {
    inDevelopmentEyebrow: string;
    agentsTitle: string;
    agentsDescription: string;
    agentsCapabilities: string;
    workflowsTitle: string;
    workflowsDescription: string;
    workflowsHeading: string;
    workflowsBody: string;
    coreTitle: string;
    coreDescription: string;
    governancePreview: string;
    investorPreview: string;
    citizenPreview: string;
  };
  validation: {
    passwordsDoNotMatch: string;
    requiredField: string;
  };
  assistantVoice: {
    savedToWorkspace: string;
    nothingToSaveYet: string;
    uploadNotAvailable: string;
    speechDetected: string;
    commandCenterAria: string;
    contextPrefix: string;
    operatorContextTitle: string;
  };
  myWorkExt: {
    continueWorking: string;
    recentlyViewed: string;
    reportsSection: string;
    reportsCenterLink: string;
    reportsCenterDetail: string;
    evidenceReviews: string;
    evidenceReviewsEmpty: string;
    evidenceLink: string;
    evidenceReviewsSuffix: string;
    savedWork: string;
    signInBrowserHint: string;
    signInAccountHint: string;
    continueResearchWorkspace: string;
    continueResearchWorkspaceDetail: string;
    continueResearchCatalog: string;
    continueResearchCatalogDetail: string;
    continueEvidence: string;
    continueEvidenceDetail: string;
    onboardingExploreResearch: string;
    onboardingExploreCountries: string;
    onboardingSearchEvidence: string;
    onboardingConfigureOperator: string;
    onboardingOpenTrust: string;
    loading: string;
  };
  researchCatalog: {
    catalogEyebrow: string;
    catalogTitle: string;
    catalogDescription: string;
    filterLabel: string;
    filterPlaceholder: string;
    showingCount: string;
    noMatch: string;
    tryDifferent: string;
    clearFilters: string;
    methods: string;
    evidenceTypes: string;
    futureWorkspace: string;
    openTopic: string;
    topicStatus: {
      catalog_available: string;
      workspace_not_available: string;
      evidence_not_connected: string;
    };
  };
  graphExtended: {
    whatCanILearn: string;
    personaGuidanceAria: string;
    pipelineAria: string;
    pipelineStages: readonly string[];
    personas: {
      citizen: { title: string; whatCanILearn: string };
      investor: { title: string; whatCanILearn: string };
      government: { title: string; whatCanILearn: string };
      student: { title: string; whatCanILearn: string };
      researcher: { title: string; whatCanILearn: string };
      academic: { title: string; whatCanILearn: string };
    };
    trustPillars: {
      evidence: { title: string; description: string };
      methodology: { title: string; description: string };
      neutrality: { title: string; description: string };
      transparency: { title: string; description: string };
    };
  };
  entityUi: {
    notAssessed: string;
    notAvailable: string;
    notConnected: string;
    officialWebsite: string;
    publicationDate: string;
    openSourceLink: string;
    connected: string;
    planned: string;
    noVerifiedData: string;
    noVerifiedInfo: string;
    benchmarkCountry: string;
    benchmarkCompany: string;
    noRelationshipsCountry: string;
    noRelationshipsCompany: string;
    searchCountries: string;
    dataStatusLegend: string;
    searchResults: string;
  };
  projectUi: {
    researchQuestion: string;
    objectives: string;
    notes: string;
    tasks: string;
    openQuestions: string;
    timeline: string;
    entities: string;
    noResearchQuestion: string;
    noObjectives: string;
    noEntitiesLinked: string;
    noRelatedCountry: string;
    noEvidence: string;
    noNotes: string;
    noTasks: string;
    noOpenQuestions: string;
    noTimeline: string;
  };
  governancePage: {
    title: string;
    description: string;
    previewNotice: string;
  };
};

export type TranslationNamespace = keyof TranslationDictionary;
