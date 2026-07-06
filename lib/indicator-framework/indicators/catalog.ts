import type {
  ApplicableEntity,
  IndicatorDefinition,
  IndicatorDomainId,
  IndicatorMethodology,
  IndicatorStatus,
} from "@/lib/indicator-framework/types";
import { FRAMEWORK_VERSION } from "@/lib/indicator-framework/types";

type IndicatorInput = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: IndicatorDomainId;
  methodology: IndicatorMethodology;
  requiredEvidenceSources: readonly string[];
  optionalEvidenceSources?: readonly string[];
  status: IndicatorStatus;
  applicableEntities: readonly ApplicableEntity[];
};

function defineIndicator(input: IndicatorInput): IndicatorDefinition {
  return {
    ...input,
    optionalEvidenceSources: input.optionalEvidenceSources ?? [],
    version: FRAMEWORK_VERSION,
  };
}

export const GOVERNANCE_INDICATORS: readonly IndicatorDefinition[] = [
  defineIndicator({
    id: "ind-gov-institutional-framework",
    slug: "institutional-framework",
    title: "Institutional Framework",
    description:
      "Documents the formal structure of government institutions from official constitutional and administrative records.",
    category: "governance",
    methodology: {
      whyItExists:
        "Governance evaluation requires a baseline of institutional structure before any qualitative assessment.",
      requiredEvidence:
        "Constitutional text, government organograms, official gazette records.",
      missingEvidence: "Connected governance datasets and live administrative registries.",
      futureScoringDerivation:
        "A completeness index could count verified institutional fields — not implemented.",
    },
    requiredEvidenceSources: ["united-nations", "national-statistics-offices"],
    optionalEvidenceSources: ["cbai-local-registry"],
    status: "not_connected",
    applicableEntities: ["country", "government", "institution"],
  }),
  defineIndicator({
    id: "ind-judicial-independence-disclosure",
    slug: "judicial-independence-disclosure",
    title: "Judicial Independence Disclosure",
    description:
      "Tracks availability of official judicial structure and independence-related public records.",
    category: "judicial-system",
    methodology: {
      whyItExists:
        "Judicial indicators must rely on published legal framework evidence, not opinion surveys alone.",
      requiredEvidence:
        "Court organization laws, judicial appointment procedures, published court statistics.",
      missingEvidence: "Judicial statistics APIs and case disposition datasets.",
      futureScoringDerivation:
        "Transparency could be measured by document availability checklist — not implemented.",
    },
    requiredEvidenceSources: ["united-nations", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "government", "institution"],
  }),
  defineIndicator({
    id: "ind-budget-document-publication",
    slug: "budget-document-publication",
    title: "Budget Document Publication",
    description:
      "Records whether core budget documents are published through official open budget channels.",
    category: "budget-transparency",
    methodology: {
      whyItExists:
        "Fiscal transparency begins with document availability — not inferred fiscal health scores.",
      requiredEvidence:
        "Published budget proposals, mid-year reviews, year-end reports, audit releases.",
      missingEvidence: "National open budget portal connections.",
      futureScoringDerivation:
        "Open Budget Index-style checklist mapping — methodology only, no scores stored.",
    },
    requiredEvidenceSources: ["national-open-budget-portals", "world-bank"],
    status: "not_connected",
    applicableEntities: ["country", "government"],
  }),
  defineIndicator({
    id: "ind-procurement-disclosure-coverage",
    slug: "procurement-disclosure-coverage",
    title: "Procurement Disclosure Coverage",
    description:
      "Measures whether public procurement opportunities and awards are disclosed in official systems.",
    category: "public-procurement",
    methodology: {
      whyItExists:
        "Procurement transparency requires tender and award records — not narrative corruption indices.",
      requiredEvidence: "Tender notices, award notices, OCDS-compatible exports.",
      missingEvidence: "Official procurement portal and OCP data feeds.",
      futureScoringDerivation:
        "Disclosure rate by procurement stage could be computed from connected records — not implemented.",
    },
    requiredEvidenceSources: [
      "open-contracting-partnership",
      "official-procurement-portals",
    ],
    status: "not_connected",
    applicableEntities: ["country", "government", "institution"],
  }),
  defineIndicator({
    id: "ind-public-service-coverage",
    slug: "public-service-coverage",
    title: "Public Service Coverage",
    description:
      "Documents administrative coverage of essential public services from official service registries.",
    category: "public-services",
    methodology: {
      whyItExists:
        "Service delivery assessment requires administrative coverage data before quality evaluation.",
      requiredEvidence:
        "Service point registries, administrative boundary data, published service charters.",
      missingEvidence: "Connected public service performance datasets.",
      futureScoringDerivation:
        "Coverage ratio by service type when geospatial registries connect — not implemented.",
    },
    requiredEvidenceSources: ["national-statistics-offices", "united-nations"],
    status: "not_connected",
    applicableEntities: ["country", "government", "institution"],
  }),
];

