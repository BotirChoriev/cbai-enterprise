import Link from "next/link";
import { hrefForEntity, type LinkableEntityType } from "@/components/shared/resolve-entity-link";

type LinkedNamesListProps = {
  names: readonly string[];
  entityType: LinkableEntityType;
  emptyLabel?: string;
};

/** Comma-separated list of real catalog names, each a real link when a profile exists. */
export default function LinkedNamesList({ names, entityType, emptyLabel = "None indexed" }: LinkedNamesListProps) {
  if (names.length === 0) {
    return <>{emptyLabel}</>;
  }

  return (
    <span className="flex flex-wrap gap-x-1.5 gap-y-1">
      {names.map((name, index) => {
        const href = hrefForEntity(entityType, name);
        return (
          <span key={name}>
            {href ? (
              <Link href={href} className="text-cyan-400 hover:text-cyan-300">
                {name}
              </Link>
            ) : (
              name
            )}
            {index < names.length - 1 ? "," : ""}
          </span>
        );
      })}
    </span>
  );
}
