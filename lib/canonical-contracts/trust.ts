/**
 * Auth / collaboration / publication trust interfaces (Stage 1).
 * Documents SF-1…SF-5 as unresolved production blockers — does not implement fixes.
 */

export type TrustTier =
  | "guest_public"
  | "personal_cabinet"
  | "team"
  | "publication"
  | "forensics";

export type SecurityFreezeId = "SF-1" | "SF-2" | "SF-3" | "SF-4" | "SF-5";

export type SecurityFreezeRecord = {
  readonly id: SecurityFreezeId;
  readonly title: string;
  readonly productionBlocker: true;
  readonly stage1MayDefineInterfacesOnly: true;
  readonly mustNotBypassInStage1: true;
};

export const SECURITY_FREEZE_BLOCKERS: readonly SecurityFreezeRecord[] = [
  {
    id: "SF-1",
    title: "Voice broker origin-only mint (no end-user auth / rate limits)",
    productionBlocker: true,
    stage1MayDefineInterfacesOnly: true,
    mustNotBypassInStage1: true,
  },
  {
    id: "SF-2",
    title: "Device-local identity is not team/collaboration authorization",
    productionBlocker: true,
    stage1MayDefineInterfacesOnly: true,
    mustNotBypassInStage1: true,
  },
  {
    id: "SF-3",
    title: "Client-writable audit history lacks append-only integrity",
    productionBlocker: true,
    stage1MayDefineInterfacesOnly: true,
    mustNotBypassInStage1: true,
  },
  {
    id: "SF-4",
    title: "Incomplete IDOR / RLS / object authorization for multi-user cloud",
    productionBlocker: true,
    stage1MayDefineInterfacesOnly: true,
    mustNotBypassInStage1: true,
  },
  {
    id: "SF-5",
    title: "Publication rights/consent workflow not durable",
    productionBlocker: true,
    stage1MayDefineInterfacesOnly: true,
    mustNotBypassInStage1: true,
  },
] as const;

export type PublicationRightsStub = {
  readonly visibility: "private" | "team" | "public";
  readonly rightsConfirmed: boolean;
  readonly authorshipConfirmed: boolean;
  readonly copyrightConfirmed: boolean;
  readonly humanConfirmationRequired: true;
  readonly voiceLevel3SingleShotPublishForbidden: true;
};

export type CollaborationTrustStub = {
  readonly tier: TrustTier;
  readonly deviceLocalSatisfiesTeamAuth: false;
  readonly cloudRequiredForSharedProduction: boolean;
};
