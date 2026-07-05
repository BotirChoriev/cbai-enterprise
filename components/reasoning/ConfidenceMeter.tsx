"use client";

import type { ConfidenceFactor } from "@/lib/reasoning/reasoning.types";
import { getScoreColor } from "@/lib/entity/entity.helpers";

type ConfidenceMeterProps = {
  confidence: number;
  factors: ConfidenceFactor[];
  visible: boolean;
};

export default function ConfidenceMeter({
  confidence,
  factors,
  visible,
}: ConfidenceMeterProps) {
  if (!visible) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="text-sm font-semibold text-zinc-50">Confidence</h3>
        <p className="mt-2 text-xs text-zinc-500">
          Confidence score computed after pipeline completes.
        </p>
      </div>
    );
  }

  const color = getScoreColor(confidence);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="text-sm font-semibold text-zinc-50">Confidence</h3>

      <div className="mt-4 flex flex-col items-center">
        <div className="relative h-32 w-32">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#27272a"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-mono text-3xl font-bold"
              style={{ color }}
            >
              {confidence}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-600">
              percent
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {factors.map((factor) => (
          <div key={factor.id}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">{factor.label}</span>
              <span
                className="font-mono text-[10px] font-medium"
                style={{ color: getScoreColor(factor.score) }}
              >
                {factor.score}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${factor.score}%`,
                  backgroundColor: getScoreColor(factor.score),
                }}
              />
            </div>
            <p className="mt-0.5 text-[9px] text-zinc-600">{factor.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
