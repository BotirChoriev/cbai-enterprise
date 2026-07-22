"use client";

import { useCallback, useMemo } from "react";
import { cbaiPageStack, cbaiSectionTitle } from "@/components/brand/brand-classes";
import type { EngineResult } from "@/lib/forward-deployed-engines/engine-types";
import { cancelEngineRun, confirmEngineRun } from "@/lib/forward-deployed-engines/engine-runner";
import { formatEngineResult } from "@/lib/forward-deployed-engines/engine-result";
import { getEngineDefinition } from "@/lib/forward-deployed-engines/engine-registry";
import { useTranslation } from "@/lib/i18n/use-translation";
import ObjectivePanel from "./ObjectivePanel";
import ContextPanel from "./ContextPanel";
import MissingInputs, { UnderstandingPanel } from "./MissingInputs";
import ProposedPlan from "./ProposedPlan";
import EvidenceRequirements from "./EvidenceRequirements";
import RiskPanel from "./RiskPanel";
import ConfirmationPanel from "./ConfirmationPanel";
import ExecutionTimeline from "./ExecutionTimeline";
import EngineResultPanel from "./EngineResultPanel";
import EngineStatusBadge from "./EngineStatusBadge";

type Props = {
  result: EngineResult;
  onUpdate?: (result: EngineResult) => void;
};

export default function EngineWorkspace({ result, onUpdate }: Props) {
  const { t } = useTranslation();
  const formatted = useMemo(() => formatEngineResult(result), [result]);
  const def = getEngineDefinition(result.run.engineId);

  const handleConfirm = useCallback(() => {
    const updated = confirmEngineRun(result.run.id);
    if (updated && onUpdate) {
      onUpdate({ ...result, run: updated });
    }
  }, [result, onUpdate]);

  const handleCancel = useCallback(() => {
    const updated = cancelEngineRun(result.run.id);
    if (updated && onUpdate) {
      onUpdate({ ...result, run: updated });
    }
  }, [result, onUpdate]);

  return (
    <article className={`${cbaiPageStack} max-w-3xl`} aria-labelledby="engine-workspace-title">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className={cbaiSectionTitle} id="engine-workspace-title">
          {t("forwardDeployed.workspaceTitle")}
        </h1>
        <EngineStatusBadge state={formatted.run.state} />
      </header>
      <p className="text-sm text-zinc-500">{t(def.labelKey)}</p>

      <ObjectivePanel statement={result.run.objective.statement} />
      <ContextPanel context={result.run.context} />
      <UnderstandingPanel plan={formatted.plan} />
      <MissingInputs plan={formatted.plan} />
      <ProposedPlan plan={formatted.plan} />
      <EvidenceRequirements plan={formatted.plan} />
      <RiskPanel plan={formatted.plan} />
      <ConfirmationPanel
        canConfirm={formatted.canConfirm}
        canCancel={formatted.canCancel}
        readOnly={result.readOnly}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <ExecutionTimeline run={formatted.run} />
      <EngineResultPanel run={formatted.run} plan={formatted.plan} />
    </article>
  );
}
