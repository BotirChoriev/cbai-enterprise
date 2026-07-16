"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { deriveOrganizationInspector } from "@/lib/organization-os/organization-inspector";
import { deriveCapabilityRequirements } from "@/lib/organization-os/capability-matching";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="text-xs leading-relaxed text-zinc-400">{value}</p>
    </div>
  );
}

/** Organization Inspector — real mission data, architecture-only collaboration maturity. */
export default function OrganizationInspectorPanel() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const { mission } = useMissionContext();

  const inspector = useMemo(
    () => (hydrated ? deriveOrganizationInspector(mission, resolveOperatorName(profile)) : null),
    [hydrated, mission, profile],
  );
  const matching = useMemo(
    () => (hydrated ? deriveCapabilityRequirements(mission) : null),
    [hydrated, mission],
  );

  if (!hydrated || !inspector) return null;

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-4`} aria-labelledby="organization-inspector-heading">
      <div>
        <p className={cbaiSectionEyebrow} id="organization-inspector-heading">
          {t("organizationOs.inspectorEyebrow")}
        </p>
        <p className="text-[10px] text-amber-500/70">{t("organizationOs.architecturePreview")}</p>
      </div>

      <Row label={t("organizationOs.missionHealth")} value={inspector.missionHealth} />
      <Row label={t("organizationOs.evidenceQuality")} value={inspector.evidenceQuality} />
      <Row label={t("organizationOs.knowledgeContribution")} value={inspector.knowledgeContribution} />
      <Row label={t("organizationOs.capabilityCoverage")} value={inspector.capabilityCoverage} />
      <Row label={t("organizationOs.humanImpact")} value={inspector.humanImpact} />
      <Row label={t("organizationOs.trust")} value={inspector.trust} />
      <Row
        label={t("organizationOs.unknowns")}
        value={inspector.unknowns.length > 0 ? inspector.unknowns.join("; ") : t("organizationOs.none")}
      />
      <Row
        label={t("organizationOs.decisionBacklog")}
        value={String(inspector.decisionBacklog)}
      />
      <Row label={t("organizationOs.maturity")} value={inspector.maturity} />
      <Row label={t("organizationOs.limitation")} value={inspector.limitation} />

      {matching && matching.requirements.length > 0 ? (
        <div className="space-y-2 border-t border-zinc-800/80 pt-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            {t("organizationOs.capabilityRequirements")}
          </p>
          <ul className="space-y-1.5">
            {matching.requirements.map((req) => (
              <li key={req.capabilityLabel} className="text-xs text-zinc-500">
                {req.capabilityLabel} — {req.whyRequired}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-zinc-600">{t("organizationOs.noPeopleRecommended")}</p>
        </div>
      ) : null}

      <p className="text-[10px] text-zinc-600">{t("organizationOs.discussionRule")}</p>
      <p className="text-[10px] text-zinc-600">{t("organizationOs.cloudNotConnected")}</p>
    </section>
  );
}
