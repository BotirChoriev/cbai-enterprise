import type { ExplorerSourceRow } from "@/lib/evidence-explorer";
import { explorerStatusClass } from "@/lib/evidence-explorer";
import { userConnectionLabel } from "@/components/shared/user-facing-copy";

type EvidenceSourceCoverageProps = {
  sources: readonly ExplorerSourceRow[];
};

export default function EvidenceSourceCoverage({ sources }: EvidenceSourceCoverageProps) {
  return (
    <section className="space-y-4" aria-labelledby="evidence-source-coverage-heading">
      <div>
        <h2
          id="evidence-source-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Source coverage
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Official sources and their connection status.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Organization</th>
              <th className="px-5 py-3 font-medium">Coverage</th>
              <th className="px-5 py-3 font-medium">Related items</th>
              <th className="px-5 py-3 font-medium">Source status</th>
              <th className="px-5 py-3 font-medium">Verification</th>
              <th className="px-5 py-3 font-medium">Update</th>
              <th className="px-5 py-3 font-medium">License</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sources.map((source) => (
              <tr key={source.id} className="align-top">
                <td className="px-5 py-4">
                  <p className="font-semibold text-zinc-100">{source.name}</p>
                  <a
                    href={source.officialWebsite}
                    className="mt-0.5 text-xs text-teal-400 underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official website
                  </a>
                </td>
                <td className="px-5 py-4 text-zinc-400">{source.organization}</td>
                <td className="px-5 py-4 text-xs text-zinc-500">{source.coverage}</td>
                <td className="px-5 py-4 text-zinc-400">
                  {source.supportedIndicatorCount}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${explorerStatusClass(source.connectionLabel)}`}
                  >
                    {userConnectionLabel(source.connectionLabel)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${explorerStatusClass(source.verificationLabel)}`}
                  >
                    {userConnectionLabel(source.verificationLabel)}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-zinc-500">
                  {source.updateFrequency}
                </td>
                <td className="px-5 py-4 text-xs text-zinc-500">{source.license}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
