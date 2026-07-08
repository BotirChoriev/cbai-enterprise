"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ResearchHero from "@/components/research/ResearchHero";
import ResearchEcosystemOverview from "@/components/research/ResearchEcosystemOverview";
import ResearchTopicCatalog from "@/components/research/ResearchTopicCatalog";
import ResearchGraphPanel from "@/components/research/graph/ResearchGraphPanel";
import ResearchPrinciples from "@/components/research/ResearchPrinciples";
import { cbaiBtnSecondary, cbaiGlassCard, cbaiHeroGlow, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { WORKSPACE_PATH } from "@/lib/research/workspace";
import {
  RESEARCH_AVAILABLE_TODAY,
  RESEARCH_HOME,
  RESEARCH_NOT_AVAILABLE_YET,
} from "@/lib/research";

export default function ResearchHome() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? searchParams.get("topic") ?? "").trim();

  return (
    <div
      className={`mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6 sm:py-14 ${cbaiHeroGlow}`}
    >
      <ResearchHero query={query} />

      <section
        aria-labelledby="research-status-heading"
        className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-4"
      >
        <h2 id="research-status-heading" className="sr-only">
          Research Intelligence status
        </h2>
        <p className="text-sm font-semibold text-cyan-300">{RESEARCH_HOME.statusLabel}</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/90">
              Available today
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-zinc-400">
              {RESEARCH_AVAILABLE_TODAY.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Not available yet
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-zinc-500">
              {RESEARCH_NOT_AVAILABLE_YET.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="research-workspace-cta-heading" className="space-y-3">
        <p className={cbaiSectionEyebrow}>Research workspace</p>
        <div className={`${cbaiGlassCard} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <h2 id="research-workspace-cta-heading" className="text-lg font-semibold text-zinc-100">
              Structured knowledge organization
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Explore the read-only workspace shell where evidence review and future collaboration
              will meet — human review required.
            </p>
          </div>
          <Link href={WORKSPACE_PATH} className={`${cbaiBtnSecondary} shrink-0`}>
            Explore Research Workspace →
          </Link>
        </div>
      </section>

      <ResearchTopicCatalog initialQuery={query} />
      <ResearchGraphPanel variant="global" />
      <ResearchEcosystemOverview />
      <ResearchPrinciples />
    </div>
  );
}
