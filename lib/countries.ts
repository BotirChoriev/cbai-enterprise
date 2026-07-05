export type CountryRegion =
  | "Americas"
  | "Asia"
  | "Europe"
  | "Middle East";

export type Country = {
  id: string;
  name: string;
  code: string;
  region: CountryRegion;
  gdp: string;
  population: string;
  capital: string;
  government: string;
  economy: string;
  aiReadiness: number;
  investmentScore: number;
  riskScore: number;
  topIndustries: string[];
  universities: string[];
  technologyLevel: string;
  businessOpportunities: string[];
  aiSummary: string;
};

export const countries: Country[] = [
  {
    id: "usa",
    name: "United States",
    code: "US",
    region: "Americas",
    gdp: "$28.8T",
    population: "335M",
    capital: "Washington, D.C.",
    government: "Federal Presidential Constitutional Republic",
    economy:
      "World's largest economy driven by services, technology, finance, and advanced manufacturing. Dominant in AI research, venture capital, and global innovation ecosystems.",
    aiReadiness: 94,
    investmentScore: 91,
    riskScore: 22,
    topIndustries: [
      "Technology",
      "Financial Services",
      "Healthcare",
      "Defense",
      "Energy",
    ],
    universities: [
      "MIT",
      "Stanford University",
      "Harvard University",
      "Caltech",
      "Carnegie Mellon",
    ],
    technologyLevel: "Advanced — Global Leader",
    businessOpportunities: [
      "AI infrastructure & cloud services",
      "Enterprise SaaS expansion",
      "Clean energy transition",
      "Healthcare AI diagnostics",
      "Defense & cybersecurity contracts",
    ],
    aiSummary:
      "The United States maintains global AI supremacy with the highest concentration of frontier labs, venture funding, and enterprise adoption. Regulatory frameworks are evolving rapidly. Strong investment climate with moderate geopolitical risk. Priority sectors: generative AI, autonomous systems, and national security applications.",
  },
  {
    id: "china",
    name: "China",
    code: "CN",
    region: "Asia",
    gdp: "$18.3T",
    population: "1.41B",
    capital: "Beijing",
    government: "Single-Party Socialist Republic",
    economy:
      "Second-largest global economy transitioning from manufacturing hub to technology and consumer-driven growth. Heavy state investment in AI, semiconductors, and new energy vehicles.",
    aiReadiness: 88,
    investmentScore: 76,
    riskScore: 58,
    topIndustries: [
      "Manufacturing",
      "Technology",
      "E-Commerce",
      "Electric Vehicles",
      "Telecommunications",
    ],
    universities: [
      "Tsinghua University",
      "Peking University",
      "Fudan University",
      "Zhejiang University",
      "Shanghai Jiao Tong University",
    ],
    technologyLevel: "Advanced — Rapidly Scaling",
    businessOpportunities: [
      "Smart manufacturing partnerships",
      "EV supply chain integration",
      "Digital payment ecosystems",
      "Green technology exports",
      "Belt and Road infrastructure",
    ],
    aiSummary:
      "China operates the world's second-largest AI ecosystem with state-backed scaling advantages in surveillance, manufacturing AI, and language models. Investment opportunities exist in tech manufacturing and green energy, but regulatory opacity and geopolitical tensions elevate risk. Data localization requirements affect foreign operators.",
  },
  {
    id: "uzbekistan",
    name: "Uzbekistan",
    code: "UZ",
    region: "Asia",
    gdp: "$102B",
    population: "36M",
    capital: "Tashkent",
    government: "Presidential Republic",
    economy:
      "Emerging market in Central Asia undergoing rapid economic liberalization. Growing focus on digital transformation, textile exports, mining, and agriculture modernization under reform agenda.",
    aiReadiness: 52,
    investmentScore: 71,
    riskScore: 41,
    topIndustries: [
      "Textiles & Apparel",
      "Agriculture",
      "Mining & Gold",
      "Construction",
      "Tourism",
    ],
    universities: [
      "Tashkent State University",
      "Westminster International University",
      "Turin Polytechnic University (TTPU)",
      "Inha University in Tashkent",
      "Samarkand State University",
    ],
    technologyLevel: "Developing — High Growth Potential",
    businessOpportunities: [
      "Digital government services",
      "AgriTech & irrigation systems",
      "Textile manufacturing automation",
      "Renewable energy projects",
      "Central Asia logistics hub",
    ],
    aiSummary:
      "Uzbekistan presents a high-growth emerging market opportunity with strong government commitment to digitalization and foreign investment reforms. AI readiness is nascent but accelerating through IT Park initiatives and education partnerships. Low competition, favorable demographics, and strategic Central Asia location make it attractive for early-mover enterprises in fintech, edtech, and infrastructure.",
  },
  {
    id: "germany",
    name: "Germany",
    code: "DE",
    region: "Europe",
    gdp: "$4.5T",
    population: "84M",
    capital: "Berlin",
    government: "Federal Parliamentary Republic",
    economy:
      "Europe's largest economy and industrial powerhouse. Excellence in automotive, engineering, chemicals, and precision manufacturing. Transitioning toward Industry 4.0 and green energy.",
    aiReadiness: 86,
    investmentScore: 84,
    riskScore: 18,
    topIndustries: [
      "Automotive",
      "Engineering & Machinery",
      "Chemicals",
      "Pharmaceuticals",
      "Renewable Energy",
    ],
    universities: [
      "Technical University of Munich",
      "RWTH Aachen",
      "Heidelberg University",
      "Ludwig Maximilian University",
      "Karlsruhe Institute of Technology",
    ],
    technologyLevel: "Advanced — Industrial Leader",
    businessOpportunities: [
      "Industry 4.0 & smart factory solutions",
      "Automotive EV transition",
      "Green hydrogen infrastructure",
      "MedTech & biotech partnerships",
      "EU regulatory compliance tech",
    ],
    aiSummary:
      "Germany combines industrial depth with strong AI research institutions and EU regulatory leadership. The Mittelstand sector offers partnership opportunities for enterprise AI integration. Energy transition creates demand for smart grid and sustainability tech. Low political risk, high stability, but slower digital adoption compared to US/Asia peers.",
  },
  {
    id: "uae",
    name: "United Arab Emirates",
    code: "AE",
    region: "Middle East",
    gdp: "$509B",
    population: "10M",
    capital: "Abu Dhabi",
    government: "Federal Absolute Monarchy",
    economy:
      "Diversified Gulf economy pivoting from oil dependency to tourism, finance, logistics, and technology. Aggressive AI national strategy with sovereign wealth fund backing.",
    aiReadiness: 82,
    investmentScore: 88,
    riskScore: 28,
    topIndustries: [
      "Oil & Gas",
      "Tourism & Hospitality",
      "Financial Services",
      "Logistics",
      "Real Estate",
    ],
    universities: [
      "Khalifa University",
      "American University of Sharjah",
      "United Arab Emirates University",
      "New York University Abu Dhabi",
      "Mohamed bin Zayed University of AI",
    ],
    technologyLevel: "Advanced — Strategic Investor",
    businessOpportunities: [
      "AI research hub partnerships",
      "Smart city infrastructure",
      "Fintech & digital banking",
      "Renewable energy (Masdar)",
      "Global logistics & free zones",
    ],
    aiSummary:
      "The UAE is executing one of the world's most ambitious national AI strategies, positioning as a Middle East technology hub. Zero corporate tax in free zones, sovereign wealth capital, and world-class infrastructure create exceptional investment conditions. MBZUAI and G42 ecosystem offer research partnerships. Moderate regional geopolitical exposure.",
  },
  {
    id: "japan",
    name: "Japan",
    code: "JP",
    region: "Asia",
    gdp: "$4.2T",
    population: "124M",
    capital: "Tokyo",
    government: "Unitary Parliamentary Constitutional Monarchy",
    economy:
      "Third-largest economy known for automotive, electronics, robotics, and precision engineering. Aging population driving automation and healthcare innovation. Strong export-oriented manufacturing base.",
    aiReadiness: 85,
    investmentScore: 79,
    riskScore: 20,
    topIndustries: [
      "Automotive",
      "Electronics",
      "Robotics",
      "Pharmaceuticals",
      "Financial Services",
    ],
    universities: [
      "University of Tokyo",
      "Kyoto University",
      "Tokyo Institute of Technology",
      "Osaka University",
      "Tohoku University",
    ],
    technologyLevel: "Advanced — Robotics Pioneer",
    businessOpportunities: [
      "Robotics & automation for aging society",
      "Semiconductor reshoring partnerships",
      "Healthcare & eldercare technology",
      "Automotive software & EV components",
      "Anime & media IP licensing",
    ],
    aiSummary:
      "Japan leads in robotics and hardware-software integration with growing AI adoption in manufacturing and healthcare. Government actively funding semiconductor independence and Society 5.0 initiatives. Stable investment environment with strong IP protection. Demographic challenges create urgent demand for automation solutions — a key market for AI-driven productivity tools.",
  },
];

export const regions: CountryRegion[] = [
  "Americas",
  "Asia",
  "Europe",
  "Middle East",
];
