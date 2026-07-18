"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import {
  isValidManualDescription,
  manualInterpretationDraftStore,
} from "@/lib/research-canvas/manual-interpretation-draft";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiMineralSurface } from "@/components/brand/brand-classes";

type ManualInterpretationInputPanelProps = {
  smartIdeaId: string;
  open: boolean;
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder: string;
  validationMessage: string;
  submitLabel: string;
  onSubmit: (value: string) => void;
};

export default function ManualInterpretationInputPanel({
  smartIdeaId,
  open,
  value,
  onValueChange,
  label,
  placeholder,
  validationMessage,
  submitLabel,
  onSubmit,
}: ManualInterpretationInputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reactId = useId();
  const textareaId = `manual-desc-${smartIdeaId}`;
  const validationId = `${reactId}-validation`;
  const canSubmit = isValidManualDescription(value);

  const syncValue = useCallback(
    (next: string) => {
      manualInterpretationDraftStore.write(smartIdeaId, next);
      onValueChange(next);
    },
    [onValueChange, smartIdeaId],
  );

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, smartIdeaId]);

  if (!open) return null;

  return (
    <div
      className={`${cbaiMineralSurface} relative isolate z-10 space-y-2 p-3`}
      data-testid="manual-interpretation-input-panel"
    >
      <label className="text-xs text-zinc-400" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        id={textareaId}
        ref={textareaRef}
        name="manual-interpretation-description"
        value={value}
        onChange={(event) => syncValue(event.target.value)}
        onInput={(event) => syncValue(event.currentTarget.value)}
        placeholder={placeholder}
        rows={5}
        spellCheck
        autoComplete="off"
        aria-label={label}
        aria-invalid={value.trim().length > 0 && !canSubmit}
        aria-describedby={validationId}
        className={`${cbaiFocusRing} pointer-events-auto relative z-10 min-h-24 w-full resize-y rounded-md border border-zinc-700 bg-[var(--surface)] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500`}
        data-testid="manual-interpretation-textarea"
      />
      {!canSubmit && value.trim().length > 0 ? (
        <p id={validationId} className="text-xs text-amber-400/90" role="status">
          {validationMessage}
        </p>
      ) : (
        <p id={validationId} className="sr-only">
          {validationMessage}
        </p>
      )}
      <button
        type="button"
        onClick={() => onSubmit(value)}
        className={cbaiBtnPrimary}
        disabled={!canSubmit}
        data-testid="manual-interpretation-submit"
      >
        {submitLabel}
      </button>
    </div>
  );
}
