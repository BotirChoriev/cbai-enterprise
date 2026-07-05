"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  executeReasoning,
  getStagesWithStatus,
} from "@/lib/reasoning/reasoning.engine";
import { REASONING_STAGE_DELAYS } from "@/lib/reasoning/reasoning.mock";
import { REASONING_STAGE_ORDER } from "@/lib/reasoning/reasoning.types";
import ReasoningInput from "@/components/reasoning/ReasoningInput";
import ReasoningPipeline from "@/components/reasoning/ReasoningPipeline";
import EvidencePanel from "@/components/reasoning/EvidencePanel";
import DecisionTree from "@/components/reasoning/DecisionTree";
import ConfidenceMeter from "@/components/reasoning/ConfidenceMeter";
import ReasoningSummaryPanel from "@/components/reasoning/ReasoningSummary";

export default function ReasoningPage() {
  const [question, setQuestion] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(-1);
  const [result, setResult] = useState<ReturnType<typeof executeReasoning> | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stages = useMemo(() => {
    if (!result) return [];
    return getStagesWithStatus(result, activeStageIndex, isComplete);
  }, [result, activeStageIndex, isComplete]);

  const evidenceVisible = activeStageIndex >= 3 || isComplete;
  const decisionVisible = activeStageIndex >= 5 || isComplete;
  const confidenceVisible = activeStageIndex >= 6 || isComplete;
  const summaryVisible = isComplete;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const runPipeline = useCallback(() => {
    const trimmed = question.trim();
    if (!trimmed) return;

    clearTimer();
    const reasoningResult = executeReasoning(trimmed);
    setResult(reasoningResult);
    setIsRunning(true);
    setIsComplete(false);
    setActiveStageIndex(0);

    let stageIndex = 0;

    function advanceStage() {
      if (stageIndex >= REASONING_STAGE_ORDER.length - 1) {
        setActiveStageIndex(REASONING_STAGE_ORDER.length);
        setIsComplete(true);
        setIsRunning(false);
        return;
      }

      stageIndex += 1;
      setActiveStageIndex(stageIndex);

      const stageId = REASONING_STAGE_ORDER[stageIndex];
      const delay = REASONING_STAGE_DELAYS[stageId];
      timerRef.current = setTimeout(advanceStage, delay);
    }

    const firstDelay = REASONING_STAGE_DELAYS[REASONING_STAGE_ORDER[0]];
    timerRef.current = setTimeout(advanceStage, firstDelay);
  }, [question, clearTimer]);

  return (
    <div className="space-y-6">
      <ReasoningInput
        question={question}
        onQuestionChange={setQuestion}
        onSubmit={runPipeline}
        isRunning={isRunning}
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <ReasoningPipeline stages={stages} isRunning={isRunning} />
        </div>

        <div className="space-y-4 xl:col-span-4">
          <EvidencePanel
            evidence={result?.evidence ?? []}
            visible={evidenceVisible}
          />
          <DecisionTree
            tree={result?.decisionTree ?? null}
            visible={decisionVisible}
          />
        </div>

        <div className="space-y-4 xl:col-span-4">
          <ConfidenceMeter
            confidence={result?.confidence ?? 0}
            factors={result?.confidenceFactors ?? []}
            visible={confidenceVisible}
          />
          <ReasoningSummaryPanel
            summary={result?.summary ?? null}
            finalAnswer={result?.finalAnswer ?? ""}
            result={result}
            visible={summaryVisible}
          />
        </div>
      </div>
    </div>
  );
}
