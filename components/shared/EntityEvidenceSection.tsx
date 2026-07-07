import EntityProfileSection from "@/components/shared/EntityProfileSection";

type EntityEvidenceSectionProps = {
  connectedCount: number;
  sourceConnectedCount: number;
  totalSources: number;
  availableItems?: readonly string[];
};

export default function EntityEvidenceSection({
  connectedCount,
  sourceConnectedCount,
  totalSources,
  availableItems,
}: EntityEvidenceSectionProps) {
  const showItemList = availableItems !== undefined;

  return (
    <EntityProfileSection
      id="evidence"
      title="Available information"
      nextStep={{ label: "Missing information →", href: "#missing-evidence" }}
    >
      {showItemList ? (
        <div className="rounded-lg bg-zinc-900/50 px-4 py-4">
          {availableItems.length > 0 ? (
            <ul className="space-y-1.5 text-sm text-zinc-300">
              {availableItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-emerald-500/90" aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">
              No official information is connected for this profile yet.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-zinc-900/50 px-4 py-3">
            <p className="text-xs text-zinc-600">Available now</p>
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
      )}

      <p className="text-sm text-zinc-400">
        {sourceConnectedCount} of {totalSources} official source
        {totalSources === 1 ? "" : "s"} connected
        {showItemList && connectedCount > 0
          ? ` · ${connectedCount} topic${connectedCount === 1 ? "" : "s"} listed above`
          : showItemList
            ? ""
            : ` · ${connectedCount} topic${connectedCount === 1 ? "" : "s"} available now`}
        .
      </p>
    </EntityProfileSection>
  );
}
