import type { PipelineConnectorReadiness } from "@/lib/pipeline-readiness";

type PipelineCompatibilityCardProps = {
  connected: readonly PipelineConnectorReadiness[];
  planned: readonly PipelineConnectorReadiness[];
};

function ConnectionLabel({ label }: { label: PipelineConnectorReadiness["connectionLabel"] }) {
  const className =
    label === "Connected"
      ? "text-teal-400 bg-teal-500/10 border-teal-500/20"
      : label === "Evidence source planned"
        ? "text-violet-400 bg-violet-500/10 border-violet-500/20"
        : "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";

  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${className}`}
    >
      {label}
    </span>
  );
}

export default function PipelineCompatibilityCard({
  connected,
  planned,
}: PipelineCompatibilityCardProps) {
  return (
    <section className="space-y-4" aria-labelledby="pipeline-compatibility-heading">
      <div>
        <h3
          id="pipeline-compatibility-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Connector compatibility
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Official connectors registered on the evidence pipeline — honest connection status only.
        </p>
      </div>

      {connected.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Connected
          </p>
          <ul className="space-y-2">
            {connected.map((connector) => (
              <li
                key={connector.connectorId}
                className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">{connector.connectorName}</p>
                  <p className="text-xs font-mono text-zinc-600">{connector.connectorId}</p>
                </div>
                <ConnectionLabel label={connector.connectionLabel} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
          Planned ({planned.length})
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {planned.map((connector) => (
            <li
              key={connector.connectorId}
              className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-300">
                  {connector.connectorName}
                </p>
              </div>
              <ConnectionLabel label={connector.connectionLabel} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
