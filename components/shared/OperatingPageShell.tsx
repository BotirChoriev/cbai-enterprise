"use client";

import type { ReactNode } from "react";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import EntityPageHeader from "@/components/shared/EntityPageHeader";
import MissionOperatingContextBar from "@/components/mission/MissionOperatingContextBar";

type OperatingPageShellProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  showOperator?: boolean;
  showMissionContext?: boolean;
  missionContextVariant?: "compact" | "full";
  children: ReactNode;
};

/** One operating-system page frame: mission context → header → Operator → content. */
export default function OperatingPageShell({
  title,
  description,
  action,
  showOperator = true,
  showMissionContext = true,
  missionContextVariant = "compact",
  children,
}: OperatingPageShellProps) {
  return (
    <div className="space-y-6">
      {showMissionContext ? <MissionOperatingContextBar variant={missionContextVariant} /> : null}
      <EntityPageHeader title={title} description={description ?? ""} />
      {action}
      {showOperator ? <ContextualOperatorBanner /> : null}
      {children}
    </div>
  );
}
