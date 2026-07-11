import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_TOPIC_STATUS_LABELS } from "@/lib/research/research-topics";
import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";
import { RESEARCH_READINESS_LABELS } from "@/lib/research/intelligence/intelligence-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type WorkspaceContextBarProps = {
  topic: ResearchTopic;
  readiness: ResearchReadinessState;
};

type ContextField = {
  label: string;
  value: string;
};

// Sticky orientation strip: reused across the whole workspace so a researcher never loses
// track of what topic, domain, and stage they're in while scrolling a long page.
export default function WorkspaceContextBar({ topic, readiness }: WorkspaceContextBarProps) {
  const fields: ContextField[] = [
    // No "Project" concept exists anywhere in this platform's data model — the closest real,
    // honest grouping above an individual topic is its catalog domain.
    { label: "Domain", value: topic.domain },
    { label: "Topic", value: topic.topicName },
    { label: "Research question", value: topic.description },
    { label: "Workspace status", value: RESEARCH_TOPIC_STATUS_LABELS[topic.status] },
    { label: "Current stage", value: RESEARCH_READINESS_LABELS[readiness] },
  ];

  return (
    <div
      className={`${cbaiGlassCard} sticky top-2 z-20 grid gap-3 p-3 sm:grid-cols-5 sm:p-4`}
      aria-label="Workspace context"
    >
      {fields.map((field) => (
        <div key={field.label} className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {field.label}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-zinc-200" title={field.value}>
            {field.value}
          </p>
        </div>
      ))}
    </div>
  );
}
