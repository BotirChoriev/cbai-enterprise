import type { GovernanceRuleCategoryRow } from "@/lib/governance-control-center";

type GovernancePillarsProps = {
  categories: readonly GovernanceRuleCategoryRow[];
};

// Governance's own atmosphere (OS Bible Part IX.9.4 / XVI: each room shares the kernel, not the
// mood). Research is a colorful, organic lattice; Governance is symmetrical and load-bearing —
// real rule categories rendered as pillars, height driven by each category's real rule count,
// never an invented number. Navy + gold rather than the open emerald field elsewhere: the two
// colors the Design Bible reserves for depth/infrastructure and "exceptional, load-bearing" —
// exactly what a rule registry is.
export default function GovernancePillars({ categories }: GovernancePillarsProps) {
  const maxCount = Math.max(...categories.map((c) => c.ruleCount), 1);
  const width = 460;
  const height = 244;
  const topMargin = 34;
  const baseline = height - 34;
  const gap = 14;
  const pillarWidth = (width - gap * (categories.length - 1)) / categories.length;

  return (
    <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center lg:mx-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[320px] w-[420px] rounded-full bg-[radial-gradient(ellipse,rgba(198,149,47,0.14),transparent_70%)]"
      />
      <svg
        className="relative h-auto w-full max-w-[460px]"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        role="img"
        aria-label={`Governance rule registry: ${categories.length} categories, ${categories.reduce((sum, c) => sum + c.ruleCount, 0)} real rules, height proportional to each category's real rule count`}
      >
        <line x1="0" y1={baseline} x2={width} y2={baseline} stroke="#c6952f" strokeWidth="1" opacity="0.35" />
        {categories.map((cat, index) => {
          const pillarHeight = 26 + (cat.ruleCount / maxCount) * (baseline - topMargin - 26);
          const x = index * (pillarWidth + gap);
          const y = baseline - pillarHeight;
          return (
            <g key={cat.category}>
              <rect x={x} y={y} width={pillarWidth} height={pillarHeight} fill="url(#pillar-gradient)" opacity="0.92" />
              <rect x={x} y={y} width={pillarWidth} height="3" fill="#f3d38a" />
              <text
                x={x + pillarWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="fill-[#c6952f]"
                fontSize="13"
                fontWeight="600"
              >
                {cat.ruleCount}
              </text>
              <text
                x={x + pillarWidth / 2}
                y={baseline + 16}
                textAnchor="middle"
                className="fill-zinc-500"
                fontSize="9"
                style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
              >
                {cat.label.length > 12 ? `${cat.label.slice(0, 11)}…` : cat.label}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="pillar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a3f5c" />
            <stop offset="100%" stopColor="#0e1b2a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
