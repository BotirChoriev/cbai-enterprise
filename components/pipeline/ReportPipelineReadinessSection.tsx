import type { ReportPipelineReadinessModel } from "@/lib/pipeline-readiness";
import { PipelineStatusBadge } from "@/components/pipeline/PipelineStatusBadge";
import PipelineLimitations from "@/components/pipeline/PipelineLimitations";
import PipelineNextSteps from "@/components/pipeline/PipelineNextSteps";

type ReportPipelineReadinessSectionProps = {
  model: ReportPipelineReadinessModel;
};

export default function ReportPipelineReadinessSection({
  model,
}: ReportPipelineReadinessSectionProps) {
  return (
    <section className="space-y-6" aria-labelledby="report-pipeline-readiness-heading">
      <div>
        <h2
          id="report-pipeline-readiness-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Report Pipeline Readiness
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Which report types are ready for evidence flow — export remains planned.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PipelineStatusBadge state={model.currentStatus} />
          <span className="text-xs text-zinc-600">
            Export: {model.exportStatus}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {model.reports.map((report) => (
          <div
            key={report.reportId}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{report.title}</h3>
                <p className="mt-1 text-xs text-zinc-600">{report.reportId}</p>
              </div>
              <PipelineStatusBadge state={report.pipelineState} />
            </div>
            <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-zinc-500">Source readiness</dt>
                <dd className="mt-1 text-zinc-400">{report.evidenceLabel}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Connector dependency</dt>
                <dd className="mt-1 text-zinc-400">{report.connectorDependency}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Export</dt>
                <dd className="mt-1 text-zinc-400">{report.exportLabel}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <PipelineLimitations
        limitations={model.limitations}
        headingId="report-pipeline-limitations-heading"
      />
      <PipelineNextSteps
        nextSteps={model.nextSteps}
        headingId="report-pipeline-next-steps-heading"
      />
    </section>
  );
}
