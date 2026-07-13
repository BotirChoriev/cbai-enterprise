import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { HOME_FOOTER, PLATFORM_VERSION, TRUST_PILLARS } from "@/lib/platform-home";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_EXPLANATIONS } from "@/lib/product-status";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export const metadata: Metadata = {
  title: "Trust",
  description: "Methodology, verification model, evidence policy, data sources, and known limitations.",
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

const VERIFICATION_STATUSES = ["live", "partial", "waiting_for_verified_data", "preview"] as const;

const DATA_SOURCE_CATEGORIES = [
  { name: "United Nations", scope: "Country-level institutional and treaty reporting." },
  { name: "World Bank Group", scope: "Country and economic indicators." },
  { name: "International Monetary Fund", scope: "Financial and macroeconomic reporting." },
  { name: "World Health Organization", scope: "Health system coverage." },
  { name: "UNESCO", scope: "Education and research statistics." },
  { name: "International Labour Organization", scope: "Labour market statistics." },
  { name: "International Telecommunication Union", scope: "Digital connectivity statistics." },
  { name: "OECD", scope: "Economic co-operation and development data." },
  { name: "Open Contracting Partnership", scope: "Public procurement transparency." },
  { name: "National statistical authorities", scope: "Per-country official statistics." },
  { name: "Government procurement authorities", scope: "Per-country procurement disclosure." },
  { name: "Ministries of finance and audit institutions", scope: "Per-country budget transparency." },
] as const;

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
    id: "verification-model",
    title: "Verification Model",
    body: [
      "Every profile and topic on this platform carries one of four honest labels, always shown as a full sentence, never a bare word or color alone:",
      ...VERIFICATION_STATUSES.map(
        (status) => `${PRODUCT_STATUS_LABELS[status]} — ${PRODUCT_STATUS_EXPLANATIONS[status]}`,
      ),
    ],
  },
  {
    id: "evidence-policy",
    title: "Evidence Policy",
    body: [HOME_FOOTER.evidencePolicy, evidenceFirstPillar.description, uncertaintyPillar.description],
  },
  {
    id: "data-sources",
    title: "Data Sources",
    body: [
      "Official sources this platform is built to connect to, by category:",
      ...DATA_SOURCE_CATEGORIES.map((source) => `${source.name} — ${source.scope}`),
      "A source only counts as connected once real, verifiable data from it is linked to a profile — never assumed from the category alone.",
    ],
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
      "Two account types exist: a Device-Local Account (email, password, display name, organization — hashed and salted with your browser's own cryptography, stored only in this browser, never sent anywhere) and, where this deployment is configured for it, a real Cloud Account backed by Supabase, a real authentication provider — your Projects, Bookmarks, Reports, and Assistant preferences sync across the devices you sign into with that account.",
      "Row Level Security is enforced on every cloud table: only your own signed-in session can read, write, or delete your records — see supabase/migrations/0002_rls_policies.sql for the exact policies.",
      "There is no analytics, no tracking script, and no third party ever receives this data. Supabase (when configured) is the only processor, and only for the account you explicitly create.",
      "A complete privacy policy will be published ahead of any commercial or public launch, once legal review is complete.",
    ],
  },
  {
    id: "terms-of-use",
    title: "Terms of Use",
    body: [
      "This is a minimum, honest statement of real current behavior — not a substitute for a lawyer-drafted Terms of Service, which will be published before any commercial or cloud-backed launch.",
      "CBAI is provided as-is, with no warranty of accuracy, completeness, or fitness for a particular purpose. Evidence-based information is not professional, legal, financial, or medical advice.",
      "You are responsible for verifying any information before relying on it for a real decision — the Human Decision principle above applies to your use of this platform, not only to what it produces.",
      "Device-Local accounts and locally stored data may be lost if this browser's storage is cleared; there is no backup or recovery for that data.",
      "Account deletion: a Device-Local account and its data can be cleared by clearing this browser's site storage. A Cloud Account cannot yet be self-service deleted from within the app — this platform has no server component that can safely hold the elevated credential such a deletion requires; contact the operator of this deployment to request cloud account and data deletion until a real self-service flow is built.",
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
    id: "known-limitations",
    title: "Known Limitations",
    body: [
      "Coverage today is intentionally shown as it really is, not as it will eventually be: most profiles have only a small number of official sources connected so far, and the remaining gaps are labeled individually rather than hidden.",
      "Device-Local accounts (email/password, hashed and salted on-device) have no server to verify them and no cross-device sync — Projects, notes, and saved work stay on the device that created them. Where a Cloud Account is configured, it is server-verified and syncs across devices, but still has no email-based account recovery, no rate limiting, and no self-service deletion yet.",
      "Governance, Investor, and Citizen workspaces, and the Knowledge Graph and Reasoning views, share the same evidence core and are still early — treat their current depth as a preview of the intended experience, not the finished one.",
    ],
  },
  {
    id: "transparency-statement",
    title: "Transparency Statement",
    body: [
      HOME_FOOTER.transparency,
      "There is no support or contact channel connected yet. Until one exists, the most reliable way to judge the platform is to check what a profile or report actually shows against the sources it cites.",
      `Version ${PLATFORM_VERSION}.`,
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
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className={`${cbaiGlassCard} relative space-y-3 overflow-hidden p-6 pl-8 scroll-mt-20`}
          >
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-[#005810] opacity-60" />
            <div>
              <p className={cbaiSectionEyebrow}>{String(index + 1).padStart(2, "0")}</p>
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
