"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getAdaptiveWorkspaceCopy } from "@/lib/i18n/platform-copy-adaptive-workspace";
import { CANONICAL_BRAND_FACTS } from "@/lib/brand/canonical-identity";
import {
  DEFAULT_NEW_WORK_PRIVACY,
  describeDiscoveryCapability,
  listPublicActivity,
} from "@/lib/discovery/global-activity";
import {
  cbaiEmptyDashed,
  cbaiLinkAction,
  cbaiPageHeader,
  cbaiSectionEyebrow,
  cbaiSectionTitle,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

/**
 * Global Activity / Discovery — opted-in public content only.
 * No fabricated popularity or demo feed items.
 */
export default function GlobalActivityClient() {
  const { language, t } = useTranslation();
  const copy = getAdaptiveWorkspaceCopy(language);
  const publicItems = listPublicActivity([]);
  const capability = describeDiscoveryCapability({ publicItemCount: publicItems.length });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <header className={cbaiPageHeader}>
        <p className={cbaiSectionEyebrow}>{CANONICAL_BRAND_FACTS.publicPlatformName}</p>
        <h1 className="cbai-display text-2xl font-semibold tracking-tight text-[color:var(--cbai-text-primary)] sm:text-3xl">
          {copy.discoveryTitle}
        </h1>
        <p className={`max-w-3xl ${cbaiTextBody}`}>{copy.discoveryDescription}</p>
        <p className={`mt-2 max-w-3xl ${cbaiTextMuted}`}>{copy.discoveryVsSearch}</p>
      </header>

      <section
        aria-labelledby="discovery-feed"
        data-discovery-capability={capability}
        data-default-privacy={DEFAULT_NEW_WORK_PRIVACY}
      >
        <h2 id="discovery-feed" className={cbaiSectionTitle}>
          {copy.discoveryTitle}
        </h2>
        {publicItems.length === 0 ? (
          <div className={`mt-3 ${cbaiEmptyDashed}`}>
            <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{copy.discoveryEmpty}</p>
            <p className={`mt-2 ${cbaiTextBody}`}>{copy.discoveryEmptyDetail}</p>
            <p className={`mt-3 ${cbaiTextMuted}`}>
              {copy.privacyPrivate} → {copy.privacyPublic} only after explicit confirmation.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/search" className={`min-h-11 inline-flex items-center underline underline-offset-4 ${cbaiLinkAction}`}>
                {t("navigation.search")}
              </Link>
              <Link href="/my-work" className={`min-h-11 inline-flex items-center underline underline-offset-4 ${cbaiLinkAction}`}>
                {copy.pageTitle}
              </Link>
              <Link href="/notifications" className={`min-h-11 inline-flex items-center underline underline-offset-4 ${cbaiLinkAction}`}>
                {copy.followAction}
              </Link>
              <Link href="/countries" className={`min-h-11 inline-flex items-center underline underline-offset-4 ${cbaiLinkAction}`}>
                {copy.openAction}
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {publicItems.map((item) => (
              <li key={item.id}>
                <Link href={item.openHref} className={cbaiLinkAction}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
