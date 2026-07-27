"use client";

import Link from "next/link";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import styles from "./DecisionJourneyHero.module.css";

export type DecisionJourneyVariant =
  | "problem"
  | "evidence"
  | "scenarios"
  | "reports"
  | "collaboration"
  | "governance";

export type HeroCopy = {
  eyebrow: string;
  title: string;
  description: string;
  primary: string;
  primaryHref: string;
  core: string;
  nodes: readonly [string, string][];
};

export type DecisionJourneyHeroContent = {
  readonly en: HeroCopy;
  readonly uz: HeroCopy;
};

const COPY: Record<"en" | "uz", Record<DecisionJourneyVariant, HeroCopy>> = {
  en: {
    problem: {
      eyebrow: "Problem Space",
      title: "Define what must change.",
      description: "Open one decision-worthy problem. AI structures the evidence, contradictions, unknowns, and possible paths. You retain the final judgment.",
      primary: "Open a problem",
      primaryHref: "/?openProblem=1",
      core: "Problem context",
      nodes: [["Objective", "What outcome matters?"], ["Boundaries", "What is in and out?"], ["Unknowns", "What could change the decision?"], ["Owner", "Who makes the final call?"]],
    },
    evidence: {
      eyebrow: "Evidence Engine",
      title: "Know what the decision rests on.",
      description: "Inspect provenance, reliability, counter-evidence, missing information, and source coverage before any scenario is trusted.",
      primary: "Review evidence",
      primaryHref: "/evidence",
      core: "Verified evidence",
      nodes: [["Sources", "Origin and custody"], ["Reliability", "Method and confidence"], ["Counter-evidence", "What challenges the claim?"], ["Gaps", "What is still missing?"]],
    },
    scenarios: {
      eyebrow: "Scenario Engine",
      title: "Compare futures before choosing one.",
      description: "Explore plausible paths, consequences, risks, assumptions, and unresolved unknowns without allowing AI to make the decision.",
      primary: "Explore scenarios",
      primaryHref: "/reasoning",
      core: "Human checkpoint",
      nodes: [["Scenario A", "Durable, lower uncertainty"], ["Scenario B", "Balanced operational path"], ["Scenario C", "Higher upside and exposure"], ["Assumptions", "Conditions that must hold"]],
    },
    reports: {
      eyebrow: "Decision Reports",
      title: "Make the reasoning defensible.",
      description: "Turn the complete decision trail into a clear report: sources, contradictions, scenario comparison, human rationale, and monitoring triggers.",
      primary: "Review reports",
      primaryHref: "/reports",
      core: "Decision record",
      nodes: [["Provenance", "Every claim traceable"], ["Rationale", "Why this path?"], ["Review", "Human approval state"], ["Monitoring", "What happens next?"]],
    },
    collaboration: {
      eyebrow: "Collaboration",
      title: "One problem. One shared thinking process.",
      description: "Invite people into a controlled workspace where evidence, challenges, roles, reviews, and decisions remain visible and accountable.",
      primary: "Open collaboration",
      primaryHref: "/rooms",
      core: "Shared context",
      nodes: [["People", "Clear roles and ownership"], ["Evidence", "One verified source space"], ["Challenges", "Disagreement stays visible"], ["Approvals", "Humans confirm actions"]],
    },
    governance: {
      eyebrow: "Governance",
      title: "Control how intelligence becomes action.",
      description: "Review permissions, provenance, decision boundaries, audit history, and confirmation gates across the operating system.",
      primary: "Review governance",
      primaryHref: "/governance",
      core: "Human authority",
      nodes: [["Permissions", "Who may do what?"], ["Audit trail", "What changed and why?"], ["Boundaries", "Where AI must stop"], ["Accountability", "Who approved the decision?"]],
    },
  },
  uz: {
    problem: {
      eyebrow: "Muammo maydoni",
      title: "Nima o‘zgarishi kerakligini aniqlang.",
      description: "Qaror talab qiladigan bitta muammoni oching. AI dalillar, qarama-qarshiliklar, noma’lumlar va yo‘llarni tizimlashtiradi. Yakuniy hukm sizniki.",
      primary: "Muammo ochish",
      primaryHref: "/?openProblem=1",
      core: "Muammo konteksti",
      nodes: [["Maqsad", "Qaysi natija muhim?"], ["Chegaralar", "Nima doiraga kiradi?"], ["Noma’lumlar", "Qarorni nima o‘zgartirishi mumkin?"], ["Egasi", "Yakuniy qarorni kim beradi?"]],
    },
    evidence: {
      eyebrow: "Dalillar mexanizmi",
      title: "Qaror nimaga tayanganini biling.",
      description: "Ssenariyga ishonishdan oldin manba kelib chiqishi, ishonchlilik, qarshi dalil, yetishmayotgan ma’lumot va qamrovni tekshiring.",
      primary: "Dalillarni ko‘rish",
      primaryHref: "/evidence",
      core: "Tekshirilgan dalil",
      nodes: [["Manbalar", "Kelib chiqishi va tarixi"], ["Ishonchlilik", "Metod va ishonch"], ["Qarshi dalil", "Da’voni nima rad etadi?"], ["Bo‘shliqlar", "Yana nima yetishmaydi?"]],
    },
    scenarios: {
      eyebrow: "Ssenariylar mexanizmi",
      title: "Tanlashdan oldin kelajaklarni solishtiring.",
      description: "AI qaror bermasdan turib ehtimoliy yo‘llar, oqibatlar, risklar, taxminlar va noma’lumlarni birgalikda tahlil qiling.",
      primary: "Ssenariylarni ko‘rish",
      primaryHref: "/reasoning",
      core: "Inson nazorati",
      nodes: [["Ssenariy A", "Barqaror, noaniqligi past"], ["Ssenariy B", "Muvozanatli operatsion yo‘l"], ["Ssenariy C", "Natija va risk yuqori"], ["Taxminlar", "Qaysi shartlar bajarilishi kerak?"]],
    },
    reports: {
      eyebrow: "Qaror hisobotlari",
      title: "Fikrlash jarayonini himoya qilinadigan qiling.",
      description: "Manbalar, qarama-qarshiliklar, ssenariy taqqoslash, inson asosi va monitoring triggerlarini bitta tushunarli hisobotga aylantiring.",
      primary: "Hisobotlarni ko‘rish",
      primaryHref: "/reports",
      core: "Qaror qaydi",
      nodes: [["Kelib chiqish", "Har bir da’vo kuzatiladi"], ["Asos", "Nega shu yo‘l?"], ["Tekshiruv", "Inson tasdig‘i holati"], ["Monitoring", "Keyin nima bo‘ladi?"]],
    },
    collaboration: {
      eyebrow: "Hamkorlik",
      title: "Bitta muammo. Bitta umumiy fikrlash jarayoni.",
      description: "Dalillar, e’tirozlar, rollar, tekshiruvlar va qarorlar ko‘rinadigan hamda hisobdor bo‘lib qoladigan boshqariladigan ish maydoni.",
      primary: "Hamkorlikni ochish",
      primaryHref: "/rooms",
      core: "Umumiy kontekst",
      nodes: [["Odamlar", "Aniq rol va egalik"], ["Dalillar", "Bitta tekshirilgan maydon"], ["E’tirozlar", "Kelishmovchilik ko‘rinadi"], ["Tasdiqlar", "Amalni inson tasdiqlaydi"]],
    },
    governance: {
      eyebrow: "Boshqaruv",
      title: "Intellekt qanday amalga aylanishini boshqaring.",
      description: "Operatsion tizim bo‘ylab ruxsatlar, kelib chiqish, qaror chegaralari, audit tarixi va tasdiqlash nuqtalarini tekshiring.",
      primary: "Boshqaruvni ko‘rish",
      primaryHref: "/governance",
      core: "Inson vakolati",
      nodes: [["Ruxsatlar", "Kim nima qila oladi?"], ["Audit tarixi", "Nima va nega o‘zgardi?"], ["Chegaralar", "AI qayerda to‘xtaydi?"], ["Javobgarlik", "Qarorni kim tasdiqladi?"]],
    },
  },
};

