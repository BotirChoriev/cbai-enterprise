import Link from "next/link";
import WorkspaceOverview from "@/components/research/workspace/WorkspaceOverview";
import WorkspaceModules from "@/components/research/workspace/WorkspaceModules";
import WorkspaceLifecycle from "@/components/research/workspace/WorkspaceLifecycle";
import WorkspaceReadiness from "@/components/research/workspace/WorkspaceReadiness";
import { cbaiHeroGlow, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function ResearchWorkspaceHome() {
  return (
    <div
      className={`mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6 sm:py-14 ${cbaiHeroGlow}`}
    >
      <Link
        href="/research"
        className="inline-flex text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
      >
        ← Back to Research Intelligence
      </Link>

      <WorkspaceOverview />
      <WorkspaceReadiness />
      <WorkspaceModules />
      <WorkspaceLifecycle />

      <section className="space-y-3">
        <p className={cbaiSectionEyebrow}>Next step</p>
        <p className="text-sm text-zinc-500">
          Open a research topic to explore its catalog profile, notebook, timeline, and knowledge
          graph within this workspace foundation.
        </p>
        <Link
          href="/research/microbiology"
          className="inline-flex text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
        >
          Open a topic example →
        </Link>
      </section>
    </div>
  );
}
