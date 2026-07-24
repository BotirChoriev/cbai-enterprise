import type { WorkspaceCoverageItem } from "@/lib/workspaces";
import { displayStatusLabel } from "@/lib/workspaces";
import { workspaceMotifFill } from "@/components/workspaces/workspace-motif-colors";

type GovernmentGridProps = {
  domains: readonly WorkspaceCoverageItem[];
  ariaLabel: string;
};

// Government's own atmosphere: a ledger of institutional cells, not a wheel or a ladder — every
// domain is an equal-weight civic register, filed side by side. Cool slate-teal, and mostly
// hollow on purpose: this workspace's real domainsWithEvidence count is low, and an honest motif
// shows that plainly rather than dressing up an empty registry as a full one.
export default function GovernmentGrid({ domains, ariaLabel }: GovernmentGridProps) {
  const cols = 4;
  const cell = 58;
  const gap = 10;
  const rows = Math.ceil(domains.length / cols);
  const width = cols * cell + (cols - 1) * gap;
  const height = rows * cell + (rows - 1) * gap;

  const withEvidence = domains.filter(
    (d) => d.statusLabel === "Connected" || d.statusLabel === "Available Information",
  ).length;

  return (
    <div className="relative mx-auto flex w-full max-w-[300px] items-center justify-center lg:mx-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[240px] w-[280px] rounded-full bg-[radial-gradient(ellipse,rgba(45,127,127,0.14),transparent_70%)]"
      />
      <svg
        className="relative h-auto w-full max-w-[260px]"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        role="img"
        aria-label={ariaLabel
          .replace("{domainCount}", String(domains.length))
          .replace("{withEvidence}", String(withEvidence))}
      >
        {domains.map((domain, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = col * (cell + gap);
          const y = row * (cell + gap);
          const hasEvidence =
            domain.statusLabel === "Connected" || domain.statusLabel === "Available Information";
          const color = workspaceMotifFill(domain.statusLabel);
          return (
            <g key={domain.id}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                rx="6"
                fill={hasEvidence ? color : "transparent"}
                fillOpacity={hasEvidence ? 0.16 : 1}
                stroke={color}
                strokeOpacity={hasEvidence ? 0.8 : 0.35}
                strokeWidth="1.5"
              >
                <title>{`${domain.title}: ${displayStatusLabel(domain.statusLabel)}`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
