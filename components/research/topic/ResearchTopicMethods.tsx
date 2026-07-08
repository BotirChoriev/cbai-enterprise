import type { ResearchTopic } from "@/lib/research/research-topics";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchTopicMethodsProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicMethods({ topic }: ResearchTopicMethodsProps) {
  return (
    <section aria-labelledby="topic-methods-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Methods</p>
        <h2 id="topic-methods-heading" className="text-xl font-semibold text-zinc-100">
          Related methods
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Methods associated with this research topic in the catalog — not live study records.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topic.relatedMethods.map((method) => (
          <li key={method}>
            <div className={`${cbaiGlassCard} px-4 py-3 text-sm text-zinc-300`}>{method}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
