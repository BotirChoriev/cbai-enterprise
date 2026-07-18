"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildPlatformContext,
  parseContextParams,
  loadRecentEntities,
  loadPinnedEntities,
  pinEntity,
  unpinEntity,
  recordRecentEntity,
  resolveEntityRef,
  serializeContextToParams,
  workspaceIdFromPath,
  type ContextEntityRef,
  type EntityKind,
  type PlatformContextSnapshot,
  type WorkspaceId,
} from "@/lib/context";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";

type PlatformContextValue = {
  context: PlatformContextSnapshot;
  setCountry: (id: string | null) => void;
  setCompany: (id: string | null) => void;
  setUniversity: (id: string | null) => void;
  setWorkspace: (workspace: WorkspaceId | null) => void;
  setSearchQuery: (query: string) => void;
  recordEntityView: (entity: ContextEntityRef) => void;
  navigateWithContext: (path: string, overrides?: Partial<PlatformContextSnapshot>) => void;
  pinEntityToWorkspace: (entity: ContextEntityRef) => void;
  unpinEntityFromWorkspace: (kind: ContextEntityRef["kind"], id: string) => void;
  isEntityPinned: (kind: ContextEntityRef["kind"], id: string) => boolean;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

function buildQueryString(
  snapshot: Pick<
    PlatformContextSnapshot,
    "country" | "company" | "university" | "workspace" | "searchQuery"
  >,
  operating?: { missionId?: string | null; projectId?: string | null },
): string {
  const params = new URLSearchParams(
    serializeContextToParams({
      ...snapshot,
      missionId: operating?.missionId ?? null,
      projectId: operating?.projectId ?? null,
    }),
  );
  return params.toString();
}

export function PlatformContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recentEntities, setRecentEntities] = useState<ContextEntityRef[]>(() =>
    loadRecentEntities(),
  );
  const [pinnedEntities, setPinnedEntities] = useState<ContextEntityRef[]>(() =>
    loadPinnedEntities(),
  );

  const params = useMemo(
    () => parseContextParams(searchParams),
    [searchParams],
  );

  const context = useMemo(() => {
    const workspaceFromRoute = workspaceIdFromPath(pathname);
    return {
      ...buildPlatformContext(
        {
          ...params,
          workspace: params.workspace ?? workspaceFromRoute,
        },
        pathname,
      ),
      recentEntities,
      pinnedEntities,
    };
  }, [params, pathname, recentEntities, pinnedEntities]);

  const operatingParams = useMemo(
    () => ({
      missionId: params.mission ?? null,
      projectId: params.project ?? null,
    }),
    [params.mission, params.project],
  );

  const pushContext = useCallback(
    (
      next: Pick<
        PlatformContextSnapshot,
        "country" | "company" | "university" | "workspace" | "searchQuery"
      >,
    ) => {
      const query = buildQueryString(next, operatingParams);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, operatingParams],
  );

  const setEntity = useCallback(
    (kind: EntityKind, id: string | null) => {
      const next = {
        country: kind === "country" ? (id ? resolveEntityRef("country", id) : null) : context.country,
        company: kind === "company" ? (id ? resolveEntityRef("company", id) : null) : context.company,
        university:
          kind === "university"
            ? id
              ? resolveEntityRef("university", id)
              : null
            : context.university,
        workspace: context.workspace,
        searchQuery: context.searchQuery,
      };
      pushContext(next);
    },
    [context, pushContext],
  );

  const setCountry = useCallback((id: string | null) => setEntity("country", id), [setEntity]);
  const setCompany = useCallback((id: string | null) => setEntity("company", id), [setEntity]);
  const setUniversity = useCallback(
    (id: string | null) => setEntity("university", id),
    [setEntity],
  );

  const setWorkspace = useCallback(
    (workspace: WorkspaceId | null) => {
      pushContext({
        country: context.country,
        company: context.company,
        university: context.university,
        workspace,
        searchQuery: context.searchQuery,
      });
    },
    [context, pushContext],
  );

  const setSearchQuery = useCallback(
    (query: string) => {
      pushContext({
        country: context.country,
        company: context.company,
        university: context.university,
        workspace: context.workspace,
        searchQuery: query,
      });
    },
    [context, pushContext],
  );

  const recordEntityView = useCallback((entity: ContextEntityRef) => {
    setRecentEntities(recordRecentEntity(entity));
  }, []);

  const pinEntityToWorkspace = useCallback((entity: ContextEntityRef) => {
    setPinnedEntities(pinEntity(entity));
    notifyMissionDataChanged("bookmark");
  }, []);

  const unpinEntityFromWorkspace = useCallback((kind: ContextEntityRef["kind"], id: string) => {
    setPinnedEntities(unpinEntity(kind, id));
    notifyMissionDataChanged("bookmark");
  }, []);

  const isEntityPinned = useCallback(
    (kind: ContextEntityRef["kind"], id: string) =>
      pinnedEntities.some((entity) => entity.kind === kind && entity.id === id),
    [pinnedEntities],
  );

  const navigateWithContext = useCallback(
    (path: string, overrides?: Partial<PlatformContextSnapshot>) => {
      const merged = {
        country: overrides?.country ?? context.country,
        company: overrides?.company ?? context.company,
        university: overrides?.university ?? context.university,
        workspace: overrides?.workspace ?? context.workspace,
        searchQuery: overrides?.searchQuery ?? context.searchQuery,
      };
      const query = buildQueryString(merged, operatingParams);
      router.push(query ? `${path}?${query}` : path);
    },
    [context, router, operatingParams],
  );

  const value = useMemo<PlatformContextValue>(
    () => ({
      context,
      setCountry,
      setCompany,
      setUniversity,
      setWorkspace,
      setSearchQuery,
      recordEntityView,
      navigateWithContext,
      pinEntityToWorkspace,
      unpinEntityFromWorkspace,
      isEntityPinned,
    }),
    [
      context,
      setCountry,
      setCompany,
      setUniversity,
      setWorkspace,
      setSearchQuery,
      recordEntityView,
      navigateWithContext,
      pinEntityToWorkspace,
      unpinEntityFromWorkspace,
      isEntityPinned,
    ],
  );

  return (
    <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
  );
}

export function usePlatformContext(): PlatformContextValue {
  const value = useContext(PlatformContext);
  if (!value) {
    throw new Error("usePlatformContext must be used within PlatformContextProvider");
  }
  return value;
}
