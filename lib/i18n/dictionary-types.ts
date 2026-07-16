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
    intelligenceLenses: string;
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
  entityIntelligence: {
    fromSearch: string;
    comparables: string;
    timelineDetail: string;
    intelligenceContext: string;
    relatedEntities: string;
    reports: string;
    openQuestions: string;
    availableInformation: string;
    missingInformation: string;
    noOfficialInformation: string;
    availableNow: string;
    sourceStatus: string;
    sourcesConnected: string;
    sourcesConnectedSummary: string;
    topicsListedAbove: string;
    topicsAvailableNow: string;
    compareDefaultHeading: string;
    compareDefaultDescription: string;
    generateReport: string;
    hideReport: string;
    openReportsCenter: string;
    entityTypeCountry: string;
    entityTypeCompany: string;
    entityTypeUniversity: string;
    factGovernment: string;
    factFounded: string;
    factOfficialWebsite: string;
    governanceLensTitle: string;
    governanceLensBody: string;
    investorLensTitle: string;
    investorLensBody: string;
    reportsBodySingle: string;
    reportsBodyPlural: string;
    openReportsCenterSr: string;
    benchmarkUniversity: string;
    partnerClaimsNotShownExtended: string;
    researchPartnershipsNotShownExtended: string;
  };
  sourceCoverage: {
    countryHeading: string;
    countryDescription: string;
    companyHeading: string;
    companyDescription: string;
    universityHeading: string;
    universityDescription: string;
    publisher: string;
    confidence: string;
    citation: string;
    supportedIndicators: string;
  };
  entityRelationships: {
    countryHeading: string;
    countryDescription: string;
    countryEmpty: string;
    exploreCompanies: string;
    exploreUniversities: string;
    companyHeading: string;
    companyDescription: string;
    companyEmpty: string;
    partnerClaims: string;
    partnerClaimsNotShown: string;
    universityHeading: string;
    universityDescription: string;
    universityEmpty: string;
    researchPartnerships: string;
    researchPartnershipsNotShown: string;
    relatedEntities: string;
    verifiedCatalog: string;
    evidenceMissing: string;
  };
  researchTopic: {
    backToTopics: string;
    humanReviewNotice: string;
    experienceNotice: string;
    overviewEyebrow: string;
    quickOverview: string;
    topicLabel: string;
    domainLabel: string;
    currentStatus: string;
    methods: string;
    evidenceTypes: string;
    relatedTopics: string;
    noRelatedTopics: string;
    humanReview: string;
    humanReviewDetail: string;
    topicsHeading: string;
    topicCount: string;
  };
  governanceCenter: {
    totalRules: string;
    criticalRules: string;
    ruleCategories: string;
    validationStepsLabel: string;
    reviewStandards: string;
    reviewStandardsBody: string;
    ruleCount: string;
    constitutionalPrinciples: string;
    constitutionalPrinciplesBody: string;
    reviewProcess: string;
    reviewProcessBody: string;
    stepLabel: string;
    relatedTopics: string;
    complianceReportModel: string;
    complianceReportBody: string;
    passedRules: string;
    passedRulesDetail: string;
    failedRules: string;
    failedRulesDetail: string;
    warnings: string;
    warningsDetail: string;
    recommendations: string;
    recommendationsDetail: string;
    moduleStatus: string;
    statusRegistered: string;
    statusDeclared: string;
    categories: Record<
      "constitution" | "evidence" | "entity" | "indicator" | "ui" | "persona",
      { label: string; purpose: string }
    >;
    validationStepContent: Record<
      | "module-proposal"
      | "standards-check"
      | "evidence-check"
      | "persona-check"
      | "accessibility-check"
      | "release-review",
      { title: string; description: string }
    >;
    personas: Record<
      "citizen" | "investor" | "government" | "student" | "researcher" | "academic",
      { title: string; protection: string }
    >;
    limits: Record<
      "no-automated-enforcement" | "no-runtime-policy-changes" | "no-hidden-ai",
      { title: string; description: string }
    >;
    principles: Record<
      | "evidence-first"
      | "political-neutrality"
      | "zero-demo-policy"
      | "methodology-before-metrics"
      | "separation-of-evidence-and-judgment"
      | "no-social-sentiment-scoring"
      | "official-source-priority"
      | "reproducibility"
      | "governance-before-release",
      { title: string; description: string }
    >;
  };
  reportsModel: {
    statuses: {
      notAvailable: string;
      registryFactsOnly: string;
      methodologyDefinitionsOnly: string;
      insufficientEvidence: string;
      evidenceSourceNotConnected: string;
      partialLocalRegistry: string;
      definedInFramework: string;
      notApplicable: string;
      planned: string;
    };
    evidenceRequired: {
      country: string;
      company: string;
      university: string;
      investor: string;
      government: string;
      research: string;
      academic: string;
    };
    reportTypes: Record<
      | "country-intelligence"
      | "company-intelligence"
      | "university-intelligence"
      | "investor-brief"
      | "government-brief"
      | "research-brief"
      | "academic-methodology",
      { title: string; description: string; audience: string }
    >;
    exportFuture: Record<
      "pdf" | "csv" | "api" | "mobile",
      { format: string; description: string }
    >;
    reportPersonas: Record<
      "citizen" | "investor" | "government" | "student" | "researcher" | "academic",
      { title: string; usefulReports: readonly string[] }
    >;
    trustPillars: Record<
      | "evidence-first"
      | "source-attribution"
      | "methodology-version"
      | "reproducibility"
      | "no-fabricated-metrics",
      { title: string; description: string }
    >;
    exportFutureHeading: string;
    noFakeAnalyticsNotice: string;
    personasHeading: string;
    trustHeading: string;
    exportFutureDescription: string;
    constitutionalCompliance: string;
    noFakeAnalyticsBody: string;
    personasSectionDescription: string;
    trustSectionDescription: string;
  };
  graphUi: {
    entityDetails: string;
    clear: string;
    searchEntities: string;
    entityType: string;
    allTypes: string;
    evidenceStatus: string;
    relationshipCount: string;
    availableSources: string;
    openModule: string;
    connectedEntities: string;
    evidenceSummary: string;
    relationshipStatus: string;
    evidenceAvailable: string;
    evidenceMissing: string;
    entityEvidenceStatus: string;
    neighborCount: string;
    evidenceRelationships: string;
    availableInformation: string;
    futureEvidence: string;
    legend: string;
    activeEntityTypes: string;
    verifiedRelationships: string;
    plannedTypes: string;
    futureTypeCount: string;
    entityTypes: Record<
      | "country"
      | "company"
      | "university"
      | "government"
      | "industry"
      | "infrastructure"
      | "natural-resources"
      | "procurement"
      | "research-center"
      | "future",
      { label: string; note: string }
    >;
    relationshipTypes: Record<
      | "located-in"
      | "registered-in"
      | "belongs-to"
      | "collaborates-with"
      | "evidence-available"
      | "evidence-missing",
      { label: string; description: string }
    >;
    evidenceLabels: {
      localPlatformRegistry: string;
      partnershipVerification: string;
    };
    noSelectionConnections: string;
    futureEvidenceDefault: string;
    plannedTypesSummary: string;
    sourceAdapterCountry: string;
    sourceAdapterCompany: string;
    sourceAdapterUniversity: string;
  };
  aboutPage: {
    title: string;
    pageDescription: string;
    whoWeAreEyebrow: string;
    purposeHeadline: string;
    purposeBody: string;
    whatIsEyebrow: string;
    whatIsHeadline: string;
    whatIsBody: string;
    whyEyebrow: string;
    whyHeadline: string;
    whyClosing: string;
    philosophyEyebrow: string;
    philosophyHeadline: string;
    differentEyebrow: string;
    differentHeadline: string;
    audiencesEyebrow: string;
    audiencesHeadline: string;
    workflowEyebrow: string;
    workflowHeadline: string;
    ecosystemsEyebrow: string;
    ecosystemsHeadline: string;
    manifestoEyebrow: string;
    manifestoHeadline: string;
    enterCBAI: string;
    trySearch: string;
    openTrust: string;
    exploreResearch: string;
    audiencesServesEyebrow: string;
    whatIsBodyExtra: string;
    whyProblems: readonly { title: string; body: string }[];
    whyClosingExtended: string;
    principles: readonly { title: string; description: string }[];
    differentiators: readonly { from: string; to: string; description: string }[];
    audiences: readonly { role: string; need: string }[];
    workflowSteps: readonly { step: string; detail: string }[];
    ecosystems: readonly { name: string; description: string }[];
    ecosystemsClosing: string;
    exploreArrow: string;
    trustEyebrow: string;
    trustHeadline: string;
    trustDoesHeading: string;
    trustDoes: readonly string[];
    trustNeverHeading: string;
    trustNever: readonly string[];
    trustClosingBefore: string;
    trustClosingLink: string;
    trustClosingAfter: string;
    visionEyebrow: string;
    visionHeadline: string;
    visionItems: readonly string[];
    manifestoTitle: string;
    manifestoItems: readonly string[];
    limitationsEyebrow: string;
    limitationsHeadline: string;
    limitationsItems: readonly string[];
    roadmapEyebrow: string;
    roadmapHeadline: string;
    roadmapItems: readonly {
      name: string;
      statusKey: "live" | "partial" | "preview" | "planned" | "waiting_for_verified_data" | "not_connected" | "restricted";
      detail: string;
    }[];
    closingHeadline: string;
    closingBody: string;
    readTrustCenter: string;
    startProject: string;
  };
  resetPasswordPage: {
    pageDescription: string;
    passwordUpdated: string;
    passwordUpdatedBody: string;
    chooseNewPassword: string;
    chooseNewPasswordBody: string;
    newPassword: string;
    confirmNewPassword: string;
    setNewPassword: string;
    minPasswordLength: string;
  };
  capabilityPassport: {
    eyebrow: string;
    title: string;
    description: string;
    readinessEmpty: string;
    readinessEmerging: string;
    readinessActive: string;
    domainsHeading: string;
    recentSignalsHeading: string;
    noSignals: string;
    maturityNone: string;
    maturityEmerging: string;
    maturityDeveloping: string;
    maturityDemonstrated: string;
    signalCount: string;
    notCvNotice: string;
  };
  discoveryEngine: {
    eyebrow: string;
    title: string;
    description: string;
    notConnected: string;
    localOnly: string;
    noCandidates: string;
    candidatesHeading: string;
    opportunityReadiness: string;
  };
  adaptiveIntelligence: {
    eyebrow: string;
    title: string;
    modeCapability: string;
    modePreference: string;
    suggestedRoutes: string;
  };
  supremeConstitution: {
    eyebrow: string;
    title: string;
    productImplication: string;
    principles: Record<
      | "humanity-first"
      | "nature-first"
      | "evidence-first"
      | "truth-before-popularity"
      | "capability-before-status"
      | "knowledge-has-no-borders"
      | "intelligence-has-no-passport"
      | "technology-expands-human-potential",
      { title: string; statement: string; productImplication: string }
    >;
  };
  capabilityDomains: {
    research: string;
    evidence: string;
    analysis: string;
    governance: string;
    synthesis: string;
    collaboration: string;
  };
  missionCenter: {
    eyebrow: string;
    title: string;
    noMissionTitle: string;
    noMissionBody: string;
    createMission: string;
    continueMission: string;
    missionActive: string;
    missionPaused: string;
    linkedProject: string;
    noLinkedProject: string;
    nextAction: string;
    missingKnowledge: string;
    suggestedCollaborators: string;
    collaboratorsNotConnected: string;
    humanityImpact: string;
    impactIncomplete: string;
    impactComplete: string;
    openImpact: string;
    intelligenceField: string;
    intelligenceFieldBody: string;
    contextHorizon: string;
    contextHorizonBody: string;
    legacyTrail: string;
    legacyTrailBody: string;
    legacyEmpty: string;
    humanDecisionBoundary: string;
    systemKnows: string;
    systemInfers: string;
    systemUnknown: string;
    humanJudgment: string;
    operatorPresence: string;
    voiceAvailable: string;
    evidenceNetwork: string;
    knowledgeNetwork: string;
    capabilitySummary: string;
    viewPassport: string;
    openProjects: string;
    notHomepage: string;
  };
  missionCreation: {
    eyebrow: string;
    title: string;
    stepProblem: string;
    stepPurpose: string;
    stepEvidence: string;
    stepDisciplines: string;
    stepImpact: string;
    problemLabel: string;
    problemPlaceholder: string;
    whyLabel: string;
    whyPlaceholder: string;
    benefitsLabel: string;
    benefitsPlaceholder: string;
    harmLabel: string;
    harmPlaceholder: string;
    evidenceHaveLabel: string;
    evidenceHavePlaceholder: string;
    evidenceMissingLabel: string;
    evidenceMissingPlaceholder: string;
    disciplinesLabel: string;
    disciplinesPlaceholder: string;
    capabilitiesLabel: string;
    capabilitiesPlaceholder: string;
    environmentalLabel: string;
    environmentalPlaceholder: string;
    successLabel: string;
    successPlaceholder: string;
    back: string;
    next: string;
    finish: string;
    cancel: string;
    stepOf: string;
  };
  missionThread: {
    eyebrow: string;
    mission: string;
    question: string;
    evidence: string;
    reasoning: string;
    collaborators: string;
    report: string;
    impact: string;
    statusComplete: string;
    statusPartial: string;
    statusMissing: string;
    statusBlocked: string;
  };
  evidencePulse: {
    eyebrow: string;
    available: string;
    partial: string;
    missing: string;
    conflicting: string;
    outdated: string;
    unverified: string;
    limitation: string;
  };
  systemAwakening: {
    skipAria: string;
    skipHint: string;
    stageIdentity: string;
    stageContext: string;
    stageMission: string;
    stageEvidence: string;
    stageOperator: string;
    stageReady: string;
  };
  languageSelector: {
    interfaceLanguage: string;
    searchLanguages: string;
    searchAria: string;
    voiceLanguage: string;
    preparedNotActive: string;
    preparedTitle: string;
    sourcePolicy: string;
    panelAria: string;
    openSettings: string;
    currentLanguage: string;
    voiceSupportVaries: string;
  };
  intelligenceLenses: {
    eyebrow: string;
    title: string;
    notPortal: string;
    maturityLive: string;
    maturityPartial: string;
    maturityPreview: string;
    openLens: string;
  };
  humanImpact: {
    eyebrow: string;
    title: string;
    humanBenefit: string;
    possibleHarm: string;
    environmentalEffect: string;
    ethicalConcerns: string;
    affectedCommunities: string;
    longTermConsequences: string;
    unknownRisks: string;
    mitigation: string;
    missingEvidence: string;
    save: string;
    requiredForReport: string;
    noFakeScores: string;
    humanOwner: string;
  };
  operatingContext: {
    missionContext: string;
    evidenceState: string;
    scope: string;
    returnPath: string;
    noMission: string;
  };
  intelligenceNetwork: {
    eyebrow: string;
    description: string;
    missionFocus: string;
    focusModes: string;
    modeMission: string;
    modeEvidence: string;
    modeAll: string;
    connectedEntities: string;
    supportingEvidence: string;
    missingEvidence: string;
    unresolvedQuestions: string;
    impactConcern: string;
    linkProjectEntities: string;
    contradiction: string;
    returnToMission: string;
  };
  operatorStates: {
    present: string;
    listening: string;
    transcribing: string;
    interpreting: string;
    clarificationRequired: string;
    showingEvidence: string;
    proposingAlternatives: string;
    waitingDecision: string;
    executing: string;
    success: string;
    warning: string;
    unsupported: string;
    permissionDenied: string;
    error: string;
    complete: string;
  };
  moduleAccountabilityUi: {
    eyebrow: string;
    title: string;
    purpose: string;
    input: string;
    processing: string;
    output: string;
    evidenceDependency: string;
    limitations: string;
    responsibleHuman: string;
    maturity: string;
    storage: string;
    nextAction: string;
    unregisteredWarning: string;
  };
  capabilityPassportExt: {
    signalSource: string;
    signalDate: string;
    uncertaintyNotice: string;
    visibilityNote: string;
    developmentDirection: string;
    inspectSignal: string;
  };
  missionThreadUi: {
    openStage: string;
    stageMission: string;
    stageQuestion: string;
    stageEvidence: string;
    stageReasoning: string;
    stageCollaborators: string;
    stageReport: string;
    stageImpact: string;
  };
  intelligenceCanvas: {
    eyebrow: string;
    notHomepage: string;
    notDashboard: string;
    livingWorkspace: string;
    centerMission: string;
    centerQuestion: string;
    centerEvidence: string;
    centerKnowledge: string;
    centerImpact: string;
    centerOperator: string;
    contextLayer: string;
    missionContext: string;
    capabilitySignals: string;
    missingKnowledge: string;
    suggestedNext: string;
    missionDna: string;
    knowledgeStream: string;
    knowledgeUniverse: string;
    timelineQuestion: string;
    timelineEvidence: string;
    timelineAnalysis: string;
    timelineValidation: string;
    timelineImpact: string;
    timelineReport: string;
    openStage: string;
    noMissionPrompt: string;
    beginMission: string;
    operatingNavigation: string;
    viewGraph: string;
    viewProjects: string;
    impactStatus: string;
    evidenceStatus: string;
  };
  operatorAwareness: {
    noMissionDefined: string;
    needIndependentSources: string;
    weakEvidence: string;
    impactIncomplete: string;
    unresolvedQuestions: string;
    needSourceUrls: string;
    missingKnowledge: string;
    similarProblem: string;
  };
  operatingNav: {
    liveActive: string;
    liveReady: string;
    liveAttention: string;
    liveNeutral: string;
  };
  evidenceRuntime: {
    operatingEyebrow: string;
    trustProperty: string;
    whatWeKnow: string;
    howWeKnow: string;
    whoVerified: string;
    whenVerified: string;
    whyTrust: string;
    whatMissing: string;
    whatContradicts: string;
    needsResearch: string;
    journeyEyebrow: string;
    heatmapEyebrow: string;
    infrastructureNote: string;
    machineValidation: string;
    machineValidationOff: string;
    humanValidation: string;
    consensusAligned: string;
    consensusConflicted: string;
    consensusPartial: string;
    consensusNone: string;
  };
  intelligenceSpaces: {
    missionSpace: string;
    evidenceSpace: string;
    knowledgeSpace: string;
    knowledgeUniverseSpace: string;
    researchSpace: string;
    reasoningSpace: string;
    impactSpace: string;
    trustSpace: string;
    capabilitySpace: string;
    reportSpace: string;
    entitySpace: string;
    searchSpace: string;
    settingsSpace: string;
    accountSpace: string;
    governanceSpace: string;
    operatingEnvironment: string;
    activeMission: string;
    noMission: string;
    spatialTransition: string;
    livingContext: string;
    continuityTimeline: string;
    operatingNavigator: string;
    capabilityGalaxy: string;
    capabilityGalaxyBody: string;
    domainSignals: string;
    hoverForContext: string;
  };
  livingIntelligence: {
    intentionEyebrow: string;
    contextMemory: string;
    recentStudy: string;
    returnContinuity: string;
    unfinishedFlow: string;
    flowStage: string;
    flowEyebrow: string;
    legacyMemory: string;
    legacyArtifacts: string;
    capabilityGrowth: string;
    growing: string;
    newActivity: string;
    steady: string;
    lastActivity: string;
    openLivingContext: string;
    closeLivingContext: string;
    knowledgeLayers: string;
    layerSurface: string;
    layerSummary: string;
    layerEvidence: string;
    layerReasoning: string;
    layerHistory: string;
    layerImpact: string;
    layerLegacy: string;
    layerEmpty: string;
    universePulse: string;
    universeQuestions: string;
    universeRelationships: string;
    universeUnknowns: string;
    universeEvidence: string;
    noDecorativeActivity: string;
  };
  experienceEngineering: {
    mentalModelEyebrow: string;
    whereAmI: string;
    whyAmIHere: string;
    whatIsHappening: string;
    whatUnfinished: string;
    whatNext: string;
    whatChanged: string;
    beginMission: string;
    flowComplete: string;
    noMission: string;
    ambientEyebrow: string;
    ambientReason: string;
    trustEyebrow: string;
    confidence: string;
    limitations: string;
    reviewState: string;
    universeViews: string;
    viewEvidence: string;
    viewRelationships: string;
    viewMission: string;
    viewCapability: string;
    mobileIntelligenceMode: string;
    clearLivingMemory: string;
    clearLivingMemoryBody: string;
    livingMemoryCleared: string;
    flowStageCompletedQuestion: string;
    flowStageCompletedHypothesis: string;
    flowStageCompletedEvidence: string;
    flowStageCompletedReasoning: string;
    flowStageCompletedReview: string;
    flowStageCompletedImpact: string;
    flowStageCompletedPublication: string;
    flowStageCompletedLegacy: string;
    ambientConflictingEvidence: string;
    ambientConflictingEvidenceReason: string;
    ambientOutdatedEvidence: string;
    ambientOutdatedEvidenceReason: string;
    ambientImpactNotReviewed: string;
    ambientImpactNotReviewedReason: string;
    ambientMissingExpertise: string;
    ambientMissingExpertiseReason: string;
    ambientDisciplineMayHelp: string;
    ambientDisciplineMayHelpReason: string;
    ambientNoMission: string;
    ambientNoMissionReason: string;
    layerValidation: string;
  };
  universalWorkspace: {
    inspectorEyebrow: string;
    workspaceEyebrow: string;
    whatIsThis: string;
    whyRelevantNow: string;
    missionConnection: string;
    evidenceSupports: string;
    contradicts: string;
    whatIsMissing: string;
    nextAction: string;
    humanJudgment: string;
    historyLegacy: string;
    noObjectSelected: string;
    activeScope: string;
    activeObject: string;
    evidenceCount: string;
    impactStatus: string;
    reportReadiness: string;
    impactComplete: string;
    impactIncomplete: string;
    reportReady: string;
    reportNotReady: string;
    knowledgeRiver: string;
    riverCause: string;
    riverUnresolved: string;
    riverResolved: string;
    floatingIntelligence: string;
    evidenceBasis: string;
    suggestedAction: string;
    humanDecisionRequired: string;
    densityControl: string;
    densityFocused: string;
    densityStandard: string;
    densityExpert: string;
    densityExplanation: string;
    densityFocusedExplain: string;
    densityStandardExplain: string;
    densityExpertExplain: string;
    collaborationEyebrow: string;
    expertiseNeeded: string;
    evidenceGap: string;
    roleDescription: string;
    externalMatchingOff: string;
    limitations: string;
    availableActions: string;
    trustState: string;
    currentState: string;
    none: string;
    yes: string;
    no: string;
    livingContext: string;
    objectTypeMission: string;
    objectTypeProject: string;
    objectTypeResearchTopic: string;
    objectTypeEvidence: string;
    objectTypeCountry: string;
    objectTypeCompany: string;
    objectTypeUniversity: string;
    objectTypeReport: string;
    objectTypeQuestion: string;
    objectTypeRelationship: string;
    objectTypeCapabilitySignal: string;
  };
  organizationOs: {
    inspectorEyebrow: string;
    architecturePreview: string;
    missionHealth: string;
    evidenceQuality: string;
    knowledgeContribution: string;
    capabilityCoverage: string;
    humanImpact: string;
    trust: string;
    unknowns: string;
    decisionBacklog: string;
    maturity: string;
    limitation: string;
    none: string;
    missionRoomEyebrow: string;
    missionRoomInactive: string;
    capabilityRequirements: string;
    noPeopleRecommended: string;
    cloudNotConnected: string;
    marketplaceInactive: string;
    discussionRule: string;
  };
  zeroLearningCurve: {
    gatewayEyebrow: string;
    gatewayHint: string;
    speak: string;
    type: string;
    chooseGoal: string;
    searchGoalHint: string;
    homeNoMissionLead: string;
    startMission: string;
    continueMission: string;
    goalResearch: string;
    goalVerify: string;
    goalCompare: string;
    goalContinue: string;
    goalCreate: string;
    goalCollaborate: string;
    goalPublish: string;
    firstMinuteAction: string;
    universalCommandEyebrow: string;
    commandHint: string;
    whereAmI: string;
    whatAmIDoing: string;
    whyItMatters: string;
    nextAction: string;
    evidenceKnown: string;
    evidenceUnknown: string;
    evidenceConflict: string;
    evidenceNeedsReview: string;
    reportsContinue: string;
    reportsGenerate: string;
    reportsReview: string;
    reportsShare: string;
    graphPeople: string;
    graphEvidence: string;
    graphKnowledge: string;
    graphQuestions: string;
    graphImpact: string;
    capabilityAssessmentOffer: string;
    capabilityAssessmentBody: string;
    advancedDetails: string;
    noTutorial: string;
    reasoningPurpose: string;
    evidenceMissionDescription: string;
    evidenceStatesExplainer: string;
    reasoningNoMission: string;
    reasoningOpenNotes: string;
    graphNoMission: string;
    reportsEmptyAction: string;
    missionContinueBanner: string;
    evidenceStatesEyebrow: string;
    evidenceNoMission: string;
    evidenceNoMissionAction: string;
    evidenceEmpty: string;
    evidenceEmptyAction: string;
    simplicityAuditEyebrow: string;
    simplicityAuditNote: string;
    companionEyebrow: string;
    returnToMission: string;
    resumeThought: string;
    commandEyebrow: string;
    storyBeatBeginning: string;
    storyBeatMiddle: string;
    storyBeatUnknown: string;
    storyBeatNext: string;
    storyBeatCompletion: string;
    routeHomePurpose: string;
    routeEvidencePurpose: string;
    routeReasoningPurpose: string;
    routeGraphPurpose: string;
    routeReportsPurpose: string;
    routeMyWorkPurpose: string;
    routeSearchPurpose: string;
    routeTrustPurpose: string;
    routeResearchPurpose: string;
    routeSettingsPurpose: string;
    routeAccountPurpose: string;
    routeAboutPurpose: string;
  };
};

export type TranslationNamespace = keyof TranslationDictionary;
