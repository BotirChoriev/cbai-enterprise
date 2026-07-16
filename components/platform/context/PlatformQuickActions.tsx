import Link from "next/link";
import type { RelatedModuleLink } from "@/lib/context";

type PlatformQuickActionsProps = {
  actions: readonly RelatedModuleLink[];
};

export default function PlatformQuickActions({ actions }: PlatformQuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className="rounded-md border border-zinc-700/60 bg-zinc-900/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-teal-500/30 hover:text-teal-300"
          title={action.description}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
