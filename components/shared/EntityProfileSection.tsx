import Link from "next/link";
import type { ReactNode } from "react";

type EntityProfileSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  nextStep?: {
    label: string;
    href: string;
  };
};

export default function EntityProfileSection({
  id,
  title,
  children,
  nextStep,
}: EntityProfileSectionProps) {
  return (
    <section id={id} className="scroll-mt-6 space-y-4" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3
          id={`${id}-heading`}
          className="text-base font-semibold text-zinc-200"
        >
          {title}
        </h3>
        {nextStep ? (
          <Link
            href={nextStep.href}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-teal-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 sm:w-auto"
          >
            {nextStep.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
