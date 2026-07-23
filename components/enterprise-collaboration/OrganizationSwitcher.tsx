"use client";

import Link from "next/link";
import { useActiveOrganization } from "@/components/enterprise-collaboration/ActiveOrganizationProvider";
import { cbaiFocusRing } from "@/components/brand/brand-classes";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";

export default function OrganizationSwitcher() {
  const {
    organizations,
    activeOrganizationId,
    setActiveOrganization,
    unreadNotifications,
    sharedBackend,
    loading,
  } = useActiveOrganization();

  if (loading) {
    return <span className="hidden text-xs text-zinc-600 lg:inline">Orgs…</span>;
  }

  if (organizations.length === 0) {
    return (
      <Link
        href="/organization"
        className="hidden rounded-lg border border-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:border-teal-500/30 hover:text-teal-300 lg:inline-flex"
      >
        Organizations
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-1.5 lg:flex">
      <label className="sr-only" htmlFor="cbai-org-switcher">
        Active organization
      </label>
      <select
        id="cbai-org-switcher"
        className={`max-w-[10rem] truncate rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-1 text-xs text-zinc-200 ${cbaiFocusRing}`}
        value={activeOrganizationId ?? ""}
        onChange={(e) => {
          void setActiveOrganization(e.target.value || null);
        }}
        title={
          sharedBackend || isOrganizationCollaborationShared()
            ? "Shared organization context"
            : "Device-local organization context — not cross-device"
        }
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
      <Link
        href="/notifications"
        className={`relative rounded-lg border border-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:border-teal-500/30 hover:text-teal-300 ${cbaiFocusRing}`}
        aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ""}`}
      >
        Inbox
        {unreadNotifications > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500/90 px-1 text-[10px] font-semibold text-zinc-950">
            {unreadNotifications > 99 ? "99+" : unreadNotifications}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
