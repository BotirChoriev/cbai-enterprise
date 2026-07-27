"use client";

import { usePathname } from "next/navigation";
import DecisionJourneyHero, {
  type DecisionJourneyHeroContent,
  type DecisionJourneyVariant,
} from "@/components/experience/DecisionJourneyHero";

type RouteExperience = {
  readonly variant: DecisionJourneyVariant;
  readonly image: string;
  readonly content: DecisionJourneyHeroContent;
};

const IMAGE = {
  evidence: "/experience/evidence-engine-v1.webp",
  scenario: "/experience/scenario-engine-v1.webp",
  collaboration: "/experience/collaboration-v1.webp",
  governance: "/experience/governance-monitoring-v1.webp",
  problem: "/experience/problem-space-v1.webp",
} as const;

const SKIP_ROUTES = new Set([
  "/",
  "/problems",
  "/evidence",
  "/reasoning",
  "/reports",
  "/organization",
  "/rooms",
  "/governance",
  "/graph",
]);

const ROUTES: Record<string, RouteExperience> = {
  "/my-work": {
    variant: "reports",
    image: IMAGE.problem,
    content: {
      en: {
        eyebrow: "My Work",
        title: "Return to the work that needs your judgment.",
        description:
          "See active problems, drafts, evidence tasks, decisions, and monitoring responsibilities in one personal operating view.",
        primary: "Open Problem Space",
        primaryHref: "/problems",
        core: "Your work",
        nodes: [["Active", "Work already in motion"], ["Drafts", "Ideas not yet approved"], ["Reviews", "Human checkpoints"], ["Monitoring", "Changes requiring attention"]],
      },
      uz: {
        eyebrow: "Mening ishlarim",
        title: "Sizning hukmingiz kerak bo‘lgan ishga qayting.",
        description:
          "Faol muammolar, qoralamalar, dalil vazifalari, qarorlar va monitoring mas’uliyatlarini bitta shaxsiy operatsion ko‘rinishda boshqaring.",
        primary: "Muammo maydonini ochish",
        primaryHref: "/problems",
        core: "Sizning ishingiz",
        nodes: [["Faol", "Davom etayotgan ish"], ["Qoralamalar", "Hali tasdiqlanmagan fikrlar"], ["Tekshiruvlar", "Inson nazorat nuqtalari"], ["Monitoring", "E’tibor talab qiladigan o‘zgarishlar"]],
      },
    },
  },
  "/search": {
    variant: "evidence",
    image: IMAGE.evidence,
    content: {
      en: {
        eyebrow: "Intelligence Search",
        title: "Find context, then connect it to a problem.",
        description:
          "Search countries, companies, universities, research, evidence, and internal work without turning discovery into an unverified answer.",
        primary: "Search intelligence",
        primaryHref: "/search",
        core: "Search context",
        nodes: [["Entities", "People and institutions"], ["Research", "Relevant knowledge"], ["Evidence", "Traceable sources"], ["Problems", "Work that gives context"]],
      },
      uz: {
        eyebrow: "Intellekt qidiruvi",
        title: "Kontekstni toping, keyin uni muammoga ulang.",
        description:
          "Mamlakatlar, kompaniyalar, universitetlar, tadqiqotlar, dalillar va ichki ishlarni tekshirilmagan javob yaratmasdan izlang.",
        primary: "Intellektni qidirish",
        primaryHref: "/search",
        core: "Qidiruv konteksti",
        nodes: [["Obyektlar", "Odamlar va tashkilotlar"], ["Tadqiqot", "Tegishli bilim"], ["Dalillar", "Kuzatiladigan manbalar"], ["Muammolar", "Kontekst beradigan ish"]],
      },
    },
  },
  "/research": {
    variant: "evidence",
    image: IMAGE.evidence,
    content: {
      en: {
        eyebrow: "Research Intelligence",
        title: "Turn research into decision-grade evidence.",
        description:
          "Explore topics, methods, institutions, publications, limitations, and contradictions before connecting findings to active work.",
        primary: "Open research workspace",
        primaryHref: "/research/workspace",
        core: "Research field",
        nodes: [["Topics", "What is being studied?"], ["Methods", "How was it tested?"], ["Institutions", "Who produced it?"], ["Limitations", "Where does confidence stop?"]],
      },
      uz: {
        eyebrow: "Tadqiqot intellekti",
        title: "Tadqiqotni qaror darajasidagi dalilga aylantiring.",
        description:
          "Natijalarni faol ishga ulashdan oldin mavzular, metodlar, institutlar, nashrlar, cheklovlar va qarama-qarshiliklarni o‘rganing.",
        primary: "Tadqiqot maydonini ochish",
        primaryHref: "/research/workspace",
        core: "Tadqiqot sohasi",
        nodes: [["Mavzular", "Nima o‘rganilgan?"], ["Metodlar", "Qanday tekshirilgan?"], ["Institutlar", "Kim yaratgan?"], ["Cheklovlar", "Ishonch qayerda tugaydi?"]],
      },
    },
  },
  "/universities": {
    variant: "collaboration",
    image: IMAGE.collaboration,
    content: {
      en: {
        eyebrow: "University Intelligence",
        title: "Understand the institutions behind the knowledge.",
        description:
          "Compare universities through research strength, programs, collaborators, evidence, and institutional context—not rankings alone.",
        primary: "Explore universities",
        primaryHref: "/universities",
        core: "Institution",
        nodes: [["Programs", "Fields and capabilities"], ["Researchers", "People behind the work"], ["Publications", "Documented output"], ["Networks", "Partners and influence"]],
      },
      uz: {
        eyebrow: "Universitet intellekti",
        title: "Bilim ortidagi institutlarni tushuning.",
        description:
          "Universitetlarni faqat reyting bilan emas, tadqiqot kuchi, dasturlar, hamkorlar, dalillar va institutsional kontekst orqali taqqoslang.",
        primary: "Universitetlarni ko‘rish",
        primaryHref: "/universities",
        core: "Institut",
        nodes: [["Dasturlar", "Yo‘nalish va imkoniyatlar"], ["Tadqiqotchilar", "Ish ortidagi odamlar"], ["Nashrlar", "Hujjatlangan natija"], ["Tarmoqlar", "Hamkor va ta’sir"]],
      },
    },
  },
  "/countries": {
    variant: "scenarios",
    image: IMAGE.scenario,
    content: {
      en: {
        eyebrow: "Country Intelligence",
        title: "See national context before comparing outcomes.",
        description:
          "Study indicators, institutions, risks, evidence, and change over time. Country data supports a decision; it does not make one.",
        primary: "Compare countries",
        primaryHref: "/countries/compare",
        core: "Country context",
        nodes: [["Indicators", "What can be measured?"], ["Institutions", "Who shapes outcomes?"], ["Risks", "What may change?"], ["Timeline", "How did context evolve?"]],
      },
      uz: {
        eyebrow: "Mamlakat intellekti",
        title: "Natijalarni taqqoslashdan oldin milliy kontekstni ko‘ring.",
        description:
          "Ko‘rsatkichlar, institutlar, risklar, dalillar va vaqt bo‘yicha o‘zgarishni o‘rganing. Mamlakat ma’lumoti qarorni qo‘llaydi, lekin qaror bermaydi.",
        primary: "Mamlakatlarni taqqoslash",
        primaryHref: "/countries/compare",
        core: "Mamlakat konteksti",
        nodes: [["Ko‘rsatkichlar", "Nimani o‘lchash mumkin?"], ["Institutlar", "Natijani kim shakllantiradi?"], ["Risklar", "Nima o‘zgarishi mumkin?"], ["Vaqt chizig‘i", "Kontekst qanday rivojlandi?"]],
      },
    },
  },
  "/companies": {
    variant: "scenarios",
    image: IMAGE.scenario,
    content: {
      en: {
        eyebrow: "Company Intelligence",
        title: "Evaluate an organization in its real operating context.",
        description:
          "Connect company signals, research, markets, relationships, risks, and evidence before forming a judgment.",
        primary: "Explore companies",
        primaryHref: "/companies",
        core: "Company context",
        nodes: [["Signals", "What is changing?"], ["Relationships", "Who is connected?"], ["Evidence", "What is verified?"], ["Risks", "What could affect the outcome?"]],
      },
      uz: {
        eyebrow: "Kompaniya intellekti",
        title: "Tashkilotni haqiqiy operatsion kontekstida baholang.",
        description:
          "Xulosa qilishdan oldin kompaniya signallari, tadqiqotlar, bozorlar, aloqalar, risklar va dalillarni bog‘lang.",
        primary: "Kompaniyalarni ko‘rish",
        primaryHref: "/companies",
        core: "Kompaniya konteksti",
        nodes: [["Signallar", "Nima o‘zgarmoqda?"], ["Aloqalar", "Kimlar bog‘langan?"], ["Dalillar", "Nima tekshirilgan?"], ["Risklar", "Natijaga nima ta’sir qiladi?"]],
      },
    },
  },
  "/files": {
    variant: "evidence",
    image: IMAGE.evidence,
    content: {
      en: {
        eyebrow: "Files",
        title: "Bring source material into a traceable workflow.",
        description:
          "Review document status, provenance, ownership, and intended use before connecting files to evidence or a problem.",
        primary: "Open scientific intake",
        primaryHref: "/scientific-documents",
        core: "Source file",
        nodes: [["Provenance", "Where did it come from?"], ["Validation", "Is the file acceptable?"], ["Ownership", "Who controls it?"], ["Connection", "Which problem needs it?"]],
      },
      uz: {
        eyebrow: "Fayllar",
        title: "Manba materialini kuzatiladigan jarayonga kiriting.",
        description:
          "Faylni dalil yoki muammoga ulashdan oldin hujjat holati, kelib chiqishi, egaligi va foydalanish maqsadini tekshiring.",
        primary: "Ilmiy hujjat qabulini ochish",
        primaryHref: "/scientific-documents",
        core: "Manba fayli",
        nodes: [["Kelib chiqish", "Qayerdan olindi?"], ["Tekshiruv", "Fayl qabul qilinadimi?"], ["Egalik", "Uni kim boshqaradi?"], ["Bog‘lanish", "Qaysi muammoga kerak?"]],
      },
    },
  },
  "/scientific-documents": {
    variant: "evidence",
    image: IMAGE.evidence,
    content: {
      en: {
        eyebrow: "Scientific Document Intake",
        title: "Inspect the document before trusting its claims.",
        description:
          "Validate the file, preserve provenance, define its role, and keep human confirmation between document intake and evidence use.",
        primary: "Review evidence",
        primaryHref: "/evidence",
        core: "Document intake",
        nodes: [["File check", "Format and integrity"], ["Context", "Why is it relevant?"], ["Claims", "What requires verification?"], ["Human gate", "Approve the next action"]],
      },
      uz: {
        eyebrow: "Ilmiy hujjat qabuli",
        title: "Hujjat da’volariga ishonishdan oldin uni tekshiring.",
        description:
          "Faylni validatsiya qiling, kelib chiqishini saqlang, vazifasini belgilang va hujjat bilan dalil orasida inson tasdig‘ini saqlang.",
        primary: "Dalillarni ko‘rish",
        primaryHref: "/evidence",
        core: "Hujjat qabuli",
        nodes: [["Fayl tekshiruvi", "Format va yaxlitlik"], ["Kontekst", "Nega bu tegishli?"], ["Da’volar", "Nima tekshirilishi kerak?"], ["Inson darvozasi", "Keyingi amalni tasdiqlang"]],
      },
    },
  },
  "/trust": {
    variant: "governance",
    image: IMAGE.governance,
    content: {
      en: {
        eyebrow: "Trust Center",
        title: "See why the system deserves—or lacks—confidence.",
        description:
          "Inspect evidence quality, provenance, AI boundaries, security posture, known limitations, and unresolved risks.",
        primary: "Review governance",
        primaryHref: "/governance",
        core: "Trust posture",
        nodes: [["Evidence", "What supports the claim?"], ["Boundaries", "Where must AI stop?"], ["Security", "What is protected?"], ["Risks", "What remains unresolved?"]],
      },
      uz: {
        eyebrow: "Ishonch markazi",
        title: "Tizim nega ishonchga loyiq yoki loyiq emasligini ko‘ring.",
        description:
          "Dalil sifati, kelib chiqish, AI chegaralari, xavfsizlik holati, ma’lum cheklovlar va hal qilinmagan risklarni tekshiring.",
        primary: "Boshqaruvni ko‘rish",
        primaryHref: "/governance",
        core: "Ishonch holati",
        nodes: [["Dalillar", "Da’voni nima qo‘llaydi?"], ["Chegaralar", "AI qayerda to‘xtaydi?"], ["Xavfsizlik", "Nima himoyalangan?"], ["Risklar", "Nima hal qilinmagan?"]],
      },
    },
  },
  "/settings": {
    variant: "governance",
    image: IMAGE.governance,
    content: {
      en: {
        eyebrow: "System Settings",
        title: "Configure the operating environment deliberately.",
        description:
          "Manage identity, language, preferences, integrations, and control boundaries without changing decision authority.",
        primary: "Review trust controls",
        primaryHref: "/trust",
        core: "Configuration",
        nodes: [["Identity", "Your operating profile"], ["Language", "How CBAI communicates"], ["Integrations", "Connected capabilities"], ["Boundaries", "What requires confirmation?"]],
      },
      uz: {
        eyebrow: "Tizim sozlamalari",
        title: "Operatsion muhitni ongli ravishda sozlang.",
        description:
          "Qaror vakolatini o‘zgartirmasdan identifikatsiya, til, afzalliklar, integratsiyalar va nazorat chegaralarini boshqaring.",
        primary: "Ishonch nazoratini ko‘rish",
        primaryHref: "/trust",
        core: "Konfiguratsiya",
        nodes: [["Identifikatsiya", "Sizning ish profilingiz"], ["Til", "CBAI qanday muloqot qiladi"], ["Integratsiyalar", "Ulangan imkoniyatlar"], ["Chegaralar", "Nima tasdiq talab qiladi?"]],
      },
    },
  },
};

