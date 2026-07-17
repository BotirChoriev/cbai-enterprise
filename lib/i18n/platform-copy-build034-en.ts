/** BUILD-034 — Organization workspace UI copy (English). */

export const ORG_WORKSPACE_EN = {
  pageEyebrow: "Organization OS",
  persistenceSharedReady:
    "Shared backend configured. Organization records sync through Supabase with RLS when signed in.",
  persistenceMisconfigured:
    "Shared backend misconfigured — organization data remains device-local only.",
  persistenceDeviceLocal:
    "Shared backend not configured — organization data is device-local only. Multi-user collaboration requires Supabase setup.",
  inviteTokenPresent:
    "Invitation token present — accept from the account matching the invited email on this device.",
  createHeading: "Create organization",
  identityWarning:
    'User-created workspace only. Naming "NASA", "WHO", or another real institution does not verify official representation.',
  nameLabel: "Name",
  typeLabel: "Type",
  createButton: "Create organization",
  nameRequired: "Organization name is required.",
  orgCreated:
    'Organization "{name}" created. This is a user workspace — not an officially verified institution.',
  memberCount: "{count} member(s)",
  missionsLabel: "Missions",
  missionsLinked: "Linked via mission context",
  membersLabel: "Members",
  pendingInvitesLabel: "Pending invites",
  inviteHeading: "Invite member",
  emailLabel: "Email",
  createInviteLink: "Create invitation link",
  emailNotSent: "Email transport not connected — invitation link only.",
  inviteCreated: "Invitation created. Email was not sent — copy this link: {link}",
  auditHeading: "Audit",
  workspaceOrganization: "workspace_organization",
} as const;
