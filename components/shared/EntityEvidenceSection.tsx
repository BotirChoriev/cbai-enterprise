import EntityProfileSection from "@/components/shared/EntityProfileSection";

type EntityEvidenceSectionProps = {
  connectedCount: number;
  sourceConnectedCount: number;
  totalSources: number;
};

export default function EntityEvidenceSection({
  connectedCount,
  sourceConnectedCount,
  totalSources,
}: EntityEvidenceSectionProps) {
  return (
    <EntityProfileSection
      id="evidence"
      title="Evidence"
      nextStep={{ label: "Missing evidence →", href: "#missing-evidence" }}
    >
      <div className="grid gap-3 grid-cols-2">
        <div className="rounded-lg bg-zinc-900/50 px-4 py-3">
          <p className="text-xs text-zinc-600">Connected evidence</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-zinc-100">
            {connectedCount}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-900/50 px-4 py-3">
          <p className="text-xs text-zinc-600">Source status</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-zinc-100">
            {sourceConnectedCount}
            <span className="text-sm font-normal text-zinc-500"> / {totalSources}</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">sources connected</p>
        </div>
      </div>
      <p className="text-sm text-zinc-400">
        You can review {connectedCount} connected item{connectedCount === 1 ? "" : "s"} now.
      </p>
    </EntityProfileSection>
  );
}
