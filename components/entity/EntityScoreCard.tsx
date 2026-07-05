import { getScoreColor } from "@/lib/entity/entity.helpers";

type EntityScoreCardProps = {
  label: string;
  score: number;
  inverted?: boolean;
  description?: string;
  compact?: boolean;
};

export default function EntityScoreCard({
  label,
  score,
  inverted = false,
  description,
  compact = false,
}: EntityScoreCardProps) {
  const colorClass = getScoreColor(score, inverted);

  if (compact) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-center min-w-[80px]">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
          {label}
        </p>
        <p className={`mt-0.5 font-mono text-lg font-semibold ${colorClass}`}>
          {score}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className={`mt-2 font-mono text-3xl font-semibold tracking-tight ${colorClass}`}>
        {score}
      </p>
      {description && (
        <p className="mt-1 text-xs text-zinc-600">{description}</p>
      )}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${inverted ? "bg-amber-500" : "bg-sky-500"}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
