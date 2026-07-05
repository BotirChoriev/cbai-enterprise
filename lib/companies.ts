export type CompanyRelationships = {
  competitors: string[];
  partners: string[];
  relatedCountries: string[];
  relatedUniversities: string[];
};

export type Company = {
  id: string;
  name: string;
  icon: string;
  country: string;
  ceo: string;
  founded: number;
  employees: number;
  revenue: string;
  marketCap: string;
  industry: string;
  products: string[];
  aiReadiness: number;
  innovationScore: number;
  investmentScore: number;
  riskScore: number;
  technologyLevel: string;
  relationships: CompanyRelationships;
  aiSummary: string;
  overview: string;
};

export const industries = [
  "Technology",
  "Consumer Electronics",
  "Automotive",
  "E-Commerce",
  "Artificial Intelligence",
  "Semiconductors",
] as const;

export type CompanyIndustry = (typeof industries)[number];

export const companyCountries = [
  "United States",
  "South Korea",
] as const;

export type CompanyCountry = (typeof companyCountries)[number];

export const companies: Company[] = [
  {
    id: "apple",
    name: "Apple",
    icon: "AAPL",
    country: "United States",
    ceo: "Tim Cook",
    founded: 1976,
    employees: 164000,
    revenue: "$391.0B",
    marketCap: "$3.4T",
    industry: "Consumer Electronics",
    products: ["iPhone", "Mac", "iPad", "Apple Watch", "Apple Intelligence"],
    aiReadiness: 92,
    innovationScore: 95,
    investmentScore: 89,
    riskScore: 18,
    technologyLevel: "Advanced — Consumer AI Leader",
    relationships: {
      competitors: ["Samsung", "Google", "Microsoft"],
      partners: ["TSMC", "Foxconn", "OpenAI"],
      relatedCountries: ["United States", "China", "Germany"],
      relatedUniversities: ["Stanford University", "MIT"],
    },
    overview:
      "Global leader in consumer electronics and services with accelerating AI integration across devices through Apple Intelligence. Dominant ecosystem lock-in via hardware-software-services vertical integration.",
    aiSummary:
      "Apple leads consumer AI deployment with on-device inference strategy prioritizing privacy. Apple Intelligence rollout across iPhone, Mac, and iPad creates a differentiated AI experience. Strong investment profile with moderate risk. Key watchpoints: China supply chain exposure and App Store regulatory pressure in EU and US.",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    icon: "MSFT",
    country: "United States",
    ceo: "Satya Nadella",
    founded: 1975,
    employees: 228000,
    revenue: "$245.1B",
    marketCap: "$3.2T",
    industry: "Technology",
    products: ["Azure", "Microsoft 365", "Copilot", "Windows", "GitHub"],
    aiReadiness: 97,
    innovationScore: 93,
    investmentScore: 94,
    riskScore: 15,
    technologyLevel: "Advanced — Enterprise AI Leader",
    relationships: {
      competitors: ["Google", "Amazon", "Oracle"],
      partners: ["OpenAI", "NVIDIA", "Meta"],
      relatedCountries: ["United States", "Germany", "Japan"],
      relatedUniversities: ["MIT", "Carnegie Mellon", "University of Washington"],
    },
    overview:
      "Dominant enterprise cloud and productivity platform with deepest AI integration through Copilot across Office, Azure, and GitHub. OpenAI partnership provides frontier model access. Largest enterprise AI distribution channel globally.",
    aiSummary:
      "Microsoft holds the strongest enterprise AI position through Azure OpenAI Service and Copilot suite. Revenue diversification across cloud, productivity, and gaming reduces concentration risk. OpenAI partnership is both strategic moat and dependency. Highest AI readiness score in portfolio with exceptional investment attractiveness.",
  },
  {
    id: "google",
    name: "Google",
    icon: "GOOG",
    country: "United States",
    ceo: "Sundar Pichai",
    founded: 1998,
    employees: 182000,
    revenue: "$350.0B",
    marketCap: "$2.3T",
    industry: "Technology",
    products: ["Search", "Gemini", "Android", "Google Cloud", "YouTube", "Waymo"],
    aiReadiness: 96,
    innovationScore: 94,
    investmentScore: 88,
    riskScore: 24,
    technologyLevel: "Advanced — AI Research Pioneer",
    relationships: {
      competitors: ["Microsoft", "OpenAI", "Meta", "Amazon"],
      partners: ["Samsung", "NVIDIA", "Accenture"],
      relatedCountries: ["United States", "India", "United Kingdom"],
      relatedUniversities: ["Stanford University", "UC Berkeley", "CMU"],
    },
    overview:
      "Alphabet subsidiary operating the world's dominant search engine and Android ecosystem. DeepMind and Google Brain heritage provides frontier AI research capabilities. Gemini models compete at the top tier of LLM performance.",
    aiSummary:
      "Google possesses unmatched data assets for AI training and the broadest consumer AI touchpoints via Search, Android, and YouTube. Antitrust litigation in US and EU poses regulatory risk. Gemini integration across products accelerating. Strong innovation pipeline in autonomous systems (Waymo) and quantum computing.",
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    icon: "NVDA",
    country: "United States",
    ceo: "Jensen Huang",
    founded: 1993,
    employees: 36000,
    revenue: "$130.5B",
    marketCap: "$3.1T",
    industry: "Semiconductors",
    products: ["H100 GPU", "Blackwell", "CUDA", "DGX Systems", "Omniverse"],
    aiReadiness: 99,
    innovationScore: 98,
    investmentScore: 91,
    riskScore: 32,
    technologyLevel: "Advanced — AI Infrastructure Monopoly",
    relationships: {
      competitors: ["AMD", "Intel", "Google TPU"],
      partners: ["Microsoft", "Amazon", "OpenAI", "Tesla"],
      relatedCountries: ["United States", "China", "Taiwan"],
      relatedUniversities: ["Stanford University", "MIT", "Caltech"],
    },
    overview:
      "Dominant supplier of AI training and inference hardware controlling ~90% of data center GPU market. CUDA software ecosystem creates deep moat. Blackwell architecture extends performance leadership.",
    aiSummary:
      "NVIDIA is the critical infrastructure layer of the global AI economy. Near-monopolistic position in AI accelerators with CUDA lock-in. Export restrictions to China create revenue headwinds and geopolitical risk. Valuation reflects AI supercycle expectations — elevated risk score despite exceptional fundamentals. Essential holding for AI exposure.",
  },
  {
    id: "tesla",
    name: "Tesla",
    icon: "TSLA",
    country: "United States",
    ceo: "Elon Musk",
    founded: 2003,
    employees: 125000,
    revenue: "$97.7B",
    marketCap: "$1.1T",
    industry: "Automotive",
    products: ["Model 3/Y/S/X", "Cybertruck", "FSD", "Optimus", "Energy Storage"],
    aiReadiness: 88,
    innovationScore: 91,
    investmentScore: 72,
    riskScore: 45,
    technologyLevel: "Advanced — Autonomous Systems",
    relationships: {
      competitors: ["BYD", "Toyota", "Rivian", "Waymo"],
      partners: ["NVIDIA", "Panasonic", "CATL"],
      relatedCountries: ["United States", "China", "Germany"],
      relatedUniversities: ["Stanford University", "UC Berkeley"],
    },
    overview:
      "Electric vehicle market leader pivoting toward AI-driven autonomy and robotics. Full Self-Driving and Optimus humanoid robot represent high-upside AI bets. Energy storage business growing rapidly.",
    aiSummary:
      "Tesla's AI value proposition centers on autonomous driving data flywheel and Optimus robotics. FSD v12 end-to-end neural network approach is differentiated but regulatory approval timeline uncertain. High volatility investment profile. Musk leadership concentration adds key-person risk. China manufacturing and competition from BYD are primary headwinds.",
  },
  {
    id: "amazon",
    name: "Amazon",
    icon: "AMZN",
    country: "United States",
    ceo: "Andy Jassy",
    founded: 1994,
    employees: 1520000,
    revenue: "$638.0B",
    marketCap: "$2.1T",
    industry: "E-Commerce",
    products: ["AWS", "Alexa", "Prime", "Amazon Bedrock", "Kindle", "Logistics"],
    aiReadiness: 93,
    innovationScore: 89,
    investmentScore: 90,
    riskScore: 20,
    technologyLevel: "Advanced — Cloud & Commerce AI",
    relationships: {
      competitors: ["Microsoft", "Google", "Walmart", "Shopify"],
      partners: ["NVIDIA", "Anthropic", "Intel"],
      relatedCountries: ["United States", "Germany", "Japan", "India"],
      relatedUniversities: ["University of Washington", "MIT", "CMU"],
    },
    overview:
      "World's largest e-commerce platform and second-largest cloud provider. AWS Bedrock offers multi-model AI services. Massive logistics network generates proprietary operational data for AI optimization.",
    aiSummary:
      "Amazon combines cloud AI infrastructure (AWS), consumer AI (Alexa), and enterprise AI (Bedrock) across the largest commerce ecosystem. Anthropic partnership strengthens model offerings. Labor and antitrust scrutiny in multiple jurisdictions. Strong investment profile with diversified AI revenue streams and low relative risk.",
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "OAI",
    country: "United States",
    ceo: "Sam Altman",
    founded: 2015,
    employees: 4500,
    revenue: "$13.0B",
    marketCap: "$300B",
    industry: "Artificial Intelligence",
    products: ["ChatGPT", "GPT-4o", "DALL-E", "Sora", "API Platform"],
    aiReadiness: 99,
    innovationScore: 99,
    investmentScore: 85,
    riskScore: 38,
    technologyLevel: "Frontier — AGI Research Leader",
    relationships: {
      competitors: ["Google", "Anthropic", "Meta AI", "xAI"],
      partners: ["Microsoft", "Apple", "Stripe"],
      relatedCountries: ["United States", "United Kingdom", "Japan"],
      relatedUniversities: ["Stanford University", "MIT", "UC Berkeley"],
    },
    overview:
      "Frontier AI lab that catalyzed the generative AI revolution with ChatGPT. GPT series models set industry benchmarks. Transitioning from research nonprofit to commercial enterprise at unprecedented scale.",
    aiSummary:
      "OpenAI defines the frontier of commercial AI with ChatGPT's 200M+ weekly users and GPT-4o multimodal capabilities. Microsoft dependency for compute creates strategic coupling. Governance structure and nonprofit mission tension add organizational risk. Unmatched brand recognition in consumer AI. Critical entity for any AI market intelligence platform.",
  },
  {
    id: "samsung",
    name: "Samsung",
    icon: "SMSN",
    country: "South Korea",
    ceo: "Han Jong-hee",
    founded: 1938,
    employees: 267000,
    revenue: "$213.0B",
    marketCap: "$320B",
    industry: "Consumer Electronics",
    products: ["Galaxy", "Semiconductors", "Displays", "Samsung Gauss AI", "Memory"],
    aiReadiness: 86,
    innovationScore: 88,
    investmentScore: 80,
    riskScore: 26,
    technologyLevel: "Advanced — Hardware & Memory Leader",
    relationships: {
      competitors: ["Apple", "TSMC", "SK Hynix", "LG"],
      partners: ["Google", "Qualcomm", "IBM"],
      relatedCountries: ["South Korea", "United States", "Vietnam"],
      relatedUniversities: ["Seoul National University", "KAIST", "MIT"],
    },
    overview:
      "Global conglomerate spanning consumer electronics, semiconductors, and displays. Only company competing with TSMC in advanced chip fabrication. Galaxy AI integration across smartphone portfolio.",
    aiSummary:
      "Samsung uniquely spans AI hardware (memory, foundry) and consumer AI (Galaxy AI). Vertical integration from chips to devices provides supply chain resilience. Geopolitical exposure through China manufacturing and Korea-US-China triangle. Gauss AI models gaining traction in mobile. Strong hardware AI readiness with growing software capabilities.",
  },
];

export function getCompanyIndustries(): string[] {
  return [...new Set(companies.map((c) => c.industry))].sort();
}

export function getCompanyCountries(): string[] {
  return [...new Set(companies.map((c) => c.country))].sort();
}