const GROUPS: readonly {
  readonly routes: readonly string[];
  readonly experience: RouteExperience;
}[] = [
  {
    routes: ["/workspace", "/workflows", "/teams", "/messages", "/publications"],
    experience: {
      variant: "collaboration",
      image: IMAGE.collaboration,
      content: {
        en: {
          eyebrow: "Collaborative Workspace",
          title: "Keep people, material, and decisions in one shared context.",
          description:
            "Coordinate work without losing provenance, ownership, disagreement, or the human confirmation required for consequential actions.",
          primary: "Open live rooms",
          primaryHref: "/rooms",
          core: "Shared work",
          nodes: [["People", "Roles and ownership"], ["Material", "Files and evidence"], ["Activity", "Visible contributions"], ["Approval", "Human confirmation"]],
        },
        uz: {
          eyebrow: "Hamkorlik ish maydoni",
          title: "Odamlar, materiallar va qarorlarni bitta kontekstda saqlang.",
          description:
            "Kelib chiqish, egalik, kelishmovchilik yoki muhim amallar uchun inson tasdig‘ini yo‘qotmasdan ishni muvofiqlashtiring.",
          primary: "Jonli xonalarni ochish",
          primaryHref: "/rooms",
          core: "Umumiy ish",
          nodes: [["Odamlar", "Rol va egalik"], ["Material", "Fayl va dalillar"], ["Faollik", "Ko‘rinadigan hissa"], ["Tasdiq", "Inson nazorati"]],
        },
      },
    },
  },
  {
    routes: ["/dashboard", "/analytics", "/discover", "/notifications", "/knowledge"],
    experience: {
      variant: "reports",
      image: IMAGE.problem,
      content: {
        en: {
          eyebrow: "Intelligence Overview",
          title: "See what changed and where attention is needed.",
          description:
            "Review signals, activity, knowledge, and unresolved work while keeping every insight connected to evidence and an accountable owner.",
          primary: "Open My Work",
          primaryHref: "/my-work",
          core: "Current state",
          nodes: [["Signals", "What changed?"], ["Activity", "What is moving?"], ["Unknowns", "What is still unclear?"], ["Owners", "Who must review?"]],
        },
        uz: {
          eyebrow: "Intellekt ko‘rinishi",
          title: "Nima o‘zgargani va qayerga e’tibor kerakligini ko‘ring.",
          description:
            "Har bir xulosani dalil va mas’ul egaga bog‘langan holda signallar, faollik, bilim va hal qilinmagan ishlarni tekshiring.",
          primary: "Mening ishlarimni ochish",
          primaryHref: "/my-work",
          core: "Joriy holat",
          nodes: [["Signallar", "Nima o‘zgardi?"], ["Faollik", "Nima harakatda?"], ["Noma’lumlar", "Nima noaniq?"], ["Egalar", "Kim tekshirishi kerak?"]],
        },
      },
    },
  },
  {
    routes: ["/account", "/ai-control", "/agents", "/core"],
    experience: {
      variant: "governance",
      image: IMAGE.governance,
      content: {
        en: {
          eyebrow: "System Control",
          title: "Make capability visible, bounded, and accountable.",
          description:
            "Inspect identity, AI behavior, permissions, operating limits, and confirmation requirements before capability becomes action.",
          primary: "Open governance",
          primaryHref: "/governance",
          core: "Control plane",
          nodes: [["Identity", "Who is acting?"], ["Capability", "What can it do?"], ["Boundary", "Where must it stop?"], ["Audit", "What was recorded?"]],
        },
        uz: {
          eyebrow: "Tizim nazorati",
          title: "Imkoniyatni ko‘rinadigan, chegaralangan va hisobdor qiling.",
          description:
            "Imkoniyat amalga aylanishidan oldin identifikatsiya, AI xatti-harakati, ruxsatlar, ish chegaralari va tasdiq talablarini tekshiring.",
          primary: "Boshqaruvni ochish",
          primaryHref: "/governance",
          core: "Nazorat qatlami",
          nodes: [["Identifikatsiya", "Kim amal qilmoqda?"], ["Imkoniyat", "Nima qila oladi?"], ["Chegara", "Qayerda to‘xtaydi?"], ["Audit", "Nima qayd qilindi?"]],
        },
      },
    },
  },
  {
    routes: ["/government", "/citizen", "/investor"],
    experience: {
      variant: "scenarios",
      image: IMAGE.scenario,
      content: {
        en: {
          eyebrow: "Decision Context",
          title: "Compare consequences before committing resources.",
          description:
            "Structure objectives, evidence, stakeholders, uncertainty, and scenarios while preserving the authority of the human decision-maker.",
          primary: "Open scenarios",
          primaryHref: "/reasoning",
          core: "Decision context",
          nodes: [["Objectives", "What outcome matters?"], ["Stakeholders", "Who is affected?"], ["Evidence", "What is known?"], ["Scenarios", "What could happen?"]],
        },
        uz: {
          eyebrow: "Qaror konteksti",
          title: "Resurs ajratishdan oldin oqibatlarni taqqoslang.",
          description:
            "Inson qaror beruvchining vakolatini saqlagan holda maqsadlar, dalillar, manfaatdorlar, noaniqlik va ssenariylarni tizimlashtiring.",
          primary: "Ssenariylarni ochish",
          primaryHref: "/reasoning",
          core: "Qaror konteksti",
          nodes: [["Maqsadlar", "Qaysi natija muhim?"], ["Manfaatdorlar", "Kimga ta’sir qiladi?"], ["Dalillar", "Nima ma’lum?"], ["Ssenariylar", "Nima sodir bo‘lishi mumkin?"]],
        },
      },
    },
  },
];

function resolveExperience(pathname: string): RouteExperience | null {
  if (SKIP_ROUTES.has(pathname)) return null;
  const direct = ROUTES[pathname];
  if (direct) return direct;
  if (pathname.startsWith("/research/")) return ROUTES["/research"];
  if (pathname.startsWith("/countries/")) return ROUTES["/countries"];
  return GROUPS.find((group) => group.routes.includes(pathname))?.experience ?? null;
}

export default function RouteExperienceHero() {
  const pathname = usePathname();
  const experience = resolveExperience(pathname);
  if (!experience) return null;

  return (
    <DecisionJourneyHero
      variant={experience.variant}
      image={experience.image}
      content={experience.content}
      experienceId={`route:${pathname}`}
    />
  );
}
