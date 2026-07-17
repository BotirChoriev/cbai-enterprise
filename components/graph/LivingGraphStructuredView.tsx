"use client";

import type { LivingGraphProjection } from "@/lib/living-graph/living-graph-projection";
import { resolveLivingObject } from "@/lib/living-object-network/living-object-resolver";
import { getCurrentUserId } from "@/lib/auth/auth-store";
import { cbaiFocusRing, cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type LivingGraphStructuredViewProps = {
  readonly projection: LivingGraphProjection;
  readonly selectedNodeId: string | null;
  readonly onSelectNode: (nodeId: string | null) => void;
};

export default function LivingGraphStructuredView({
  projection,
  selectedNodeId,
  onSelectNode,
}: LivingGraphStructuredViewProps) {
  const { t } = useTranslation();
  const actorId = getCurrentUserId();

  if (projection.emptyReason) {
    return (
      <section className={`${cbaiGlassCard} p-4`} aria-live="polite">
        <p className="text-sm text-zinc-400">{projection.emptyReason}</p>
      </section>
    );
  }

  return (
    <section
      className={`${cbaiGlassCard} space-y-4 p-4`}
      aria-labelledby="living-graph-structured-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="living-graph-structured-heading" className="text-sm font-semibold text-zinc-100">
          Canonical relationships
        </h2>
        <p className="text-[10px] text-zinc-600">
          {projection.nodes.length} nodes · {projection.edges.length} edges ·{" "}
          {projection.projectionMs.toFixed(1)}ms
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Nodes</h3>
          <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto" role="listbox" aria-label="Graph nodes">
            {projection.nodes.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedNodeId === node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`${cbaiFocusRing} w-full rounded-md border px-3 py-2 text-left text-xs ${
                    selectedNodeId === node.id
                      ? "border-teal-500/40 bg-teal-500/10 text-zinc-100"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="font-medium">{node.label}</span>
                  <span className="mt-0.5 block text-[10px] text-zinc-600">
                    {node.objectType} · {node.lifecycleState} · {node.trustState}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Relationships</h3>
          <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
            {projection.edges.map((edge) => (
              <li key={edge.id} className="rounded-md border border-zinc-800/80 px-3 py-2 text-[10px] text-zinc-500">
                {edge.sourceNodeId} → {edge.relationshipType} → {edge.targetNodeId}
                <span className="block text-zinc-600">{edge.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {selectedNodeId ? (
        <div className="border-t border-zinc-800/60 pt-3 text-xs text-zinc-400">
          {(() => {
            const node = projection.nodes.find((n) => n.id === selectedNodeId);
            if (!node) return null;
            const resolved = resolveLivingObject(node.reference, actorId);
            if (!resolved.ok) return <p>{resolved.message}</p>;
            return (
              <>
                <p className="font-medium text-zinc-200">{resolved.object.label}</p>
                <p className="mt-1">{t("knowledgeBrain.provenance")}: {resolved.object.provenanceAvailable ? "available" : "unavailable"}</p>
                <p>{t("knowledgeBrain.limitations")}: {resolved.object.limitations.join("; ") || "—"}</p>
                {resolved.object.nextAction ? (
                  <p className="mt-1 text-teal-400/90">{resolved.object.nextAction}</p>
                ) : null}
              </>
            );
          })()}
        </div>
      ) : null}
    </section>
  );
}
