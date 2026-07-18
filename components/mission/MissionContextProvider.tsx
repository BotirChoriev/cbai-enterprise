"use client";

import { useEffect } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import { deriveMissionThread } from "@/lib/intelligence-os/mission-engine";
import { deriveAdaptiveIntelligence } from "@/lib/intelligence-os/adaptive-intelligence";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import { syncMissionFromOperatingParams, parseOperatingParams } from "@/lib/intelligence-os/mission-operating-context";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import type { EvidencePulseReading } from "@/lib/intelligence-os/evidence-pulse";
import type { MissionThreadState } from "@/lib/intelligence-os/mission.types";
import type { AdaptiveIntelligenceProfile } from "@/lib/intelligence-os/adaptive-intelligence";
import type { HumanImpactAssessment } from "@/lib/intelligence-os/human-impact.types";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";

type MissionContextValue = {
  readonly mission: Mission | null;
  readonly evidencePulse: EvidencePulseReading | null;
  readonly missionThread: readonly MissionThreadState[];
  readonly adaptive: AdaptiveIntelligenceProfile | null;
  readonly humanImpact: HumanImpactAssessment | null;
  readonly refreshMissionContext: () => void;
};

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionContextProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const { profile } = useAssistantProfile();
  const [tick, setTick] = useState(0);
  const refreshMissionContext = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onMissionDataChanged = () => refreshMissionContext();
    window.addEventListener(MISSION_DATA_CHANGED, onMissionDataChanged);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onMissionDataChanged);
  }, [refreshMissionContext]);

  const workspaceRole = profile.workspaceRole ?? null;
  const operatorName = resolveOperatorName(profile);

  const value = useMemo((): MissionContextValue => {
    if (!hydrated) {
      return {
        mission: null,
        evidencePulse: null,
        missionThread: [],
        adaptive: null,
        humanImpact: null,
        refreshMissionContext,
      };
    }
    void tick;
    syncMissionFromOperatingParams(parseOperatingParams(searchParams));
    const mission = getCurrentMission();
    const passport = buildCapabilityPassport(operatorName);
    return {
      mission,
      evidencePulse: deriveEvidencePulse(mission),
      missionThread: deriveMissionThread(mission),
      adaptive: deriveAdaptiveIntelligence(passport, workspaceRole),
      humanImpact: mission ? loadHumanImpactForMission(mission.id) : null,
      refreshMissionContext,
    };
  }, [hydrated, workspaceRole, operatorName, tick, refreshMissionContext, searchParams]);

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMissionContext(): MissionContextValue {
  const ctx = useContext(MissionContext);
  if (!ctx) {
    return {
      mission: null,
      evidencePulse: null,
      missionThread: [],
      adaptive: null,
      humanImpact: null,
      refreshMissionContext: () => {},
    };
  }
  return ctx;
}
