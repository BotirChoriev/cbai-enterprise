import Link from "next/link";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import { buildReportsCenterModel } from "@/lib/reports-center";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const continueLinks = [
  {
    label: "Research Workspace",
    href: "/research/workspace",
    detail: "Open the structured workspace for evidence review and knowledge organization.",
  },
  {
    label: "Research Catalog",
    href: "/research",
    detail: "Browse research topics, missions, and evidence status.",
  },
  {
    label: "Evidence",
    href: "/knowledge",
    detail: "Review official source status across profiles.",
  },
  {
    label: "Research Review",
    href: "/research/review",
    detail: "Review a topic's evidence, decisions, and reviewer status.",
  },
] as const;

export default function MyWork() {
  const evidence = buildEvidenceExplorerModel();
  const reports = buildReportsCenterModel();

  return (
    <div className="space-y-8">
      <div className={`${cbaiGlassCard} border-cyan-500/15 px-6 py-5`}>
        <h2 className="text-lg font-semibold text-zinc-100">My Work</h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          CBAI does not yet have accounts or saved sessions, so nothing below is personalized to
          you. These are the real, working entry points into research and evidence review across
          the platform — never a fabricated history.
        </p>
      </div>

      <section aria-labelledby="my-work-continue-heading" className="space-y-3">
        <p className={cbaiSectionEyebrow} id="my-work-continue-heading">
          Continue Working
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {continueLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${cbaiGlassCard} flex flex-col px-5 py-4 transition-colors hover:border-cyan-500/25`}
            >
              <span className="text-sm font-semibold text-cyan-400">{link.label}</span>
              <span className="mt-1 text-xs text-zinc-500">{link.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="my-work-reports-heading" className="space-y-3">
        <p className={cbaiSectionEyebrow} id="my-work-reports-heading">
          Reports
        </p>
        <Link
          href="/analytics"
          className={`${cbaiGlassCard} flex flex-col px-5 py-4 transition-colors hover:border-cyan-500/25 sm:max-w-sm`}
        >
          <span className="text-sm font-semibold text-cyan-400">Reports Center</span>
          <span className="mt-1 text-xs text-zinc-500">
            {reports.summary.reportTypes} report types defined for profile and comparison review.
          </span>
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section aria-labelledby="my-work-missions-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
          <p className={cbaiSectionEyebrow} id="my-work-missions-heading">
            Recent Missions
          </p>
          <p className="text-xs text-zinc-500">
            No missions are shown here — sign-in and mission history are not connected yet. Open
            the{" "}
            <Link href="/research" className="text-cyan-400 hover:text-cyan-300">
              Research Catalog
            </Link>{" "}
            to start a real mission.
          </p>
        </section>

        <section aria-labelledby="my-work-research-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
          <p className={cbaiSectionEyebrow} id="my-work-research-heading">
            Recent Research
          </p>
          <p className="text-xs text-zinc-500">
            No recent research is shown here — sign-in and browsing history are not connected
            yet. Every research topic remains reachable from the Research Catalog at any time.
          </p>
        </section>

        <section
          aria-labelledby="my-work-evidence-reviews-heading"
          className={`${cbaiGlassCard} space-y-2 p-5`}
        >
          <p className={cbaiSectionEyebrow} id="my-work-evidence-reviews-heading">
            Evidence Reviews
          </p>
          <p className="text-xs text-zinc-500">
            No personal review history is connected yet. Platform-wide, {evidence.summary.connectedSources}{" "}
            of {evidence.summary.totalSources} evidence sources are connected — open{" "}
            <Link href="/knowledge" className="text-cyan-400 hover:text-cyan-300">
              Evidence
            </Link>{" "}
            to review current status.
          </p>
        </section>

        <section aria-labelledby="my-work-saved-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
          <p className={cbaiSectionEyebrow} id="my-work-saved-heading">
            Saved Work
          </p>
          <p className="text-xs text-zinc-500">
            No persistence layer exists yet for saved work — this is an honest empty state, not
            an error.
          </p>
        </section>
      </div>
    </div>
  );
}
