import type { SearchInsight } from "@/lib/global-search";

type SearchInsightPanelProps = {
  insight: SearchInsight;
};

export default function SearchInsightPanel({ insight }: SearchInsightPanelProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-400" />
          </span>
          <h3 className="text-sm font-semibold text-zinc-50">CBAI Search Insight</h3>
        </div>
        <p className="mt-1 text-xs text-zinc-500">AI-powered result analysis</p>
      </div>

      <div className="space-y-5 p-5">
        <section>
          <p className="text-sm leading-relaxed text-zinc-300">{insight.summary}</p>
        </section>

        {insight.topMatches.length > 0 && (
          <section>
            <h4 className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              Top Matches
            </h4>
            <ul className="space-y-2">
              {insight.topMatches.map((match, i) => (
                <li
                  key={match}
                  className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
                >
                  <span className="font-mono text-[10px] text-violet-400">{i + 1}</span>
                  <span className="text-xs text-zinc-300">{match}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {insight.patterns.length > 0 && (
          <section>
            <h4 className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              Patterns Found
            </h4>
            <ul className="space-y-1.5">
              {insight.patterns.map((pattern) => (
                <li
                  key={pattern}
                  className="flex items-start gap-2 text-xs text-zinc-400"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                  {pattern}
                </li>
              ))}
            </ul>
          </section>
        )}

        {insight.suggestedActions.length > 0 && (
          <section>
            <h4 className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              Suggested Next Actions
            </h4>
            <ul className="space-y-1.5">
              {insight.suggestedActions.map((action) => (
                <li
                  key={action}
                  className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50 hover:text-zinc-200"
                >
                  <svg
                    className="h-3 w-3 shrink-0 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                  {action}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="border-t border-zinc-800 px-5 py-3">
        <p className="font-mono text-[10px] text-zinc-600">
          CBAI Core · Mock search intelligence · Confidence: 91.3%
        </p>
      </div>
    </div>
  );
}
