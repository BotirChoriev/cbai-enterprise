"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import {
  createMeeting,
  createDecision,
  createDirective,
  createExecutionPlan,
  createExecutionTask,
  updateExecutionTask,
  loadMeetings,
  loadDecisions,
  loadDirectives,
  loadExecutionTasks,
} from "@/lib/genesis/execution-store";
import { deriveLeadershipMetrics } from "@/lib/genesis/monitoring-metrics";
import { loadUnifiedAuditTrail } from "@/lib/genesis/genesis-audit-store";
import { createTeam, loadTeams } from "@/lib/genesis/team-store";
import { createOrganizationUnit, loadOrganizationUnits } from "@/lib/genesis/organization-unit-store";
import OperationalLoopPanel from "@/components/genesis/OperationalLoopPanel";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type Props = {
  organizationId: string;
  operatorName: string;
};

export default function ExecutionOsPanel({ organizationId, operatorName }: Props) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);

  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [agenda, setAgenda] = useState("");
  const [decisionText, setDecisionText] = useState("");
  const [directiveTitle, setDirectiveTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [selectedDirectiveId, setSelectedDirectiveId] = useState("");
  const [taskEvidence, setTaskEvidence] = useState("");
  const [teamName, setTeamName] = useState("");
  const [unitName, setUnitName] = useState("");
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

  const meetings = useMemo(() => {
    void tick;
    return hydrated ? loadMeetings(organizationId) : [];
  }, [hydrated, organizationId, tick]);

  const decisions = useMemo(() => {
    void tick;
    return hydrated ? loadDecisions(organizationId) : [];
  }, [hydrated, organizationId, tick]);

  const directives = useMemo(() => {
    void tick;
    return hydrated ? loadDirectives(organizationId) : [];
  }, [hydrated, organizationId, tick]);

  const tasks = useMemo(() => {
    void tick;
    return hydrated ? loadExecutionTasks(organizationId) : [];
  }, [hydrated, organizationId, tick]);

  const metrics = useMemo(() => {
    void tick;
    return hydrated ? deriveLeadershipMetrics(organizationId) : [];
  }, [hydrated, organizationId, tick]);

  const audit = useMemo(() => {
    void tick;
    return hydrated ? loadUnifiedAuditTrail(organizationId) : null;
  }, [hydrated, organizationId, tick]);

  const teams = useMemo(() => {
    void tick;
    return hydrated ? loadTeams(organizationId) : [];
  }, [hydrated, organizationId, tick]);

  const units = useMemo(() => {
    void tick;
    return hydrated ? loadOrganizationUnits(organizationId) : [];
  }, [hydrated, organizationId, tick]);

  if (!hydrated) return null;

  const recordMeeting = () => {
    if (!meetingTitle.trim() || !meetingDate) return;
    const meeting = createMeeting({
      organizationId,
      missionId: mission?.id ?? null,
      projectId: mission?.projectId ?? null,
      title: meetingTitle.trim(),
      date: meetingDate,
      participants: [operatorName],
      agenda: agenda.trim(),
      notes: "",
      evidenceRefs: [],
      followUpDate: null,
    });
    setSelectedMeetingId(meeting.id);
    setMeetingTitle("");
    setAgenda("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const recordDecision = () => {
    const meetingId = selectedMeetingId || meetings[0]?.id;
    if (!meetingId || !decisionText.trim()) return;
    createDecision({
      meetingId,
      organizationId,
      missionId: mission?.id ?? null,
      humanDecisionOwner: operatorName,
      decisionText: decisionText.trim(),
      rationale: "",
      evidenceRefs: [],
      limitations: "",
      reviewStatus: "Approved",
    });
    setDecisionText("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const recordDirective = () => {
    const decisionId = decisions[decisions.length - 1]?.id ?? null;
    if (!directiveTitle.trim()) return;
    const directive = createDirective({
      decisionId,
      organizationId,
      missionId: mission?.id ?? null,
      projectId: mission?.projectId ?? null,
      title: directiveTitle.trim(),
      description: "",
      issuingAuthority: operatorName,
      responsibleOwner: operatorName,
      teamId: teams[0]?.id ?? null,
      objective: directiveTitle.trim(),
      expectedResult: "",
      successCriteria: "",
      evidenceRequirement: "Evidence required before completion.",
      issueDate: new Date().toISOString().slice(0, 10),
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      priority: "medium",
      risks: "",
      dependencies: "",
      status: "Active",
    });
    setSelectedDirectiveId(directive.id);
    setDirectiveTitle("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const recordPlanAndTask = () => {
    const directiveId = selectedDirectiveId || directives[directives.length - 1]?.id;
    if (!directiveId || !taskTitle.trim()) return;
    const plan = createExecutionPlan({
      directiveId,
      organizationId,
      milestones: ["Milestone 1"],
      expectedOutputs: "",
      expectedOutcomes: "",
      evidenceRequirements: "Completion evidence required.",
      status: "Active",
    });
    createExecutionTask({
      planId: plan.id,
      directiveId,
      organizationId,
      missionId: mission?.id ?? null,
      projectId: mission?.projectId ?? null,
      title: taskTitle.trim(),
      assignee: operatorName,
      accountableOwner: operatorName,
      collaborators: [],
      priority: "medium",
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      status: "Active",
      expectedResult: taskTitle.trim(),
      evidenceRequirement: "Submit evidence on completion.",
      progressNote: "",
      approvalState: "none",
    });
    setTaskTitle("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const completeFirstOpenTask = () => {
    const open = tasks.find((t) => t.status !== "Completed" && t.status !== "Cancelled");
    if (!open) return;
    if (!taskEvidence.trim()) {
      setFeedback(t("genesisOs.evidenceRequired"));
      return;
    }
    const updated = updateExecutionTask(open.id, {
      status: "Completed",
      completionEvidence: taskEvidence.trim(),
    });
    if (updated) {
      setTaskEvidence("");
      setFeedback(t("genesisOs.saved"));
      bump();
    }
  };

  const addTeam = () => {
    if (!teamName.trim()) return;
    createTeam({
      name: teamName.trim(),
      organizationId,
      missionIds: mission ? [mission.id] : [],
      purpose: "Mission execution team",
    });
    setTeamName("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  const addUnit = () => {
    if (!unitName.trim()) return;
    createOrganizationUnit({
      organizationId,
      name: unitName.trim(),
      kind: "department",
      description: "Organization unit",
      missionIds: mission ? [mission.id] : [],
    });
    setUnitName("");
    setFeedback(t("genesisOs.saved"));
    bump();
  };

  return (
    <section className="space-y-4" aria-labelledby="execution-os-heading">
      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>{t("genesisOs.eyebrow")}</p>
        <h2 id="execution-os-heading" className="text-sm font-semibold text-zinc-100">
          {t("genesisOs.executionOsTitle")}
        </h2>
        <p className="text-xs text-zinc-500">{t("genesisOs.executionOsPurpose")}</p>
        <p className="text-xs text-zinc-600">{t("genesisOs.humanDecisionBoundary")}</p>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.createTeam")}</h3>
        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder={t("genesisOs.teamName")}
          className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
        />
        <button type="button" onClick={addTeam} className={`${cbaiBtnPrimary} min-h-10`}>
          {t("genesisOs.createTeam")}
        </button>
        {teams.length > 0 ? (
          <p className="text-xs text-zinc-500">Teams: {teams.map((t) => t.name).join(", ")}</p>
        ) : null}
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <h3 className="text-sm font-semibold text-zinc-200">Organization unit</h3>
        <input
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          placeholder="Unit or department name"
          className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
        />
        <button type="button" onClick={addUnit} className={`${cbaiBtnPrimary} min-h-10`}>
          Create unit
        </button>
        {units.length > 0 ? (
          <p className="text-xs text-zinc-500">Units: {units.map((u) => u.name).join(", ")}</p>
        ) : null}
      </div>

      <div className={`${cbaiGlassCard} grid gap-4 p-4 lg:grid-cols-2`}>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.createMeeting")}</h3>
          <input
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder={t("genesisOs.meetingTitle")}
            className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
          />
          <input
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
          />
          <textarea
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder={t("genesisOs.agenda")}
            rows={2}
            className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
          />
          <button type="button" onClick={recordMeeting} className={`${cbaiBtnPrimary} min-h-10`}>
            {t("genesisOs.createMeeting")}
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.recordDecision")}</h3>
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
          >
            <option value="">—</option>
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <textarea
            value={decisionText}
            onChange={(e) => setDecisionText(e.target.value)}
            placeholder={t("genesisOs.decisionText")}
            rows={2}
            className={`w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm ${cbaiFocusRing}`}
          />
          <button type="button" onClick={recordDecision} className={`${cbaiBtnPrimary} min-h-10`}>
            {t("genesisOs.recordDecision")}
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.createDirective")}</h3>
          <input
            value={directiveTitle}
            onChange={(e) => setDirectiveTitle(e.target.value)}
            placeholder={t("genesisOs.directiveTitle")}
            className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
          />
          <button type="button" onClick={recordDirective} className={`${cbaiBtnPrimary} min-h-10`}>
            {t("genesisOs.createDirective")}
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.createTask")}</h3>
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder={t("genesisOs.taskTitle")}
            className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
          />
          <button type="button" onClick={recordPlanAndTask} className={`${cbaiBtnPrimary} min-h-10`}>
            {t("genesisOs.createPlan")} + {t("genesisOs.createTask")}
          </button>
          <input
            value={taskEvidence}
            onChange={(e) => setTaskEvidence(e.target.value)}
            placeholder={t("genesisOs.completionEvidence")}
            className={`min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm ${cbaiFocusRing}`}
          />
          <button type="button" onClick={completeFirstOpenTask} className={`${cbaiBtnPrimary} min-h-10`}>
            {t("genesisOs.updateTask")}
          </button>
          <p className="text-[10px] text-zinc-600">{t("genesisOs.evidenceRequired")}</p>
        </div>
      </div>

      {meetings.length === 0 && directives.length === 0 ? (
        <p className="text-xs text-zinc-500">{t("genesisOs.chainEmpty")}</p>
      ) : (
        <div className={`${cbaiGlassCard} space-y-2 p-4 text-xs text-zinc-400`}>
          <p>
            Chain: {meetings.length} meetings · {decisions.length} decisions · {directives.length}{" "}
            directives · {tasks.length} tasks
          </p>
          <ul className="max-h-32 space-y-1 overflow-y-auto">
            {tasks.map((task) => (
              <li key={task.id}>
                {task.title} · {task.status}
                {task.blocker ? ` · blocked: ${task.blocker}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <OperationalLoopPanel organizationId={organizationId} operatorName={operatorName} />

      <div className={`${cbaiGlassCard} space-y-3 p-4`}>
        <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.monitoringTitle")}</h3>
        <p className="text-xs text-zinc-500">{t("genesisOs.monitoringPurpose")}</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
              <p className="text-xs font-medium text-zinc-200">
                {m.label}: {m.value}
              </p>
              <p className="mt-1 text-[10px] text-zinc-600">{m.limitation}</p>
              {m.recordIds && m.recordIds.length > 0 ? (
                <p className="mt-1 text-[10px] text-zinc-500">Records: {m.recordIds.slice(0, 3).join(", ")}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {audit ? (
        <div className={`${cbaiGlassCard} space-y-2 p-4`}>
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.auditHeading")}</h3>
          <p className="text-[10px] text-zinc-600">{audit.limitation}</p>
          <ul className="max-h-24 space-y-1 overflow-y-auto text-[10px] text-zinc-500">
            {audit.genesis.slice(0, 8).map((a) => (
              <li key={a.id}>
                {a.timestamp.slice(0, 19)} · {a.action} · {a.recordType}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {feedback ? (
        <p className="text-xs text-teal-400/90" role="status">
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
