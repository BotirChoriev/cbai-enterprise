import Link from "next/link";
import type { ContextBreadcrumbSegment } from "@/lib/context";

type PlatformBreadcrumbProps = {
  segments: readonly ContextBreadcrumbSegment[];
};

export default function PlatformBreadcrumb({ segments }: PlatformBreadcrumbProps) {
  return (
    <nav aria-label="Platform breadcrumb" className="flex flex-wrap items-center gap-1 text-xs">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <span key={`${segment.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span className="text-zinc-600">→</span>}
            {segment.href && !isLast ? (
              <Link
                href={segment.href}
                className="text-cyan-400 underline-offset-2 hover:underline"
              >
                {segment.label}
              </Link>
            ) : (
              <span className={isLast ? "text-zinc-300" : "text-zinc-500"}>
                {segment.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
