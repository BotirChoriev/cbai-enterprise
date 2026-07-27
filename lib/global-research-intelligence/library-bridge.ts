/**
 * Scientific library bridge — adapter boundary; no fabricated library records.
 */

import type { GriLibraryRecord } from "@/lib/global-research-intelligence/types";

export type LibraryBridgeCapability = {
  readonly id: string;
  readonly name: string;
  readonly status: "available_not_connected" | "connected" | "restricted" | "not_available";
  readonly licenseNote: string;
};

export const LIBRARY_ADAPTERS: readonly LibraryBridgeCapability[] = [
  {
    id: "openalex",
    name: "OpenAlex",
    status: "available_not_connected",
    licenseNote: "Connect only after confirming OpenAlex terms for this deployment.",
  },
  {
    id: "crossref",
    name: "Crossref",
    status: "available_not_connected",
    licenseNote: "Verify Crossref reuse/attribution before live use.",
  },
  {
    id: "pubmed",
    name: "PubMed / NCBI",
    status: "available_not_connected",
    licenseNote: "Verify NCBI terms; do not scrape contrary to policy.",
  },
  {
    id: "local-catalog",
    name: "CBAI research topic catalog",
    status: "connected",
    licenseNote: "Catalog metadata only — not publication full texts.",
  },
] as const;

export type LibraryBridgeResult = {
  readonly records: readonly GriLibraryRecord[];
  readonly adapters: readonly LibraryBridgeCapability[];
  readonly honestyNotice: string;
};

export function listLibraryBridge(topicId?: string | null): LibraryBridgeResult {
  void topicId;
  return {
    records: [],
    adapters: LIBRARY_ADAPTERS,
    honestyNotice:
      "Scientific Library Bridge lists connector capability honestly. No publications, theses, or patents are invented to fill the view.",
  };
}
