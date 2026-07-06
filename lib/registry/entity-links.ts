import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import type { Country } from "@/lib/countries";
import type { Company } from "@/lib/companies";
import type { University } from "@/lib/universities";
import type { ActiveEntityType, EntityId, EntityLinkGraph } from "@/lib/registry/types";
import {
  buildCompanyEntityId,
  buildCountryEntityId,
  buildUniversityEntityId,
} from "@/lib/registry/entity-id";
import { namesMatch } from "@/lib/name-match";

function resolveCountryEntityIdByName(countryName: string): EntityId | null {
  const country = countries.find((record) => namesMatch(record.name, countryName));
  return country ? buildCountryEntityId(country.id) : null;
}

/** Resolve ISO-style country code from a country display name label. */
export function resolveCountryCodeByName(countryName: string): string {
  const country = countries.find((record) => namesMatch(record.name, countryName));
  return country?.code ?? "";
}

/** Outbound related entity IDs for a country — permanent IDs only. */
export function resolveCountryRelatedEntityIds(country: Country): EntityId[] {
  const related: EntityId[] = [];

  for (const company of companies) {
    if (namesMatch(company.country, country.name)) {
      related.push(buildCompanyEntityId(company.id));
    }
  }

  for (const university of universities) {
    if (namesMatch(university.country, country.name)) {
      related.push(buildUniversityEntityId(university.id));
    }
  }

  return related;
}

/** Outbound related entity IDs for a company. */
export function resolveCompanyRelatedEntityIds(company: Company): EntityId[] {
  const related: EntityId[] = [];
  const countryId = resolveCountryEntityIdByName(company.country);

  if (countryId) {
    related.push(countryId);
  }

  for (const university of universities) {
    if (namesMatch(university.country, company.country)) {
      related.push(buildUniversityEntityId(university.id));
    }
  }

  return related;
}

/** Outbound related entity IDs for a university. */
export function resolveUniversityRelatedEntityIds(university: University): EntityId[] {
  const related: EntityId[] = [];
  const countryId = resolveCountryEntityIdByName(university.country);

  if (countryId) {
    related.push(countryId);
  }

  for (const company of companies) {
    if (namesMatch(company.country, university.country)) {
      related.push(buildCompanyEntityId(company.id));
    }
  }

  return related;
}

/** Resolve outbound links for any active entity type from source registries. */
export function resolveRelatedEntityIds(
  entityType: ActiveEntityType,
  legacyRegistryId: string,
): EntityId[] {
  switch (entityType) {
    case "country": {
      const country = countries.find((record) => record.id === legacyRegistryId);
      return country ? resolveCountryRelatedEntityIds(country) : [];
    }
    case "company": {
      const company = companies.find((record) => record.id === legacyRegistryId);
      return company ? resolveCompanyRelatedEntityIds(company) : [];
    }
    case "university": {
      const university = universities.find((record) => record.id === legacyRegistryId);
      return university ? resolveUniversityRelatedEntityIds(university) : [];
    }
  }
}

/** Build inbound/outbound link graph for one entity. */
export function buildEntityLinkGraph(
  entityId: EntityId,
  allEntities: readonly { entityId: EntityId; relatedEntityIds: readonly EntityId[] }[],
): EntityLinkGraph {
  const record = allEntities.find((entity) => entity.entityId === entityId);
  const outbound = record ? [...record.relatedEntityIds] : [];

  const inbound = allEntities
    .filter((entity) => entity.relatedEntityIds.includes(entityId))
    .map((entity) => entity.entityId);

  return { entityId, outbound, inbound };
}

/** Resolve related entity records by permanent ID list. */
export function resolveLinkedEntities<T extends { entityId: EntityId }>(
  entityIds: readonly EntityId[],
  index: ReadonlyMap<EntityId, T>,
): T[] {
  return entityIds
    .map((id) => index.get(id))
    .filter((entity): entity is T => entity !== undefined);
}
