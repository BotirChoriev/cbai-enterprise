import type { ReactNode } from "react";

type EntitySupportingDetailsProps = {
  children: ReactNode;
};

export default function EntitySupportingDetails({ children }: EntitySupportingDetailsProps) {
  return (
    <details className="group rounded-xl border border-zinc-800 bg-zinc-950/40">
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-zinc-400 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="group-open:text-zinc-300">Supporting information</span>
        <span className="ml-2 text-xs text-zinc-600">pipeline · indicators · comparison · timeline</span>
      </summary>
      <div className="space-y-8 border-t border-zinc-800 px-5 py-6">{children}</div>
    </details>
  );
}
