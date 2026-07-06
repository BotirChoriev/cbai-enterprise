/**
 * CBAI Evidence Pipeline Architecture — lifecycle status.
 * Declarative only — no runtime processing.
 */

export const PIPELINE_STATUSES = [
  "planned",
  "ready",
  "processing",
  "verified",
  "deprecated",
] as const;

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export type PipelineStatusDefinition = {
  status: PipelineStatus;
  label: string;
  description: string;
  allowsFutureProcessing: boolean;
};

export const PIPELINE_STATUS_DEFINITIONS: readonly PipelineStatusDefinition[] = [
  {
    status: "planned",
    label: "Planned",
    description: "Pipeline defined; runtime processing not started.",
    allowsFutureProcessing: false,
  },
  {
    status: "ready",
    label: "Ready",
    description: "Pipeline contract validated; awaiting runtime binding.",
    allowsFutureProcessing: true,
  },
  {
    status: "processing",
    label: "Processing",
    description: "Reserved — active evidence processing in future runtime.",
    allowsFutureProcessing: true,
  },
  {
    status: "verified",
    label: "Verified",
    description: "Reserved — pipeline verified against governance rules.",
    allowsFutureProcessing: true,
  },
  {
    status: "deprecated",
    label: "Deprecated",
    description: "Superseded pipeline; retained for audit and migration.",
    allowsFutureProcessing: false,
  },
] as const;

const STATUS_SET = new Set<string>(PIPELINE_STATUSES);

export function isPipelineStatus(value: string): value is PipelineStatus {
  return STATUS_SET.has(value);
}

export function isProcessablePipelineStatus(status: PipelineStatus): boolean {
  const definition = PIPELINE_STATUS_DEFINITIONS.find((entry) => entry.status === status);
  return definition?.allowsFutureProcessing ?? false;
}
