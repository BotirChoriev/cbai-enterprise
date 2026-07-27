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
  statementKey: string;
};

const ROUTE_ENGINES: RouteEngine[] = [
  { prefix: "/", engineId: "mission", labelKey: "forwardDeployed.engines.mission", statementKey: "forwardDeployed.engines.missionDesc" },
  { prefix: "/research", engineId: "research", labelKey: "forwardDeployed.engines.research", statementKey: "forwardDeployed.engines.researchDesc" },
  { prefix: "/knowledge", engineId: "evidence", labelKey: "forwardDeployed.engines.evidence", statementKey: "forwardDeployed.engines.evidenceDesc" },
  { prefix: "/evidence", engineId: "evidence", labelKey: "forwardDeployed.engines.evidence", statementKey: "forwardDeployed.engines.evidenceDesc" },
  { prefix: "/graph", engineId: "evidence", labelKey: "forwardDeployed.engines.evidence", statementKey: "forwardDeployed.engines.evidenceDesc" },
  { prefix: "/countries", engineId: "country_intelligence", labelKey: "forwardDeployed.engines.country", statementKey: "forwardDeployed.engines.countryDesc" },
  { prefix: "/companies", engineId: "organization_intelligence", labelKey: "forwardDeployed.engines.organization", statementKey: "forwardDeployed.engines.organizationDesc" },
  { prefix: "/universities", engineId: "organization_intelligence", labelKey: "forwardDeployed.engines.organization", statementKey: "forwardDeployed.engines.organizationDesc" },
  { prefix: "/governance", engineId: "governance_review", labelKey: "forwardDeployed.engines.governance", statementKey: "forwardDeployed.engines.governanceDesc" },
  { prefix: "/my-work", engineId: "mission", labelKey: "forwardDeployed.engines.mission", statementKey: "forwardDeployed.engines.missionDesc" },
  { prefix: "/reports", engineId: "governance_review", labelKey: "forwardDeployed.engines.governance", statementKey: "forwardDeployed.engines.governanceDesc" },
  { prefix: "/government", engineId: "evidence", labelKey: "forwardDeployed.engines.evidence", statementKey: "forwardDeployed.engines.evidenceDesc" },
];

export default function EngineRouteEntryStrip() {
  const pathname = usePathname();
  const { t } = useTranslation();
  // Spatial home already owns mission entry — avoid a second mission ribbon (DD-CLOS-006).
  if (pathname === "/") return null;
  // Prefer longest prefix so "/" does not steal every route.
  const match = [...ROUTE_ENGINES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => pathname === r.prefix || (r.prefix !== "/" && pathname.startsWith(`${r.prefix}/`)));
  if (!match) return null;

  return (
    <section className={`${cbaiMineralPanel} mb-4`} aria-label={t("forwardDeployed.workspaceTitle")}>
      <p className={cbaiSectionEyebrow}>{t("forwardDeployed.workspaceTitle")}</p>
      <EngineEntryPanel engineId={match.engineId} statement={t(match.statementKey)} labelKey={match.labelKey} />
    </section>
  );
}
