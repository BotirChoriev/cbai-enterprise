import type { UniversityRelationships } from "@/lib/universities.adapter";
import {
  formatRelationshipAvailability,
} from "@/lib/universities.adapter";
import {
  NOT_CONNECTED_SOURCE_LABEL,
  RELATIONSHIP_NOT_CONNECTED_LABEL,
} from "@/lib/universities.intelligence";

type UniversityRelationshipsProps = {
  relationships: UniversityRelationships;
};

type RelationshipSection = {
  key: keyof UniversityRelationships;
  title: string;
  icon: React.ReactNode;
  accent: string;
  unavailableWhenEmpty?: boolean;
  singleValue?: boolean;
};

const sections: RelationshipSection[] = [
  {
    key: "country",
    title: "Country",
    singleValue: true,
    accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    ),
  },
  {
    key: "companies",
    title: "Companies",
    accent: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
      />
    ),
  },
  {
    key: "researchCenters",
    title: "Research Centers",
    accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    unavailableWhenEmpty: true,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    ),
  },
  {
    key: "government",
    title: "Government",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
  },
];

function renderSectionItems(
  key: keyof UniversityRelationships,
  relationships: UniversityRelationships,
): string[] {
  const value = relationships[key];
  if (key === "country") {
    return value ? [value as string] : [];
  }
  return value as string[];
}

export default function UniversityRelationships({
  relationships,
}: UniversityRelationshipsProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-6 py-4">
        <h3 className="text-sm font-semibold text-zinc-50">Linked Records</h3>
        <p className="text-xs text-zinc-500">
          Relationships derived from local country and company catalogs only
        </p>
      </div>

      <div className="grid gap-px bg-zinc-800 sm:grid-cols-2">
        {sections.map((section) => {
          const items = renderSectionItems(section.key, relationships);
          const showUnavailable =
            section.unavailableWhenEmpty && items.length === 0;

          return (
            <div key={section.key} className="bg-zinc-950 p-5">
              <div className="mb-3 flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border ${section.accent}`}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    {section.icon}
                  </svg>
                </div>
                <h4 className="text-xs font-semibold text-zinc-300">
                  {section.title}
                </h4>
                <span className="ml-auto font-mono text-[10px] text-zinc-600">
                  {showUnavailable
                    ? "N/A"
                    : formatRelationshipAvailability(items.length)}
                </span>
              </div>

              {showUnavailable ? (
                <p className="text-sm text-zinc-500">
                  {RELATIONSHIP_NOT_CONNECTED_LABEL}
                </p>
              ) : items.length === 0 ? (
                <p className="text-sm text-zinc-500">{NOT_CONNECTED_SOURCE_LABEL}</p>
              ) : (
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm text-zinc-400"
                    >
                      <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
