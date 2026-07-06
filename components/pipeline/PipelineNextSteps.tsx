type PipelineNextStepsProps = {
  nextSteps: readonly string[];
  headingId?: string;
};

export default function PipelineNextSteps({
  nextSteps,
  headingId = "pipeline-next-steps-heading",
}: PipelineNextStepsProps) {
  return (
    <section className="space-y-3" aria-labelledby={headingId}>
      <h3
        id={headingId}
        className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
      >
        Next steps
      </h3>
      <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-500">
        {nextSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