export const ECONOMY_INDICATORS: readonly IndicatorDefinition[] = [
  defineIndicator({
    id: "ind-econ-national-accounts",
    slug: "national-accounts",
    title: "National Accounts Reference",
    description:
      "Anchors macroeconomic evaluation to official national accounts publications.",
    category: "economy",
    methodology: {
      whyItExists:
        "Economic indicators must trace to NSO-published accounts — never fabricated GDP figures.",
      requiredEvidence: "GDP, GNI, sectoral accounts from national statistics offices.",
      missingEvidence: "World Bank and IMF API connections.",
      futureScoringDerivation:
        "Growth and volatility metrics derived from verified time series — not implemented.",
    },
    requiredEvidenceSources: ["national-statistics-offices", "world-bank", "imf"],
    status: "not_connected",
    applicableEntities: ["country"],
  }),
  defineIndicator({
    id: "ind-trade-flow-disclosure",
    slug: "trade-flow-disclosure",
    title: "Trade Flow Disclosure",
    description:
      "Records official import and export statistics from customs and trade authorities.",
    category: "trade",
    methodology: {
      whyItExists: "Trade analysis requires customs statistics — not media trade narratives.",
      requiredEvidence: "Customs declarations, UN Comtrade-compatible national exports.",
      missingEvidence: "Connected customs and Comtrade feeds.",
      futureScoringDerivation:
        "Trade balance and partner concentration from verified flows — not implemented.",
    },
    requiredEvidenceSources: ["united-nations", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "company"],
  }),
  defineIndicator({
    id: "ind-investment-fdi-registration",
    slug: "fdi-registration",
    title: "FDI Registration Disclosure",
    description:
      "Tracks foreign direct investment statistics from official investment promotion and central bank sources.",
    category: "investment",
    methodology: {
      whyItExists:
        "Investment indicators require official FDI statistics — not marketing attractiveness scores.",
      requiredEvidence: "Central bank balance of payments, IPA published FDI reports.",
      missingEvidence: "IMF and national investment agency data connections.",
      futureScoringDerivation:
        "Sectoral FDI breakdown when granular registries connect — not implemented.",
    },
    requiredEvidenceSources: ["imf", "world-bank", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "company"],
  }),
  defineIndicator({
    id: "ind-industry-classification",
    slug: "industry-classification",
    title: "Industry Classification Reference",
    description:
      "Maps entities to official industry classification codes from registries and statistics.",
    category: "industry",
    methodology: {
      whyItExists:
        "Industry analysis requires ISIC/NAICS codes from official sources — not guessed sectors.",
      requiredEvidence: "Business registries, production statistics, industry surveys.",
      missingEvidence: "National business registry APIs beyond local CBAI catalog.",
      futureScoringDerivation:
        "Sector share metrics from verified classification — not implemented.",
    },
    requiredEvidenceSources: ["national-statistics-offices", "cbai-local-registry"],
    optionalEvidenceSources: ["oecd"],
    status: "connected",
    applicableEntities: ["country", "company", "institution"],
  }),
  defineIndicator({
    id: "ind-agriculture-production",
    slug: "agriculture-production",
    title: "Agriculture Production Statistics",
    description:
      "Documents agricultural output from FAO and national agricultural statistics.",
    category: "agriculture",
    methodology: {
      whyItExists:
        "Agricultural indicators require crop and livestock statistics from official surveys.",
      requiredEvidence: "FAO FAOSTAT, national agricultural census, land use records.",
      missingEvidence: "FAO and NSO agricultural API connections.",
      futureScoringDerivation:
        "Yield and production trend analysis from verified series — not implemented.",
    },
    requiredEvidenceSources: ["united-nations", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "company"],
  }),
  defineIndicator({
    id: "ind-employment-labour-market",
    slug: "labour-market-statistics",
    title: "Labour Market Statistics",
    description:
      "Anchors employment evaluation to ILO and national labour force survey data.",
    category: "employment",
    methodology: {
      whyItExists:
        "Employment indicators require labour force surveys — not inferred job market sentiment.",
      requiredEvidence: "ILOSTAT, unemployment rates, participation rates from NSO.",
      missingEvidence: "ILO and NSO labour API connections.",
      futureScoringDerivation:
        "Labour market health indices from official series — not implemented.",
    },
    requiredEvidenceSources: ["ilo", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "institution"],
  }),
];

