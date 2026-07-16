"use client";

import { cbaiPageHeader, cbaiTextMuted } from "@/components/brand/brand-classes";

type EntityPageHeaderProps = {
  title: string;
  description: string;
};

/** One page header pattern for all entity registry routes (countries, companies, universities). */
export default function EntityPageHeader({ title, description }: EntityPageHeaderProps) {
  return (
    <header className={`${cbaiPageHeader} flex flex-col gap-1.5`}>
      <h1 className="cbai-display text-2xl text-zinc-50">{title}</h1>
      <p className={`max-w-3xl line-clamp-2 ${cbaiTextMuted}`}>{description}</p>
    </header>
  );
}
