import Link from "next/link";
import type { RelatedModuleLink } from "@/lib/context";

type RelatedModulesProps = {
  modules: readonly RelatedModuleLink[];
};

export default function RelatedModules({ modules }: RelatedModulesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {modules.map((mod) => (
        <Link
          key={mod.id}
          href={mod.href}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[11px] text-zinc-400 transition-colors hover:border-cyan-500/20 hover:text-cyan-300"
          title={mod.description}
        >
          {mod.label}
        </Link>
      ))}
    </div>
  );
}
