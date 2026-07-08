import {
  listResearchEntityTypes,
  listSeededResearchEntityTypes,
} from "@/lib/research/entities";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function ResearchEntityTypeOverview() {
  const entityTypes = listResearchEntityTypes();
  const seededTypes = new Set(listSeededResearchEntityTypes());

  return (
    <div className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow}>Entity types</p>
        <h3 className="text-base font-semibold text-zinc-100">Supported research object types</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Architecture preview for the Global Living Research Graph — not connected yet.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {entityTypes.map((typeDef) => {
          const hasSeed = seededTypes.has(typeDef.entityType);
          return (
            <li key={typeDef.entityType}>
              <div className={`${cbaiGlassCard} p-3`}>
                <p className="text-sm font-medium text-zinc-200">{typeDef.displayName}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{typeDef.description}</p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  {hasSeed ? "Seed catalog reference" : "Type defined · not connected yet"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
