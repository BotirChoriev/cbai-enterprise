type PipelineLimitationsProps = {
  limitations: readonly string[];
  headingId?: string;
};

export default function PipelineLimitations({
  limitations,
  headingId = "pipeline-limitations-heading",
}: PipelineLimitationsProps) {
  return (
    <section className="space-y-3" aria-labelledby={headingId}>
      <h3
        id={headingId}
        className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
      >
        Limitations
      </h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-zinc-500">
        {limitations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
