"use client";

import { cbaiPageHeader } from "@/components/brand/brand-classes";

type EntityPageHeaderProps = {
  title: string;
  description: string;
};

/** One page header pattern for all entity registry routes (countries, companies, universities). */
export default function EntityPageHeader({ title, description }: EntityPageHeaderProps) {
  return (
    <header className={cbaiPageHeader}>
      <h1 className="cbai-display text-2xl text-zinc-50">{title}</h1>
      <p className="mt-1 max-w-3xl text-sm text-zinc-500">{description}</p>
    </header>
  );
}
