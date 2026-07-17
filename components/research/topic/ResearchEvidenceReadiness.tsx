"use client";

import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  getExperimentReadinessForTopic,
  getLaboratoryReadinessForTopic,
  getPublicationReadinessForTopic,
  EXPERIMENT_LAYER_SOURCE_STATUS_LABELS,
  LABORATORY_LAYER_SOURCE_STATUS_LABELS,
  PUBLICATION_LAYER_SOURCE_STATUS_LABELS,
} from "@/lib/research";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type EvidenceCardProps = {
  title: string;
  status: string;
  supported: string;
  limitation: string;
  statusLabel: string;
  willSupportLabel: string;
  limitationLabel: string;
  humanReviewLabel: string;
};

function EvidenceReadinessCard({
  title,
  status,
  supported,
  limitation,
  statusLabel,
  willSupportLabel,
  limitationLabel,
  humanReviewLabel,
}: EvidenceCardProps) {
  return (
    <article className={`${cbaiGlassCard} flex flex-col p-4`}>
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      <dl className="mt-3 flex-1 space-y-3 text-xs">
        <div>
          <dt className="font-medium uppercase tracking-wider text-zinc-600">{statusLabel}</dt>
          <dd className="mt-1 text-zinc-400">{status}</dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wider text-zinc-600">{willSupportLabel}</dt>
          <dd className="mt-1 leading-relaxed text-zinc-400">{supported}</dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wider text-zinc-600">{limitationLabel}</dt>
          <dd className="mt-1 leading-relaxed text-zinc-500">{limitation}</dd>
        </div>
      </dl>
      <p className="mt-4 border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-600">
        {humanReviewLabel}
      </p>
    </article>
  );
}

type ResearchEvidenceReadinessProps = {
  topic: ResearchTopic;
};

export default function ResearchEvidenceReadiness({ topic }: ResearchEvidenceReadinessProps) {
  const { t } = useTranslation();
  const publication = getPublicationReadinessForTopic(topic);
  const experiment = getExperimentReadinessForTopic(topic);
  const laboratory = getLaboratoryReadinessForTopic(topic);

  const cardLabels = {
    statusLabel: t("researchTopicCompletion.status"),
    willSupportLabel: t("researchTopicCompletion.willSupport"),
    limitationLabel: t("researchTopicCompletion.currentLimitation"),
    humanReviewLabel: t("researchTopicCompletion.humanReviewBeforeDecision"),
  };

  return (
    <section aria-labelledby="topic-evidence-readiness-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>{t("researchTopicCompletion.evidenceReadinessEyebrow")}</p>
        <h2 id="topic-evidence-readiness-heading" className="text-xl font-semibold text-zinc-100">
          {t("researchTopicCompletion.evidenceReadinessTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {t("researchTopicCompletion.evidenceReadinessDetail")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <EvidenceReadinessCard
          title={t("researchTopicCompletion.publications")}
          status={PUBLICATION_LAYER_SOURCE_STATUS_LABELS[publication.layer.sourceStatus]}
          supported={publication.layer.futureCapabilities.slice(0, 2).join(". ")}
          limitation={
            publication.layer.limitations[0] ??
            t("researchTopicCompletion.publicationLimitationFallback")
          }
          {...cardLabels}
        />
        <EvidenceReadinessCard
          title={t("researchTopicCompletion.experiments")}
          status={EXPERIMENT_LAYER_SOURCE_STATUS_LABELS[experiment.layer.sourceStatus]}
          supported={
            experiment.layer.negativeResultsSupported && experiment.layer.replicationSupported
              ? `${experiment.layer.futureCapabilities[0]}. Variables, replication, and negative results.`
              : experiment.layer.futureCapabilities.slice(0, 2).join(". ")
          }
          limitation={
            experiment.layer.limitations[0] ??
            t("researchTopicCompletion.experimentLimitationFallback")
          }
          {...cardLabels}
        />
        <EvidenceReadinessCard
          title={t("researchTopicCompletion.laboratories")}
          status={LABORATORY_LAYER_SOURCE_STATUS_LABELS[laboratory.layer.sourceStatus]}
          supported={
            laboratory.layer.equipmentSupported && laboratory.layer.safetyEthicsSupported
              ? `${laboratory.layer.futureCapabilities[0]}. Equipment, safety, and ethics metadata.`
              : laboratory.layer.futureCapabilities.slice(0, 2).join(". ")
          }
          limitation={
            laboratory.layer.limitations[0] ??
            t("researchTopicCompletion.laboratoryLimitationFallback")
          }
          {...cardLabels}
        />
      </div>
    </section>
  );
}
