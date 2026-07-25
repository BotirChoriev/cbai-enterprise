"use client";

import Link from "next/link";
import {
  ABOUT_IDENTITY_LAST_UPDATED,
  CANONICAL_BRAND_FACTS,
  getCanonicalBrand,
} from "@/lib/brand/canonical-identity";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondary,
  cbaiGlassCard,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

/**
 * Accessible Platform identity section — single source is the brand registry.
 * Voice Operator and About both reference these verified facts.
 */
export default function PlatformIdentitySection() {
  const { language, t } = useTranslation();
  const brand = getCanonicalBrand(language);

  return (
    <section
      id="platform-identity"
      aria-labelledby="platform-identity-heading"
      className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}
      data-platform-identity="canonical"
    >
      <p className={cbaiSectionEyebrow}>{CANONICAL_BRAND_FACTS.publicPlatformName}</p>
      <h2 id="platform-identity-heading" className="cbai-display max-w-3xl text-2xl text-zinc-50 sm:text-3xl">
        {brand.platformIdentityHeading}
      </h2>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">{brand.labelPublicPlatform}</dt>
          <dd className="mt-1 font-medium text-zinc-100">{brand.publicPlatformName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{brand.labelIntelligenceOs}</dt>
          <dd className="mt-1 font-medium text-zinc-100">{brand.productSystemName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{brand.labelFounder}</dt>
          <dd className="mt-1 font-medium text-zinc-100">{brand.founderName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{brand.labelDomain}</dt>
          <dd className="mt-1 font-medium text-zinc-100">{brand.canonicalDomain}</dd>
        </div>
      </dl>
      <p className="max-w-3xl text-base leading-relaxed text-zinc-400">{brand.completeDescription}</p>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">{brand.ownershipOriginStatement}</p>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">{brand.relationship}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-zinc-900/50 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-100">{brand.labelMission}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{brand.mission}</p>
        </div>
        <div className="rounded-lg bg-zinc-900/50 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-100">{brand.labelEvidenceFirst}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{brand.evidenceFirst}</p>
        </div>
        <div className="rounded-lg bg-zinc-900/50 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-100">{brand.labelHumanAuthority}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{brand.humanDecisionAuthority}</p>
        </div>
        <div className="rounded-lg bg-zinc-900/50 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-100">{brand.labelSourceTransparency}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{brand.sourceTransparency}</p>
        </div>
      </div>
      <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 px-5 py-4">
        <p className="text-sm font-semibold text-zinc-100">{brand.labelPrivacyVoice}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{brand.privacyAndVoice}</p>
      </div>
      <p className="text-xs text-zinc-500">
        {brand.labelLastUpdated}: {ABOUT_IDENTITY_LAST_UPDATED}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/trust" className={cbaiBtnPrimary}>
          {t("aboutPage.readTrustCenter")}
        </Link>
        <Link href="/my-work" className={cbaiBtnSecondary}>
          {t("aboutPage.enterCBAI")}
        </Link>
      </div>
    </section>
  );
}