const JOURNEY = {
  en: ["Problem", "Evidence", "Contradictions", "Scenarios", "Human decision", "Monitoring"],
  uz: ["Muammo", "Dalillar", "Qarama-qarshilik", "Ssenariylar", "Inson qarori", "Monitoring"],
} as const;

const ACTIVE_STAGE: Record<DecisionJourneyVariant, number> = {
  problem: 0,
  evidence: 1,
  scenarios: 3,
  reports: 4,
  collaboration: 4,
  governance: 4,
};

const HERO_IMAGE: Record<DecisionJourneyVariant, string> = {
  problem: "/experience/problem-space-v1.webp",
  evidence: "/experience/evidence-engine-v1.webp",
  scenarios: "/experience/scenario-engine-v1.webp",
  reports: "/experience/governance-monitoring-v1.webp",
  collaboration: "/experience/collaboration-v1.webp",
  governance: "/experience/governance-monitoring-v1.webp",
};

export default function DecisionJourneyHero({
  variant,
  content,
  image,
  experienceId,
}: {
  variant: DecisionJourneyVariant;
  content?: DecisionJourneyHeroContent;
  image?: string;
  experienceId?: string;
}) {
  const { language } = useTranslation();
  const { openDock } = useVoiceOperator();
  const locale = language === "uz" ? "uz" : "en";
  const copy = content?.[locale] ?? COPY[locale][variant];
  const journey = JOURNEY[locale];

  return (
    <section
      className={`${styles.hero} ${styles[variant]}`}
      data-cbai-experience={experienceId ?? variant}
    >
      <div
        className={styles.cinematicMedia}
        style={{ backgroundImage: `url("${image ?? HERO_IMAGE[variant]}")` }}
        aria-hidden="true"
      />
      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 className={styles.title}>{copy.title}</h1>
          <p className={styles.description}>{copy.description}</p>
          <div className={styles.actions}>
            <Link href={copy.primaryHref} className={styles.primary}>
              {copy.primary}
              <span aria-hidden="true">→</span>
            </Link>
            <button type="button" className={styles.secondary} onClick={openDock}>
              <span aria-hidden="true">◉</span>
              {locale === "uz" ? "Ovoz operatori bilan boshqarish" : "Control with Voice Operator"}
            </button>
          </div>
        </div>

        <div className={styles.visual} aria-label={locale === "uz" ? "Intellekt xaritasi" : "Intelligence map"}>
          <div className={styles.orbit} />
          <div className={styles.orbitInner} />
          <div className={styles.core}>{copy.core}</div>
          {copy.nodes.map(([title, detail], index) => (
            <div
              key={title}
              className={`${styles.node} ${[styles.nodeOne, styles.nodeTwo, styles.nodeThree, styles.nodeFour][index]}`}
            >
              <strong>{title}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.journey} aria-label={locale === "uz" ? "Qaror jarayoni" : "Decision workflow"}>
        {journey.map((label, index) => (
          <div key={label} className={`${styles.stage} ${ACTIVE_STAGE[variant] === index ? styles.stageActive : ""}`}>
            <span className={styles.stageNumber}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.stageLabel}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
