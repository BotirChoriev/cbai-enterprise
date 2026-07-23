/**
 * billing-admin is a simulated role note — not a real payment authority.
 */
export const BILLING_ADMIN_ROLE_NOTE = {
  roleId: "billing-admin",
  label: "Billing admin (simulated)",
  summary:
    "May view simulated plans, entitlements, usage, and budget caps in TEST MODE. Cannot charge cards, create invoices, or mutate Production billing.",
  neverCharges: true as const,
  productionForbidden: true as const,
};

export function isBillingAdminRoleId(value: unknown): boolean {
  return value === BILLING_ADMIN_ROLE_NOTE.roleId;
}
