import type { CompanyRelationships } from "@/lib/companies";

type CompanyRelationshipsProps = {
  relationships: CompanyRelationships;
};

type RelationshipSection = {
  key: keyof CompanyRelationships;
  title: string;
  icon: React.ReactNode;
  accent: string;
};

const sections: RelationshipSection[] = [
  {
    key: "competitors",
    title: "Competitors",
    accent: "text-red-400 bg-red-500/10 border-red-500/20",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    ),
  },
  {
    key: "partners",
    title: "Partners",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    ),
  },
  {
    key: "relatedCountries",
    title: "Related Countries",
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
    key: "relatedUniversities",
    title: "Related Universities",
    accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a2.25 2.25 0 002.25 2.25H15a2.25 2.25 0 002.25-2.25V9.75A2.25 2.25 0 0015 7.5h-6A2.25 2.25 0 006.75 9.75V15z"
      />
    ),
  },
];

export default function CompanyRelationships({
  relationships,
}: CompanyRelationshipsProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-6 py-4">
        <h3 className="text-sm font-semibold text-zinc-50">
          Company Relationships
        </h3>
        <p className="text-xs text-zinc-500">
          Cross-entity intelligence graph
        </p>
      </div>

      <div className="grid gap-px bg-zinc-800 sm:grid-cols-2">
        {sections.map((section) => {
          const items = relationships[section.key];
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
                  {items.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50 hover:text-zinc-200"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
