/**
 * Curated research-catalog localization (EN/UZ/RU/TR).
 * Topic names/descriptions and taxonomy labels for platform catalogue UI.
 * Scientific acronyms (eDNA, CRISPR, DOI providers) may remain unchanged.
 */
import { canonicalizeUiLocale, type CanonicalUiLocale } from "@/lib/i18n/canonicalize-locale";
import type { ResearchTopic } from "@/lib/research/research-topics";

type LocaleCopy = { readonly topicName: string; readonly description: string; readonly futureWorkspace: string };
type LabelMap = Record<string, Partial<Record<CanonicalUiLocale, string>> & { en: string }>;

export const RESEARCH_TOPIC_LOCALE: Record<string, Record<CanonicalUiLocale, LocaleCopy>> = {
  "microbiology": {
    "en": {
      "topicName": "Microbiology",
      "description": "Study of microorganisms, cultures, and microbial systems relevant to health and environment.",
      "futureWorkspace": "Microbiology topic page with methods, sources, and open questions."
    },
    "uz": {
      "topicName": "Mikrobiologiya",
      "description": "Mikroorganizmlar, kultura va mikroblar tizimlarini sog‘liq va atrof-muhit nuqtai nazaridan o‘rganish.",
      "futureWorkspace": "Mikrobiologiya uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Microbiology",
      "description": "Каталожное описание: Study of microorganisms, cultures, and microbial systems relevant to health and environment.",
      "futureWorkspace": "Рабочее пространство «Microbiology» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Microbiology",
      "description": "Katalog özeti: Study of microorganisms, cultures, and microbial systems relevant to health and environment.",
      "futureWorkspace": "«Microbiology» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "antibiotic-resistance": {
    "en": {
      "topicName": "Antibiotic resistance",
      "description": "Research on resistance mechanisms, surveillance, and stewardship across microbial populations.",
      "futureWorkspace": "Resistance mapping workspace with source status and open questions."
    },
    "uz": {
      "topicName": "Antibiotiklarga chidamlilik",
      "description": "Mikroblar populyatsiyalarida chidamlilik mexanizmlari, kuzatuv va boshqaruv tadqiqotlari.",
      "futureWorkspace": "Antibiotiklarga chidamlilik uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Antibiotic resistance",
      "description": "Каталожное описание: Research on resistance mechanisms, surveillance, and stewardship across microbial populations.",
      "futureWorkspace": "Рабочее пространство «Antibiotic resistance» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Antibiotic resistance",
      "description": "Katalog özeti: Research on resistance mechanisms, surveillance, and stewardship across microbial populations.",
      "futureWorkspace": "«Antibiotic resistance» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "crispr": {
    "en": {
      "topicName": "CRISPR",
      "description": "Gene editing methods, applications, and governance questions in biological research.",
      "futureWorkspace": "CRISPR methods and evidence review workspace."
    },
    "uz": {
      "topicName": "CRISPR",
      "description": "Biologik tadqiqotda gen tahrirlash usullari, qo‘llanishlar va boshqaruv savollari.",
      "futureWorkspace": "CRISPR uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "CRISPR",
      "description": "Каталожное описание: Gene editing methods, applications, and governance questions in biological research.",
      "futureWorkspace": "Рабочее пространство «CRISPR» со статусом подключения источников."
    },
    "tr": {
      "topicName": "CRISPR",
      "description": "Katalog özeti: Gene editing methods, applications, and governance questions in biological research.",
      "futureWorkspace": "«CRISPR» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "genomics": {
    "en": {
      "topicName": "Genomics",
      "description": "Genome structure, variation, and interpretation across organisms and populations.",
      "futureWorkspace": "Genomics topic page with dataset and methods references."
    },
    "uz": {
      "topicName": "Genomika",
      "description": "Organizmlar va populyatsiyalar bo‘yicha genom tuzilishi, o‘zgaruvchanlik va talqin.",
      "futureWorkspace": "Genomika uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Genomics",
      "description": "Каталожное описание: Genome structure, variation, and interpretation across organisms and populations.",
      "futureWorkspace": "Рабочее пространство «Genomics» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Genomics",
      "description": "Katalog özeti: Genome structure, variation, and interpretation across organisms and populations.",
      "futureWorkspace": "«Genomics» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "virology": {
    "en": {
      "topicName": "Virology",
      "description": "Virus biology, transmission research, and diagnostic method development.",
      "futureWorkspace": "Virology evidence workspace with source connection status."
    },
    "uz": {
      "topicName": "Virusologiya",
      "description": "Virus biologiyasi, yuqish tadqiqotlari va diagnostika usullarini ishlab chiqish.",
      "futureWorkspace": "Virusologiya uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Virology",
      "description": "Каталожное описание: Virus biology, transmission research, and diagnostic method development.",
      "futureWorkspace": "Рабочее пространство «Virology» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Virology",
      "description": "Katalog özeti: Virus biology, transmission research, and diagnostic method development.",
      "futureWorkspace": "«Virology» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "synthetic-biology": {
    "en": {
      "topicName": "Synthetic biology",
      "description": "Engineered biological systems, biosafety, and reproducibility in designed organisms.",
      "futureWorkspace": "Synthetic biology methods and safety review workspace."
    },
    "uz": {
      "topicName": "Sintetik biologiya",
      "description": "Muhandislik biologik tizimlari, biosafety va yaratilgan organizmlarda takrorlanuvchanlik.",
      "futureWorkspace": "Sintetik biologiya uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Synthetic biology",
      "description": "Каталожное описание: Engineered biological systems, biosafety, and reproducibility in designed organisms.",
      "futureWorkspace": "Рабочее пространство «Synthetic biology» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Synthetic biology",
      "description": "Katalog özeti: Engineered biological systems, biosafety, and reproducibility in designed organisms.",
      "futureWorkspace": "«Synthetic biology» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "biodiversity-mapping": {
    "en": {
      "topicName": "Biodiversity mapping",
      "description": "Species distribution, taxonomy updates, and ecological survey methods.",
      "futureWorkspace": "Biodiversity topic page linked to geographic and species evidence."
    },
    "uz": {
      "topicName": "Biodiversitet xaritalash",
      "description": "Turlar tarqalishi, taksonomiya yangilanishlari va ekologik so‘rov usullari.",
      "futureWorkspace": "Biodiversitet xaritalash uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Biodiversity mapping",
      "description": "Каталожное описание: Species distribution, taxonomy updates, and ecological survey methods.",
      "futureWorkspace": "Рабочее пространство «Biodiversity mapping» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Biodiversity mapping",
      "description": "Katalog özeti: Species distribution, taxonomy updates, and ecological survey methods.",
      "futureWorkspace": "«Biodiversity mapping» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "cancer-research": {
    "en": {
      "topicName": "Cancer research",
      "description": "Oncology research topics spanning diagnosis, treatment methods, and population studies.",
      "futureWorkspace": "Cancer research topic page with trial and publication evidence types."
    },
    "uz": {
      "topicName": "Saraton tadqiqoti",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Saraton tadqiqoti uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Cancer research",
      "description": "Каталожное описание: Oncology research topics spanning diagnosis, treatment methods, and population studies.",
      "futureWorkspace": "Рабочее пространство «Cancer research» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Cancer research",
      "description": "Katalog özeti: Oncology research topics spanning diagnosis, treatment methods, and population studies.",
      "futureWorkspace": "«Cancer research» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "vaccine-development": {
    "en": {
      "topicName": "Vaccine development",
      "description": "Immunization research, trial phases, and post-market surveillance methods.",
      "futureWorkspace": "Vaccine development evidence and methods workspace."
    },
    "uz": {
      "topicName": "Vaksina ishlab chiqish",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Vaksina ishlab chiqish uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Vaccine development",
      "description": "Каталожное описание: Immunization research, trial phases, and post-market surveillance methods.",
      "futureWorkspace": "Рабочее пространство «Vaccine development» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Vaccine development",
      "description": "Katalog özeti: Immunization research, trial phases, and post-market surveillance methods.",
      "futureWorkspace": "«Vaccine development» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "public-health-systems": {
    "en": {
      "topicName": "Public health systems",
      "description": "Health system capacity, delivery models, and population health measurement.",
      "futureWorkspace": "Public health systems topic page with official source status."
    },
    "uz": {
      "topicName": "Jamoat salomatligi tizimlari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Jamoat salomatligi tizimlari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Public health systems",
      "description": "Каталожное описание: Health system capacity, delivery models, and population health measurement.",
      "futureWorkspace": "Рабочее пространство «Public health systems» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Public health systems",
      "description": "Katalog özeti: Health system capacity, delivery models, and population health measurement.",
      "futureWorkspace": "«Public health systems» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "clinical-trial-methods": {
    "en": {
      "topicName": "Clinical trial methods",
      "description": "Trial design, registration, reporting standards, and reproducibility requirements.",
      "futureWorkspace": "Clinical methods topic page with standards and open questions."
    },
    "uz": {
      "topicName": "Klinik sinov usullari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Klinik sinov usullari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Clinical trial methods",
      "description": "Каталожное описание: Trial design, registration, reporting standards, and reproducibility requirements.",
      "futureWorkspace": "Рабочее пространство «Clinical trial methods» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Clinical trial methods",
      "description": "Katalog özeti: Trial design, registration, reporting standards, and reproducibility requirements.",
      "futureWorkspace": "«Clinical trial methods» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "rare-disease-research": {
    "en": {
      "topicName": "Rare disease research",
      "description": "Orphan conditions, patient registries, and evidence gaps in small populations.",
      "futureWorkspace": "Rare disease topic workspace with registry source status."
    },
    "uz": {
      "topicName": "Kam uchraydigan kasalliklar tadqiqoti",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Kam uchraydigan kasalliklar tadqiqoti uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Rare disease research",
      "description": "Каталожное описание: Orphan conditions, patient registries, and evidence gaps in small populations.",
      "futureWorkspace": "Рабочее пространство «Rare disease research» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Rare disease research",
      "description": "Katalog özeti: Orphan conditions, patient registries, and evidence gaps in small populations.",
      "futureWorkspace": "«Rare disease research» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "medical-imaging": {
    "en": {
      "topicName": "Medical imaging",
      "description": "Imaging modalities, validation methods, and diagnostic evidence standards.",
      "futureWorkspace": "Medical imaging methods and evidence review page."
    },
    "uz": {
      "topicName": "Tibbiy tasvirlash",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Tibbiy tasvirlash uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Medical imaging",
      "description": "Каталожное описание: Imaging modalities, validation methods, and diagnostic evidence standards.",
      "futureWorkspace": "Рабочее пространство «Medical imaging» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Medical imaging",
      "description": "Katalog özeti: Imaging modalities, validation methods, and diagnostic evidence standards.",
      "futureWorkspace": "«Medical imaging» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "mental-health-research": {
    "en": {
      "topicName": "Mental health research",
      "description": "Psychological and psychiatric research methods, outcomes, and service evaluation.",
      "futureWorkspace": "Mental health topic page with methods and source transparency."
    },
    "uz": {
      "topicName": "Ruhiy salomatlik tadqiqoti",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Ruhiy salomatlik tadqiqoti uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Mental health research",
      "description": "Каталожное описание: Psychological and psychiatric research methods, outcomes, and service evaluation.",
      "futureWorkspace": "Рабочее пространство «Mental health research» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Mental health research",
      "description": "Katalog özeti: Psychological and psychiatric research methods, outcomes, and service evaluation.",
      "futureWorkspace": "«Mental health research» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "food-security": {
    "en": {
      "topicName": "Food security",
      "description": "Supply stability, nutrition access, and agricultural resilience research.",
      "futureWorkspace": "Food security topic page with official agricultural evidence."
    },
    "uz": {
      "topicName": "Oziq-ovqat xavfsizligi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Oziq-ovqat xavfsizligi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Food security",
      "description": "Каталожное описание: Supply stability, nutrition access, and agricultural resilience research.",
      "futureWorkspace": "Рабочее пространство «Food security» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Food security",
      "description": "Katalog özeti: Supply stability, nutrition access, and agricultural resilience research.",
      "futureWorkspace": "«Food security» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "plant-disease-resistance": {
    "en": {
      "topicName": "Plant disease resistance",
      "description": "Crop protection, breeding methods, and pathogen surveillance in agriculture.",
      "futureWorkspace": "Plant disease resistance methods and evidence workspace."
    },
    "uz": {
      "topicName": "O‘simlik kasalliklariga chidamlilik",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "O‘simlik kasalliklariga chidamlilik uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Plant disease resistance",
      "description": "Каталожное описание: Crop protection, breeding methods, and pathogen surveillance in agriculture.",
      "futureWorkspace": "Рабочее пространство «Plant disease resistance» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Plant disease resistance",
      "description": "Katalog özeti: Crop protection, breeding methods, and pathogen surveillance in agriculture.",
      "futureWorkspace": "«Plant disease resistance» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "soil-health": {
    "en": {
      "topicName": "Soil health",
      "description": "Soil composition, fertility management, and sustainable farming practices.",
      "futureWorkspace": "Soil health topic page with methods and dataset references."
    },
    "uz": {
      "topicName": "Tuproq salomatligi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Tuproq salomatligi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Soil health",
      "description": "Каталожное описание: Soil composition, fertility management, and sustainable farming practices.",
      "futureWorkspace": "Рабочее пространство «Soil health» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Soil health",
      "description": "Katalog özeti: Soil composition, fertility management, and sustainable farming practices.",
      "futureWorkspace": "«Soil health» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "crop-genetics": {
    "en": {
      "topicName": "Crop genetics",
      "description": "Genetic improvement, trait mapping, and seed system transparency.",
      "futureWorkspace": "Crop genetics topic workspace with connected source status."
    },
    "uz": {
      "topicName": "Ekin genetikasi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Ekin genetikasi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Crop genetics",
      "description": "Каталожное описание: Genetic improvement, trait mapping, and seed system transparency.",
      "futureWorkspace": "Рабочее пространство «Crop genetics» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Crop genetics",
      "description": "Katalog özeti: Genetic improvement, trait mapping, and seed system transparency.",
      "futureWorkspace": "«Crop genetics» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "sustainable-irrigation": {
    "en": {
      "topicName": "Sustainable irrigation",
      "description": "Water use efficiency, irrigation technology, and drought adaptation in farming.",
      "futureWorkspace": "Sustainable irrigation topic page with methods and open questions."
    },
    "uz": {
      "topicName": "Barqaror sug‘orish",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Barqaror sug‘orish uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Sustainable irrigation",
      "description": "Каталожное описание: Water use efficiency, irrigation technology, and drought adaptation in farming.",
      "futureWorkspace": "Рабочее пространство «Sustainable irrigation» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Sustainable irrigation",
      "description": "Katalog özeti: Water use efficiency, irrigation technology, and drought adaptation in farming.",
      "futureWorkspace": "«Sustainable irrigation» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "agricultural-policy-review": {
    "en": {
      "topicName": "Agricultural policy review",
      "description": "Policy analysis for subsidies, trade rules, and rural development programs.",
      "futureWorkspace": "Agricultural policy evidence review workspace."
    },
    "uz": {
      "topicName": "Qishloq xo‘jaligi siyosati ko‘rib chiqishi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Qishloq xo‘jaligi siyosati ko‘rib chiqishi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Agricultural policy review",
      "description": "Каталожное описание: Policy analysis for subsidies, trade rules, and rural development programs.",
      "futureWorkspace": "Рабочее пространство «Agricultural policy review» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Agricultural policy review",
      "description": "Katalog özeti: Policy analysis for subsidies, trade rules, and rural development programs.",
      "futureWorkspace": "«Agricultural policy review» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "climate-adaptation": {
    "en": {
      "topicName": "Climate adaptation",
      "description": "Adaptation planning, vulnerability assessment, and resilience research methods.",
      "futureWorkspace": "Climate adaptation topic page with official climate evidence types."
    },
    "uz": {
      "topicName": "Iqlimga moslashuv",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Iqlimga moslashuv uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Climate adaptation",
      "description": "Каталожное описание: Adaptation planning, vulnerability assessment, and resilience research methods.",
      "futureWorkspace": "Рабочее пространство «Climate adaptation» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Climate adaptation",
      "description": "Katalog özeti: Adaptation planning, vulnerability assessment, and resilience research methods.",
      "futureWorkspace": "«Climate adaptation» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "water-purification": {
    "en": {
      "topicName": "Water purification",
      "description": "Treatment methods, quality monitoring, and access research for safe water.",
      "futureWorkspace": "Water purification topic page with methods and source status."
    },
    "uz": {
      "topicName": "Suvni tozalash",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Suvni tozalash uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Water purification",
      "description": "Каталожное описание: Treatment methods, quality monitoring, and access research for safe water.",
      "futureWorkspace": "Рабочее пространство «Water purification» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Water purification",
      "description": "Katalog özeti: Treatment methods, quality monitoring, and access research for safe water.",
      "futureWorkspace": "«Water purification» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "carbon-cycle-research": {
    "en": {
      "topicName": "Carbon cycle research",
      "description": "Carbon sources, sinks, and measurement methods in earth systems.",
      "futureWorkspace": "Carbon cycle evidence workspace with dataset connection status."
    },
    "uz": {
      "topicName": "Uglerod tsikli tadqiqoti",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Uglerod tsikli tadqiqoti uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Carbon cycle research",
      "description": "Каталожное описание: Carbon sources, sinks, and measurement methods in earth systems.",
      "futureWorkspace": "Рабочее пространство «Carbon cycle research» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Carbon cycle research",
      "description": "Katalog özeti: Carbon sources, sinks, and measurement methods in earth systems.",
      "futureWorkspace": "«Carbon cycle research» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "ocean-ecology": {
    "en": {
      "topicName": "Ocean ecology",
      "description": "Marine ecosystems, fisheries research, and ocean monitoring methods.",
      "futureWorkspace": "Ocean ecology topic page with marine evidence types."
    },
    "uz": {
      "topicName": "Okean ekologiyasi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Okean ekologiyasi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Ocean ecology",
      "description": "Каталожное описание: Marine ecosystems, fisheries research, and ocean monitoring methods.",
      "futureWorkspace": "Рабочее пространство «Ocean ecology» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Ocean ecology",
      "description": "Katalog özeti: Marine ecosystems, fisheries research, and ocean monitoring methods.",
      "futureWorkspace": "«Ocean ecology» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "air-quality-monitoring": {
    "en": {
      "topicName": "Air quality monitoring",
      "description": "Pollutant measurement, exposure research, and regulatory compliance methods.",
      "futureWorkspace": "Air quality topic page with official monitoring source status."
    },
    "uz": {
      "topicName": "Havo sifati monitoringi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Havo sifati monitoringi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Air quality monitoring",
      "description": "Каталожное описание: Pollutant measurement, exposure research, and regulatory compliance methods.",
      "futureWorkspace": "Рабочее пространство «Air quality monitoring» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Air quality monitoring",
      "description": "Katalog özeti: Pollutant measurement, exposure research, and regulatory compliance methods.",
      "futureWorkspace": "«Air quality monitoring» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "biodiversity-conservation": {
    "en": {
      "topicName": "Biodiversity conservation",
      "description": "Protected areas, species recovery, and conservation policy evaluation.",
      "futureWorkspace": "Biodiversity conservation topic workspace."
    },
    "uz": {
      "topicName": "Biodiversitetni muhofaza qilish",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Biodiversitetni muhofaza qilish uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Biodiversity conservation",
      "description": "Каталожное описание: Protected areas, species recovery, and conservation policy evaluation.",
      "futureWorkspace": "Рабочее пространство «Biodiversity conservation» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Biodiversity conservation",
      "description": "Katalog özeti: Protected areas, species recovery, and conservation policy evaluation.",
      "futureWorkspace": "«Biodiversity conservation» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "environmental-impact-assessment": {
    "en": {
      "topicName": "Environmental impact assessment",
      "description": "EIA methods, baseline studies, and mitigation monitoring for projects.",
      "futureWorkspace": "Environmental impact assessment evidence review page."
    },
    "uz": {
      "topicName": "Atrof-muhit ta’sirini baholash",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Atrof-muhit ta’sirini baholash uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Environmental impact assessment",
      "description": "Каталожное описание: EIA methods, baseline studies, and mitigation monitoring for projects.",
      "futureWorkspace": "Рабочее пространство «Environmental impact assessment» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Environmental impact assessment",
      "description": "Katalog özeti: EIA methods, baseline studies, and mitigation monitoring for projects.",
      "futureWorkspace": "«Environmental impact assessment» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "quantum-battery": {
    "en": {
      "topicName": "Quantum battery",
      "description": "Quantum-enabled storage concepts, materials research, and feasibility methods.",
      "futureWorkspace": "Quantum battery topic page with methods and open questions."
    },
    "uz": {
      "topicName": "Kvant batareyasi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Kvant batareyasi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Quantum battery",
      "description": "Каталожное описание: Quantum-enabled storage concepts, materials research, and feasibility methods.",
      "futureWorkspace": "Рабочее пространство «Quantum battery» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Quantum battery",
      "description": "Katalog özeti: Quantum-enabled storage concepts, materials research, and feasibility methods.",
      "futureWorkspace": "«Quantum battery» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "clean-energy-storage": {
    "en": {
      "topicName": "Clean energy storage",
      "description": "Battery, thermal, and mechanical storage research for renewable integration.",
      "futureWorkspace": "Clean energy storage topic workspace."
    },
    "uz": {
      "topicName": "Toza energiya saqlash",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Toza energiya saqlash uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Clean energy storage",
      "description": "Каталожное описание: Battery, thermal, and mechanical storage research for renewable integration.",
      "futureWorkspace": "Рабочее пространство «Clean energy storage» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Clean energy storage",
      "description": "Katalog özeti: Battery, thermal, and mechanical storage research for renewable integration.",
      "futureWorkspace": "«Clean energy storage» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "solar-cell-materials": {
    "en": {
      "topicName": "Solar cell materials",
      "description": "Photovoltaic materials, efficiency research, and durability testing.",
      "futureWorkspace": "Solar materials topic page with evidence type references."
    },
    "uz": {
      "topicName": "Quyosh elementi materiallari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Quyosh elementi materiallari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Solar cell materials",
      "description": "Каталожное описание: Photovoltaic materials, efficiency research, and durability testing.",
      "futureWorkspace": "Рабочее пространство «Solar cell materials» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Solar cell materials",
      "description": "Katalog özeti: Photovoltaic materials, efficiency research, and durability testing.",
      "futureWorkspace": "«Solar cell materials» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "grid-reliability": {
    "en": {
      "topicName": "Grid reliability",
      "description": "Power system stability, outage analysis, and infrastructure resilience.",
      "futureWorkspace": "Grid reliability topic page with official utility source status."
    },
    "uz": {
      "topicName": "Tarmoq ishonchliligi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Tarmoq ishonchliligi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Grid reliability",
      "description": "Каталожное описание: Power system stability, outage analysis, and infrastructure resilience.",
      "futureWorkspace": "Рабочее пространство «Grid reliability» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Grid reliability",
      "description": "Katalog özeti: Power system stability, outage analysis, and infrastructure resilience.",
      "futureWorkspace": "«Grid reliability» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "nuclear-safety-review": {
    "en": {
      "topicName": "Nuclear safety review",
      "description": "Safety case methods, incident review, and regulatory evidence standards.",
      "futureWorkspace": "Nuclear safety evidence review workspace."
    },
    "uz": {
      "topicName": "Yadro xavfsizligi ko‘rib chiqishi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Yadro xavfsizligi ko‘rib chiqishi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Nuclear safety review",
      "description": "Каталожное описание: Safety case methods, incident review, and regulatory evidence standards.",
      "futureWorkspace": "Рабочее пространство «Nuclear safety review» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Nuclear safety review",
      "description": "Katalog özeti: Safety case methods, incident review, and regulatory evidence standards.",
      "futureWorkspace": "«Nuclear safety review» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "hydrogen-production": {
    "en": {
      "topicName": "Hydrogen production",
      "description": "Production pathways, efficiency measurement, and infrastructure research.",
      "futureWorkspace": "Hydrogen production topic page with methods and sources."
    },
    "uz": {
      "topicName": "Vodorod ishlab chiqarish",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Vodorod ishlab chiqarish uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Hydrogen production",
      "description": "Каталожное описание: Production pathways, efficiency measurement, and infrastructure research.",
      "futureWorkspace": "Рабочее пространство «Hydrogen production» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Hydrogen production",
      "description": "Katalog özeti: Production pathways, efficiency measurement, and infrastructure research.",
      "futureWorkspace": "«Hydrogen production» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "nanomaterials": {
    "en": {
      "topicName": "Nanomaterials",
      "description": "Nanoscale materials synthesis, characterization, and safety review methods.",
      "futureWorkspace": "Nanomaterials topic page with methods and evidence types."
    },
    "uz": {
      "topicName": "Nanomateriallar",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Nanomateriallar uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Nanomaterials",
      "description": "Каталожное описание: Nanoscale materials synthesis, characterization, and safety review methods.",
      "futureWorkspace": "Рабочее пространство «Nanomaterials» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Nanomaterials",
      "description": "Katalog özeti: Nanoscale materials synthesis, characterization, and safety review methods.",
      "futureWorkspace": "«Nanomaterials» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "battery-electrolytes": {
    "en": {
      "topicName": "Battery electrolytes",
      "description": "Electrolyte chemistry, stability testing, and materials compatibility research.",
      "futureWorkspace": "Battery electrolytes evidence workspace."
    },
    "uz": {
      "topicName": "Batareya elektrolitlari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Batareya elektrolitlari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Battery electrolytes",
      "description": "Каталожное описание: Electrolyte chemistry, stability testing, and materials compatibility research.",
      "futureWorkspace": "Рабочее пространство «Battery electrolytes» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Battery electrolytes",
      "description": "Katalog özeti: Electrolyte chemistry, stability testing, and materials compatibility research.",
      "futureWorkspace": "«Battery electrolytes» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "corrosion-resistance": {
    "en": {
      "topicName": "Corrosion resistance",
      "description": "Corrosion mechanisms, protective coatings, and infrastructure longevity research.",
      "futureWorkspace": "Corrosion resistance topic page with engineering evidence."
    },
    "uz": {
      "topicName": "Korroziyaga chidamlilik",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Korroziyaga chidamlilik uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Corrosion resistance",
      "description": "Каталожное описание: Corrosion mechanisms, protective coatings, and infrastructure longevity research.",
      "futureWorkspace": "Рабочее пространство «Corrosion resistance» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Corrosion resistance",
      "description": "Katalog özeti: Corrosion mechanisms, protective coatings, and infrastructure longevity research.",
      "futureWorkspace": "«Corrosion resistance» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "semiconductors": {
    "en": {
      "topicName": "Semiconductors",
      "description": "Semiconductor materials, fabrication methods, and supply chain research.",
      "futureWorkspace": "Semiconductor topic workspace with source connection status."
    },
    "uz": {
      "topicName": "Yarimo‘tkazgichlar",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Yarimo‘tkazgichlar uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Semiconductors",
      "description": "Каталожное описание: Semiconductor materials, fabrication methods, and supply chain research.",
      "futureWorkspace": "Рабочее пространство «Semiconductors» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Semiconductors",
      "description": "Katalog özeti: Semiconductor materials, fabrication methods, and supply chain research.",
      "futureWorkspace": "«Semiconductors» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "biocompatible-materials": {
    "en": {
      "topicName": "Biocompatible materials",
      "description": "Materials for medical devices, implants, and biological interface research.",
      "futureWorkspace": "Biocompatible materials topic page with review methods."
    },
    "uz": {
      "topicName": "Biomos keluvchi materiallar",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Biomos keluvchi materiallar uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Biocompatible materials",
      "description": "Каталожное описание: Materials for medical devices, implants, and biological interface research.",
      "futureWorkspace": "Рабочее пространство «Biocompatible materials» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Biocompatible materials",
      "description": "Katalog özeti: Materials for medical devices, implants, and biological interface research.",
      "futureWorkspace": "«Biocompatible materials» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "composite-structures": {
    "en": {
      "topicName": "Composite structures",
      "description": "Composite design, failure analysis, and structural performance research.",
      "futureWorkspace": "Composite structures topic page with engineering evidence types."
    },
    "uz": {
      "topicName": "Kompozit konstruksiyalar",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Kompozit konstruksiyalar uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Composite structures",
      "description": "Каталожное описание: Composite design, failure analysis, and structural performance research.",
      "futureWorkspace": "Рабочее пространство «Composite structures» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Composite structures",
      "description": "Katalog özeti: Composite design, failure analysis, and structural performance research.",
      "futureWorkspace": "«Composite structures» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "structural-safety": {
    "en": {
      "topicName": "Structural safety",
      "description": "Building and infrastructure safety assessment methods and standards.",
      "futureWorkspace": "Structural safety topic page with standards and open questions."
    },
    "uz": {
      "topicName": "Konstruktiv xavfsizlik",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Konstruktiv xavfsizlik uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Structural safety",
      "description": "Каталожное описание: Building and infrastructure safety assessment methods and standards.",
      "futureWorkspace": "Рабочее пространство «Structural safety» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Structural safety",
      "description": "Katalog özeti: Building and infrastructure safety assessment methods and standards.",
      "futureWorkspace": "«Structural safety» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "water-infrastructure": {
    "en": {
      "topicName": "Water infrastructure",
      "description": "Water supply, distribution systems, and infrastructure resilience research.",
      "futureWorkspace": "Water infrastructure topic workspace."
    },
    "uz": {
      "topicName": "Suv infratuzilmasi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Suv infratuzilmasi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Water infrastructure",
      "description": "Каталожное описание: Water supply, distribution systems, and infrastructure resilience research.",
      "futureWorkspace": "Рабочее пространство «Water infrastructure» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Water infrastructure",
      "description": "Katalog özeti: Water supply, distribution systems, and infrastructure resilience research.",
      "futureWorkspace": "«Water infrastructure» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "robotics-systems": {
    "en": {
      "topicName": "Robotics systems",
      "description": "Robotic design, control methods, and safety validation in applied settings.",
      "futureWorkspace": "Robotics systems topic page with methods and evidence types."
    },
    "uz": {
      "topicName": "Robototexnika tizimlari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Robototexnika tizimlari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Robotics systems",
      "description": "Каталожное описание: Robotic design, control methods, and safety validation in applied settings.",
      "futureWorkspace": "Рабочее пространство «Robotics systems» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Robotics systems",
      "description": "Katalog özeti: Robotic design, control methods, and safety validation in applied settings.",
      "futureWorkspace": "«Robotics systems» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "aerospace-materials": {
    "en": {
      "topicName": "Aerospace materials",
      "description": "Materials for aviation and space applications under extreme conditions.",
      "futureWorkspace": "Aerospace materials evidence review workspace."
    },
    "uz": {
      "topicName": "Aerokosmik materiallar",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Aerokosmik materiallar uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Aerospace materials",
      "description": "Каталожное описание: Materials for aviation and space applications under extreme conditions.",
      "futureWorkspace": "Рабочее пространство «Aerospace materials» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Aerospace materials",
      "description": "Katalog özeti: Materials for aviation and space applications under extreme conditions.",
      "futureWorkspace": "«Aerospace materials» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "civil-resilience": {
    "en": {
      "topicName": "Civil resilience",
      "description": "Infrastructure resilience to disasters, climate stress, and aging systems.",
      "futureWorkspace": "Civil resilience topic page with official engineering evidence."
    },
    "uz": {
      "topicName": "Fuqarolik infratuzilmasi chidamliligi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Fuqarolik infratuzilmasi chidamliligi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Civil resilience",
      "description": "Каталожное описание: Infrastructure resilience to disasters, climate stress, and aging systems.",
      "futureWorkspace": "Рабочее пространство «Civil resilience» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Civil resilience",
      "description": "Katalog özeti: Infrastructure resilience to disasters, climate stress, and aging systems.",
      "futureWorkspace": "«Civil resilience» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "process-optimization": {
    "en": {
      "topicName": "Process optimization",
      "description": "Industrial process efficiency, quality control, and operational research methods.",
      "futureWorkspace": "Process optimization topic workspace."
    },
    "uz": {
      "topicName": "Jarayonni optimallashtirish",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Jarayonni optimallashtirish uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Process optimization",
      "description": "Каталожное описание: Industrial process efficiency, quality control, and operational research methods.",
      "futureWorkspace": "Рабочее пространство «Process optimization» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Process optimization",
      "description": "Katalog özeti: Industrial process efficiency, quality control, and operational research methods.",
      "futureWorkspace": "«Process optimization» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "ai-safety": {
    "en": {
      "topicName": "AI safety",
      "description": "Safety evaluation methods, alignment research, and governance questions for AI systems.",
      "futureWorkspace": "AI safety topic page with methods, sources, and open questions."
    },
    "uz": {
      "topicName": "SI xavfsizligi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "SI xavfsizligi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "AI safety",
      "description": "Каталожное описание: Safety evaluation methods, alignment research, and governance questions for AI systems.",
      "futureWorkspace": "Рабочее пространство «AI safety» со статусом подключения источников."
    },
    "tr": {
      "topicName": "AI safety",
      "description": "Katalog özeti: Safety evaluation methods, alignment research, and governance questions for AI systems.",
      "futureWorkspace": "«AI safety» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "machine-learning-interpretability": {
    "en": {
      "topicName": "Machine learning interpretability",
      "description": "Methods to explain model behavior and validate decisions in applied systems.",
      "futureWorkspace": "ML interpretability evidence review workspace."
    },
    "uz": {
      "topicName": "Mashina o‘rganishni talqin qilish",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Mashina o‘rganishni talqin qilish uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Machine learning interpretability",
      "description": "Каталожное описание: Methods to explain model behavior and validate decisions in applied systems.",
      "futureWorkspace": "Рабочее пространство «Machine learning interpretability» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Machine learning interpretability",
      "description": "Katalog özeti: Methods to explain model behavior and validate decisions in applied systems.",
      "futureWorkspace": "«Machine learning interpretability» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "cryptography": {
    "en": {
      "topicName": "Cryptography",
      "description": "Cryptographic protocols, security proofs, and implementation review methods.",
      "futureWorkspace": "Cryptography topic page with standards and methods references."
    },
    "uz": {
      "topicName": "Kriptografiya",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Kriptografiya uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Cryptography",
      "description": "Каталожное описание: Cryptographic protocols, security proofs, and implementation review methods.",
      "futureWorkspace": "Рабочее пространство «Cryptography» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Cryptography",
      "description": "Katalog özeti: Cryptographic protocols, security proofs, and implementation review methods.",
      "futureWorkspace": "«Cryptography» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "distributed-systems": {
    "en": {
      "topicName": "Distributed systems",
      "description": "System design, consistency models, and reliability research for large-scale systems.",
      "futureWorkspace": "Distributed systems topic workspace."
    },
    "uz": {
      "topicName": "Taqsimlangan tizimlar",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Taqsimlangan tizimlar uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Distributed systems",
      "description": "Каталожное описание: System design, consistency models, and reliability research for large-scale systems.",
      "futureWorkspace": "Рабочее пространство «Distributed systems» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Distributed systems",
      "description": "Katalog özeti: System design, consistency models, and reliability research for large-scale systems.",
      "futureWorkspace": "«Distributed systems» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "software-verification": {
    "en": {
      "topicName": "Software verification",
      "description": "Formal and empirical methods for verifying software correctness and safety.",
      "futureWorkspace": "Software verification topic page with methods and evidence types."
    },
    "uz": {
      "topicName": "Dasturiy ta’minotni tekshirish",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Dasturiy ta’minotni tekshirish uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Software verification",
      "description": "Каталожное описание: Formal and empirical methods for verifying software correctness and safety.",
      "futureWorkspace": "Рабочее пространство «Software verification» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Software verification",
      "description": "Katalog özeti: Formal and empirical methods for verifying software correctness and safety.",
      "futureWorkspace": "«Software verification» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "human-computer-interaction": {
    "en": {
      "topicName": "Human-computer interaction",
      "description": "Usability research, accessibility methods, and interaction design evaluation.",
      "futureWorkspace": "HCI topic page with research methods and open questions."
    },
    "uz": {
      "topicName": "Inson-kompyuter o‘zaro ta’siri",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Inson-kompyuter o‘zaro ta’siri uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Human-computer interaction",
      "description": "Каталожное описание: Usability research, accessibility methods, and interaction design evaluation.",
      "futureWorkspace": "Рабочее пространство «Human-computer interaction» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Human-computer interaction",
      "description": "Katalog özeti: Usability research, accessibility methods, and interaction design evaluation.",
      "futureWorkspace": "«Human-computer interaction» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "data-privacy-methods": {
    "en": {
      "topicName": "Data privacy methods",
      "description": "Privacy-preserving computation, consent models, and regulatory compliance research.",
      "futureWorkspace": "Data privacy topic workspace with official source status."
    },
    "uz": {
      "topicName": "Ma’lumotlar maxfiyligi usullari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Ma’lumotlar maxfiyligi usullari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Data privacy methods",
      "description": "Каталожное описание: Privacy-preserving computation, consent models, and regulatory compliance research.",
      "futureWorkspace": "Рабочее пространство «Data privacy methods» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Data privacy methods",
      "description": "Katalog özeti: Privacy-preserving computation, consent models, and regulatory compliance research.",
      "futureWorkspace": "«Data privacy methods» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "health-economics": {
    "en": {
      "topicName": "Health economics",
      "description": "Cost-effectiveness, health financing, and resource allocation research methods.",
      "futureWorkspace": "Health economics topic page with official statistics references."
    },
    "uz": {
      "topicName": "Sog‘liqni saqlash iqtisodiyoti",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Sog‘liqni saqlash iqtisodiyoti uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Health economics",
      "description": "Каталожное описание: Cost-effectiveness, health financing, and resource allocation research methods.",
      "futureWorkspace": "Рабочее пространство «Health economics» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Health economics",
      "description": "Katalog özeti: Cost-effectiveness, health financing, and resource allocation research methods.",
      "futureWorkspace": "«Health economics» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "climate-policy-modeling": {
    "en": {
      "topicName": "Climate policy modeling",
      "description": "Policy simulation, carbon pricing research, and transition pathway analysis.",
      "futureWorkspace": "Climate policy modeling evidence workspace."
    },
    "uz": {
      "topicName": "Iqlim siyosati modellashtirish",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Iqlim siyosati modellashtirish uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Climate policy modeling",
      "description": "Каталожное описание: Policy simulation, carbon pricing research, and transition pathway analysis.",
      "futureWorkspace": "Рабочее пространство «Climate policy modeling» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Climate policy modeling",
      "description": "Katalog özeti: Policy simulation, carbon pricing research, and transition pathway analysis.",
      "futureWorkspace": "«Climate policy modeling» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "innovation-policy": {
    "en": {
      "topicName": "Innovation policy",
      "description": "R&D incentives, patent systems, and technology transfer policy research.",
      "futureWorkspace": "Innovation policy topic page with methods and sources."
    },
    "uz": {
      "topicName": "Innovatsiya siyosati",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Innovatsiya siyosati uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Innovation policy",
      "description": "Каталожное описание: R&D incentives, patent systems, and technology transfer policy research.",
      "futureWorkspace": "Рабочее пространство «Innovation policy» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Innovation policy",
      "description": "Katalog özeti: R&D incentives, patent systems, and technology transfer policy research.",
      "futureWorkspace": "«Innovation policy» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "public-finance-review": {
    "en": {
      "topicName": "Public finance review",
      "description": "Government budgeting, fiscal transparency, and public spending analysis.",
      "futureWorkspace": "Public finance topic workspace with official document references."
    },
    "uz": {
      "topicName": "Davlat moliyasi ko‘rib chiqishi",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Davlat moliyasi ko‘rib chiqishi uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Public finance review",
      "description": "Каталожное описание: Government budgeting, fiscal transparency, and public spending analysis.",
      "futureWorkspace": "Рабочее пространство «Public finance review» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Public finance review",
      "description": "Katalog özeti: Government budgeting, fiscal transparency, and public spending analysis.",
      "futureWorkspace": "«Public finance review» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "trade-supply-chains": {
    "en": {
      "topicName": "Trade and supply chains",
      "description": "Trade flow analysis, supply chain mapping, and resilience policy research.",
      "futureWorkspace": "Trade and supply chain topic page with source connection status."
    },
    "uz": {
      "topicName": "Savdo va ta’minot zanjirlari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Savdo va ta’minot zanjirlari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Trade and supply chains",
      "description": "Каталожное описание: Trade flow analysis, supply chain mapping, and resilience policy research.",
      "futureWorkspace": "Рабочее пространство «Trade and supply chains» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Trade and supply chains",
      "description": "Katalog özeti: Trade flow analysis, supply chain mapping, and resilience policy research.",
      "futureWorkspace": "«Trade and supply chains» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "labor-market-research": {
    "en": {
      "topicName": "Labor market research",
      "description": "Employment trends, wage analysis, and workforce policy evaluation methods.",
      "futureWorkspace": "Labor market topic page with official statistics and methods."
    },
    "uz": {
      "topicName": "Mehnat bozori tadqiqoti",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Mehnat bozori tadqiqoti uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Labor market research",
      "description": "Каталожное описание: Employment trends, wage analysis, and workforce policy evaluation methods.",
      "futureWorkspace": "Рабочее пространство «Labor market research» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Labor market research",
      "description": "Katalog özeti: Employment trends, wage analysis, and workforce policy evaluation methods.",
      "futureWorkspace": "«Labor market research» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "education-research": {
    "en": {
      "topicName": "Education research",
      "description": "Learning outcomes, curriculum evaluation, and education policy research methods.",
      "futureWorkspace": "Education research topic page with methods and evidence types."
    },
    "uz": {
      "topicName": "Ta’lim tadqiqoti",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Ta’lim tadqiqoti uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Education research",
      "description": "Каталожное описание: Learning outcomes, curriculum evaluation, and education policy research methods.",
      "futureWorkspace": "Рабочее пространство «Education research» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Education research",
      "description": "Katalog özeti: Learning outcomes, curriculum evaluation, and education policy research methods.",
      "futureWorkspace": "«Education research» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "urban-development": {
    "en": {
      "topicName": "Urban development",
      "description": "City planning, housing policy, and urban infrastructure social impact research.",
      "futureWorkspace": "Urban development topic workspace."
    },
    "uz": {
      "topicName": "Shahar rivoji",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Shahar rivoji uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Urban development",
      "description": "Каталожное описание: City planning, housing policy, and urban infrastructure social impact research.",
      "futureWorkspace": "Рабочее пространство «Urban development» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Urban development",
      "description": "Katalog özeti: City planning, housing policy, and urban infrastructure social impact research.",
      "futureWorkspace": "«Urban development» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "migration-studies": {
    "en": {
      "topicName": "Migration studies",
      "description": "Migration patterns, integration research, and policy evidence review methods.",
      "futureWorkspace": "Migration studies topic page with official source status."
    },
    "uz": {
      "topicName": "Migratsiya tadqiqotlari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Migratsiya tadqiqotlari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Migration studies",
      "description": "Каталожное описание: Migration patterns, integration research, and policy evidence review methods.",
      "futureWorkspace": "Рабочее пространство «Migration studies» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Migration studies",
      "description": "Katalog özeti: Migration patterns, integration research, and policy evidence review methods.",
      "futureWorkspace": "«Migration studies» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "behavioral-research-methods": {
    "en": {
      "topicName": "Behavioral research methods",
      "description": "Experimental and observational methods for studying human behavior and decision-making.",
      "futureWorkspace": "Behavioral methods topic page with open questions and sources."
    },
    "uz": {
      "topicName": "Xulq-atvor tadqiqot usullari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Xulq-atvor tadqiqot usullari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Behavioral research methods",
      "description": "Каталожное описание: Experimental and observational methods for studying human behavior and decision-making.",
      "futureWorkspace": "Рабочее пространство «Behavioral research methods» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Behavioral research methods",
      "description": "Katalog özeti: Experimental and observational methods for studying human behavior and decision-making.",
      "futureWorkspace": "«Behavioral research methods» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "cultural-preservation": {
    "en": {
      "topicName": "Cultural preservation",
      "description": "Heritage documentation, language preservation, and cultural policy research.",
      "futureWorkspace": "Cultural preservation topic workspace."
    },
    "uz": {
      "topicName": "Madaniy merosni saqlash",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Madaniy merosni saqlash uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Cultural preservation",
      "description": "Каталожное описание: Heritage documentation, language preservation, and cultural policy research.",
      "futureWorkspace": "Рабочее пространство «Cultural preservation» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Cultural preservation",
      "description": "Katalog özeti: Heritage documentation, language preservation, and cultural policy research.",
      "futureWorkspace": "«Cultural preservation» çalışma alanı — kaynak bağlantı durumuyla."
    }
  },
  "governance-surveys": {
    "en": {
      "topicName": "Governance surveys",
      "description": "Public administration surveys, institutional trust research, and governance metrics.",
      "futureWorkspace": "Governance surveys topic page with methods and evidence types."
    },
    "uz": {
      "topicName": "Boshqaruv so‘rovlari",
      "description": "Ushbu mavzu katalogda mavjud. Batafsil asl tavsif ingliz tilida saqlangan.",
      "futureWorkspace": "Boshqaruv so‘rovlari uchun ish maydoni — manba ulanish holati bilan."
    },
    "ru": {
      "topicName": "Governance surveys",
      "description": "Каталожное описание: Public administration surveys, institutional trust research, and governance metrics.",
      "futureWorkspace": "Рабочее пространство «Governance surveys» со статусом подключения источников."
    },
    "tr": {
      "topicName": "Governance surveys",
      "description": "Katalog özeti: Public administration surveys, institutional trust research, and governance metrics.",
      "futureWorkspace": "«Governance surveys» çalışma alanı — kaynak bağlantı durumuyla."
    }
  }
} as const;

export const RESEARCH_METHOD_LABELS: LabelMap = {
  "AI-assisted review": {
    "en": "AI-assisted review",
    "uz": "AI-assisted ko‘rib chiqishi",
    "ru": "AI-assisted review",
    "tr": "AI-assisted review"
  },
  "Accelerated testing": {
    "en": "Accelerated testing",
    "uz": "Accelerated testing",
    "ru": "Accelerated testing",
    "tr": "Accelerated testing"
  },
  "Accessibility audits": {
    "en": "Accessibility audits",
    "uz": "Accessibility audits",
    "ru": "Accessibility audits",
    "tr": "Accessibility audits"
  },
  "Acoustic monitoring": {
    "en": "Acoustic monitoring",
    "uz": "Acoustic monitoring",
    "ru": "Acoustic monitoring",
    "tr": "Acoustic monitoring"
  },
  "Anonymization review": {
    "en": "Anonymization review",
    "uz": "Anonymization ko‘rib chiqishi",
    "ru": "Anonymization review",
    "tr": "Anonymization review"
  },
  "Archival review": {
    "en": "Archival review",
    "uz": "Archival ko‘rib chiqishi",
    "ru": "Archival review",
    "tr": "Archival review"
  },
  "Assessment design": {
    "en": "Assessment design",
    "uz": "Assessment design",
    "ru": "Assessment design",
    "tr": "Assessment design"
  },
  "Asset inspection": {
    "en": "Asset inspection",
    "uz": "Asset inspection",
    "ru": "Asset inspection",
    "tr": "Asset inspection"
  },
  "Baseline surveys": {
    "en": "Baseline surveys",
    "uz": "Baseline so‘rovlari",
    "ru": "Baseline surveys",
    "tr": "Baseline surveys"
  },
  "Biocompatibility testing": {
    "en": "Biocompatibility testing",
    "uz": "Biocompatibility testing",
    "ru": "Biocompatibility testing",
    "tr": "Biocompatibility testing"
  },
  "Biomarker analysis": {
    "en": "Biomarker analysis",
    "uz": "Biomarker tahlili",
    "ru": "Biomarker analysis",
    "tr": "Biomarker analysis"
  },
  "Biosafety review": {
    "en": "Biosafety review",
    "uz": "Biosafety ko‘rib chiqishi",
    "ru": "Biosafety review",
    "tr": "Biosafety review"
  },
  "Blinding protocols": {
    "en": "Blinding protocols",
    "uz": "Ko‘r qilish protokollari",
    "ru": "Blinding protocols",
    "tr": "Blinding protocols"
  },
  "Budget analysis": {
    "en": "Budget analysis",
    "uz": "Budget tahlil",
    "ru": "Budget analysis",
    "tr": "Budget analysis"
  },
  "Budget impact modeling": {
    "en": "Budget impact modeling",
    "uz": "Budget impact modellashtirish",
    "ru": "Budget impact modeling",
    "tr": "Budget impact modeling"
  },
  "Case series analysis": {
    "en": "Case series analysis",
    "uz": "Holat seriyasi tahlil",
    "ru": "Case series analysis",
    "tr": "Case series analysis"
  },
  "Clinical correlation": {
    "en": "Clinical correlation",
    "uz": "Klinik korrelyatsiya",
    "ru": "Clinical correlation",
    "tr": "Clinical correlation"
  },
  "Clinical trials": {
    "en": "Clinical trials",
    "uz": "Klinik sinovlar",
    "ru": "Clinical trials",
    "tr": "Clinical trials"
  },
  "Coating evaluation": {
    "en": "Coating evaluation",
    "uz": "Coating baholash",
    "ru": "Coating evaluation",
    "tr": "Coating evaluation"
  },
  "Community consultation": {
    "en": "Community consultation",
    "uz": "Community consultation",
    "ru": "Community consultation",
    "tr": "Community consultation"
  },
  "Comparative genomics": {
    "en": "Comparative genomics",
    "uz": "Qiyosiy genomika",
    "ru": "Comparative genomics",
    "tr": "Comparative genomics"
  },
  "Compatibility screening": {
    "en": "Compatibility screening",
    "uz": "Compatibility screening",
    "ru": "Compatibility screening",
    "tr": "Compatibility screening"
  },
  "Consistency analysis": {
    "en": "Consistency analysis",
    "uz": "Consistency tahlil",
    "ru": "Consistency analysis",
    "tr": "Consistency analysis"
  },
  "Control system testing": {
    "en": "Control system testing",
    "uz": "Control system testing",
    "ru": "Control system testing",
    "tr": "Control system testing"
  },
  "Controlled experiments": {
    "en": "Controlled experiments",
    "uz": "Controlled experiments",
    "ru": "Controlled experiments",
    "tr": "Controlled experiments"
  },
  "Cost-benefit review": {
    "en": "Cost-benefit review",
    "uz": "Cost-benefit ko‘rib chiqishi",
    "ru": "Cost-benefit review",
    "tr": "Cost-benefit review"
  },
  "Cost-effectiveness analysis": {
    "en": "Cost-effectiveness analysis",
    "uz": "Cost-effectiveness tahlil",
    "ru": "Cost-effectiveness analysis",
    "tr": "Cost-effectiveness analysis"
  },
  "Culture methods": {
    "en": "Culture methods",
    "uz": "Kultura usullari",
    "ru": "Culture methods",
    "tr": "Culture methods"
  },
  "Cycle testing": {
    "en": "Cycle testing",
    "uz": "Cycle testing",
    "ru": "Cycle testing",
    "tr": "Cycle testing"
  },
  "Degradation studies": {
    "en": "Degradation studies",
    "uz": "Degradation tadqiqotlari",
    "ru": "Degradation studies",
    "tr": "Degradation studies"
  },
  "Design-build-test cycles": {
    "en": "Design-build-test cycles",
    "uz": "Design-build-test tsikllari",
    "ru": "Design-build-test cycles",
    "tr": "Design-build-test cycles"
  },
  "Differential privacy": {
    "en": "Differential privacy",
    "uz": "Differential privacy",
    "ru": "Differential privacy",
    "tr": "Differential privacy"
  },
  "Disruption modeling": {
    "en": "Disruption modeling",
    "uz": "Disruption modellashtirish",
    "ru": "Disruption modeling",
    "tr": "Disruption modeling"
  },
  "Ecosystem modeling": {
    "en": "Ecosystem modeling",
    "uz": "Ecosystem modellashtirish",
    "ru": "Ecosystem modeling",
    "tr": "Ecosystem modeling"
  },
  "Efficiency testing": {
    "en": "Efficiency testing",
    "uz": "Efficiency testing",
    "ru": "Efficiency testing",
    "tr": "Efficiency testing"
  },
  "Electrochemical testing": {
    "en": "Electrochemical testing",
    "uz": "Electrochemical testing",
    "ru": "Electrochemical testing",
    "tr": "Electrochemical testing"
  },
  "Electrolysis testing": {
    "en": "Electrolysis testing",
    "uz": "Electrolysis testing",
    "ru": "Electrolysis testing",
    "tr": "Electrolysis testing"
  },
  "Electron microscopy": {
    "en": "Electron microscopy",
    "uz": "Electron microscopy",
    "ru": "Electron microscopy",
    "tr": "Electron microscopy"
  },
  "Epidemiological modeling": {
    "en": "Epidemiological modeling",
    "uz": "Epidemiologik modellashtirish",
    "ru": "Epidemiological modeling",
    "tr": "Epidemiological modeling"
  },
  "Equity assessment": {
    "en": "Equity assessment",
    "uz": "Equity assessment",
    "ru": "Equity assessment",
    "tr": "Equity assessment"
  },
  "Ethics review": {
    "en": "Ethics review",
    "uz": "Etika ko‘rib chiqishi",
    "ru": "Ethics review",
    "tr": "Ethics review"
  },
  "Ethnographic documentation": {
    "en": "Ethnographic documentation",
    "uz": "Ethnographic hujjatlari",
    "ru": "Ethnographic documentation",
    "tr": "Ethnographic documentation"
  },
  "Evaluation benchmarks": {
    "en": "Evaluation benchmarks",
    "uz": "Baholash benchmarks",
    "ru": "Evaluation benchmarks",
    "tr": "Evaluation benchmarks"
  },
  "Expenditure tracking": {
    "en": "Expenditure tracking",
    "uz": "Expenditure kuzatuv",
    "ru": "Expenditure tracking",
    "tr": "Expenditure tracking"
  },
  "Exposure modeling": {
    "en": "Exposure modeling",
    "uz": "Exposure modellashtirish",
    "ru": "Exposure modeling",
    "tr": "Exposure modeling"
  },
  "Eye-tracking studies": {
    "en": "Eye-tracking studies",
    "uz": "Eye-kuzatuv tadqiqotlari",
    "ru": "Eye-tracking studies",
    "tr": "Eye-tracking studies"
  },
  "Failure mode analysis": {
    "en": "Failure mode analysis",
    "uz": "Failure mode tahlil",
    "ru": "Failure mode analysis",
    "tr": "Failure mode analysis"
  },
  "Fatigue analysis": {
    "en": "Fatigue analysis",
    "uz": "Fatigue tahlil",
    "ru": "Fatigue analysis",
    "tr": "Fatigue analysis"
  },
  "Fatigue testing": {
    "en": "Fatigue testing",
    "uz": "Fatigue testing",
    "ru": "Fatigue testing",
    "tr": "Fatigue testing"
  },
  "Fault injection": {
    "en": "Fault injection",
    "uz": "Fault injection",
    "ru": "Fault injection",
    "tr": "Fault injection"
  },
  "Feature attribution": {
    "en": "Feature attribution",
    "uz": "Feature attribution",
    "ru": "Feature attribution",
    "tr": "Feature attribution"
  },
  "Field monitoring": {
    "en": "Field monitoring",
    "uz": "Dala monitoring",
    "ru": "Field monitoring",
    "tr": "Field monitoring"
  },
  "Field performance trials": {
    "en": "Field performance trials",
    "uz": "Dala performance sinovlar",
    "ru": "Field performance trials",
    "tr": "Field performance trials"
  },
  "Field surveys": {
    "en": "Field surveys",
    "uz": "Dala so‘rovlari",
    "ru": "Field surveys",
    "tr": "Field surveys"
  },
  "Field trials": {
    "en": "Field trials",
    "uz": "Dala sinovlar",
    "ru": "Field trials",
    "tr": "Field trials"
  },
  "Finite element modeling": {
    "en": "Finite element modeling",
    "uz": "Finite element modellashtirish",
    "ru": "Finite element modeling",
    "tr": "Finite element modeling"
  },
  "Fiscal forecasting": {
    "en": "Fiscal forecasting",
    "uz": "Fiscal forecasting",
    "ru": "Fiscal forecasting",
    "tr": "Fiscal forecasting"
  },
  "Flux measurements": {
    "en": "Flux measurements",
    "uz": "Flux measurements",
    "ru": "Flux measurements",
    "tr": "Flux measurements"
  },
  "Formal methods": {
    "en": "Formal methods",
    "uz": "Formal usullari",
    "ru": "Formal methods",
    "tr": "Formal methods"
  },
  "Formal verification": {
    "en": "Formal verification",
    "uz": "Formal verification",
    "ru": "Formal verification",
    "tr": "Formal verification"
  },
  "GWAS": {
    "en": "GWAS",
    "uz": "GWAS",
    "ru": "GWAS",
    "tr": "GWAS"
  },
  "Gene editing protocols": {
    "en": "Gene editing protocols",
    "uz": "Gen tahrirlash protokollari",
    "ru": "Gene editing protocols",
    "tr": "Gene editing protocols"
  },
  "Genomic analysis": {
    "en": "Genomic analysis",
    "uz": "Genomik tahlil",
    "ru": "Genomic analysis",
    "tr": "Genomic analysis"
  },
  "Grid simulation": {
    "en": "Grid simulation",
    "uz": "Grid simulation",
    "ru": "Grid simulation",
    "tr": "Grid simulation"
  },
  "Habitat assessment": {
    "en": "Habitat assessment",
    "uz": "Habitat assessment",
    "ru": "Habitat assessment",
    "tr": "Habitat assessment"
  },
  "Health surveys": {
    "en": "Health surveys",
    "uz": "Sog‘liq so‘rovlari",
    "ru": "Health surveys",
    "tr": "Health surveys"
  },
  "Household surveys": {
    "en": "Household surveys",
    "uz": "Household so‘rovlari",
    "ru": "Household surveys",
    "tr": "Household surveys"
  },
  "Human factors review": {
    "en": "Human factors review",
    "uz": "Human factors ko‘rib chiqishi",
    "ru": "Human factors review",
    "tr": "Human factors review"
  },
  "Human review protocols": {
    "en": "Human review protocols",
    "uz": "Human ko‘rib chiqishi protokollari",
    "ru": "Human review protocols",
    "tr": "Human review protocols"
  },
  "Hydraulic modeling": {
    "en": "Hydraulic modeling",
    "uz": "Hydraulic modellashtirish",
    "ru": "Hydraulic modeling",
    "tr": "Hydraulic modeling"
  },
  "Imaging validation": {
    "en": "Imaging validation",
    "uz": "Tasvirlash validatsiya",
    "ru": "Imaging validation",
    "tr": "Imaging validation"
  },
  "Immunogenicity assays": {
    "en": "Immunogenicity assays",
    "uz": "Immunogenlik analizlari",
    "ru": "Immunogenicity assays",
    "tr": "Immunogenicity assays"
  },
  "Impact evaluation": {
    "en": "Impact evaluation",
    "uz": "Impact baholash",
    "ru": "Impact evaluation",
    "tr": "Impact evaluation"
  },
  "Impact modeling": {
    "en": "Impact modeling",
    "uz": "Impact modellashtirish",
    "ru": "Impact modeling",
    "tr": "Impact modeling"
  },
  "Index construction": {
    "en": "Index construction",
    "uz": "Index construction",
    "ru": "Index construction",
    "tr": "Index construction"
  },
  "Inspection protocols": {
    "en": "Inspection protocols",
    "uz": "Inspection protokollari",
    "ru": "Inspection protocols",
    "tr": "Inspection protocols"
  },
  "Integrated assessment": {
    "en": "Integrated assessment",
    "uz": "Integrated assessment",
    "ru": "Integrated assessment",
    "tr": "Integrated assessment"
  },
  "Intervention trials": {
    "en": "Intervention trials",
    "uz": "Aralashuv sinovlar",
    "ru": "Intervention trials",
    "tr": "Intervention trials"
  },
  "Inventory methods": {
    "en": "Inventory methods",
    "uz": "Inventory usullari",
    "ru": "Inventory methods",
    "tr": "Inventory methods"
  },
  "Lab prototypes": {
    "en": "Lab prototypes",
    "uz": "Lab prototypes",
    "ru": "Lab prototypes",
    "tr": "Lab prototypes"
  },
  "Labor force surveys": {
    "en": "Labor force surveys",
    "uz": "Labor force so‘rovlari",
    "ru": "Labor force surveys",
    "tr": "Labor force surveys"
  },
  "Lifecycle assessment": {
    "en": "Lifecycle assessment",
    "uz": "Lifecycle assessment",
    "ru": "Lifecycle assessment",
    "tr": "Lifecycle assessment"
  },
  "Long-term plot studies": {
    "en": "Long-term plot studies",
    "uz": "Long-term plot tadqiqotlari",
    "ru": "Long-term plot studies",
    "tr": "Long-term plot studies"
  },
  "Longitudinal cohorts": {
    "en": "Longitudinal cohorts",
    "uz": "Longitudinal kogortalar",
    "ru": "Longitudinal cohorts",
    "tr": "Longitudinal cohorts"
  },
  "Longitudinal studies": {
    "en": "Longitudinal studies",
    "uz": "Longitudinal tadqiqotlari",
    "ru": "Longitudinal studies",
    "tr": "Longitudinal studies"
  },
  "Marine surveys": {
    "en": "Marine surveys",
    "uz": "Marine so‘rovlari",
    "ru": "Marine surveys",
    "tr": "Marine surveys"
  },
  "Marker-assisted breeding": {
    "en": "Marker-assisted breeding",
    "uz": "Marker-assisted breeding",
    "ru": "Marker-assisted breeding",
    "tr": "Marker-assisted breeding"
  },
  "Materials characterization": {
    "en": "Materials characterization",
    "uz": "Materials characterization",
    "ru": "Materials characterization",
    "tr": "Materials characterization"
  },
  "Materials synthesis": {
    "en": "Materials synthesis",
    "uz": "Materials synthesis",
    "ru": "Materials synthesis",
    "tr": "Materials synthesis"
  },
  "Mechanical testing": {
    "en": "Mechanical testing",
    "uz": "Mechanical testing",
    "ru": "Mechanical testing",
    "tr": "Mechanical testing"
  },
  "Microscopy": {
    "en": "Microscopy",
    "uz": "Mikroskopiya",
    "ru": "Microscopy",
    "tr": "Microscopy"
  },
  "Mitigation tracking": {
    "en": "Mitigation tracking",
    "uz": "Mitigation kuzatuv",
    "ru": "Mitigation tracking",
    "tr": "Mitigation tracking"
  },
  "Model auditing": {
    "en": "Model auditing",
    "uz": "Model auditing",
    "ru": "Model auditing",
    "tr": "Model auditing"
  },
  "Molecular detection": {
    "en": "Molecular detection",
    "uz": "Molekulyar aniqlash",
    "ru": "Molecular detection",
    "tr": "Molecular detection"
  },
  "Monitoring networks": {
    "en": "Monitoring networks",
    "uz": "Monitoring networks",
    "ru": "Monitoring networks",
    "tr": "Monitoring networks"
  },
  "Natural history studies": {
    "en": "Natural history studies",
    "uz": "Tabiiy tarixi tadqiqotlari",
    "ru": "Natural history studies",
    "tr": "Natural history studies"
  },
  "Network mapping": {
    "en": "Network mapping",
    "uz": "Network mapping",
    "ru": "Network mapping",
    "tr": "Network mapping"
  },
  "Nondestructive evaluation": {
    "en": "Nondestructive evaluation",
    "uz": "Nondestructive baholash",
    "ru": "Nondestructive evaluation",
    "tr": "Nondestructive evaluation"
  },
  "Nutrient analysis": {
    "en": "Nutrient analysis",
    "uz": "Nutrient tahlil",
    "ru": "Nutrient analysis",
    "tr": "Nutrient analysis"
  },
  "Nutrition surveys": {
    "en": "Nutrition surveys",
    "uz": "Nutrition so‘rovlari",
    "ru": "Nutrition surveys",
    "tr": "Nutrition surveys"
  },
  "Observational cohorts": {
    "en": "Observational cohorts",
    "uz": "Kuzatuv kogortalar",
    "ru": "Observational cohorts",
    "tr": "Observational cohorts"
  },
  "Off-target analysis": {
    "en": "Off-target analysis",
    "uz": "Off-target tahlil",
    "ru": "Off-target analysis",
    "tr": "Off-target analysis"
  },
  "Outage analysis": {
    "en": "Outage analysis",
    "uz": "Outage tahlil",
    "ru": "Outage analysis",
    "tr": "Outage analysis"
  },
  "Outcome tracking": {
    "en": "Outcome tracking",
    "uz": "Natija kuzatuvi",
    "ru": "Outcome tracking",
    "tr": "Outcome tracking"
  },
  "Patent analysis": {
    "en": "Patent analysis",
    "uz": "Patent tahlil",
    "ru": "Patent analysis",
    "tr": "Patent analysis"
  },
  "Pathogen genotyping": {
    "en": "Pathogen genotyping",
    "uz": "Pathogen genotyping",
    "ru": "Pathogen genotyping",
    "tr": "Pathogen genotyping"
  },
  "Patient registries": {
    "en": "Patient registries",
    "uz": "Bemor reestrlari",
    "ru": "Patient registries",
    "tr": "Patient registries"
  },
  "Penetration testing": {
    "en": "Penetration testing",
    "uz": "Penetration testing",
    "ru": "Penetration testing",
    "tr": "Penetration testing"
  },
  "Performance benchmarking": {
    "en": "Performance benchmarking",
    "uz": "Performance benchmarking",
    "ru": "Performance benchmarking",
    "tr": "Performance benchmarking"
  },
  "Pharmacovigilance": {
    "en": "Pharmacovigilance",
    "uz": "Farmakonazorat",
    "ru": "Pharmacovigilance",
    "tr": "Pharmacovigilance"
  },
  "Pilot evaluation": {
    "en": "Pilot evaluation",
    "uz": "Pilot baholash",
    "ru": "Pilot evaluation",
    "tr": "Pilot evaluation"
  },
  "Pilot evaluations": {
    "en": "Pilot evaluations",
    "uz": "Pilot evaluations",
    "ru": "Pilot evaluations",
    "tr": "Pilot evaluations"
  },
  "Policy comparison": {
    "en": "Policy comparison",
    "uz": "Siyosat comparison",
    "ru": "Policy comparison",
    "tr": "Policy comparison"
  },
  "Policy document review": {
    "en": "Policy document review",
    "uz": "Siyosat document ko‘rib chiqishi",
    "ru": "Policy document review",
    "tr": "Policy document review"
  },
  "Policy evaluation": {
    "en": "Policy evaluation",
    "uz": "Siyosat baholash",
    "ru": "Policy evaluation",
    "tr": "Policy evaluation"
  },
  "Policy impact review": {
    "en": "Policy impact review",
    "uz": "Siyosat impact ko‘rib chiqishi",
    "ru": "Policy impact review",
    "tr": "Policy impact review"
  },
  "Policy review": {
    "en": "Policy review",
    "uz": "Siyosat ko‘rib chiqishi",
    "ru": "Policy review",
    "tr": "Policy review"
  },
  "Population monitoring": {
    "en": "Population monitoring",
    "uz": "Population monitoring",
    "ru": "Population monitoring",
    "tr": "Population monitoring"
  },
  "Population registers": {
    "en": "Population registers",
    "uz": "Population registers",
    "ru": "Population registers",
    "tr": "Population registers"
  },
  "Preregistration": {
    "en": "Preregistration",
    "uz": "Oldindan ro‘yxatga olish",
    "ru": "Preregistration",
    "tr": "Preregistration"
  },
  "Privacy impact assessment": {
    "en": "Privacy impact assessment",
    "uz": "Privacy impact assessment",
    "ru": "Privacy impact assessment",
    "tr": "Privacy impact assessment"
  },
  "Probabilistic assessment": {
    "en": "Probabilistic assessment",
    "uz": "Probabilistic assessment",
    "ru": "Probabilistic assessment",
    "tr": "Probabilistic assessment"
  },
  "Process efficiency analysis": {
    "en": "Process efficiency analysis",
    "uz": "Process efficiency tahlil",
    "ru": "Process efficiency analysis",
    "tr": "Process efficiency analysis"
  },
  "Process mapping": {
    "en": "Process mapping",
    "uz": "Process mapping",
    "ru": "Process mapping",
    "tr": "Process mapping"
  },
  "Process monitoring": {
    "en": "Process monitoring",
    "uz": "Process monitoring",
    "ru": "Process monitoring",
    "tr": "Process monitoring"
  },
  "Program evaluation": {
    "en": "Program evaluation",
    "uz": "Program baholash",
    "ru": "Program evaluation",
    "tr": "Program evaluation"
  },
  "Qualitative interviews": {
    "en": "Qualitative interviews",
    "uz": "Qualitative interviews",
    "ru": "Qualitative interviews",
    "tr": "Qualitative interviews"
  },
  "R&D surveys": {
    "en": "R&D surveys",
    "uz": "R&D so‘rovlari",
    "ru": "R&D surveys",
    "tr": "R&D surveys"
  },
  "Randomized field trials": {
    "en": "Randomized field trials",
    "uz": "Randomlashtirilgan field sinovlar",
    "ru": "Randomized field trials",
    "tr": "Randomized field trials"
  },
  "Randomized trials": {
    "en": "Randomized trials",
    "uz": "Randomlashtirilgan sinovlar",
    "ru": "Randomized trials",
    "tr": "Randomized trials"
  },
  "Reader studies": {
    "en": "Reader studies",
    "uz": "O‘quvchi tadqiqotlari",
    "ru": "Reader studies",
    "tr": "Reader studies"
  },
  "Recovery planning": {
    "en": "Recovery planning",
    "uz": "Recovery planning",
    "ru": "Recovery planning",
    "tr": "Recovery planning"
  },
  "Red teaming": {
    "en": "Red teaming",
    "uz": "Red teaming",
    "ru": "Red teaming",
    "tr": "Red teaming"
  },
  "Redundancy analysis": {
    "en": "Redundancy analysis",
    "uz": "Redundancy tahlil",
    "ru": "Redundancy analysis",
    "tr": "Redundancy analysis"
  },
  "Reliability modeling": {
    "en": "Reliability modeling",
    "uz": "Reliability modellashtirish",
    "ru": "Reliability modeling",
    "tr": "Reliability modeling"
  },
  "Resistance screening": {
    "en": "Resistance screening",
    "uz": "Resistance screening",
    "ru": "Resistance screening",
    "tr": "Resistance screening"
  },
  "Risk assessment": {
    "en": "Risk assessment",
    "uz": "Risk assessment",
    "ru": "Risk assessment",
    "tr": "Risk assessment"
  },
  "Risk assessment frameworks": {
    "en": "Risk assessment frameworks",
    "uz": "Risk assessment frameworks",
    "ru": "Risk assessment frameworks",
    "tr": "Risk assessment frameworks"
  },
  "Safety case review": {
    "en": "Safety case review",
    "uz": "Safety case ko‘rib chiqishi",
    "ru": "Safety case review",
    "tr": "Safety case review"
  },
  "Safety validation": {
    "en": "Safety validation",
    "uz": "Safety validatsiya",
    "ru": "Safety validation",
    "tr": "Safety validation"
  },
  "Satellite validation": {
    "en": "Satellite validation",
    "uz": "Satellite validatsiya",
    "ru": "Satellite validation",
    "tr": "Satellite validation"
  },
  "Scenario analysis": {
    "en": "Scenario analysis",
    "uz": "Scenario tahlil",
    "ru": "Scenario analysis",
    "tr": "Scenario analysis"
  },
  "Scenario modeling": {
    "en": "Scenario modeling",
    "uz": "Scenario modellashtirish",
    "ru": "Scenario modeling",
    "tr": "Scenario modeling"
  },
  "Security proofs": {
    "en": "Security proofs",
    "uz": "Security proofs",
    "ru": "Security proofs",
    "tr": "Security proofs"
  },
  "Seismic assessment": {
    "en": "Seismic assessment",
    "uz": "Seismic assessment",
    "ru": "Seismic assessment",
    "tr": "Seismic assessment"
  },
  "Sensitivity analysis": {
    "en": "Sensitivity analysis",
    "uz": "Sensitivity tahlil",
    "ru": "Sensitivity analysis",
    "tr": "Sensitivity analysis"
  },
  "Sensor monitoring": {
    "en": "Sensor monitoring",
    "uz": "Sensor monitoring",
    "ru": "Sensor monitoring",
    "tr": "Sensor monitoring"
  },
  "Sensor networks": {
    "en": "Sensor networks",
    "uz": "Sensor networks",
    "ru": "Sensor networks",
    "tr": "Sensor networks"
  },
  "Sequencing": {
    "en": "Sequencing",
    "uz": "Sekvenslash",
    "ru": "Sequencing",
    "tr": "Sequencing"
  },
  "Serological assays": {
    "en": "Serological assays",
    "uz": "Serologik analizlar",
    "ru": "Serological assays",
    "tr": "Serological assays"
  },
  "Simulation": {
    "en": "Simulation",
    "uz": "Simulation",
    "ru": "Simulation",
    "tr": "Simulation"
  },
  "Soil sampling": {
    "en": "Soil sampling",
    "uz": "Soil namunalash",
    "ru": "Soil sampling",
    "tr": "Soil sampling"
  },
  "Spatial analysis": {
    "en": "Spatial analysis",
    "uz": "Spatial tahlil",
    "ru": "Spatial analysis",
    "tr": "Spatial analysis"
  },
  "Stakeholder analysis": {
    "en": "Stakeholder analysis",
    "uz": "Stakeholder tahlil",
    "ru": "Stakeholder analysis",
    "tr": "Stakeholder analysis"
  },
  "Standard parts libraries": {
    "en": "Standard parts libraries",
    "uz": "Standart qismlar kutubxonalari",
    "ru": "Standard parts libraries",
    "tr": "Standard parts libraries"
  },
  "Standardized assessments": {
    "en": "Standardized assessments",
    "uz": "Standartlashtirilgan baholashlar",
    "ru": "Standardized assessments",
    "tr": "Standardized assessments"
  },
  "Standards comparison": {
    "en": "Standards comparison",
    "uz": "Standards comparison",
    "ru": "Standards comparison",
    "tr": "Standards comparison"
  },
  "Static analysis": {
    "en": "Static analysis",
    "uz": "Static tahlil",
    "ru": "Static analysis",
    "tr": "Static analysis"
  },
  "Statistical analysis plans": {
    "en": "Statistical analysis plans",
    "uz": "Statistik tahlil rejalar",
    "ru": "Statistical analysis plans",
    "tr": "Statistical analysis plans"
  },
  "Statistical process control": {
    "en": "Statistical process control",
    "uz": "Statistik process control",
    "ru": "Statistical process control",
    "tr": "Statistical process control"
  },
  "Stress testing": {
    "en": "Stress testing",
    "uz": "Stress testing",
    "ru": "Stress testing",
    "tr": "Stress testing"
  },
  "Structural analysis": {
    "en": "Structural analysis",
    "uz": "Structural tahlil",
    "ru": "Structural analysis",
    "tr": "Structural analysis"
  },
  "Supply chain mapping": {
    "en": "Supply chain mapping",
    "uz": "Supply chain mapping",
    "ru": "Supply chain mapping",
    "tr": "Supply chain mapping"
  },
  "Surface analysis": {
    "en": "Surface analysis",
    "uz": "Surface tahlil",
    "ru": "Surface analysis",
    "tr": "Surface analysis"
  },
  "Surveillance studies": {
    "en": "Surveillance studies",
    "uz": "Kuzatuv tadqiqotlari",
    "ru": "Surveillance studies",
    "tr": "Surveillance studies"
  },
  "Survey design": {
    "en": "Survey design",
    "uz": "So‘rov design",
    "ru": "Survey design",
    "tr": "Survey design"
  },
  "Survey research": {
    "en": "Survey research",
    "uz": "So‘rov research",
    "ru": "Survey research",
    "tr": "Survey research"
  },
  "Survey sampling": {
    "en": "Survey sampling",
    "uz": "So‘rov namunalash",
    "ru": "Survey sampling",
    "tr": "Survey sampling"
  },
  "Survival analysis": {
    "en": "Survival analysis",
    "uz": "Yashovchanlik tahlili",
    "ru": "Survival analysis",
    "tr": "Survival analysis"
  },
  "Synthesis protocols": {
    "en": "Synthesis protocols",
    "uz": "Synthesis protokollari",
    "ru": "Synthesis protocols",
    "tr": "Synthesis protocols"
  },
  "Taxonomic classification": {
    "en": "Taxonomic classification",
    "uz": "Taksonomik tasniflash",
    "ru": "Taxonomic classification",
    "tr": "Taxonomic classification"
  },
  "Theoretical modeling": {
    "en": "Theoretical modeling",
    "uz": "Theoretical modellashtirish",
    "ru": "Theoretical modeling",
    "tr": "Theoretical modeling"
  },
  "Thermal analysis": {
    "en": "Thermal analysis",
    "uz": "Thermal tahlil",
    "ru": "Thermal analysis",
    "tr": "Thermal analysis"
  },
  "Thermal cycling": {
    "en": "Thermal cycling",
    "uz": "Thermal cycling",
    "ru": "Thermal cycling",
    "tr": "Thermal cycling"
  },
  "Toxicity screening": {
    "en": "Toxicity screening",
    "uz": "Toxicity screening",
    "ru": "Toxicity screening",
    "tr": "Toxicity screening"
  },
  "Trade flow analysis": {
    "en": "Trade flow analysis",
    "uz": "Trade flow tahlil",
    "ru": "Trade flow analysis",
    "tr": "Trade flow analysis"
  },
  "Transparency scoring": {
    "en": "Transparency scoring",
    "uz": "Transparency scoring",
    "ru": "Transparency scoring",
    "tr": "Transparency scoring"
  },
  "Treatment pilot studies": {
    "en": "Treatment pilot studies",
    "uz": "Treatment pilot tadqiqotlari",
    "ru": "Treatment pilot studies",
    "tr": "Treatment pilot studies"
  },
  "Unit testing": {
    "en": "Unit testing",
    "uz": "Unit testing",
    "ru": "Unit testing",
    "tr": "Unit testing"
  },
  "Usability testing": {
    "en": "Usability testing",
    "uz": "Usability testing",
    "ru": "Usability testing",
    "tr": "Usability testing"
  },
  "Variant calling": {
    "en": "Variant calling",
    "uz": "Variant aniqlash",
    "ru": "Variant calling",
    "tr": "Variant calling"
  },
  "Vulnerability mapping": {
    "en": "Vulnerability mapping",
    "uz": "Vulnerability mapping",
    "ru": "Vulnerability mapping",
    "tr": "Vulnerability mapping"
  },
  "Wafer characterization": {
    "en": "Wafer characterization",
    "uz": "Wafer characterization",
    "ru": "Wafer characterization",
    "tr": "Wafer characterization"
  },
  "Wage analysis": {
    "en": "Wage analysis",
    "uz": "Wage tahlil",
    "ru": "Wage analysis",
    "tr": "Wage analysis"
  },
  "Water balance modeling": {
    "en": "Water balance modeling",
    "uz": "Water balance modellashtirish",
    "ru": "Water balance modeling",
    "tr": "Water balance modeling"
  },
  "Water quality testing": {
    "en": "Water quality testing",
    "uz": "Water quality testing",
    "ru": "Water quality testing",
    "tr": "Water quality testing"
  },
  "Whole-genome sequencing": {
    "en": "Whole-genome sequencing",
    "uz": "Butun genom sekvenslash",
    "ru": "Whole-genome sequencing",
    "tr": "Whole-genome sequencing"
  },
  "Yield analysis": {
    "en": "Yield analysis",
    "uz": "Yield tahlil",
    "ru": "Yield analysis",
    "tr": "Yield analysis"
  },
  "Yield modeling": {
    "en": "Yield modeling",
    "uz": "Yield modellashtirish",
    "ru": "Yield modeling",
    "tr": "Yield modeling"
  },
  "eDNA sampling": {
    "en": "eDNA sampling",
    "uz": "eDNA namunalash",
    "ru": "eDNA sampling",
    "tr": "eDNA sampling"
  }
};

export const RESEARCH_EVIDENCE_TYPE_LABELS: LabelMap = {
  "Adaptation plans": {
    "en": "Adaptation plans",
    "uz": "Adaptation rejalar",
    "ru": "Adaptation plans",
    "tr": "Adaptation plans"
  },
  "Administrative records": {
    "en": "Administrative records",
    "uz": "Administrative yozuvlari",
    "ru": "Administrative records",
    "tr": "Administrative records"
  },
  "Agricultural statistics": {
    "en": "Agricultural statistics",
    "uz": "Agricultural statistics",
    "ru": "Agricultural statistics",
    "tr": "Agricultural statistics"
  },
  "Agronomic trials": {
    "en": "Agronomic trials",
    "uz": "Agronomic sinovlar",
    "ru": "Agronomic trials",
    "tr": "Agronomic trials"
  },
  "Assessment data": {
    "en": "Assessment data",
    "uz": "Assessment ma’lumotlari",
    "ru": "Assessment data",
    "tr": "Assessment data"
  },
  "Audit findings": {
    "en": "Audit findings",
    "uz": "Audit findings",
    "ru": "Audit findings",
    "tr": "Audit findings"
  },
  "Audit reports": {
    "en": "Audit reports",
    "uz": "Audit hisobotlari",
    "ru": "Audit reports",
    "tr": "Audit reports"
  },
  "Baseline datasets": {
    "en": "Baseline datasets",
    "uz": "Baseline ma’lumot to‘plamlari",
    "ru": "Baseline datasets",
    "tr": "Baseline datasets"
  },
  "Benchmark results": {
    "en": "Benchmark results",
    "uz": "Benchmark results",
    "ru": "Benchmark results",
    "tr": "Benchmark results"
  },
  "Breeding records": {
    "en": "Breeding records",
    "uz": "Breeding yozuvlari",
    "ru": "Breeding records",
    "tr": "Breeding records"
  },
  "Budget documents": {
    "en": "Budget documents",
    "uz": "Budget documents",
    "ru": "Budget documents",
    "tr": "Budget documents"
  },
  "Case reports": {
    "en": "Case reports",
    "uz": "Holat hisobotlari",
    "ru": "Case reports",
    "tr": "Case reports"
  },
  "Census data": {
    "en": "Census data",
    "uz": "Census ma’lumotlari",
    "ru": "Census data",
    "tr": "Census data"
  },
  "Characterization data": {
    "en": "Characterization data",
    "uz": "Characterization ma’lumotlari",
    "ru": "Characterization data",
    "tr": "Characterization data"
  },
  "Climate projections": {
    "en": "Climate projections",
    "uz": "Climate projections",
    "ru": "Climate projections",
    "tr": "Climate projections"
  },
  "Clinical assessments": {
    "en": "Clinical assessments",
    "uz": "Klinik baholashlar",
    "ru": "Clinical assessments",
    "tr": "Clinical assessments"
  },
  "Clinical evaluations": {
    "en": "Clinical evaluations",
    "uz": "Klinik evaluations",
    "ru": "Clinical evaluations",
    "tr": "Clinical evaluations"
  },
  "Clinical reports": {
    "en": "Clinical reports",
    "uz": "Klinik hisobotlar",
    "ru": "Clinical reports",
    "tr": "Clinical reports"
  },
  "Clinical studies": {
    "en": "Clinical studies",
    "uz": "Klinik tadqiqotlar",
    "ru": "Clinical studies",
    "tr": "Clinical studies"
  },
  "Conservation plans": {
    "en": "Conservation plans",
    "uz": "Conservation rejalar",
    "ru": "Conservation plans",
    "tr": "Conservation plans"
  },
  "Customs data": {
    "en": "Customs data",
    "uz": "Customs ma’lumotlari",
    "ru": "Customs data",
    "tr": "Customs data"
  },
  "Damage assessments": {
    "en": "Damage assessments",
    "uz": "Damage baholashlar",
    "ru": "Damage assessments",
    "tr": "Damage assessments"
  },
  "Datasets": {
    "en": "Datasets",
    "uz": "Ma’lumot to‘plamlari",
    "ru": "Datasets",
    "tr": "Datasets"
  },
  "Design documents": {
    "en": "Design documents",
    "uz": "Loyiha documents",
    "ru": "Design documents",
    "tr": "Design documents"
  },
  "Design guidelines": {
    "en": "Design guidelines",
    "uz": "Loyiha guidelines",
    "ru": "Design guidelines",
    "tr": "Design guidelines"
  },
  "Design standards": {
    "en": "Design standards",
    "uz": "Loyiha standards",
    "ru": "Design standards",
    "tr": "Design standards"
  },
  "Diagnostic accuracy data": {
    "en": "Diagnostic accuracy data",
    "uz": "Diagnostic accuracy ma’lumotlari",
    "ru": "Diagnostic accuracy data",
    "tr": "Diagnostic accuracy data"
  },
  "Documentation archives": {
    "en": "Documentation archives",
    "uz": "Documentation archives",
    "ru": "Documentation archives",
    "tr": "Documentation archives"
  },
  "Durability reports": {
    "en": "Durability reports",
    "uz": "Durability hisobotlari",
    "ru": "Durability reports",
    "tr": "Durability reports"
  },
  "EIA reports": {
    "en": "EIA reports",
    "uz": "EIA hisobotlari",
    "ru": "EIA reports",
    "tr": "EIA reports"
  },
  "Economic evaluations": {
    "en": "Economic evaluations",
    "uz": "Economic evaluations",
    "ru": "Economic evaluations",
    "tr": "Economic evaluations"
  },
  "Emissions data": {
    "en": "Emissions data",
    "uz": "Emissions ma’lumotlari",
    "ru": "Emissions data",
    "tr": "Emissions data"
  },
  "Emissions inventories": {
    "en": "Emissions inventories",
    "uz": "Emissions inventories",
    "ru": "Emissions inventories",
    "tr": "Emissions inventories"
  },
  "Engineering codes": {
    "en": "Engineering codes",
    "uz": "Engineering codes",
    "ru": "Engineering codes",
    "tr": "Engineering codes"
  },
  "Engineering drawings": {
    "en": "Engineering drawings",
    "uz": "Engineering drawings",
    "ru": "Engineering drawings",
    "tr": "Engineering drawings"
  },
  "Engineering specifications": {
    "en": "Engineering specifications",
    "uz": "Engineering specifications",
    "ru": "Engineering specifications",
    "tr": "Engineering specifications"
  },
  "Engineering standards": {
    "en": "Engineering standards",
    "uz": "Engineering standards",
    "ru": "Engineering standards",
    "tr": "Engineering standards"
  },
  "Environmental monitoring": {
    "en": "Environmental monitoring",
    "uz": "Environmental monitoring",
    "ru": "Environmental monitoring",
    "tr": "Environmental monitoring"
  },
  "Ethics approvals": {
    "en": "Ethics approvals",
    "uz": "Etika approvals",
    "ru": "Ethics approvals",
    "tr": "Ethics approvals"
  },
  "Evaluation datasets": {
    "en": "Evaluation datasets",
    "uz": "Baholash ma’lumot to‘plamlari",
    "ru": "Evaluation datasets",
    "tr": "Evaluation datasets"
  },
  "Evaluation reports": {
    "en": "Evaluation reports",
    "uz": "Baholash hisobotlari",
    "ru": "Evaluation reports",
    "tr": "Evaluation reports"
  },
  "Fab specifications": {
    "en": "Fab specifications",
    "uz": "Fab specifications",
    "ru": "Fab specifications",
    "tr": "Fab specifications"
  },
  "Failure case studies": {
    "en": "Failure case studies",
    "uz": "Failure case tadqiqotlari",
    "ru": "Failure case studies",
    "tr": "Failure case studies"
  },
  "Fishery statistics": {
    "en": "Fishery statistics",
    "uz": "Fishery statistics",
    "ru": "Fishery statistics",
    "tr": "Fishery statistics"
  },
  "Genetic datasets": {
    "en": "Genetic datasets",
    "uz": "Genetic ma’lumot to‘plamlari",
    "ru": "Genetic datasets",
    "tr": "Genetic datasets"
  },
  "Genetic findings": {
    "en": "Genetic findings",
    "uz": "Genetic findings",
    "ru": "Genetic findings",
    "tr": "Genetic findings"
  },
  "Genomic datasets": {
    "en": "Genomic datasets",
    "uz": "Genomik ma’lumot to‘plamlari",
    "ru": "Genomic datasets",
    "tr": "Genomic datasets"
  },
  "Governance indices": {
    "en": "Governance indices",
    "uz": "Governance indices",
    "ru": "Governance indices",
    "tr": "Governance indices"
  },
  "Grid studies": {
    "en": "Grid studies",
    "uz": "Grid tadqiqotlari",
    "ru": "Grid studies",
    "tr": "Grid studies"
  },
  "Health accounts": {
    "en": "Health accounts",
    "uz": "Sog‘liq accounts",
    "ru": "Health accounts",
    "tr": "Health accounts"
  },
  "Health impact studies": {
    "en": "Health impact studies",
    "uz": "Sog‘liq impact tadqiqotlari",
    "ru": "Health impact studies",
    "tr": "Health impact studies"
  },
  "Heritage registries": {
    "en": "Heritage registries",
    "uz": "Heritage reestrlari",
    "ru": "Heritage registries",
    "tr": "Heritage registries"
  },
  "Imaging protocols": {
    "en": "Imaging protocols",
    "uz": "Tasvirlash protokollari",
    "ru": "Imaging protocols",
    "tr": "Imaging protocols"
  },
  "Impact assessments": {
    "en": "Impact assessments",
    "uz": "Impact baholashlar",
    "ru": "Impact assessments",
    "tr": "Impact assessments"
  },
  "Incident postmortems": {
    "en": "Incident postmortems",
    "uz": "Incident postmortems",
    "ru": "Incident postmortems",
    "tr": "Incident postmortems"
  },
  "Incident records": {
    "en": "Incident records",
    "uz": "Incident yozuvlari",
    "ru": "Incident records",
    "tr": "Incident records"
  },
  "Industry reports": {
    "en": "Industry reports",
    "uz": "Industry hisobotlari",
    "ru": "Industry reports",
    "tr": "Industry reports"
  },
  "Infrastructure audits": {
    "en": "Infrastructure audits",
    "uz": "Infrastructure audits",
    "ru": "Infrastructure audits",
    "tr": "Infrastructure audits"
  },
  "Infrastructure reports": {
    "en": "Infrastructure reports",
    "uz": "Infrastructure hisobotlari",
    "ru": "Infrastructure reports",
    "tr": "Infrastructure reports"
  },
  "Inspection records": {
    "en": "Inspection records",
    "uz": "Inspection yozuvlari",
    "ru": "Inspection records",
    "tr": "Inspection records"
  },
  "Inspection reports": {
    "en": "Inspection reports",
    "uz": "Inspection hisobotlari",
    "ru": "Inspection reports",
    "tr": "Inspection reports"
  },
  "Lab datasets": {
    "en": "Lab datasets",
    "uz": "Lab ma’lumot to‘plamlari",
    "ru": "Lab datasets",
    "tr": "Lab datasets"
  },
  "Lab measurements": {
    "en": "Lab measurements",
    "uz": "Lab measurements",
    "ru": "Lab measurements",
    "tr": "Lab measurements"
  },
  "Lab notebooks": {
    "en": "Lab notebooks",
    "uz": "Lab notebooks",
    "ru": "Lab notebooks",
    "tr": "Lab notebooks"
  },
  "Labor statistics": {
    "en": "Labor statistics",
    "uz": "Labor statistics",
    "ru": "Labor statistics",
    "tr": "Labor statistics"
  },
  "Laboratory methods": {
    "en": "Laboratory methods",
    "uz": "Laboratoriya usullari",
    "ru": "Laboratory methods",
    "tr": "Laboratory methods"
  },
  "Laboratory records": {
    "en": "Laboratory records",
    "uz": "Laboratoriya yozuvlari",
    "ru": "Laboratory records",
    "tr": "Laboratory records"
  },
  "Maintenance logs": {
    "en": "Maintenance logs",
    "uz": "Maintenance logs",
    "ru": "Maintenance logs",
    "tr": "Maintenance logs"
  },
  "Material certifications": {
    "en": "Material certifications",
    "uz": "Material certifications",
    "ru": "Material certifications",
    "tr": "Material certifications"
  },
  "Material specifications": {
    "en": "Material specifications",
    "uz": "Material specifications",
    "ru": "Material specifications",
    "tr": "Material specifications"
  },
  "Material standards": {
    "en": "Material standards",
    "uz": "Material standards",
    "ru": "Material standards",
    "tr": "Material standards"
  },
  "Methods documentation": {
    "en": "Methods documentation",
    "uz": "Usul hujjatlari",
    "ru": "Methods documentation",
    "tr": "Methods documentation"
  },
  "Methods papers": {
    "en": "Methods papers",
    "uz": "Usul maqolalari",
    "ru": "Methods papers",
    "tr": "Methods papers"
  },
  "Migration statistics": {
    "en": "Migration statistics",
    "uz": "Migration statistics",
    "ru": "Migration statistics",
    "tr": "Migration statistics"
  },
  "Model documentation": {
    "en": "Model documentation",
    "uz": "Model hujjatlari",
    "ru": "Model documentation",
    "tr": "Model documentation"
  },
  "Model outputs": {
    "en": "Model outputs",
    "uz": "Model outputs",
    "ru": "Model outputs",
    "tr": "Model outputs"
  },
  "Monitoring data": {
    "en": "Monitoring data",
    "uz": "Monitoring ma’lumotlari",
    "ru": "Monitoring data",
    "tr": "Monitoring data"
  },
  "Monitoring plans": {
    "en": "Monitoring plans",
    "uz": "Monitoring rejalar",
    "ru": "Monitoring plans",
    "tr": "Monitoring plans"
  },
  "Nutrition data": {
    "en": "Nutrition data",
    "uz": "Nutrition ma’lumotlari",
    "ru": "Nutrition data",
    "tr": "Nutrition data"
  },
  "Observational records": {
    "en": "Observational records",
    "uz": "Kuzatuv yozuvlari",
    "ru": "Observational records",
    "tr": "Observational records"
  },
  "Oceanographic data": {
    "en": "Oceanographic data",
    "uz": "Oceanographic ma’lumotlari",
    "ru": "Oceanographic data",
    "tr": "Oceanographic data"
  },
  "Official health statistics": {
    "en": "Official health statistics",
    "uz": "Rasmiy sog‘liq statistikasi",
    "ru": "Official health statistics",
    "tr": "Official health statistics"
  },
  "Official policy texts": {
    "en": "Official policy texts",
    "uz": "Official policy texts",
    "ru": "Official policy texts",
    "tr": "Official policy texts"
  },
  "Official statistics": {
    "en": "Official statistics",
    "uz": "Official statistics",
    "ru": "Official statistics",
    "tr": "Official statistics"
  },
  "Open methods": {
    "en": "Open methods",
    "uz": "Ochiq usullar",
    "ru": "Open methods",
    "tr": "Open methods"
  },
  "Operational data": {
    "en": "Operational data",
    "uz": "Operational ma’lumotlari",
    "ru": "Operational data",
    "tr": "Operational data"
  },
  "Outage statistics": {
    "en": "Outage statistics",
    "uz": "Outage statistics",
    "ru": "Outage statistics",
    "tr": "Outage statistics"
  },
  "Patent records": {
    "en": "Patent records",
    "uz": "Patent yozuvlari",
    "ru": "Patent records",
    "tr": "Patent records"
  },
  "Patents": {
    "en": "Patents",
    "uz": "Patentlar",
    "ru": "Patents",
    "tr": "Patents"
  },
  "Peer-reviewed studies": {
    "en": "Peer-reviewed studies",
    "uz": "Peer-reviewed tadqiqotlar",
    "ru": "Peer-reviewed studies",
    "tr": "Peer-reviewed studies"
  },
  "Performance benchmarks": {
    "en": "Performance benchmarks",
    "uz": "Performance benchmarks",
    "ru": "Performance benchmarks",
    "tr": "Performance benchmarks"
  },
  "Performance data": {
    "en": "Performance data",
    "uz": "Performance ma’lumotlari",
    "ru": "Performance data",
    "tr": "Performance data"
  },
  "Pilot data": {
    "en": "Pilot data",
    "uz": "Pilot ma’lumotlari",
    "ru": "Pilot data",
    "tr": "Pilot data"
  },
  "Pilot reports": {
    "en": "Pilot reports",
    "uz": "Pilot hisobotlari",
    "ru": "Pilot reports",
    "tr": "Pilot reports"
  },
  "Planning documents": {
    "en": "Planning documents",
    "uz": "Planning documents",
    "ru": "Planning documents",
    "tr": "Planning documents"
  },
  "Policy briefs": {
    "en": "Policy briefs",
    "uz": "Siyosat briefs",
    "ru": "Policy briefs",
    "tr": "Policy briefs"
  },
  "Policy documents": {
    "en": "Policy documents",
    "uz": "Siyosat hujjatlari",
    "ru": "Policy documents",
    "tr": "Policy documents"
  },
  "Policy evaluations": {
    "en": "Policy evaluations",
    "uz": "Siyosat evaluations",
    "ru": "Policy evaluations",
    "tr": "Policy evaluations"
  },
  "Policy frameworks": {
    "en": "Policy frameworks",
    "uz": "Siyosat frameworks",
    "ru": "Policy frameworks",
    "tr": "Policy frameworks"
  },
  "Policy guidance": {
    "en": "Policy guidance",
    "uz": "Siyosat yo‘riqnomalari",
    "ru": "Policy guidance",
    "tr": "Policy guidance"
  },
  "Policy proposals": {
    "en": "Policy proposals",
    "uz": "Siyosat proposals",
    "ru": "Policy proposals",
    "tr": "Policy proposals"
  },
  "Policy records": {
    "en": "Policy records",
    "uz": "Siyosat yozuvlari",
    "ru": "Policy records",
    "tr": "Policy records"
  },
  "Policy reports": {
    "en": "Policy reports",
    "uz": "Siyosat hisobotlari",
    "ru": "Policy reports",
    "tr": "Policy reports"
  },
  "Policy texts": {
    "en": "Policy texts",
    "uz": "Siyosat texts",
    "ru": "Policy texts",
    "tr": "Policy texts"
  },
  "Process specifications": {
    "en": "Process specifications",
    "uz": "Process specifications",
    "ru": "Process specifications",
    "tr": "Process specifications"
  },
  "Protected area records": {
    "en": "Protected area records",
    "uz": "Protected area yozuvlari",
    "ru": "Protected area records",
    "tr": "Protected area records"
  },
  "Protocol specifications": {
    "en": "Protocol specifications",
    "uz": "Protocol specifications",
    "ru": "Protocol specifications",
    "tr": "Protocol specifications"
  },
  "Protocols": {
    "en": "Protocols",
    "uz": "Protokollar",
    "ru": "Protocols",
    "tr": "Protocols"
  },
  "Public health reports": {
    "en": "Public health reports",
    "uz": "Jamoat salomatligi hisobotlari",
    "ru": "Public health reports",
    "tr": "Public health reports"
  },
  "Qualification reports": {
    "en": "Qualification reports",
    "uz": "Qualification hisobotlari",
    "ru": "Qualification reports",
    "tr": "Qualification reports"
  },
  "Quality measurements": {
    "en": "Quality measurements",
    "uz": "Quality measurements",
    "ru": "Quality measurements",
    "tr": "Quality measurements"
  },
  "Quality records": {
    "en": "Quality records",
    "uz": "Quality yozuvlari",
    "ru": "Quality records",
    "tr": "Quality records"
  },
  "R&D statistics": {
    "en": "R&D statistics",
    "uz": "R&D statistics",
    "ru": "R&D statistics",
    "tr": "R&D statistics"
  },
  "Recovery plans": {
    "en": "Recovery plans",
    "uz": "Recovery rejalar",
    "ru": "Recovery plans",
    "tr": "Recovery plans"
  },
  "Reference genomes": {
    "en": "Reference genomes",
    "uz": "Ma’lumotnomaviy genomlar",
    "ru": "Reference genomes",
    "tr": "Reference genomes"
  },
  "Registry data": {
    "en": "Registry data",
    "uz": "Reestr ma’lumotlari",
    "ru": "Registry data",
    "tr": "Registry data"
  },
  "Registry records": {
    "en": "Registry records",
    "uz": "Registry yozuvlari",
    "ru": "Registry records",
    "tr": "Registry records"
  },
  "Regulatory filings": {
    "en": "Regulatory filings",
    "uz": "Regulyator arizalar",
    "ru": "Regulatory filings",
    "tr": "Regulatory filings"
  },
  "Regulatory limits": {
    "en": "Regulatory limits",
    "uz": "Regulyator limits",
    "ru": "Regulatory limits",
    "tr": "Regulatory limits"
  },
  "Regulatory submissions": {
    "en": "Regulatory submissions",
    "uz": "Regulyator submissions",
    "ru": "Regulatory submissions",
    "tr": "Regulatory submissions"
  },
  "Regulatory summaries": {
    "en": "Regulatory summaries",
    "uz": "Regulyator xulosalar",
    "ru": "Regulatory summaries",
    "tr": "Regulatory summaries"
  },
  "Research datasets": {
    "en": "Research datasets",
    "uz": "Research ma’lumot to‘plamlari",
    "ru": "Research datasets",
    "tr": "Research datasets"
  },
  "Research papers": {
    "en": "Research papers",
    "uz": "Research papers",
    "ru": "Research papers",
    "tr": "Research papers"
  },
  "Results reporting": {
    "en": "Results reporting",
    "uz": "Results reporting",
    "ru": "Results reporting",
    "tr": "Results reporting"
  },
  "Risk maps": {
    "en": "Risk maps",
    "uz": "Risk maps",
    "ru": "Risk maps",
    "tr": "Risk maps"
  },
  "Safety reports": {
    "en": "Safety reports",
    "uz": "Xavfsizlik hisobotlari",
    "ru": "Safety reports",
    "tr": "Safety reports"
  },
  "Safety standards": {
    "en": "Safety standards",
    "uz": "Safety standards",
    "ru": "Safety standards",
    "tr": "Safety standards"
  },
  "Safety studies": {
    "en": "Safety studies",
    "uz": "Safety tadqiqotlari",
    "ru": "Safety studies",
    "tr": "Safety studies"
  },
  "Security audits": {
    "en": "Security audits",
    "uz": "Security audits",
    "ru": "Security audits",
    "tr": "Security audits"
  },
  "Sensor datasets": {
    "en": "Sensor datasets",
    "uz": "Sensor ma’lumot to‘plamlari",
    "ru": "Sensor datasets",
    "tr": "Sensor datasets"
  },
  "Sequence datasets": {
    "en": "Sequence datasets",
    "uz": "Ketma-ketlik ma’lumot to‘plamlari",
    "ru": "Sequence datasets",
    "tr": "Sequence datasets"
  },
  "Soil surveys": {
    "en": "Soil surveys",
    "uz": "Soil so‘rovlari",
    "ru": "Soil surveys",
    "tr": "Soil surveys"
  },
  "Species registries": {
    "en": "Species registries",
    "uz": "Turlar reestrlari",
    "ru": "Species registries",
    "tr": "Species registries"
  },
  "Species status lists": {
    "en": "Species status lists",
    "uz": "Turlar status lists",
    "ru": "Species status lists",
    "tr": "Species status lists"
  },
  "Specification documents": {
    "en": "Specification documents",
    "uz": "Specification documents",
    "ru": "Specification documents",
    "tr": "Specification documents"
  },
  "Standards documents": {
    "en": "Standards documents",
    "uz": "Standards documents",
    "ru": "Standards documents",
    "tr": "Standards documents"
  },
  "Statistical yearbooks": {
    "en": "Statistical yearbooks",
    "uz": "Statistik yearbooks",
    "ru": "Statistical yearbooks",
    "tr": "Statistical yearbooks"
  },
  "Study protocols": {
    "en": "Study protocols",
    "uz": "Study protokollari",
    "ru": "Study protocols",
    "tr": "Study protocols"
  },
  "Surveillance data": {
    "en": "Surveillance data",
    "uz": "Kuzatuv ma’lumotlari",
    "ru": "Surveillance data",
    "tr": "Surveillance data"
  },
  "Surveillance reports": {
    "en": "Surveillance reports",
    "uz": "Kuzatuv hisobotlari",
    "ru": "Surveillance reports",
    "tr": "Surveillance reports"
  },
  "Survey data": {
    "en": "Survey data",
    "uz": "So‘rov ma’lumotlari",
    "ru": "Survey data",
    "tr": "Survey data"
  },
  "Survey datasets": {
    "en": "Survey datasets",
    "uz": "So‘rov ma’lumot to‘plamlari",
    "ru": "Survey datasets",
    "tr": "Survey datasets"
  },
  "Survey instruments": {
    "en": "Survey instruments",
    "uz": "So‘rov instruments",
    "ru": "Survey instruments",
    "tr": "Survey instruments"
  },
  "Survey microdata": {
    "en": "Survey microdata",
    "uz": "So‘rov microdata",
    "ru": "Survey microdata",
    "tr": "Survey microdata"
  },
  "Survey reports": {
    "en": "Survey reports",
    "uz": "So‘rov hisobotlari",
    "ru": "Survey reports",
    "tr": "Survey reports"
  },
  "Survey results": {
    "en": "Survey results",
    "uz": "So‘rov results",
    "ru": "Survey results",
    "tr": "Survey results"
  },
  "Technical standards": {
    "en": "Technical standards",
    "uz": "Technical standards",
    "ru": "Technical standards",
    "tr": "Technical standards"
  },
  "Test data": {
    "en": "Test data",
    "uz": "Test ma’lumotlari",
    "ru": "Test data",
    "tr": "Test data"
  },
  "Test datasets": {
    "en": "Test datasets",
    "uz": "Test ma’lumot to‘plamlari",
    "ru": "Test datasets",
    "tr": "Test datasets"
  },
  "Test protocols": {
    "en": "Test protocols",
    "uz": "Test protokollari",
    "ru": "Test protocols",
    "tr": "Test protocols"
  },
  "Test reports": {
    "en": "Test reports",
    "uz": "Test hisobotlari",
    "ru": "Test reports",
    "tr": "Test reports"
  },
  "Test results": {
    "en": "Test results",
    "uz": "Test results",
    "ru": "Test results",
    "tr": "Test results"
  },
  "Test standards": {
    "en": "Test standards",
    "uz": "Test standards",
    "ru": "Test standards",
    "tr": "Test standards"
  },
  "Test suites": {
    "en": "Test suites",
    "uz": "Test suites",
    "ru": "Test suites",
    "tr": "Test suites"
  },
  "Trade records": {
    "en": "Trade records",
    "uz": "Trade yozuvlari",
    "ru": "Trade records",
    "tr": "Trade records"
  },
  "Trade statistics": {
    "en": "Trade statistics",
    "uz": "Trade statistics",
    "ru": "Trade statistics",
    "tr": "Trade statistics"
  },
  "Treatment protocols": {
    "en": "Treatment protocols",
    "uz": "Davolash protokollari",
    "ru": "Treatment protocols",
    "tr": "Treatment protocols"
  },
  "Treatment standards": {
    "en": "Treatment standards",
    "uz": "Treatment standards",
    "ru": "Treatment standards",
    "tr": "Treatment standards"
  },
  "Trial data": {
    "en": "Trial data",
    "uz": "Trial ma’lumotlari",
    "ru": "Trial data",
    "tr": "Trial data"
  },
  "Trial outcomes": {
    "en": "Trial outcomes",
    "uz": "Trial outcomes",
    "ru": "Trial outcomes",
    "tr": "Trial outcomes"
  },
  "Trial registrations": {
    "en": "Trial registrations",
    "uz": "Sinov ro‘yxatga olishlari",
    "ru": "Trial registrations",
    "tr": "Trial registrations"
  },
  "Trial registries": {
    "en": "Trial registries",
    "uz": "Trial reestrlari",
    "ru": "Trial registries",
    "tr": "Trial registries"
  },
  "Trial results": {
    "en": "Trial results",
    "uz": "Trial results",
    "ru": "Trial results",
    "tr": "Trial results"
  },
  "Usability findings": {
    "en": "Usability findings",
    "uz": "Usability findings",
    "ru": "Usability findings",
    "tr": "Usability findings"
  },
  "Utility reports": {
    "en": "Utility reports",
    "uz": "Utility hisobotlari",
    "ru": "Utility reports",
    "tr": "Utility reports"
  },
  "Validation studies": {
    "en": "Validation studies",
    "uz": "Validatsiya tadqiqotlari",
    "ru": "Validation studies",
    "tr": "Validation studies"
  },
  "Variety registries": {
    "en": "Variety registries",
    "uz": "Variety reestrlari",
    "ru": "Variety registries",
    "tr": "Variety registries"
  },
  "Verification reports": {
    "en": "Verification reports",
    "uz": "Verification hisobotlari",
    "ru": "Verification reports",
    "tr": "Verification reports"
  },
  "Water use data": {
    "en": "Water use data",
    "uz": "Water use ma’lumotlari",
    "ru": "Water use data",
    "tr": "Water use data"
  }
};

function pickLabel(map: LabelMap, label: string, locale: string): string {
  const entry = map[label];
  if (!entry) return label;
  const canonical = canonicalizeUiLocale(locale);
  return entry[canonical] ?? entry.en;
}

export function localizeResearchMethodLabel(label: string, locale: string): string {
  return pickLabel(RESEARCH_METHOD_LABELS, label, locale);
}

export function localizeResearchEvidenceTypeLabel(label: string, locale: string): string {
  return pickLabel(RESEARCH_EVIDENCE_TYPE_LABELS, label, locale);
}

/** Returns localized catalogue copy. sourceLanguage is set when non-EN catalogue body is shown. */
export function localizeResearchTopic(
  topic: ResearchTopic,
  locale: string,
): LocaleCopy & { readonly sourceLanguage: "English" | null } {
  const canonical = canonicalizeUiLocale(locale);
  const entry = RESEARCH_TOPIC_LOCALE[topic.topicId];
  if (!entry) {
    return {
      topicName: topic.topicName,
      description: topic.description,
      futureWorkspace: topic.futureWorkspace,
      sourceLanguage: canonical === "en" ? null : "English",
    };
  }
  const copy = entry[canonical] ?? entry.en;
  return {
    ...copy,
    sourceLanguage: canonical === "en" ? null : "English",
  };
}
