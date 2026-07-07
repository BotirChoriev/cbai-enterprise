import type { ReactNode } from "react";

type EntitySupportingDetailsProps = {
  children: ReactNode;
};

export default function EntitySupportingDetails({ children }: EntitySupportingDetailsProps) {
  return (
    <details id="compare" className="group scroll-mt-6 rounded-xl border border-zinc-800 bg-zinc-950/40">
      <summary className="cursor-pointer list-none px-4 py-4 text-sm font-medium text-zinc-400 marker:content-none sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="group-open:text-zinc-300">More detail</span>
        <span className="ml-2 hidden text-xs text-zinc-600 sm:inline">
          compare evidence · indicators · timeline
        </span>
      </summary>
      <div className="space-y-8 border-t border-zinc-800 px-4 py-6 sm:px-5">{children}</div>
    </details>
  );
}
