import Link from "next/link";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { RESEARCH_EXAMPLE_TOPICS, RESEARCH_HOME } from "@/lib/research";

type ResearchTopicPreviewProps = {
  query?: string;
};

export default function ResearchTopicPreview({ query = "" }: ResearchTopicPreviewProps) {
  return (
    <section aria-labelledby="research-topics-heading" className="space-y-5">
      <div className="space-y-2">
        <p className={cbaiSectionEyebrow}>Example topics</p>
        <h2 id="research-topics-heading" className="text-xl font-semibold text-zinc-100">
          Topic exploration preview
        </h2>
        <p className="max-w-2xl text-sm text-zinc-400">
          Sample research directions for orientation. Selecting a topic does not open live
          publications, experiments, or researcher profiles.
        </p>
      </div>

      {query ? (
        <div
          className={`${cbaiGlassCard} border-teal-500/20 px-5 py-4`}
          role="status"
        >
          <p className="text-sm font-medium text-zinc-200">
            Topic entry: <span className="text-teal-400">{query}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {RESEARCH_HOME.topicExplorationNote}
          </p>
        </div>
      ) : null}

      <ul className="flex flex-wrap gap-2">
        {RESEARCH_EXAMPLE_TOPICS.map((topic) => (
          <li key={topic}>
            <Link
              href={`/research?topic=${encodeURIComponent(topic)}`}
              className={`${cbaiGlassCard} inline-flex min-h-10 items-center px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-teal-400/30 hover:text-teal-300`}
            >
              {topic}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
