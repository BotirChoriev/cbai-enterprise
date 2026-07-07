import type { ReactNode } from "react";

type EntityCompareSectionProps = {
  children: ReactNode;
};

export default function EntityCompareSection({ children }: EntityCompareSectionProps) {
  return (
    <section id="compare" className="scroll-mt-6 space-y-3" aria-labelledby="compare-heading">
      <h3 id="compare-heading" className="text-base font-semibold text-zinc-200">
        Compare evidence
      </h3>
      <p className="text-sm text-zinc-500">Compare evidence for this profile.</p>
      {children}
    </section>
  );
}
