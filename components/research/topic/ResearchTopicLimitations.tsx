import { RESEARCH_TOPIC_NOT_AVAILABLE_YET } from "@/lib/research/research-topics";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function ResearchTopicLimitations() {
  return (
    <section aria-labelledby="topic-limitations-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Limitations</p>
        <h2 id="topic-limitations-heading" className="text-xl font-semibold text-zinc-100">
          Not connected yet
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          The following capabilities are not available for this topic today. No live scientific
          databases, publication feeds, or researcher profiles are connected.
        </p>
      </div>

      <div className={`${cbaiGlassCard} border-zinc-700/40 p-5`}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {RESEARCH_TOPIC_NOT_AVAILABLE_YET.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-zinc-500">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-zinc-800 pt-4 text-xs leading-relaxed text-zinc-600">
          Human review is required before using any future connected evidence from this topic in
          a decision or publication claim.
        </p>
      </div>
    </section>
  );
}
