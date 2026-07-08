import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  RESEARCH_TOPIC_AVAILABLE_TODAY,
  RESEARCH_TOPIC_STATUS_LABELS,
} from "@/lib/research/research-topics";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchTopicWorkspaceStatusProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicWorkspaceStatus({
  topic,
}: ResearchTopicWorkspaceStatusProps) {
  return (
    <section aria-labelledby="topic-workspace-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Workspace status</p>
        <h2 id="topic-workspace-heading" className="text-xl font-semibold text-zinc-100">
          Available today
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Status: {RESEARCH_TOPIC_STATUS_LABELS[topic.status]} — catalog information only.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${cbaiGlassCard} border-emerald-500/15 p-5`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/90">
            Available today
          </p>
          <ul className="mt-3 space-y-2">
            {RESEARCH_TOPIC_AVAILABLE_TODAY.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${cbaiGlassCard} p-5`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/90">
            Future workspace
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{topic.futureWorkspace}</p>
        </div>
      </div>
    </section>
  );
}
