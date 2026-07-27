"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import { buildResearchLinkedWorkDraft } from "@/lib/operational-objects/linked-work-draft";
import { RESEARCH_PIPELINE_STAGES } from "@/lib/research/research-pipeline";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnSecondarySm, cbaiFocusRing, cbaiMineralPanel, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { emitPlatformActionResult } from "@/lib/platform-actions/action-result-events";

type ResearchPipelineBoardProps = {
  readonly topicId: string;
  readonly topicName: string;
};

export default function ResearchPipelineBoard({ topicId, topicName }: ResearchPipelineBoardProps) {
  const { t, language } = useTranslation();
  const pathname = usePathname();
  const operationalObjects = useOperationalObjectsOptional();

  function openStage(stageId: string) {
    const stage = RESEARCH_PIPELINE_STAGES.find((item) => item.id === stageId);
    if (!stage || !operationalObjects) return;
    const preset = stage.preset ?? "research_question";
    const { draft, inferredFields } = buildResearchLinkedWorkDraft(
      {
        topicId,
        topicName,
        routePath: pathname || `/research/${topicId}`,
      },
      preset,
      language,
    );
    operationalObjects.openComposer(
      {
        ...draft,
        type: stage.draftType,
        nextAction: t(stage.nextActionKey),
        assumptions: [t(stage.honestyKey)],
        missingInformation: [t("operationalObject.pipelineUnknownsDefault")],
      },
      inferredFields,
      "existing_object",
    );
    emitPlatformActionResult({
      kind: "draft_prepared",
      actionId: "operational_object.compose",
      message: stage.id,
      href: pathname || `/research/${topicId}`,
    });
  }

  return (
    <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-research-pipeline="">
      <div>
        <p className={cbaiSectionEyebrow}>{t("operationalObject.pipelineEyebrow")}</p>
        <h2 className="text-sm font-semibold text-[var(--cbai-text-primary)]">{t("operationalObject.pipelineTitle")}</h2>
        <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{t("operationalObject.pipelineIntro")}</p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2">
        {RESEARCH_PIPELINE_STAGES.map((stage, index) => (
          <li key={stage.id} className="rounded-md border border-[var(--cbai-border-default)] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-[var(--cbai-text-muted)]">
              {index + 1}. {t(stage.labelKey)}
            </p>
            <p className="mt-1 text-[11px] text-[var(--cbai-text-secondary)]">{t(stage.honestyKey)}</p>
            <button
              type="button"
              className={`mt-2 ${cbaiBtnSecondarySm} ${cbaiFocusRing}`}
              data-cbai-pipeline-stage={stage.id}
              onClick={() => openStage(stage.id)}
            >
              {t(stage.nextActionKey)}
            </button>
          </li>
        ))}
      </ol>
      <p className="text-[11px] text-[var(--cbai-text-muted)]">
        <Link href="/scientific-documents" className="text-[var(--cbai-accent-primary)] underline">
          {t("operationalObject.pipelineOpenIntake")}
        </Link>
      </p>
    </section>
  );
}
