import Link from "next/link";
import { SEARCH_EXPLORE_CATEGORIES } from "@/lib/search-gateway";
import { EVIDENCE_NOT_CONNECTED_LABEL } from "@/lib/platform-home";
import HomeModuleIcon from "@/components/platform/home/HomeModuleIcon";
import type { HomeModuleIconId } from "@/lib/platform-home";

const iconByCategory: Record<string, HomeModuleIconId> = {
  countries: "countries",
  companies: "companies",
  universities: "universities",
  governance: "governance",
  procurement: "search",
  "human-rights": "governance",
  infrastructure: "graph",
  economy: "reasoning",
  education: "universities",
};

const linkClass =
  "flex min-h-[4.5rem] flex-col justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

const disabledClass =
  "flex min-h-[4.5rem] flex-col justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 px-4 py-3 text-left opacity-90";

export default function SearchExploreByCategory() {
  return (
    <ul
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Explore by category"
    >
      {SEARCH_EXPLORE_CATEGORIES.map((category) => {
        const icon = iconByCategory[category.id] ?? "search";
        const href =
          category.href ??
          (category.searchQuery
            ? `/search?q=${encodeURIComponent(category.searchQuery)}`
            : undefined);

        if (!category.connected || !href) {
          return (
            <li key={category.id}>
              <div className={disabledClass}>
                <CategoryContent
                  label={category.label}
                  icon={icon}
                  status={EVIDENCE_NOT_CONNECTED_LABEL}
                />
              </div>
            </li>
          );
        }

        return (
          <li key={category.id}>
            <Link href={href} className={linkClass}>
              <CategoryContent label={category.label} icon={icon} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function CategoryContent({
  label,
  icon,
  status,
}: {
  label: string;
  icon: HomeModuleIconId;
  status?: string;
}) {
  return (
    <>
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-100">
        <HomeModuleIcon name={icon} className="h-4 w-4 text-zinc-500" />
        {label}
      </span>
      {status ? (
        <span className="mt-1 text-xs text-zinc-600">{status}</span>
      ) : null}
    </>
  );
}
