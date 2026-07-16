import Link from "next/link";
import type {
  TopicEvidenceCatalogItem,
  TopicEvidenceCatalogStatus,
  TopicEvidenceReview,
} from "@/lib/research/evidence/evidence-topic-builder";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const STATUS_LABELS: Record<TopicEvidenceCatalogStatus, string> = {
  catalog_available: "Catalog evidence",
  source_not_connected: "Source not connected",
  human_review_required: "Human scientific review required",
};

function statusAccent(status: TopicEvidenceCatalogStatus): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-300";
    case "source_not_connected":
      return "border-zinc-700 bg-zinc-900/40 text-zinc-400";
    case "human_review_required":
      return "border-amber-500/25 bg-amber-500/5 text-amber-300";
  }
}

type TopicEvidenceReviewWorkflowProps = {
  review: TopicEvidenceReview;
  /** The evidence item to show in the detail column — resolved by the caller (e.g. from ?evidence=). */
  selectedEvidence: TopicEvidenceCatalogItem | undefined;
};

export default function TopicEvidenceReviewWorkflow({
  review,
  selectedEvidence,
}: TopicEvidenceReviewWorkflowProps) {
  const { topic, evidenceItems, reviewReadiness, limitations, nextActions } = review;

  return (
    <section aria-labelledby="topic-evidence-review-heading" className="space-y-4">
      <div className="space-y-1">
        <p className={cbaiSectionEyebrow}>Evidence &amp; review workflow</p>
        <h2
          id="topic-evidence-review-heading"
          className="text-xl font-semibold tracking-tight text-zinc-100"
        >
          {topic.topicName}
        </h2>
        <p className="max-w-3xl text-sm text-zinc-500">
          Available topic information — from catalog evidence categories through review
          readiness and the next research action.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)_minmax(220px,260px)]">
        <nav aria-label="Available catalog evidence" className={`${cbaiGlassCard} space-y-3 p-4`}>
          <p className={cbaiSectionEyebrow}>Available evidence</p>
          {evidenceItems.length > 0 ? (
            <ul className="space-y-2">
              {evidenceItems.map((item) => {
                const isSelected = item.evidenceItemId === selectedEvidence?.evidenceItemId;
                return (
                  <li key={item.evidenceItemId}>
                    <Link
                      href={`?evidence=${item.slug}`}
                      scroll={false}
                      aria-current={isSelected ? "true" : undefined}
                      className={`block rounded-lg border px-3 py-2 transition-colors ${
                        isSelected
                          ? "border-teal-500/40 bg-teal-500/10"
                          : "border-zinc-800/80 bg-slate-950/40 hover:border-teal-500/20 hover:bg-teal-500/5"
                      }`}
                    >
                      <p className="text-sm font-medium text-zinc-200">{item.label}</p>
                      <span
                        className={`mt-1 inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${statusAccent(item.status)}`}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500">No catalog evidence categories listed.</p>
          )}
        </nav>

        <article
          aria-label="Selected evidence detail"
          className={`${cbaiGlassCard} space-y-3 p-5`}
        >
          <p className={cbaiSectionEyebrow}>Selected evidence</p>
          {selectedEvidence ? (
            <>
              <h3 className="text-lg font-semibold text-zinc-100">{selectedEvidence.label}</h3>
              <span
                className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusAccent(selectedEvidence.status)}`}
              >
                {STATUS_LABELS[selectedEvidence.status]}
              </span>
              <p className="text-sm leading-relaxed text-zinc-400">{selectedEvidence.note}</p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">No evidence category is available to select.</p>
          )}

          <div className="border-t border-zinc-800/80 pt-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Future evidence connection
            </p>
            <ul className="mt-2 space-y-1.5">
              {limitations.map((limitation) => (
                <li key={limitation} className="flex items-start gap-2 text-xs text-zinc-500">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <aside aria-label="Review readiness and next actions" className="space-y-4">
          <div className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className={cbaiSectionEyebrow}>Review readiness</p>
            <p className="text-sm font-medium text-zinc-200">{reviewReadiness.statusLabel}</p>
            <p className="text-xs leading-relaxed text-zinc-500">{reviewReadiness.note}</p>
          </div>

          <div className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className={cbaiSectionEyebrow}>Next research action</p>
            <ul className="space-y-1.5">
              {nextActions.map((action) => (
                <li key={action} className="flex items-start gap-2 text-xs text-zinc-400">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500/60" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
