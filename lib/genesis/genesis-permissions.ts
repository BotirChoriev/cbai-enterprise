/**
 * Device-local permission capability checks — honest limitations when backend is unavailable.
 */

export const PERMISSION_CAPABILITIES = [
  "View",
  "Create",
  "Edit",
  "Assign",
  "Comment",
  "Submit Evidence",
  "Review",
  "Approve",
  "Publish",
  "Generate Report",
  "Manage Team",
  "Manage Organization",
  "View Monitoring",
  "Manage Opportunity",
  "Express Interest",
] as const;

export type PermissionCapability = (typeof PERMISSION_CAPABILITIES)[number];

export type GenesisPermissionContext = {
  readonly actorId: string;
  readonly organizationId?: string | null;
  readonly isOwner?: boolean;
  readonly isMember?: boolean;
  readonly deviceLocalMode: boolean;
};

export type PermissionCheckResult = {
  readonly allowed: boolean;
  readonly capability: PermissionCapability;
  readonly reason: string;
  readonly deviceLocalDisclaimer?: string;
};

const DEVICE_LOCAL_DISCLAIMER =
  "Device-local mode — permissions are not enforced across users or devices. Do not claim server authorization.";

export function checkGenesisPermission(
  capability: PermissionCapability,
  ctx: GenesisPermissionContext,
): PermissionCheckResult {
  if (!ctx.actorId.trim()) {
    return { allowed: false, capability, reason: "Actor identity required." };
  }

  if (ctx.deviceLocalMode) {
    const restricted: PermissionCapability[] = ["Approve", "Publish", "Manage Organization"];
    if (restricted.includes(capability) && !ctx.isOwner && !ctx.isMember) {
      return {
        allowed: false,
        capability,
        reason: "Action requires organization membership (device-local check only).",
        deviceLocalDisclaimer: DEVICE_LOCAL_DISCLAIMER,
      };
    }
    return {
      allowed: true,
      capability,
      reason: "Allowed in device-local demonstration mode.",
      deviceLocalDisclaimer: DEVICE_LOCAL_DISCLAIMER,
    };
  }

  return {
    allowed: ctx.isOwner || ctx.isMember === true,
    capability,
    reason: ctx.isOwner || ctx.isMember ? "Membership grants capability." : "Requires backend authorization.",
  };
}

export function isDeviceLocalMode(): boolean {
  if (typeof window === "undefined") return true;
  return !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
}
