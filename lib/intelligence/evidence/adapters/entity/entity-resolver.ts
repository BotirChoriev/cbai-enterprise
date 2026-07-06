import { countries } from "@/lib/countries";
import { toCountryEntity, getCountryRelationships } from "@/lib/countries.adapter";
import { companies } from "@/lib/companies";
import { toCompanyEntity, getCompanyRelationships } from "@/lib/companies.adapter";
import { universities } from "@/lib/universities";
import { toUniversityEntity, getUniversityRelationships } from "@/lib/universities.adapter";
import type { EntityRef } from "@/lib/intelligence/request.types";
import {
  entityRefKey,
  isSupportedEntityType,
  type EntityResolutionBatch,
  type EntityResolutionResult,
  type SupportedEntityType,
} from "@/lib/intelligence/evidence/adapters/entity/types";

/**
 * Read-only resolver mapping {@link EntityRef} to universal {@link Entity}
 * records via existing domain data and adapters.
 */
export class EntityResolver {
  /**
   * Resolve all subject entities from a request scope.
   *
   * Duplicate refs are deduplicated by `{type}:{id}`. Unsupported types and
   * missing records produce warnings — never errors or fabricated entities.
   */
  resolveSubjectEntities(refs: EntityRef[] | undefined): EntityResolutionBatch {
    if (!refs || refs.length === 0) {
      return { resolved: [], warnings: [] };
    }

    const seen = new Set<string>();
    const resolved: EntityResolutionBatch["resolved"] = [];
    const warnings: string[] = [];

    for (const ref of refs) {
      const key = entityRefKey(ref);

      if (seen.has(key)) {
        warnings.push(`duplicate-subject-entity:${key}`);
        continue;
      }

      seen.add(key);

      const result = this.resolveRef(ref);

      warnings.push(...result.warnings);

      if (result.entity) {
        resolved.push({
          entity: result.entity,
          relationshipsSummary: result.relationshipsSummary,
          refKey: key,
        });
      }
    }

    return { resolved, warnings };
  }

  /**
   * Resolve a single entity reference.
   */
  resolveRef(ref: EntityRef): EntityResolutionResult {
    const refKey = entityRefKey(ref);
    const warnings: string[] = [];

    if (!isSupportedEntityType(ref.type)) {
      warnings.push(`entity-type-not-connected:${ref.type}:${ref.id}`);
      return { refKey, ref, warnings };
    }

    const lookup = this.lookupSupportedEntity(ref.type, ref.id);

    if (!lookup) {
      warnings.push(`entity-not-found:${ref.type}:${ref.id}`);
      return { refKey, ref, warnings };
    }

    if (ref.name && ref.name !== lookup.entity.name) {
      warnings.push(
        `entity-name-mismatch:${refKey}:requested="${ref.name}":resolved="${lookup.entity.name}"`,
      );
    }

    return {
      refKey,
      ref,
      entity: lookup.entity,
      relationshipsSummary: lookup.relationshipsSummary,
      warnings,
    };
  }

  private lookupSupportedEntity(
    type: SupportedEntityType,
    id: string,
  ): { entity: import("@/lib/entity/entity.types").Entity; relationshipsSummary?: string } | null {
    switch (type) {
      case "country": {
        const country = countries.find((c) => c.id === id);
        if (!country) return null;
        const rels = getCountryRelationships(country);
        return {
          entity: toCountryEntity(country),
          relationshipsSummary: formatCountryRelationships(rels),
        };
      }
      case "company": {
        const company = companies.find((c) => c.id === id);
        if (!company) return null;
        const rels = getCompanyRelationships(company);
        return {
          entity: toCompanyEntity(company),
          relationshipsSummary: formatCompanyRelationships(rels),
        };
      }
      case "university": {
        const university = universities.find((u) => u.id === id);
        if (!university) return null;
        const rels = getUniversityRelationships(university);
        return {
          entity: toUniversityEntity(university),
          relationshipsSummary: formatUniversityRelationships(rels),
        };
      }
      default:
        return null;
    }
  }
}

function formatCountryRelationships(rels: ReturnType<typeof getCountryRelationships>): string {
  return [
    `Related companies: ${joinOrNone(rels.relatedCompanies)}.`,
    `Universities: ${joinOrNone(rels.universities)}.`,
    `Government: ${joinOrNone(rels.government)}.`,
    `Industries: ${joinOrNone(rels.industries)}.`,
  ].join(" ");
}

function formatCompanyRelationships(rels: ReturnType<typeof getCompanyRelationships>): string {
  return [
    `Headquarters country: ${rels.headquartersCountry ?? "none linked"}.`,
    `Universities (same country catalog): ${joinOrNone(rels.universities)}.`,
    `Partner companies: ${joinOrNone(rels.partnerCompanies)}.`,
    `Competitor companies: ${joinOrNone(rels.competitorCompanies)}.`,
  ].join(" ");
}

function formatUniversityRelationships(
  rels: ReturnType<typeof getUniversityRelationships>,
): string {
  return [
    `Country: ${rels.country ?? "none linked"}.`,
    `Companies (same country catalog): ${joinOrNone(rels.companies)}.`,
    `Research centers: ${joinOrNone(rels.researchCenters)}.`,
    `Government: ${joinOrNone(rels.government)}.`,
  ].join(" ");
}

function joinOrNone(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "none listed";
}

/** Shared default resolver singleton. */
export const defaultEntityResolver = new EntityResolver();