export const SOCIAL_INDICATORS: readonly IndicatorDefinition[] = [
  defineIndicator({
    id: "ind-hr-treaty-reporting",
    slug: "human-rights-treaty-reporting",
    title: "Human Rights Treaty Reporting",
    description:
      "Tracks submission and publication of state reports under UN human rights mechanisms.",
    category: "human-rights",
    methodology: {
      whyItExists:
        "Human rights assessment must begin with official reporting obligations — not advocacy scores.",
      requiredEvidence: "Treaty body reports, UPR cycles, official state submissions.",
      missingEvidence: "UN human rights mechanism data feeds.",
      futureScoringDerivation:
        "Reporting compliance checklist — not implemented as numeric score.",
    },
    requiredEvidenceSources: ["united-nations"],
    status: "not_connected",
    applicableEntities: ["country", "government"],
  }),
  defineIndicator({
    id: "ind-edu-enrollment-statistics",
    slug: "education-enrollment-statistics",
    title: "Education Enrollment Statistics",
    description:
      "Documents enrollment and literacy from UNESCO UIS and national education ministries.",
    category: "education",
    methodology: {
      whyItExists:
        "Education evaluation requires enrollment statistics — not university marketing rankings.",
      requiredEvidence: "UIS data, national education statistics, accreditation records.",
      missingEvidence: "UNESCO UIS and ministry API connections.",
      futureScoringDerivation:
        "Enrollment gap analysis by level when datasets connect — not implemented.",
    },
    requiredEvidenceSources: ["unesco", "national-statistics-offices"],
    optionalEvidenceSources: ["cbai-local-registry"],
    status: "not_connected",
    applicableEntities: ["country", "university", "institution"],
  }),
  defineIndicator({
    id: "ind-health-system-coverage",
    slug: "health-system-coverage",
    title: "Health System Coverage",
    description:
      "Records health service coverage indicators from WHO and national health statistics.",
    category: "health",
    methodology: {
      whyItExists:
        "Health assessment requires WHO-verified statistics — not fabricated health scores.",
      requiredEvidence: "Global Health Observatory, national health accounts, facility registries.",
      missingEvidence: "WHO and national health API connections.",
      futureScoringDerivation:
        "UHC service coverage index from official WHO methodology — not stored until connected.",
    },
    requiredEvidenceSources: ["who", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "institution"],
  }),
];

