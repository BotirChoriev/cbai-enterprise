import Link from "next/link";
import type { LandscapeObject } from "@/lib/research/landscape/landscape-types";
import { LANDSCAPE_STATUS_LABELS } from "@/lib/research/landscape/landscape-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type LandscapeObjectCardProps = {
  object: LandscapeObject;
  compact?: boolean;
  onSelectTopic?: (topicId: string) => void;
};

function statusClass(status: LandscapeObject["status"]): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "future_workspace":
      return "border-teal-500/30 bg-teal-500/10 text-teal-300";
    case "not_connected_yet":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

export default function LandscapeObjectCard({
  object,
  compact = false,
  onSelectTopic,
}: LandscapeObjectCardProps) {
  const body = (
    <>
      <p className={`font-medium text-zinc-100 ${compact ? "text-[11px]" : "text-xs"}`}>
        {object.label}
      </p>
      {object.description && !compact ? (
        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-zinc-500">
          {object.description}
        </p>
      ) : null}
      <span
        className={`mt-2 inline-flex rounded border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${statusClass(object.status)}`}
      >
        {LANDSCAPE_STATUS_LABELS[object.status]}
      </span>
    </>
  );

  const className = `${cbaiGlassCard} min-w-[7.5rem] max-w-[11rem] flex-1 p-2.5 transition-colors hover:border-teal-500/20`;

  if (object.topicId && onSelectTopic) {
    return (
      <button
        type="button"
        onClick={() => onSelectTopic(object.topicId!)}
        className={`${className} text-left`}
      >
        {body}
      </button>
    );
  }

  if (object.href) {
    return (
      <Link href={object.href} className={`${className} block`}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}
