"use client";

import { useEffect, useState } from "react";
import {
  MISSION_ENGINE_STAGES,
  canCompleteMissionEngine,
  createMissionEngineRuntime,
  loadMissionEngineRuntime,
  missionEngineStageLabel,
  recordMissionDecision,
  requiredEvidenceIncomplete,
  transitionMissionEngineStage,
  upsertHumanReviewCheckpoint,
  upsertMissionEvidenceRequirement,
  type MissionEngineRuntime,
  type MissionEngineStage,
} from "@/lib/mission-engine";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import {
  cbaiMineralSurface,
  cbaiSectionEyebrow,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

/**
 * Mission engine stage panel — honest gates for evidence + human approval.
 */
export default function MissionEngineStagePanel() {
  const hydrated = useHydrated();
  const { mission } = useMissionContext();
  const [runtime, setRuntime] = useState<MissionEngineRuntime | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actor, setActor] = useState("local-user");

  function refresh(missionId: string) {
    setRuntime(loadMissionEngineRuntime(missionId));
  }

  useEffect(() => {
    if (!hydrated || !mission) {
      setRuntime(null);
      return;
    }
    refresh(mission.id);
  }, [hydrated, mission]);

  if (!mission) {
    return (
      <section className={`${cbaiMineralSurface} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Mission engine</p>
        <p className={cbaiTextBody}>
          No active mission. Start a mission first — stage progress is not fabricated.
        </p>
      </section>
    );
  }

  const missionId = mission.id;

  function ensureRuntime() {
    const next = createMissionEngineRuntime(missionId);
    setRuntime(next);
    setMessage("Mission engine runtime created on this device (starts at Define).");
  }

  function onStage(toStage: MissionEngineStage) {
    const result = transitionMissionEngineStage(missionId, toStage, actor.trim() || "local-user");
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setRuntime(result.runtime);
    setMessage(`Stage → ${missionEngineStageLabel(toStage)} (audited).`);
  }

  function addRequiredEvidenceGap() {
    const id = `req-${Date.now()}`;
    const next = upsertMissionEvidenceRequirement(missionId, {
      id,
      description: "Required evidence not yet attached (planned)",
      evidenceId: null,
      required: true,
      satisfied: false,
    });
    setRuntime(next);
    setMessage("Added required evidence gap — completion stays blocked until satisfied.");
  }

  function markEvidenceSatisfied() {
    if (!runtime) return;
    const first = runtime.evidenceRequirements.find((row) => row.required && !row.satisfied);
    if (!first) {
      setMessage("No unsatisfied required evidence rows.");
      return;
    }
    const next = upsertMissionEvidenceRequirement(missionId, {
      ...first,
      satisfied: true,
      evidenceId: first.evidenceId ?? `linked-planned-${first.id}`,
    });
    setRuntime(next);
    setMessage("Marked one required evidence row satisfied (device-local).");
  }

  function addReviewCheckpoint() {
    const id = `review-${Date.now()}`;
    const next = upsertHumanReviewCheckpoint(missionId, {
      id,
      label: "Human review before final decision",
      required: true,
      approvedBy: null,
      approvedAt: null,
      notes: null,
    });
    setRuntime(next);
    setMessage("Added required human review checkpoint.");
  }

  function approveCheckpoint() {
    if (!runtime) return;
    const first = runtime.humanReviewCheckpoints.find((row) => row.required && !row.approvedAt);
    if (!first) {
      setMessage("No pending required checkpoints.");
      return;
    }
    const next = upsertHumanReviewCheckpoint(missionId, {
      ...first,
      approvedBy: actor.trim() || "local-user",
      approvedAt: new Date().toISOString(),
      notes: "Approved on device",
    });
    setRuntime(next);
    setMessage("Checkpoint approved.");
  }

  function recordDecision(approvedByHuman: boolean) {
    const result = recordMissionDecision(missionId, {
      summary: approvedByHuman
        ? "Human-approved decision recorded locally."
        : "Attempted decision without human approval.",
      approvedByHuman,
      approvedBy: approvedByHuman ? actor.trim() || "local-user" : null,
      approvedAt: approvedByHuman ? new Date().toISOString() : null,
      notes: null,
    });
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setRuntime(result.runtime);
    setMessage("Final decision recorded with human approval.");
  }

  const completion = runtime ? canCompleteMissionEngine(runtime) : null;

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-4`} aria-labelledby="mission-engine-heading">
      <div className="space-y-1">
        <p className={cbaiSectionEyebrow} id="mission-engine-heading">
          Mission engine stages
        </p>
        <p className={cbaiTextMuted}>
          Define → Collect → Verify → Analyze → Compare → Scenario → Review → Complete. Completion
          is blocked while required evidence is incomplete; final decision requires human approval.
        </p>
      </div>

      <label className="block space-y-1 text-xs text-zinc-500">
        Actor (audit who)
        <input
          value={actor}
          onChange={(event) => setActor(event.target.value)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
        />
      </label>

      {!hydrated ? (
        <p className={cbaiTextMuted}>Loading…</p>
      ) : !runtime ? (
        <div className="space-y-2">
          <p className={cbaiTextBody}>No mission engine runtime for this mission yet.</p>
          <button
            type="button"
            onClick={ensureRuntime}
            aria-label="Initialize mission engine stage runtime"
            className="rounded-md border border-teal-500/40 bg-teal-500/10 px-3 py-1.5 text-xs text-teal-300"
          >
            Initialize stage runtime
          </button>
        </div>
      ) : (
        <>
          <p className={cbaiTextBody}>
            Current stage: <span className="text-teal-300">{missionEngineStageLabel(runtime.stage)}</span>
          </p>
          {requiredEvidenceIncomplete(runtime) ? (
            <p className="text-xs text-amber-300/90">
              Required evidence incomplete — Complete stays blocked.
            </p>
          ) : null}
          {completion && !completion.ok ? (
            <p className="text-xs text-zinc-500">{completion.reason}</p>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {MISSION_ENGINE_STAGES.map((stage) => (
              <button
                key={stage}
                type="button"
                disabled={stage === runtime.stage}
                onClick={() => onStage(stage)}
                className={`rounded border px-2 py-1 text-[10px] ${
                  stage === runtime.stage
                    ? "border-teal-500/50 text-teal-300"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
              >
                {missionEngineStageLabel(stage)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addRequiredEvidenceGap}
              className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400"
            >
              Add required evidence gap
            </button>
            <button
              type="button"
              onClick={markEvidenceSatisfied}
              className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400"
            >
              Satisfy one evidence requirement
            </button>
            <button
              type="button"
              onClick={addReviewCheckpoint}
              className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400"
            >
              Add human review checkpoint
            </button>
            <button
              type="button"
              onClick={approveCheckpoint}
              className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400"
            >
              Approve pending checkpoint
            </button>
            <button
              type="button"
              onClick={() => recordDecision(true)}
              aria-label="Record human-approved mission decision"
              className="rounded border border-teal-500/40 px-2 py-1 text-[10px] text-teal-300"
            >
              Record human-approved decision
            </button>
            <button
              type="button"
              onClick={() => recordDecision(false)}
              className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-500"
            >
              Try decision without approval
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-zinc-600">Stage audit</p>
            {runtime.stageAudit.length === 0 ? (
              <p className={cbaiTextMuted}>No audit entries.</p>
            ) : (
              <ul className="space-y-1 text-[10px] text-zinc-500">
                {[...runtime.stageAudit].reverse().map((entry) => (
                  <li key={entry.id}>
                    {entry.changedAt} · {entry.changedBy} ·{" "}
                    {entry.fromStage ? missionEngineStageLabel(entry.fromStage) : "—"} →{" "}
                    {missionEngineStageLabel(entry.toStage)}
                    {entry.note ? ` — ${entry.note}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {message ? <p className="text-xs text-amber-300/90">{message}</p> : null}
    </section>
  );
}
