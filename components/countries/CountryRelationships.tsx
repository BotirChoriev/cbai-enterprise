import type { CountryRelationships } from "@/lib/countries.adapter";

type CountryRelationshipsProps = {
  relationships: CountryRelationships;
  businessOpportunities: string[];
};

type RelationshipSection = {
  key: keyof CountryRelationships;
  title: string;
  icon: React.ReactNode;
  accent: string;
};

const sections: RelationshipSection[] = [
  {
    key: "relatedCompanies",
    title: "Related Companies",
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
    key: "universities",
    title: "Universities",
    accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a2.25 2.25 0 002.25 2.25H15a2.25 2.25 0 002.25-2.25V9.75A2.25 2.25 0 0015 7.5h-6A2.25 2.25 0 006.75 9.75V15z"
      />
    ),
  },
  {
    key: "government",
    title: "Government",
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
      />
    ),
  },
  {
    key: "industries",
    title: "Industries",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
      />
    ),
  },
];

export default function CountryRelationships({
  relationships,
  businessOpportunities,
}: CountryRelationshipsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h3 className="text-sm font-semibold text-zinc-50">
            Country Relationships
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

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
          </div>
          <h4 className="text-xs font-semibold text-zinc-300">
            Business Opportunities
          </h4>
          <span className="ml-auto font-mono text-[10px] text-zinc-600">
            {businessOpportunities.length}
          </span>
        </div>
        <ul className="space-y-1.5">
          {businessOpportunities.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50 hover:text-zinc-200"
            >
              <span className="mt-1.5 font-mono text-[10px] text-zinc-600">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
