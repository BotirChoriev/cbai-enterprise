import type {
  EntityPipelineReadinessModel,
  PipelineReadinessModel,
} from "@/lib/pipeline-readiness";
import PipelineStageList from "@/components/pipeline/PipelineStageList";
import PipelineCompatibilityCard from "@/components/pipeline/PipelineCompatibilityCard";
import PipelineLimitations from "@/components/pipeline/PipelineLimitations";
import PipelineNextSteps from "@/components/pipeline/PipelineNextSteps";
import { PipelineStatusBadge } from "@/components/pipeline/PipelineStatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type PipelineReadinessPanelProps = {
  model: PipelineReadinessModel;
  variant?: "full" | "compact";
};

function NormalizationReadiness({
  normalizers,
}: {
  normalizers: PipelineReadinessModel["normalizers"];
}) {
  const readyCount = normalizers.filter((n) => n.state === "ready").length;

  return (
    <section className="space-y-4" aria-labelledby="pipeline-normalization-heading">
      <div>
        <h3
          id="pipeline-normalization-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Normalization readiness
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {readyCount} of {normalizers.length} normalization contracts available in Evidence
          Infrastructure — no live processing.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {normalizers.map((normalizer) => (
          <li
            key={normalizer.normalizerId}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-zinc-300">{normalizer.label}</p>
              <PipelineStatusBadge state={normalizer.state} />
            </div>
            <p className="mt-1 text-xs text-zinc-600">{normalizer.standardReference}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ValidationReadiness({
  rules,
}: {
  rules: PipelineReadinessModel["validationRules"];
}) {
  return (
    <section className="space-y-4" aria-labelledby="pipeline-validation-heading">
      <div>
        <h3
          id="pipeline-validation-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Validation readiness
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {rules.length} declarative validation rules defined for future evidence flow.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {rules.map((rule) => (
          <li
            key={rule.ruleId}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
          >
            <p className="text-sm font-medium text-zinc-300">{rule.label}</p>
            <p className="mt-1 text-xs text-zinc-500">{rule.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EntityPipelineReadinessSection({
  model,
}: {
  model: EntityPipelineReadinessModel;
}) {
  return (
    <section className="space-y-4" aria-labelledby="entity-pipeline-readiness-heading">
      <div>
        <h3
          id="entity-pipeline-readiness-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Pipeline Readiness
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Evidence flow status for this {model.entityLabel} — no score without evidence.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Evidence flow
          </p>
          <div className="mt-2">
            <PipelineStatusBadge state={model.evidenceFlowStatus} />
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Sources connected
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.connectedSourceCount}
            <span className="text-sm font-normal text-zinc-500">
              {" "}
              / {model.totalSourceCount}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Connectors planned
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.plannedConnectorCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Indicators connected
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.indicatorsConnected}
            <span className="text-sm font-normal text-zinc-500">
              {" "}
              / {model.indicatorsTotal}
            </span>
          </p>
        </div>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-600">Source readiness</dt>
          <dd className="mt-1 text-zinc-400">{model.sourceReadinessLabel}</dd>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-600">
            Indicator coverage readiness
          </dt>
          <dd className="mt-1 text-zinc-400">{model.indicatorReadinessLabel}</dd>
        </div>
      </dl>

      <PipelineLimitations
        limitations={model.limitations}
        headingId="entity-pipeline-limitations-heading"
      />
    </section>
  );
}

export default function PipelineReadinessPanel({
  model,
  variant = "full",
}: PipelineReadinessPanelProps) {
  if (variant === "compact") {
    return null;
  }

  const allStages = [
    ...model.readyStages,
    ...model.plannedStages,
    ...model.blockedStages,
  ].sort((a, b) => a.order - b.order);

  return (
    <section className="space-y-8" aria-labelledby="pipeline-readiness-heading">
      <div>
        <h2
          id="pipeline-readiness-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence Pipeline Readiness
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          How official evidence will move through CBAI — validation and source readiness, not
          automated conclusions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader title="Pipeline" />
          <CardContent>
            <p className="text-xs font-mono text-zinc-600">{model.pipelineId}</p>
            <div className="mt-2">
              <PipelineStatusBadge state={model.currentStatus} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Stages defined" />
          <CardContent>
            <p className="text-2xl font-semibold text-zinc-100">{model.stageCount}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {model.readyStages.length} validation ready · {model.plannedStages.length} source
              planned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Connectors" />
          <CardContent>
            <p className="text-2xl font-semibold text-zinc-100">
              {model.connectedConnectors.length}
              <span className="text-sm font-normal text-zinc-500">
                {" "}
                / {model.supportedConnectors.length}
              </span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">connected on pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Scope" />
          <CardContent>
            <p className="text-sm text-zinc-400">
              {model.supportedIndicators} indicators · {model.supportedReports} reports ·{" "}
              {model.supportedWorkspaces} workspaces
            </p>
          </CardContent>
        </Card>
      </div>

      <PipelineStageList stages={allStages} />
      <PipelineCompatibilityCard
        connected={model.connectedConnectors}
        planned={model.plannedConnectors}
      />
      <NormalizationReadiness normalizers={model.normalizers} />
      <ValidationReadiness rules={model.validationRules} />
      <PipelineLimitations limitations={model.limitations} />
      <PipelineNextSteps nextSteps={model.nextSteps} />
    </section>
  );
}
