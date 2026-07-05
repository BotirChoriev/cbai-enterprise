import type { Entity, EntityMetadataField } from "@/lib/entity/entity.types";
import EntityHeader from "@/components/entity/EntityHeader";
import EntityOverview from "@/components/entity/EntityOverview";
import EntityMetrics from "@/components/entity/EntityMetrics";
import EntityTags from "@/components/entity/EntityTags";
import EntityTimeline from "@/components/entity/EntityTimeline";
import EntityAISummary from "@/components/entity/EntityAISummary";
import EntityScoreCard from "@/components/entity/EntityScoreCard";
import { ENTITY_SCORE_CONFIGS } from "@/lib/entity/entity.types";

type EntityLayoutProps = {
  entity: Entity;
  /** Override metadata field labels and order */
  metadataFields?: EntityMetadataField[];
  /** Optional header action slot (e.g. edit, export) */
  headerAction?: React.ReactNode;
  /** Show full-size score cards below header */
  showScoreCards?: boolean;
  /** AI summary confidence override */
  aiConfidence?: number;
  /** Custom sections injected between standard blocks */
  children?: React.ReactNode;
};

/**
 * Universal entity detail layout.
 * All intelligence modules render through this composition.
 */
export default function EntityLayout({
  entity,
  metadataFields,
  headerAction,
  showScoreCards = false,
  aiConfidence,
  children,
}: EntityLayoutProps) {
  return (
    <div className="space-y-6">
      <EntityHeader entity={entity} action={headerAction} />

      {showScoreCards && (
        <div className="grid gap-4 sm:grid-cols-3">
          {ENTITY_SCORE_CONFIGS.map((config) => (
            <EntityScoreCard
              key={config.key}
              label={config.label}
              score={entity.scores[config.key]}
              inverted={config.inverted}
              description={config.description}
            />
          ))}
        </div>
      )}

      <EntityTags entity={entity} />
      <EntityOverview entity={entity} metadataFields={metadataFields} />
      <EntityMetrics entity={entity} />

      {children}

      <div className="grid gap-6 lg:grid-cols-2">
        <EntityTimeline entity={entity} />
        <EntityAISummary entity={entity} confidence={aiConfidence} />
      </div>
    </div>
  );
}
