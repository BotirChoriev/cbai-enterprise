import type { WorkspaceReadinessLabel } from "@/lib/workspaces";

/** Real status → fill color, shared by every workspace motif so a dot never lies about evidence state. */
export function workspaceMotifFill(status: WorkspaceReadinessLabel): string {
  switch (status) {
    case "Connected":
    case "Available Information":
      return "#22d3ee";
    case "Planned":
      return "#a78bfa";
    case "Insufficient Evidence":
      return "#fbbf24";
    case "Evidence Source Not Connected":
    default:
      return "#52525b";
  }
}
