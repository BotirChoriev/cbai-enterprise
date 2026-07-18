"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { loadOrganizationMemberships } from "@/lib/organization-os/organization-membership-store";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import {
  buildLeadershipBrief,
  buildMissionReport,
  listAvailableGenesisReports,
  type GenesisReportArtifact,
} from "@/lib/genesis/genesis-reports";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function GenesisReportsPanel() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const [tick, setTick] = useState(0);
  const [selectedReport, setSelectedReport] = useState<GenesisReportArtifact | null>(null);
  const bump = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onChange = () => bump();
    window.addEventListener(MISSION_DATA_CHANGED, onChange);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChange);
  }, [bump]);

  const organizationId = useMemo(() => {
    void tick;
    if (!hydrated) return null;
    const memberships = loadOrganizationMemberships();
    return memberships[0]?.organizationId ?? null;
  }, [hydrated, tick]);

  const missionId = useMemo(() => {
    void tick;
    return hydrated ? loadCurrentMission()?.id ?? null : null;
  }, [hydrated, tick]);

  const reports = useMemo(() => {
    void tick;
    if (!hydrated) return [];
    return listAvailableGenesisReports({ organizationId: organizationId ?? undefined, missionId: missionId ?? undefined });
  }, [hydrated, tick, organizationId, missionId]);

  const generateBrief = () => {
    if (!organizationId) return;
    setSelectedReport(buildLeadershipBrief(organizationId));
  };

  if (!hydrated) return null;

  return (
    <section id="genesis-reports" className="space-y-4" aria-labelledby="genesis-reports-heading">
      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <p className={cbaiSectionEyebrow}>{t("genesisOs.eyebrow")}</p>
        <h2 id="genesis-reports-heading" className="text-lg font-semibold text-zinc-100">
          {t("genesisOs.genesisReportsTitle")}
        </h2>
        <p className="text-sm text-zinc-400">{t("genesisOs.genesisReportsPurpose")}</p>
        <p className="text-xs text-amber-400/90">{t("genesisOs.noFabricatedReports")}</p>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.generateLeadershipBrief")}</h3>
        {organizationId ? (
          <button
            type="button"
            onClick={generateBrief}
            className="rounded-lg border border-teal-500/30 bg-teal-950/30 px-4 py-2 text-sm text-teal-300 hover:bg-teal-950/50"
          >
            {t("genesisOs.generateLeadershipBrief")}
          </button>
        ) : (
          <p className="text-xs text-zinc-500">{t("genesisOs.reportsNeedOrganization")}</p>
        )}
        {missionId ? (
          <button
            type="button"
            onClick={() => setSelectedReport(buildMissionReport(missionId))}
            className="ml-0 block text-xs text-teal-400 hover:text-teal-300 sm:ml-3 sm:inline"
          >
            Mission Report →
          </button>
        ) : null}
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <h3 className="text-sm font-semibold text-zinc-200">Available reports</h3>
        {reports.length === 0 ? (
          <p className="text-xs text-zinc-500">{t("genesisOs.emptyReports")}</p>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelectedReport(r)}
                  className="text-left text-xs text-teal-400 hover:text-teal-300"
                >
                  {r.kind} — {r.available ? "available" : r.unavailableReason ?? "unavailable"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedReport ? (
        <div className={`${cbaiGlassCard} space-y-3 p-5`}>
          <h3 className="text-sm font-semibold text-zinc-200">{selectedReport.title}</h3>
          <dl className="grid gap-1 text-xs text-zinc-400">
            <div>
              <dt className="text-zinc-600">Scope</dt>
              <dd>{selectedReport.scope}</dd>
            </div>
            <div>
              <dt className="text-zinc-600">Period</dt>
              <dd>{selectedReport.reportingPeriod}</dd>
            </div>
            <div>
              <dt className="text-zinc-600">Generated</dt>
              <dd>{selectedReport.generatedAt}</dd>
            </div>
            <div>
              <dt className="text-zinc-600">Source records</dt>
              <dd>{selectedReport.sourceRecordIds.length} record(s)</dd>
            </div>
          </dl>
          {selectedReport.sections.map((section) => (
            <div key={section.heading}>
              <p className="text-xs font-medium text-zinc-300">{section.heading}</p>
              <p className="whitespace-pre-wrap text-xs text-zinc-400">{section.body}</p>
            </div>
          ))}
          <ul className="list-disc pl-4 text-xs text-zinc-500">
            {selectedReport.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="text-xs text-amber-400/90">{selectedReport.humanDecisionBoundary}</p>
          {!selectedReport.available ? (
            <p className="text-xs text-zinc-500">{selectedReport.unavailableReason}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
