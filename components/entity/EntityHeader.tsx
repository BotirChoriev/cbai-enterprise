import Image from "next/image";
import type { EntityComponentProps } from "@/lib/entity/entity.types";
import {
  getEntityInitials,
  getEntityTypeLabel,
  getStatusConfig,
} from "@/lib/entity/entity.helpers";
import {
  entityTypeAccents,
  entityTypeIconPaths,
} from "@/lib/entity/entity.icons";
import EntityScoreCard from "@/components/entity/EntityScoreCard";
import EntityIcon from "@/components/entity/EntityIcon";
import { ENTITY_SCORE_CONFIGS } from "@/lib/entity/entity.types";

type EntityHeaderProps = EntityComponentProps & {
  action?: React.ReactNode;
};

export default function EntityHeader({ entity, action }: EntityHeaderProps) {
  const status = getStatusConfig(entity.status);
  const accent = entityTypeAccents[entity.type];
  const initials = getEntityInitials(entity);

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/5 via-violet-500/5 to-cyan-500/5"
      />

      <div className="relative border-b border-zinc-800 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            {entity.logo ? (
              <Image
                src={entity.logo}
                alt={`${entity.name} logo`}
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl border border-zinc-800 object-cover"
              />
            ) : (
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-xl border font-mono text-lg font-bold ${accent}`}
              >
                {initials}
              </span>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${accent}`}
                >
                  <EntityIcon
                    path={entityTypeIconPaths[entity.type]}
                    className="h-3 w-3"
                  />
                  {getEntityTypeLabel(entity.type)}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${status.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">
                {entity.name}
              </h2>
              {entity.subtitle && (
                <p className="mt-0.5 text-sm text-zinc-500">{entity.subtitle}</p>
              )}
              <p className="mt-1 text-xs text-zinc-600">{entity.category}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {ENTITY_SCORE_CONFIGS.map((config) => (
              <EntityScoreCard
                key={config.key}
                label={config.label}
                score={entity.scores[config.key]}
                inverted={config.inverted}
                compact
              />
            ))}
            {action}
          </div>
        </div>
      </div>
    </div>
  );
}
