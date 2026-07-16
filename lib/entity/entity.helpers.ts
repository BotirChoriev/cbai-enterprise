import type {
  Entity,
  EntityMetadataValue,
  EntityStatus,
  EntityType,
} from "@/lib/entity/entity.types";
import { ENTITY_MODULE_CONFIGS } from "@/lib/entity/entity.types";

/** Normalize a score to 0–100 range */
export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

/** Color class for score values — inverted flips scale for risk-type scores */
export function getScoreColor(score: number, inverted = false): string {
  const effective = inverted ? 100 - clampScore(score) : clampScore(score);
  if (effective >= 80) return "text-emerald-400";
  if (effective >= 60) return "text-teal-400";
  if (effective >= 40) return "text-amber-400";
  return "text-amber-600";
}

/** Background bar color for score progress indicators */
export function getScoreBarColor(score: number, inverted = false): string {
  const effective = inverted ? 100 - clampScore(score) : clampScore(score);
  if (effective >= 80) return "bg-emerald-500";
  if (effective >= 60) return "bg-teal-500";
  if (effective >= 40) return "bg-amber-500";
  return "bg-amber-600";
}

/** Status badge styling */
export function getStatusConfig(status: EntityStatus): {
  label: string;
  dot: string;
  badge: string;
} {
  const configs: Record<
    EntityStatus,
    { label: string; dot: string; badge: string }
  > = {
    active: {
      label: "Active",
      dot: "bg-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    inactive: {
      label: "Inactive",
      dot: "bg-zinc-500",
      badge: "bg-zinc-500/10 text-zinc-400 border-zinc-700",
    },
    pending: {
      label: "Pending",
      dot: "bg-amber-400",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    archived: {
      label: "Archived",
      dot: "bg-zinc-600",
      badge: "bg-zinc-600/10 text-zinc-500 border-zinc-700",
    },
    monitoring: {
      label: "Monitoring",
      dot: "bg-teal-400 animate-pulse",
      badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    },
  };
  return configs[status];
}

/** Human-readable entity type label */
export function getEntityTypeLabel(type: EntityType): string {
  return ENTITY_MODULE_CONFIGS[type].label;
}

/** Human-readable plural entity type label */
export function getEntityTypePluralLabel(type: EntityType): string {
  return ENTITY_MODULE_CONFIGS[type].pluralLabel;
}

/** Format a metadata value for display */
export function formatMetadataValue(value: EntityMetadataValue): string {
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/** Derive display initials from entity name or icon field */
export function getEntityInitials(entity: Entity): string {
  if (entity.icon) return entity.icon.toUpperCase().slice(0, 3);
  return entity.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

/** Format metric value with optional unit */
export function formatMetricValue(
  value: string | number,
  unit?: string,
): string {
  const formatted =
    typeof value === "number" ? value.toLocaleString() : value;
  return unit ? `${formatted} ${unit}` : formatted;
}

/** Validate entity has required fields (runtime guard for adapters) */
export function isValidEntity(value: unknown): value is Entity {
  if (!value || typeof value !== "object") return false;
  const e = value as Entity;
  return (
    typeof e.id === "string" &&
    typeof e.name === "string" &&
    typeof e.type === "string" &&
    typeof e.overview === "string" &&
    e.scores !== undefined &&
    typeof e.scores.aiScore === "number"
  );
}

/** Create a stable entity slug from name */
export function createEntitySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
