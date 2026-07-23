"use client";

import type { ReactNode } from "react";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import EntityPageHeader from "@/components/shared/EntityPageHeader";
import MissionOperatingContextBar from "@/components/mission/MissionOperatingContextBar";
import { cbaiStackLg } from "@/components/brand/brand-classes";

type OperatingPageShellProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  showOperator?: boolean;
  showMissionContext?: boolean;
  missionContextVariant?: "compact" | "full";
  statusStrip?: ReactNode;
  children: ReactNode;
};

/** Page frame — optional mission continuity strip below the header. */
export default function OperatingPageShell({
  title,
  description,
  action,
  showOperator = false,
  showMissionContext = true,
  missionContextVariant,
  statusStrip,
  children,
}: OperatingPageShellProps) {
  const showMissionBar = showMissionContext && missionContextVariant;

  return (
    <div className={cbaiStackLg}>
      <EntityPageHeader title={title} description={description ?? ""} />
      {showMissionBar ? <MissionOperatingContextBar variant={missionContextVariant} /> : null}
      {statusStrip}
      {action}
      {showOperator ? <ContextualOperatorBanner /> : null}
      {children}
    </div>
  );
}
