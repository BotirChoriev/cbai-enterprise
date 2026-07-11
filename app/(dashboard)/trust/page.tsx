import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { HOME_FOOTER, PLATFORM_VERSION, PLATFORM_BUILD, PLATFORM_EVOLUTION_PHASE, TRUST_PILLARS } from "@/lib/platform-home";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export const metadata: Metadata = {
  title: "Trust",
  description: "Constitution, methodology, evidence policy, and version history.",
};

function findPillar(id: string) {
  const pillar = TRUST_PILLARS.find((item) => item.id === id);
  if (!pillar) {
    throw new Error(`Trust pillar "${id}" not found in TRUST_PILLARS.`);
  }
  return pillar;
}

const humanDecisionPillar = findPillar("humans-decide");
const evidenceFirstPillar = findPillar("sources-before-conclusions");
const uncertaintyPillar = findPillar("uncertainty-visible");

type TrustSection = {
  id: string;
  title: string;
  body: string[];
};

const sections: TrustSection[] = [
  {
    id: "constitution",
    title: "Constitution",
    body: [
      HOME_FOOTER.mission,
      `Governing document: ${HOME_FOOTER.constitution}.`,
    ],
  },
  {
    id: "methodology",
    title: "Methodology",
    body: [HOME_FOOTER.methodology],
  },
  {
    id: "evidence-policy",
    title: "Evidence Policy",
    body: [HOME_FOOTER.evidencePolicy, evidenceFirstPillar.description, uncertaintyPillar.description],
  },
  {
    id: "human-decision",
    title: "Human Decision",
    body: [
      humanDecisionPillar.description,
      "Every reasoning result this platform produces carries a human-decision-required flag that is always true — verified by automated test, never left to chance.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    body: [
      "This platform does not have user accounts, sign-in, or session tracking today — there is no personal data to collect, store, or share.",
      "A complete privacy policy is a placeholder pending legal review, required before any account or personalization system is introduced.",
    ],
  },
  {
    id: "copyright",
    title: "Copyright",
    body: [
      "CBAI does not claim ownership of third-party data, flags, logos, publications, datasets, or government materials referenced in this platform. Source attribution is preserved wherever a source is connected.",
      "Original CBAI platform content and design are the property of CBAI.",
    ],
  },
  {
    id: "version-history",
    title: "Version History",
    body: [
      `Version ${PLATFORM_VERSION} · Build ${PLATFORM_BUILD} · ${PLATFORM_EVOLUTION_PHASE}.`,
    ],
  },
];

export default function TrustPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Trust"
        description="How CBAI earns trust — one place for the constitution, methodology, and policies that govern the platform."
      />

      <nav aria-label="Trust sections" className={`${cbaiGlassCard} p-4`}>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-cyan-400 hover:text-cyan-300">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className={`${cbaiGlassCard} space-y-3 p-6 scroll-mt-20`}
          >
            <div>
              <p className={cbaiSectionEyebrow}>Trust</p>
              <h2 id={`${section.id}-heading`} className="mt-1 text-lg font-semibold text-zinc-100">
                {section.title}
              </h2>
            </div>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-zinc-400">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="text-xs text-zinc-600">
        Full pillar-by-pillar detail lives on the{" "}
        <Link href="/#home-trust-heading" className="text-cyan-400 hover:text-cyan-300">
          Home
        </Link>{" "}
        page&apos;s trust summary.
      </p>
    </div>
  );
}
