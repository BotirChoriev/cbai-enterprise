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
  };
  errors: {
    generic: string;
    notFound: string;
    couldNotSave: string;
    tryAgain: string;
  };
};

export type TranslationNamespace = keyof TranslationDictionary;
