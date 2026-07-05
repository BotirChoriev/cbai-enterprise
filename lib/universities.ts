export type UniversityType = "Public" | "Private" | "Research";

export type UniversityRelationships = {
  industryPartners: string[];
  relatedCompanies: string[];
  relatedCountries: string[];
};

export type University = {
  id: string;
  name: string;
  icon: string;
  country: string;
  city: string;
  founded: number;
  students: number;
  faculty: number;
  type: UniversityType;
  ranking: number;
  researchStrength: number;
  aiReadiness: number;
  innovationScore: number;
  investmentScore: number;
  riskScore: number;
  technologyLevel: string;
  topPrograms: string[];
  researchAreas: string[];
  relationships: UniversityRelationships;
  overview: string;
  aiSummary: string;
};

export const universityTypes: UniversityType[] = ["Public", "Private", "Research"];

export const universities: University[] = [
  {
    id: "stanford",
    name: "Stanford University",
    icon: "SU",
    country: "United States",
    city: "Stanford, CA",
    founded: 1885,
    students: 17500,
    faculty: 2300,
    type: "Private",
    ranking: 3,
    researchStrength: 98,
    aiReadiness: 97,
    innovationScore: 99,
    investmentScore: 95,
    riskScore: 12,
    technologyLevel: "Advanced — AI Research Pioneer",
    topPrograms: [
      "Computer Science",
      "Artificial Intelligence",
      "Electrical Engineering",
      "Business (MBA)",
      "Biomedical Engineering",
    ],
    researchAreas: [
      "Deep Learning",
      "Natural Language Processing",
      "Robotics",
      "Human-Computer Interaction",
      "Computational Biology",
    ],
    relationships: {
      industryPartners: ["Google", "NVIDIA", "Apple", "OpenAI"],
      relatedCompanies: ["Google", "NVIDIA", "Apple", "Tesla"],
      relatedCountries: ["United States", "China", "Japan"],
    },
    overview:
      "Silicon Valley's premier research university and the birthplace of modern AI entrepreneurship. Stanford AI Lab (SAIL) has produced foundational breakthroughs in deep learning, computer vision, and autonomous systems. Unmatched industry proximity drives tech transfer.",
    aiSummary:
      "Stanford ranks among the top three global AI research institutions with the highest industry collaboration density. Fei-Fei Li's ImageNet legacy and the Stanford HAI institute anchor its AI leadership. Exceptional talent pipeline feeds Google, OpenAI, and NVIDIA. Investment score reflects endowment strength and startup ecosystem output.",
  },
  {
    id: "mit",
    name: "MIT",
    icon: "MIT",
    country: "United States",
    city: "Cambridge, MA",
    founded: 1861,
    students: 11500,
    faculty: 1100,
    type: "Private",
    ranking: 1,
    researchStrength: 99,
    aiReadiness: 98,
    innovationScore: 98,
    investmentScore: 94,
    riskScore: 10,
    technologyLevel: "Advanced — Global Research Leader",
    topPrograms: [
      "Computer Science & AI",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Physics",
      "Economics",
    ],
    researchAreas: [
      "Machine Learning",
      "Quantum Computing",
      "Autonomous Systems",
      "Computational Neuroscience",
      "Large Language Models",
    ],
    relationships: {
      industryPartners: ["Microsoft", "Amazon", "IBM", "OpenAI"],
      relatedCompanies: ["Microsoft", "Amazon", "NVIDIA", "Tesla"],
      relatedCountries: ["United States", "Germany", "Japan"],
    },
    overview:
      "World's leading science and technology research university. CSAIL is one of the largest AI research labs globally. MIT has produced more Nobel laureates in physics and economics than any peer institution and drives frontier research in AI, robotics, and quantum systems.",
    aiSummary:
      "MIT holds the #1 global ranking with the strongest research output metrics in the CBAI portfolio. CSAIL's breadth spans from theoretical ML to deployed robotics. Deep industry ties with Microsoft and Amazon through research partnerships. Lowest risk score among US institutions with exceptional investment attractiveness for talent and IP licensing.",
  },
  {
    id: "harvard",
    name: "Harvard University",
    icon: "HU",
    country: "United States",
    city: "Cambridge, MA",
    founded: 1636,
    students: 23000,
    faculty: 2400,
    type: "Private",
    ranking: 4,
    researchStrength: 95,
    aiReadiness: 88,
    innovationScore: 90,
    investmentScore: 92,
    riskScore: 14,
    technologyLevel: "Advanced — Interdisciplinary Research",
    topPrograms: [
      "Computer Science",
      "Applied Mathematics",
      "Business (MBA)",
      "Law",
      "Public Policy",
    ],
    researchAreas: [
      "AI Ethics & Policy",
      "Computational Social Science",
      "Bioinformatics",
      "Health AI",
      "Algorithmic Fairness",
    ],
    relationships: {
      industryPartners: ["Google", "Meta", "Microsoft", "McKinsey"],
      relatedCompanies: ["Google", "Microsoft", "OpenAI", "Amazon"],
      relatedCountries: ["United States", "United Kingdom", "Germany"],
    },
    overview:
      "America's oldest university with growing AI research footprint through the Kempner Institute for AI and the Harvard Data Science Initiative. Strength in AI policy, ethics, and interdisciplinary applications rather than pure CS engineering.",
    aiSummary:
      "Harvard's AI strategy emphasizes responsible AI development and cross-disciplinary impact. Kempner Institute positions it as a leader in AI+biology convergence. Lower AI readiness vs MIT/Stanford reflects later CS scaling, but policy influence and endowment create unique strategic value. Strong investment profile with moderate risk.",
  },
  {
    id: "oxford",
    name: "Oxford University",
    icon: "OX",
    country: "United Kingdom",
    city: "Oxford",
    founded: 1096,
    students: 26000,
    faculty: 4000,
    type: "Public",
    ranking: 5,
    researchStrength: 94,
    aiReadiness: 91,
    innovationScore: 89,
    investmentScore: 86,
    riskScore: 16,
    technologyLevel: "Advanced — European Research Hub",
    topPrograms: [
      "Computer Science",
      "Engineering Science",
      "Philosophy & Ethics",
      "Medicine",
      "Mathematics",
    ],
    researchAreas: [
      "Machine Learning Theory",
      "AI Safety",
      "Computational Linguistics",
      "Medical AI",
      "Autonomous Agents",
    ],
    relationships: {
      industryPartners: ["DeepMind", "Google", "AstraZeneca", "ARM"],
      relatedCompanies: ["Google", "Microsoft", "Amazon"],
      relatedCountries: ["United Kingdom", "United States", "Germany"],
    },
    overview:
      "Europe's oldest and most prestigious university. DeepMind was founded by Oxford alumni and maintains deep research ties. Oxford Martin School leads global AI governance research. Strong in AI safety and theoretical foundations.",
    aiSummary:
      "Oxford combines 900+ years of academic tradition with cutting-edge AI through DeepMind partnership and the Oxford Robotics Institute. AI safety research influence exceeds any European peer. Brexit-related funding uncertainty creates minor risk elevation. Prime European hub for AI talent and ethical AI frameworks.",
  },
  {
    id: "cambridge",
    name: "Cambridge University",
    icon: "CAM",
    country: "United Kingdom",
    city: "Cambridge",
    founded: 1209,
    students: 24000,
    faculty: 3800,
    type: "Public",
    ranking: 6,
    researchStrength: 93,
    aiReadiness: 90,
    innovationScore: 88,
    investmentScore: 85,
    riskScore: 17,
    technologyLevel: "Advanced — European Research Hub",
    topPrograms: [
      "Computer Science",
      "Engineering",
      "Natural Sciences",
      "Mathematics",
      "Clinical Medicine",
    ],
    researchAreas: [
      "Speech Recognition",
      "Computer Vision",
      "Computational Neuroscience",
      "Autonomous Vehicles",
      "AI for Science",
    ],
    relationships: {
      industryPartners: ["ARM", "Microsoft", "AstraZeneca", "Apple"],
      relatedCompanies: ["Apple", "Microsoft", "Google", "Amazon"],
      relatedCountries: ["United Kingdom", "United States", "Japan"],
    },
    overview:
      "Historic research powerhouse and birthplace of ARM architecture. Cambridge Machine Learning Group is globally influential. Apple maintains its largest non-US R&D center in Cambridge. Strong track record in speech recognition and computer vision.",
    aiSummary:
      "Cambridge's AI legacy includes foundational speech recognition research and ARM chip architecture that powers mobile AI inference globally. Microsoft Research Cambridge is a major industry anchor. Slightly lower innovation score vs Oxford reflects fewer AI-native startups, but deep hardware-software AI integration expertise is unique.",
  },
  {
    id: "tuit",
    name: "Tashkent University of Information Technologies",
    icon: "TUIT",
    country: "Uzbekistan",
    city: "Tashkent",
    founded: 1955,
    students: 12000,
    faculty: 650,
    type: "Public",
    ranking: 842,
    researchStrength: 58,
    aiReadiness: 62,
    innovationScore: 55,
    investmentScore: 74,
    riskScore: 35,
    technologyLevel: "Developing — Regional IT Leader",
    topPrograms: [
      "Software Engineering",
      "Telecommunications",
      "Information Security",
      "Data Science",
      "Computer Engineering",
    ],
    researchAreas: [
      "Telecom Networks",
      "Cybersecurity",
      "Applied Machine Learning",
      "IoT Systems",
      "Digital Government",
    ],
    relationships: {
      industryPartners: ["IT Park Uzbekistan", "Huawei", "Samsung"],
      relatedCompanies: ["Samsung", "Google", "Microsoft"],
      relatedCountries: ["Uzbekistan", "South Korea", "China"],
    },
    overview:
      "Uzbekistan's leading IT-focused university driving the nation's digital transformation agenda. Key partner in IT Park Tashkent ecosystem and government digitalization programs. Growing AI curriculum aligned with national AI strategy.",
    aiSummary:
      "TUIT represents Central Asia's strongest IT education institution with high growth potential under Uzbekistan's digital reform agenda. AI readiness is nascent but accelerating through IT Park partnerships and international exchange programs. High investment attractiveness for regional edtech and talent development. Primary gateway for AI skills development in Central Asia.",
  },
  {
    id: "nuuz",
    name: "National University of Uzbekistan",
    icon: "NUUz",
    country: "Uzbekistan",
    city: "Tashkent",
    founded: 1918,
    students: 18000,
    faculty: 1200,
    type: "Public",
    ranking: 801,
    researchStrength: 55,
    aiReadiness: 48,
    innovationScore: 50,
    investmentScore: 68,
    riskScore: 38,
    technologyLevel: "Developing — National Research University",
    topPrograms: [
      "Mathematics",
      "Physics",
      "Economics",
      "International Relations",
      "Computer Science",
    ],
    researchAreas: [
      "Applied Mathematics",
      "Economics & Policy",
      "Central Asian Studies",
      "Renewable Energy",
      "Computational Methods",
    ],
    relationships: {
      industryPartners: ["World Bank", "UNDP", "IT Park Uzbekistan"],
      relatedCompanies: ["Samsung", "Microsoft"],
      relatedCountries: ["Uzbekistan", "Germany", "Japan"],
    },
    overview:
      "Uzbekistan's oldest and largest comprehensive university. Broad research portfolio spanning natural sciences, humanities, and emerging technology programs. Key institution for national policy research and international academic partnerships.",
    aiSummary:
      "NUUz provides foundational research capacity for Uzbekistan's broader higher education ecosystem. AI readiness is early-stage but supported by government investment in STEM education reform. Strong in policy and economics research relevant to Central Asian AI governance. Moderate investment profile with higher risk reflecting institutional transition period.",
  },
  {
    id: "kaist",
    name: "KAIST",
    icon: "KAIST",
    country: "South Korea",
    city: "Daejeon",
    founded: 1971,
    students: 10500,
    faculty: 680,
    type: "Research",
    ranking: 53,
    researchStrength: 92,
    aiReadiness: 94,
    innovationScore: 93,
    investmentScore: 88,
    riskScore: 18,
    technologyLevel: "Advanced — Asian Research Powerhouse",
    topPrograms: [
      "Computer Science",
      "Electrical Engineering",
      "Robotics",
      "Bio & Brain Engineering",
      "Industrial Design",
    ],
    researchAreas: [
      "Deep Learning",
      "Robotics & Autonomous Systems",
      "Semiconductor AI",
      "Brain-Computer Interfaces",
      "AI Chip Design",
    ],
    relationships: {
      industryPartners: ["Samsung", "LG", "NVIDIA", "Google"],
      relatedCompanies: ["Samsung", "NVIDIA", "Google", "Tesla"],
      relatedCountries: ["South Korea", "United States", "Japan"],
    },
    overview:
      "South Korea's premier science and technology research university. Korea Advanced Institute of Science and Technology drives national AI strategy with deep Samsung and LG partnerships. World-class robotics and semiconductor AI research programs.",
    aiSummary:
      "KAIST is Asia's leading research-focused technology university with AI readiness rivaling top US institutions. Samsung and LG partnerships create direct industry research pipelines. Strong in hardware-AI co-design critical for semiconductor competitiveness. Excellent investment profile with low risk and high innovation output in robotics and chip AI.",
  },
];

export function getUniversityCountries(): string[] {
  return [...new Set(universities.map((u) => u.country))].sort();
}

export function getUniversityTypes(): UniversityType[] {
  return [...new Set(universities.map((u) => u.type))].sort();
}