export const SCIENCE_ENVIRONMENT_INDICATORS: readonly IndicatorDefinition[] = [
  defineIndicator({
    id: "ind-research-output-disclosure",
    slug: "research-output-disclosure",
    title: "Research Output Disclosure",
    description:
      "Tracks bibliometric and research output evidence from verified publication indexes.",
    category: "research",
    methodology: {
      whyItExists:
        "Research capability requires citable output evidence — not AI readiness scores.",
      requiredEvidence: "Publication indexes, grant award databases, R&D expenditure surveys.",
      missingEvidence: "Bibliometric API and national R&D survey connections.",
      futureScoringDerivation:
        "Field-normalized output metrics when indexes connect — not implemented.",
    },
    requiredEvidenceSources: ["unesco", "oecd", "national-statistics-offices"],
    optionalEvidenceSources: ["cbai-local-registry"],
    status: "not_connected",
    applicableEntities: ["university", "institution", "country"],
  }),
  defineIndicator({
    id: "ind-innovation-patent-filings",
    slug: "patent-filing-disclosure",
    title: "Patent Filing Disclosure",
    description:
      "Documents patent and IP filing statistics from official intellectual property offices.",
    category: "innovation",
    methodology: {
      whyItExists:
        "Innovation indicators require IP office records — not innovation hype narratives.",
      requiredEvidence: "Patent office statistics, WIPO data, R&D tax incentive disclosures.",
      missingEvidence: "WIPO and national IP office API connections.",
      futureScoringDerivation:
        "Patent per capita when verified counts available — not implemented.",
    },
    requiredEvidenceSources: ["united-nations", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "company", "university"],
  }),
  defineIndicator({
    id: "ind-digital-connectivity",
    slug: "digital-connectivity",
    title: "Digital Connectivity Statistics",
    description:
      "Measures ICT access and affordability from ITU and national telecom regulators.",
    category: "digital-development",
    methodology: {
      whyItExists:
        "Digital development requires ITU statistics — not technology level labels.",
      requiredEvidence: "ITU ICT statistics, regulator coverage maps, affordability baskets.",
      missingEvidence: "ITU and regulator API connections.",
      futureScoringDerivation:
        "Connectivity gap metrics from official ITU series — not implemented.",
    },
    requiredEvidenceSources: ["itu", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "institution"],
  }),
  defineIndicator({
    id: "ind-infrastructure-asset-registry",
    slug: "infrastructure-asset-registry",
    title: "Infrastructure Asset Registry",
    description:
      "Documents transport, energy, and utility infrastructure from official asset registries.",
    category: "infrastructure",
    methodology: {
      whyItExists:
        "Infrastructure evaluation requires asset registries — not estimated capacity scores.",
      requiredEvidence: "Transport networks, utility coverage, infrastructure master plans.",
      missingEvidence: "National infrastructure GIS and asset registry connections.",
      futureScoringDerivation:
        "Asset density per capita when geospatial registries connect — not implemented.",
    },
    requiredEvidenceSources: ["national-statistics-offices", "world-bank"],
    status: "not_connected",
    applicableEntities: ["country", "institution"],
  }),
  defineIndicator({
    id: "ind-environment-emissions-inventory",
    slug: "emissions-inventory",
    title: "Emissions Inventory Disclosure",
    description:
      "Tracks national greenhouse gas inventories from official climate communications.",
    category: "environment",
    methodology: {
      whyItExists:
        "Environmental indicators require emissions inventories — not estimated carbon scores.",
      requiredEvidence: "National GHG inventories, monitoring agency publications.",
      missingEvidence: "UNFCCC and national environment agency connections.",
      futureScoringDerivation:
        "Emissions trend analysis from verified inventories — not implemented.",
    },
    requiredEvidenceSources: ["united-nations", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "company"],
  }),
  defineIndicator({
    id: "ind-energy-mix-disclosure",
    slug: "energy-mix-disclosure",
    title: "Energy Mix Disclosure",
    description:
      "Documents energy production and consumption from official energy balances.",
    category: "energy",
    methodology: {
      whyItExists:
        "Energy indicators require IEA/national energy balance data — not transition slogans.",
      requiredEvidence: "Energy balances, renewable capacity statistics, grid access data.",
      missingEvidence: "National energy agency and IEA connections.",
      futureScoringDerivation:
        "Renewable share metrics from verified balances — not implemented.",
    },
    requiredEvidenceSources: ["national-statistics-offices", "world-bank"],
    status: "not_connected",
    applicableEntities: ["country", "company"],
  }),
  defineIndicator({
    id: "ind-climate-ndc-submission",
    slug: "ndc-submission",
    title: "NDC Submission Reference",
    description:
      "Records nationally determined contribution submissions and update cycles.",
    category: "climate",
    methodology: {
      whyItExists:
        "Climate policy indicators must trace to NDC documents — not opinion-based climate scores.",
      requiredEvidence: "UNFCCC NDC registry entries, national climate strategy documents.",
      missingEvidence: "UNFCCC registry API connection.",
      futureScoringDerivation:
        "Target ambition comparison when structured NDC data connects — not implemented.",
    },
    requiredEvidenceSources: ["united-nations"],
    status: "not_connected",
    applicableEntities: ["country", "government"],
  }),
  defineIndicator({
    id: "ind-disaster-sendai-reporting",
    slug: "sendai-framework-reporting",
    title: "Sendai Framework Reporting",
    description:
      "Tracks disaster risk reduction reporting under the Sendai Framework.",
    category: "disaster-preparedness",
    methodology: {
      whyItExists:
        "Disaster preparedness requires official DRR reporting — not inferred resilience scores.",
      requiredEvidence: "Sendai Monitor submissions, early warning system coverage data.",
      missingEvidence: "UNDRR and national emergency agency connections.",
      futureScoringDerivation:
        "Indicator progress against Sendai targets when reports connect — not implemented.",
    },
    requiredEvidenceSources: ["united-nations", "national-statistics-offices"],
    status: "not_connected",
    applicableEntities: ["country", "government", "institution"],
  }),
];

export const ALL_DOMAIN_INDICATORS: readonly IndicatorDefinition[] = [
  ...GOVERNANCE_INDICATORS,
  ...ECONOMY_INDICATORS,
  ...SOCIAL_INDICATORS,
  ...SCIENCE_ENVIRONMENT_INDICATORS,
];
