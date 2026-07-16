/**
 * Live state indicators for Operating Navigation — derived from real stores only.
 */

import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import { loadProjects, loadProjectEvidence } from "@/lib/project/project-store";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";

export type NavLiveState = "active" | "ready" | "attention" | "neutral";

export function deriveNavLiveState(href: string, pathname: string): NavLiveState {
  const normalized = href.split("?")[0];
  const isActive = normalized === "/" ? pathname === "/" : pathname === normalized || pathname.startsWith(`${normalized}/`);
  if (isActive) return "active";

  const mission = getCurrentMission();
  const projects = loadProjects();
  const totalEvidence = projects.reduce((sum, p) => sum + loadProjectEvidence(p.id).length, 0);

  switch (normalized) {
    case "/":
      return mission ? "ready" : "attention";
    case "/knowledge":
      return totalEvidence > 0 ? "ready" : "attention";
    case "/research":
      return projects.some((p) => p.type === "research_project") ? "ready" : "neutral";
    case "/countries":
    case "/companies":
    case "/universities":
      return "neutral";
    case "/reports": {
      const impact = mission ? loadHumanImpactForMission(mission.id) : null;
      if (mission && impact?.isComplete) return "ready";
      if (mission) return "attention";
      return "neutral";
    }
    case "/graph":
      if (mission?.projectId) {
        const pulse = deriveEvidencePulse(mission);
        return pulse.count > 0 ? "ready" : "attention";
      }
      return "neutral";
    case "/my-work":
      return projects.length > 0 ? "ready" : "neutral";
    default:
      return "neutral";
  }
}
