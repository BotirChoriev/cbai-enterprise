import { RESEARCH_TOPIC_STATUS_LABELS } from "@/lib/research/research-topics";
import type { ResearchTopic } from "@/lib/research/research-topics";
import type { TopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const NOT_ENOUGH_EVIDENCE = "Not enough evidence available.";

export function buildMissionStatement(topic: ResearchTopic): string {
  return `Investigate ${topic.topicName} within ${topic.domain}, using available catalog evidence.`;
}

function buildKnownInformation(topic: ResearchTopic): readonly string[] {
  const items: string[] = [`Classified under ${topic.domain}.`];

  if (topic.relatedMethods.length > 0) {
    items.push(`Documented research methods: ${topic.relatedMethods.join(", ")}.`);
  }
  if (topic.relatedEvidenceTypes.length > 0) {
    items.push(`Recognized evidence categories: ${topic.relatedEvidenceTypes.join(", ")}.`);
  }
  items.push(`Catalog status: ${RESEARCH_TOPIC_STATUS_LABELS[topic.status]}.`);

  return items;
}

function buildUnknowns(review: TopicEvidenceReview): readonly string[] {
  const items: string[] = [
    `Live findings for the evidence categories above are not yet known — no official source has been connected for ${review.topic.topicName}.`,
  ];

  const reviewRequired = review.evidenceItems.filter(
    (item) => item.status === "human_review_required",
  );
  if (reviewRequired.length > 0) {
    items.push(
      `${reviewRequired.length} evidence categor${reviewRequired.length === 1 ? "y" : "ies"} require human scientific review before anything can be assessed.`,
    );
  }

  return items;
}

function buildEvidenceGaps(review: TopicEvidenceReview): readonly string[] {
  const gaps: string[] = review.evidenceItems
    .filter((item) => item.status === "source_not_connected")
    .map((item) => `${item.label} — source not connected.`);

  if (!review.reviewReadiness.reviewOpened) {
    gaps.push("Review not started.");
  }

  return gaps;
}

function buildRecommendedNextAction(review: TopicEvidenceReview): string {
  return review.nextActions[0] ?? NOT_ENOUGH_EVIDENCE;
}

type MissionSection = {
  title: string;
  items: readonly string[];
};

type ResearchMissionWorkspaceProps = {
  review: TopicEvidenceReview;
};

export default function ResearchMissionWorkspace({ review }: ResearchMissionWorkspaceProps) {
  const { topic } = review;

  const sections: MissionSection[] = [
    { title: "Research mission", items: [buildMissionStatement(topic)] },
    { title: "Known information", items: buildKnownInformation(topic) },
    { title: "Unknowns", items: buildUnknowns(review) },
    { title: "Evidence gaps", items: buildEvidenceGaps(review) },
    { title: "Recommended next action", items: [buildRecommendedNextAction(review)] },
  ];

  return (
    <section aria-labelledby="research-mission-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Research mission workspace</p>
        <h2 id="research-mission-heading" className="text-xl font-semibold text-zinc-100">
          {topic.topicName}: what we know, what we don&apos;t
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Derived only from the existing catalog and evidence workspace — no invented findings.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className={`${cbaiGlassCard} p-4`}>
            <h3 className="text-sm font-medium text-zinc-200">{section.title}</h3>
            {section.items.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-zinc-500">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500/60" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-zinc-600">{NOT_ENOUGH_EVIDENCE}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
