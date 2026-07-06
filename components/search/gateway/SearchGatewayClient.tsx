"use client";

import { useMemo, useSyncExternalStore } from "react";
import SearchGateway from "@/components/search/gateway/SearchGateway";
import { executeGatewaySearch } from "@/lib/search-gateway";

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
  const query = useSyncExternalStore(
    subscribe,
    getSearchQuerySnapshot,
    getServerSearchQuerySnapshot,
  );

  const response = useMemo(() => executeGatewaySearch(query), [query]);

  return <SearchGateway query={query} response={response} />;
}
