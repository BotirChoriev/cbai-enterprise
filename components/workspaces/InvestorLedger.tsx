import type { WorkspaceCoverageItem } from "@/lib/workspaces";
import { displayStatusLabel } from "@/lib/workspaces";
import { workspaceMotifFill } from "@/components/workspaces/workspace-motif-colors";

type InvestorLedgerProps = {
  domains: readonly WorkspaceCoverageItem[];
};

// Investor's own atmosphere: a due-diligence ledger, not a wheel — diligence is sequential and
// comparative across domains, so each real domain gets one row, and each row's real
// indicator-connection ratio sets the tick length. Indigo instead of Governance's navy+gold or
// Citizen's clay: the one room whose subject is capital, not people or rules.
export default function InvestorLedger({ domains }: InvestorLedgerProps) {
  const width = 300;
  const rowHeight = 20;
  const height = domains.length * rowHeight + 12;
  const labelWidth = 8;
  const maxTick = width - labelWidth - 40;

  return (
    <div className="relative mx-auto flex w-full max-w-[340px] items-center justify-center lg:mx-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[240px] w-[340px] rounded-full bg-[radial-gradient(ellipse,rgba(99,102,241,0.14),transparent_70%)]"
      />
      <svg
        className="relative h-auto w-full max-w-[300px]"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        role="img"
        aria-label={`Investor evidence ledger: ${domains.length} real investment domains, tick length is each domain's real indicator-connection ratio`}
      >
        {domains.map((domain, index) => {
          const y = index * rowHeight + 8;
          const ratio = domain.indicatorCount > 0 ? domain.connectedCount / domain.indicatorCount : 0;
          const tickLength = Math.max(6, ratio * maxTick);
          return (
            <g key={domain.id}>
              <line
                x1={labelWidth}
                y1={y}
                x2={width - 40}
                y2={y}
                stroke="#312e81"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              <line
                x1={labelWidth}
                y1={y}
                x2={labelWidth + tickLength}
                y2={y}
                stroke="#818cf8"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <title>{`${domain.title}: ${displayStatusLabel(domain.statusLabel)}`}</title>
              </line>
              <circle
                cx={labelWidth + tickLength}
                cy={y}
                r="4"
                fill={workspaceMotifFill(domain.statusLabel)}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
