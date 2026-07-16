"use client";

import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import { cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type EntityRelationshipsSectionProps = {
  entityType: "country" | "company" | "university";
  entityId: string;
};

export default function EntityRelationshipsSection({
  entityType,
  entityId,
}: EntityRelationshipsSectionProps) {
  const { t } = useTranslation();
  const relationships = buildEntityRelationships(entityType, entityId);

  const headingKey = `${entityType}Heading` as const;
  const descriptionKey = `${entityType}Description` as const;
  const emptyKey = `${entityType}Empty` as const;
  const headingId = `${entityType}-relationships-heading`;

  const emptyActions =
    entityType === "country"
      ? [
          { label: t("entityRelationships.exploreCompanies"), href: "/companies" },
          { label: t("entityRelationships.exploreUniversities"), href: "/universities" },
        ]
      : entityType === "company"
        ? [
            { label: t("navigation.countries"), href: "/countries" },
            { label: t("entityRelationships.exploreUniversities"), href: "/universities" },
          ]
        : [
            { label: t("navigation.countries"), href: "/countries" },
            { label: t("navigation.companies"), href: "/companies" },
          ];

  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div>
        <h3 id={headingId} className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          {t(`entityRelationships.${headingKey}`)}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">{t(`entityRelationships.${descriptionKey}`)}</p>
      </div>

      <div className={`${cbaiGlassCard} space-y-4 p-6`}>
        <EntityRelatedPanel
          showHeading={false}
          relationships={relationships}
          emptyLabel={t(`entityRelationships.${emptyKey}`)}
          emptyActions={emptyActions}
        />

        {entityType === "company" ? (
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              {t("entityRelationships.partnerClaims")}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {t("entityIntelligence.partnerClaimsNotShownExtended")}
            </p>
          </div>
        ) : null}

        {entityType === "university" ? (
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              {t("entityRelationships.researchPartnerships")}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {t("entityIntelligence.researchPartnershipsNotShownExtended")}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
