"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  MODULE_ACCOUNTABILITY,
  toExtendedAccountability,
  type ModuleAccountabilityEntry,
} from "@/lib/intelligence-os/module-accountability";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const LIVE_ROUTES = MODULE_ACCOUNTABILITY.filter((m) => m.maturity === "live" || m.maturity === "partial");

function AccountabilityCard({ entry }: { entry: ModuleAccountabilityEntry }) {
  const { t } = useTranslation();
  const ext = toExtendedAccountability(entry);

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-200">{entry.moduleName}</h3>
        <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
          {entry.maturity}
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-zinc-600">{t("moduleAccountabilityUi.purpose")}</dt>
          <dd className="text-zinc-400">{ext.purpose}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">{t("moduleAccountabilityUi.input")}</dt>
          <dd className="text-zinc-400">{ext.input}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">{t("moduleAccountabilityUi.processing")}</dt>
          <dd className="text-zinc-400">{ext.processing}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">{t("moduleAccountabilityUi.output")}</dt>
          <dd className="text-zinc-400">{ext.output}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">{t("moduleAccountabilityUi.limitations")}</dt>
          <dd className="text-zinc-400">{ext.limitations}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">{t("moduleAccountabilityUi.storage")}</dt>
          <dd className="text-zinc-400">{ext.storage}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-zinc-500">
        {t("moduleAccountabilityUi.nextAction")}: {ext.nextAction}
      </p>
      {entry.maturity === "live" || entry.maturity === "partial" ? (
        <Link href={entry.route} className="mt-2 inline-block text-xs text-teal-400 hover:text-teal-300">
          {entry.route} →
        </Link>
      ) : null}
    </article>
  );
}

export default function ModuleAccountabilityPanel() {
  const { t } = useTranslation();

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-6`} aria-labelledby="module-accountability-heading">
      <p className={cbaiSectionEyebrow}>{t("moduleAccountabilityUi.eyebrow")}</p>
      <h2 id="module-accountability-heading" className="text-lg font-semibold text-zinc-100">
        {t("moduleAccountabilityUi.title")}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {LIVE_ROUTES.map((entry) => (
          <AccountabilityCard key={entry.route} entry={entry} />
        ))}
      </div>
    </section>
  );
}
