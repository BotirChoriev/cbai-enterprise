"use client";

import { usePathname } from "next/navigation";
import { cbaiMineralPanel, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { ForwardDeployedEngineId } from "@/lib/forward-deployed-engines/engine-types";
import { EngineEntryPanel } from "./EngineWorkspaceProvider";

type RouteEngine = {
  prefix: string;
  engineId: ForwardDeployedEngineId;
  labelKey: string;
  defaultStatement: string;
};

const ROUTE_ENGINES: RouteEngine[] = [
  { prefix: "/", engineId: "mission", labelKey: "forwardDeployed.engines.mission", defaultStatement: "Structure next mission step" },
  { prefix: "/research", engineId: "research", labelKey: "forwardDeployed.engines.research", defaultStatement: "Start structured research" },
  { prefix: "/knowledge", engineId: "evidence", labelKey: "forwardDeployed.engines.evidence", defaultStatement: "Map evidence for current context" },
  { prefix: "/graph", engineId: "evidence", labelKey: "forwardDeployed.engines.evidence", defaultStatement: "Explore linked evidence relationships" },
  { prefix: "/countries", engineId: "country_intelligence", labelKey: "forwardDeployed.engines.country", defaultStatement: "Country intelligence review" },
  { prefix: "/companies", engineId: "organization_intelligence", labelKey: "forwardDeployed.engines.organization", defaultStatement: "Organization evidence profile" },
  { prefix: "/universities", engineId: "organization_intelligence", labelKey: "forwardDeployed.engines.organization", defaultStatement: "University evidence profile" },
  { prefix: "/governance", engineId: "governance_review", labelKey: "forwardDeployed.engines.governance", defaultStatement: "Governance review checklist" },
  { prefix: "/my-work", engineId: "mission", labelKey: "forwardDeployed.engines.mission", defaultStatement: "Structure next mission step" },
  { prefix: "/reports", engineId: "governance_review", labelKey: "forwardDeployed.engines.governance", defaultStatement: "Review report before publication" },
  { prefix: "/government", engineId: "evidence", labelKey: "forwardDeployed.engines.evidence", defaultStatement: "Public administration evidence review" },
];

export default function EngineRouteEntryStrip() {
  const pathname = usePathname();
  const { t } = useTranslation();
  // Prefer longest prefix so "/" does not steal every route.
  const match = [...ROUTE_ENGINES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => pathname === r.prefix || (r.prefix !== "/" && pathname.startsWith(`${r.prefix}/`)));
  if (!match) return null;

  return (
    <section className={`${cbaiMineralPanel} mb-4`} aria-label={t("forwardDeployed.workspaceTitle")}>
      <p className={cbaiSectionEyebrow}>{t("forwardDeployed.workspaceTitle")}</p>
      <EngineEntryPanel engineId={match.engineId} statement={match.defaultStatement} labelKey={match.labelKey} />
    </section>
  );
}
