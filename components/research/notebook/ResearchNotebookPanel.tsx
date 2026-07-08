import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchNotebookForTopicObject } from "@/lib/research/notebook/notebook-query";
import { NOTEBOOK_CATALOG_ONLY_NOTICE } from "@/lib/research/notebook/notebook-types";
import ResearchNotebookSummary from "@/components/research/notebook/ResearchNotebookSummary";
import ResearchNotebookEvidence from "@/components/research/notebook/ResearchNotebookEvidence";
import ResearchNotebookOpenQuestions from "@/components/research/notebook/ResearchNotebookOpenQuestions";
import ResearchNotebookLimitations from "@/components/research/notebook/ResearchNotebookLimitations";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchNotebookPanelProps = {
  topic: ResearchTopic;
  embedded?: boolean;
};

export default function ResearchNotebookPanel({ topic, embedded = false }: ResearchNotebookPanelProps) {
  const notebook = getResearchNotebookForTopicObject(topic);

  return (
    <section aria-labelledby="topic-notebook-heading" className="space-y-4">
      {!embedded ? (
        <div>
          <p className={cbaiSectionEyebrow}>Structured notebook</p>
          <h2 id="topic-notebook-heading" className="text-xl font-semibold text-zinc-100">
            Research Notebook
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            A structured notebook for reviewing this research topic.
          </p>
          <p className="mt-2 rounded-md border border-cyan-500/15 bg-cyan-500/5 px-3 py-2 text-xs text-zinc-400">
            {NOTEBOOK_CATALOG_ONLY_NOTICE} Live evidence not connected.
          </p>
        </div>
      ) : (
        <h2 id="topic-notebook-heading" className="text-sm font-semibold text-zinc-100">
          Research Notebook
        </h2>
      )}

      <ResearchNotebookSummary notebook={notebook} />

      <div className={`${cbaiGlassCard} grid gap-5 p-5 lg:grid-cols-2`}>
        <ResearchNotebookEvidence notebook={notebook} />
        <div className="space-y-5">
          <ResearchNotebookOpenQuestions notebook={notebook} />
          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Negative results
            </h4>
            <ul className="space-y-1.5">
              {notebook.negativeResultPurpose.slice(0, 3).map((purpose) => (
                <li key={purpose} className="flex items-start gap-2 text-[11px] text-zinc-500">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                  {purpose}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ResearchNotebookLimitations notebook={notebook} />
    </section>
  );
}
