/**
 * Global Activity / Discovery — opted-in public content only.
 *
 * Never fabricates popularity, views, reactions, or activity. Until real public
 * items exist, the feed is honestly empty.
 */

export type ActivityObjectType =
  | "public_project"
  | "public_research"
  | "public_report"
  | "public_group"
  | "public_meeting"
  | "public_image"
  | "public_video"
  | "country"
  | "company"
  | "university"
  | "research_topic";

export type ActivityVisibility = "private" | "shared" | "public";

export type GlobalActivityItem = {
  readonly id: string;
  readonly actorOrOrganization: string;
  readonly objectType: ActivityObjectType;
  readonly title: string;
  readonly shortDescription: string;
  readonly sourceProvenance: string;
  readonly publishedOrUpdatedAt: string;
  readonly language: string;
  readonly evidenceStatus: "verified" | "partial" | "unverified" | "unavailable";
  readonly visibility: ActivityVisibility;
  readonly relatedEntityOrTopic: string | null;
  readonly openHref: string;
};

export type FollowTargetType =
  | "public_project"
  | "public_research"
  | "public_report"
  | "public_group"
  | "public_meeting"
  | "public_image"
  | "public_video"
  | "country"
  | "company"
  | "university"
  | "research_topic"
  | "indicator";

export type DigestPreference = "immediate" | "daily" | "weekly" | "off";

/**
 * Discovery only lists items that are explicitly public.
 * Seed catalogs (countries etc.) are followable, but are not “activity events”.
 */
export function listPublicActivity(items: readonly GlobalActivityItem[]): readonly GlobalActivityItem[] {
  return items.filter((item) => item.visibility === "public");
}

export function describeDiscoveryCapability(input: {
  readonly publicItemCount: number;
}): "empty" | "populated" {
  return input.publicItemCount > 0 ? "populated" : "empty";
}

export const DEFAULT_NEW_WORK_PRIVACY: ActivityVisibility = "private";
