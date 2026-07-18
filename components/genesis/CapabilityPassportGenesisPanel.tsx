"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import {
  CAPABILITY_RECORD_TYPES,
  CAPABILITY_VERIFICATION_STATUSES,
} from "@/lib/genesis/genesis-types";
import {
  createCapabilityRecord,
  loadCapabilityRecords,
  updateCapabilityVerification,
  assertNoUniversalHumanScore,
} from "@/lib/genesis/capability-records-store";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function CapabilityPassportGenesisPanel() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const operatorName = resolveOperatorName(profile);
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);

  const [claim, setClaim] = useState("");
  const [recordType, setRecordType] =
    useState<(typeof CAPABILITY_RECORD_TYPES)[number]>("skill_or_method");
  const [methodsUsed, setMethodsUsed] = useState("");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const onChange = () => bump();
    window.addEventListener(MISSION_DATA_CHANGED, onChange);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChange);
  }, [bump]);

  const mission = useMemo(() => {
    void tick;
    return hydrated ? loadCurrentMission() : null;
  }, [hydrated, tick]);

  const records = useMemo(() => {
    void tick;
    return hydrated ? loadCapabilityRecords() : [];
  }, [hydrated, tick]);

  assertNoUniversalHumanScore({});

  const addRecord = () => {
    if (!claim.trim()) return;
    createCapabilityRecord({
      recordType,
      claim: claim.trim(),
      label: claim.trim(),
      description: "",
      methodsUsed: methodsUsed.trim(),
      missionId: mission?.id ?? null,
      projectId: mission?.projectId ?? null,
      relatedWorkIds: mission?.projectId ? [mission.projectId] : [],
      evidenceRefs: evidenceLabel.trim() ? [{ label: evidenceLabel.trim() }] : [],
      visibility: "private",
      limitations: "Self-declared until human review.",
      unresolvedQuestions: "",
    });
    setClaim("");
    setEvidenceLabel("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const submitForReview = (recordId: string) => {
    updateCapabilityVerification(recordId, {
      verificationStatus: "Under Review",
      reviewer: operatorName,
      reason: "Submitted for local demonstration review.",
    });
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  if (!hydrated) return null;

  return (
    <section id="capability-passport-genesis" className="space-y-4" aria-labelledby="capability-passport-heading">
      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <p className={cbaiSectionEyebrow}>{t("genesisOs.eyebrow")}</p>
        <h2 id="capability-passport-heading" className="text-lg font-semibold text-zinc-100">
          {t("genesisOs.capabilityPassportTitle")}
        </h2>
        <p className="text-sm text-zinc-400">{t("genesisOs.capabilityPassportPurpose")}</p>
        <p className="text-xs text-zinc-600">{t("genesisOs.noUniversalScore")}</p>
        <p className="text-xs text-amber-400/90">{t("genesisOs.deviceLocalLimitation")}</p>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.createCapabilityRecord")}</h3>
        <label className="block space-y-1">
          <span className="text-xs text-zinc-500">{t("genesisOs.recordClaim")}</span>
          <input
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            className={`${cbaiFocusRing} w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100`}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-zinc-500">{t("genesisOs.recordType")}</span>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value as (typeof CAPABILITY_RECORD_TYPES)[number])}
            className={`${cbaiFocusRing} w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100`}
          >
            {CAPABILITY_RECORD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        {showAdvanced ? (
          <>
            <label className="block space-y-1">
              <span className="text-xs text-zinc-500">{t("genesisOs.methods")}</span>
              <input
                value={methodsUsed}
                onChange={(e) => setMethodsUsed(e.target.value)}
                className={`${cbaiFocusRing} w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100`}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-zinc-500">{t("genesisOs.evidenceLabel")}</span>
              <input
                value={evidenceLabel}
                onChange={(e) => setEvidenceLabel(e.target.value)}
                className={`${cbaiFocusRing} w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100`}
              />
            </label>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="text-xs text-teal-400 hover:text-teal-300"
          >
            {t("genesisOs.showDetails")} →
          </button>
        )}
        <button type="button" onClick={addRecord} className={cbaiBtnPrimary}>
          {t("genesisOs.createCapabilityRecord")}
        </button>
        {feedback ? <p className="text-xs text-teal-400">{feedback}</p> : null}
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.verificationStatus")}</h3>
        {records.length === 0 ? (
          <p className="text-xs text-zinc-500">{t("genesisOs.emptyCapabilityRecords")}</p>
        ) : (
          <ul className="space-y-3">
            {records.map((rec) => (
              <li key={rec.id} className="rounded-lg border border-zinc-800/80 p-3">
                <p className="text-sm font-medium text-zinc-200">{rec.claim}</p>
                <p className="text-xs text-zinc-500">
                  {rec.recordType.replace(/_/g, " ")} · {rec.verificationStatus}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Evidence: {rec.evidenceRefs.length} · Visibility: {rec.visibility}
                </p>
                {rec.limitations ? (
                  <p className="mt-1 text-xs text-amber-400/80">Limitation: {rec.limitations}</p>
                ) : null}
                {rec.verificationStatus === "Evidence Submitted" || rec.verificationStatus === "Self-Declared" ? (
                  <button
                    type="button"
                    onClick={() => submitForReview(rec.id)}
                    className="mt-2 text-xs text-teal-400 hover:text-teal-300"
                  >
                    {t("genesisOs.submitForReview")} →
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-zinc-600">
          Statuses: {CAPABILITY_VERIFICATION_STATUSES.slice(0, 4).join(", ")}…
        </p>
      </div>
    </section>
  );
}
