import type { ReactNode } from "react";

type EntityCompareSectionProps = {
  children: ReactNode;
  heading?: string;
  description?: string;
};

export default function EntityCompareSection({
  children,
  heading = "Compare",
  description = "Side-by-side official information for this profile.",
}: EntityCompareSectionProps) {
  return (
    <section id="compare" className="scroll-mt-6 space-y-3" aria-labelledby="compare-heading">
      <h3 id="compare-heading" className="text-base font-semibold text-zinc-200">
        {heading}
      </h3>
      <p className="text-sm text-zinc-500">{description}</p>
      {children}
    </section>
  );
}
