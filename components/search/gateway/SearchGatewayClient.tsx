"use client";

import { useSyncExternalStore, useMemo } from "react";
import SearchGateway from "@/components/search/gateway/SearchGateway";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { executeGatewaySearch } from "@/lib/search-gateway";
import { useTranslation } from "@/lib/i18n/use-translation";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getSearchQuerySnapshot(): string {
  return new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
}

function getServerSearchQuerySnapshot(): string {
  return "";
}

export default function SearchGatewayClient() {
  const { t } = useTranslation();
  const query = useSyncExternalStore(
    subscribe,
    getSearchQuerySnapshot,
    getServerSearchQuerySnapshot,
  );

  const response = useMemo(() => executeGatewaySearch(query), [query]);

  return (
    <OperatingPageShell
      title={t("navigation.search")}
      description={t("navigation.startWithSearchBody")}
      showOperator={false}
    >
      <SearchGateway query={query} response={response} />
    </OperatingPageShell>
  );
}
