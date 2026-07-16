"use client";

import { useSyncExternalStore, useMemo } from "react";
import SearchGateway from "@/components/search/gateway/SearchGateway";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import { executeGatewaySearch } from "@/lib/search-gateway";
import {
  deriveSearchActivationStages,
  type SearchActivationStageId,
} from "@/lib/intelligence-os/search-activation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";

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

const STAGE_I18N: Record<SearchActivationStageId, string> = {
  understanding: "activation.searchUnderstanding",
  searchingEntities: "activation.searchSearchingEntities",
  checkingEvidence: "activation.searchCheckingEvidence",
  findingKnowledge: "activation.searchFindingKnowledge",
  comparing: "activation.searchComparing",
  preparing: "activation.searchPreparing",
  completed: "activation.searchCompleted",
  noMatches: "activation.searchNoMatches",
};

export default function SearchGatewayClient() {
  const { t } = useTranslation();
  const disclosure = useProgressiveDisclosure();
  const query = useSyncExternalStore(
    subscribe,
    getSearchQuerySnapshot,
    getServerSearchQuerySnapshot,
  );

  const response = useMemo(() => executeGatewaySearch(query), [query]);

  const activationMessage = useMemo(() => {
    if (!query) return null;
    const stages = deriveSearchActivationStages(query, response);
    if (stages.length === 0) return null;
    const terminal = stages[stages.length - 1];
    return t(STAGE_I18N[terminal]);
  }, [query, response, t]);

  return (
    <OperatingPageShell
      title={t("navigation.search")}
      showOperator={false}
      missionContextVariant="compact"
    >
      {activationMessage ? <ActivationStatusLine message={activationMessage} compact /> : null}
      <SearchGateway query={query} response={response} showGoalEntry={disclosure.showGatewayGoalChips} />
    </OperatingPageShell>
  );
}
