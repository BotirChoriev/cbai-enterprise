import type { ResearchTopic } from "@/lib/research/research-topics";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchTopicEvidenceMapProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicEvidenceMap({ topic }: ResearchTopicEvidenceMapProps) {
  return (
    <section aria-labelledby="topic-evidence-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Evidence types</p>
        <h2 id="topic-evidence-heading" className="text-xl font-semibold text-zinc-100">
          Evidence map
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Evidence types that will matter for this topic when official sources are connected.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {topic.relatedEvidenceTypes.map((evidenceType) => (
          <li key={evidenceType}>
            <article className={`${cbaiGlassCard} flex items-start gap-3 p-4`}>
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400/80 shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-sm font-medium text-zinc-200">{evidenceType}</h3>
                <p className="mt-1 text-xs text-zinc-600">Not connected yet</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
