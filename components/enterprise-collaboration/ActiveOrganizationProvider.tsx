"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { resolveOrganizationRepository } from "@/lib/persistence/repository-factory";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";
import {
  loadActiveEnterpriseContext,
  saveActiveEnterpriseContext,
  setActiveOrganizationForUser,
} from "@/lib/enterprise-collaboration/active-context";
import { countInboxUnread } from "@/lib/enterprise-collaboration/cloud-persistence";
import type { Organization } from "@/lib/organization-os/organization.types";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";

type ActiveOrganizationValue = {
  readonly organizations: readonly Organization[];
  readonly activeOrganizationId: string | null;
  readonly activeOrganization: Organization | null;
  readonly sharedBackend: boolean;
  readonly unreadNotifications: number;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
  readonly setActiveOrganization: (organizationId: string | null) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const ActiveOrganizationContext = createContext<ActiveOrganizationValue | null>(null);

export function ActiveOrganizationProvider({ children }: { readonly children: ReactNode }) {
  const { cloudUser, isCloudSignedIn, accountMode } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  const [unreadNotifications, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sharedBackend = isOrganizationCollaborationShared() && isCloudSignedIn;
  const userId = cloudUser?.id ?? resolveActorId();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        setOrganizations([]);
        setActiveOrganizationId(null);
        setUnread(0);
        return;
      }
      const repo = resolveOrganizationRepository();
      // Shared claims must use shared repository — never present local orgs as shared truth.
      if (sharedBackend && !repo.isShared) {
        setError("Shared backend required for organization collaboration.");
        setOrganizations([]);
        return;
      }
      const orgs = await repo.listOrganizations(userId);
      setOrganizations([...orgs]);
      const stored = loadActiveEnterpriseContext().organizationId;
      const next =
        stored && orgs.some((o) => o.id === stored) ? stored : orgs[0]?.id ?? null;
      if (next !== stored) {
        saveActiveEnterpriseContext({ organizationId: next });
      }
      setActiveOrganizationId(next);
      setUnread(await countInboxUnread(userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }, [userId, sharedBackend, accountMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setActiveOrganization = useCallback(
    async (organizationId: string | null) => {
      if (!userId) return { ok: false as const, error: "Sign in required." };
      if (organizationId) {
        const allowed = organizations.some((o) => o.id === organizationId);
        if (!allowed) {
          return { ok: false as const, error: "Cannot activate an organization you do not belong to." };
        }
      }
      if (!sharedBackend) {
        const result = setActiveOrganizationForUser(userId, organizationId);
        if ("error" in result) return { ok: false as const, error: result.error };
      } else {
        saveActiveEnterpriseContext({ organizationId });
      }
      // Clear stale entity/workspace lens context on org switch (lenses are not tenants).
      saveActiveEnterpriseContext({
        organizationId,
        workspaceId: null,
        missionId: null,
      });
      setActiveOrganizationId(organizationId);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cbai-active-organization-changed", { detail: { organizationId } }));
      }
      return { ok: true as const };
    },
    [userId, organizations, sharedBackend],
  );

  const value = useMemo<ActiveOrganizationValue>(() => {
    const activeOrganization = organizations.find((o) => o.id === activeOrganizationId) ?? null;
    return {
      organizations,
      activeOrganizationId,
      activeOrganization,
      sharedBackend,
      unreadNotifications,
      loading,
      error,
      refresh,
      setActiveOrganization,
    };
  }, [
    organizations,
    activeOrganizationId,
    sharedBackend,
    unreadNotifications,
    loading,
    error,
    refresh,
    setActiveOrganization,
  ]);

  return (
    <ActiveOrganizationContext.Provider value={value}>{children}</ActiveOrganizationContext.Provider>
  );
}

export function useActiveOrganization(): ActiveOrganizationValue {
  const ctx = useContext(ActiveOrganizationContext);
  if (!ctx) {
    throw new Error("useActiveOrganization must be used within ActiveOrganizationProvider");
  }
  return ctx;
}
