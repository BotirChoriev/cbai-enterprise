import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_TOPIC_STATUS_LABELS } from "@/lib/research/research-topics";

type ResearchDomainMotifProps = {
  topics: readonly ResearchTopic[];
  lineColor: string;
};

const STATUS_ORDER: ResearchTopic["status"][] = [
  "catalog_available",
  "workspace_not_available",
  "evidence_not_connected",
];

// A domain's real topic roster rendered as a status ledger — one row per real status bucket,
// bar length is that bucket's real share of the domain's real topic count. Reused across every
// domain lens rather than hand-drawn per field, so the honesty (never an invented number) is
// structural, not a convention someone can forget to follow next time.
export default function ResearchDomainMotif({ topics, lineColor }: ResearchDomainMotifProps) {
  const width = 300;
  const rowHeight = 26;
  const height = STATUS_ORDER.length * rowHeight + 12;
  const maxBar = width - 100;
  const total = topics.length || 1;

  return (
    <div className="relative mx-auto flex w-full max-w-[340px] items-center justify-center lg:mx-0">
      <svg
        className="relative h-auto w-full max-w-[300px]"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        role="img"
        aria-label={`${topics.length} real topics in this domain, by real catalog status`}
      >
        {STATUS_ORDER.map((status, index) => {
          const count = topics.filter((t) => t.status === status).length;
          const y = index * rowHeight + 10;
          const barLength = Math.max(2, (count / total) * maxBar);
          return (
            <g key={status}>
              <text x="0" y={y - 6} fontSize="9" className="fill-zinc-500" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {RESEARCH_TOPIC_STATUS_LABELS[status]}
              </text>
              <line x1="0" y1={y} x2={width - 40} y2={y} stroke={lineColor} strokeOpacity="0.15" strokeWidth="6" strokeLinecap="round" />
              <line x1="0" y1={y} x2={barLength} y2={y} stroke={lineColor} strokeOpacity="0.85" strokeWidth="6" strokeLinecap="round" />
              <text x={width - 34} y={y + 3} fontSize="11" fontWeight="600" className="fill-zinc-300">
                {count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
