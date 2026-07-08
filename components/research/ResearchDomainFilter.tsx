import type { ResearchDomainId } from "@/lib/research/research-topics";
import { RESEARCH_DOMAINS } from "@/lib/research/research-topics";

type ResearchDomainFilterProps = {
  selectedDomain: ResearchDomainId | "all";
  onSelectDomain: (domainId: ResearchDomainId | "all") => void;
  topicCounts: Record<ResearchDomainId, number>;
};

export default function ResearchDomainFilter({
  selectedDomain,
  onSelectDomain,
  topicCounts,
}: ResearchDomainFilterProps) {
  const totalCount = Object.values(topicCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-400/90">
        Filter by domain
      </p>
      <ul className="flex flex-wrap gap-2">
        <li>
          <button
            type="button"
            onClick={() => onSelectDomain("all")}
            className={`min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedDomain === "all"
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                : "border-zinc-800 bg-slate-950/60 text-zinc-400 hover:border-cyan-500/20 hover:text-zinc-200"
            }`}
          >
            All domains
            <span className="ml-1.5 text-xs text-zinc-500">({totalCount})</span>
          </button>
        </li>
        {RESEARCH_DOMAINS.map((domain) => (
          <li key={domain.domainId}>
            <button
              type="button"
              onClick={() => onSelectDomain(domain.domainId)}
              className={`min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedDomain === domain.domainId
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : "border-zinc-800 bg-slate-950/60 text-zinc-400 hover:border-cyan-500/20 hover:text-zinc-200"
              }`}
            >
              {domain.domainName}
              <span className="ml-1.5 text-xs text-zinc-500">({topicCounts[domain.domainId]})</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
