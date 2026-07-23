/**
 * Research topic workspace facets — architecture for complete topic workspaces.
 * Status is honest: available when topic surfaces exist; planned/missing otherwise.
 */

import type { ResearchTopic } from "@/lib/research/research-topics";

export type WorkspaceFacetStatus = "Available" | "Planned" | "Awaiting evidence";

export type ResearchWorkspaceFacet = {
  id: string;
  label: string;
  status: WorkspaceFacetStatus;
  description: string;
};

export function buildResearchWorkspaceFacets(topic: ResearchTopic): readonly ResearchWorkspaceFacet[] {
  const evidenceReady =
    topic.status === "catalog_available" || topic.status === "workspace_not_available";

  return [
    {
      id: "evidence",
      label: "Evidence",
      status: evidenceReady ? "Available" : "Awaiting evidence",
      description: "Evidence readiness, supporting and counter-evidence review.",
    },
    {
      id: "sources",
      label: "Sources",
      status: "Planned",
      description: "Official source attachments for this topic — connect when available.",
    },
    {
      id: "timeline",
      label: "Timeline",
      status: "Available",
      description: "Knowledge timeline for topic progression.",
    },
    {
      id: "methods",
      label: "Methods",
      status: "Available",
      description: topic.relatedMethods.join(" · ") || "Method definitions from the research catalog.",
    },
    {
      id: "outputs",
      label: "Outputs",
      status: "Planned",
      description: "Structured research outputs once evidence and review complete.",
    },
    {
      id: "reports",
      label: "Reports",
      status: "Available",
      description: "Topic report generation when registry facts allow.",
    },
    {
      id: "mission-workspace",
      label: "Mission Workspace",
      status: "Available",
      description: "Continue analysis inside a Mission instead of generic chat.",
    },
    {
      id: "open-science",
      label: "Open Science workflow",
      status: "Planned",
      description: "Open datasets, reproducibility, and public review pathways.",
    },
  ] as const;
}

export function workspaceFacetStatusClass(status: WorkspaceFacetStatus): string {
  switch (status) {
    case "Available":
      return "border-teal-500/25 bg-teal-500/10 text-teal-300";
    case "Planned":
      return "border-amber-500/25 bg-amber-500/10 text-amber-300";
    case "Awaiting evidence":
      return "border-zinc-600/80 bg-zinc-800/60 text-zinc-400";
  }
}
