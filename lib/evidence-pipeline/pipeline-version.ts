export const EVIDENCE_PIPELINE_VERSION = "1.0.0" as const;

export type EvidencePipelineVersionInfo = {
  pipelineVersion: typeof EVIDENCE_PIPELINE_VERSION;
  pipelineRecordVersion: "1.0.0";
  schema: "cbai-evidence-pipeline-v1";
  runtimeSupport: "none";
};

export const EVIDENCE_PIPELINE_VERSION_INFO: EvidencePipelineVersionInfo = {
  pipelineVersion: EVIDENCE_PIPELINE_VERSION,
  pipelineRecordVersion: "1.0.0",
  schema: "cbai-evidence-pipeline-v1",
  runtimeSupport: "none",
};

export type PipelineMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

export const PIPELINE_MIGRATION_MANIFEST: readonly PipelineMigrationEntry[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Reserved — runtime stage executors and async queue binding.",
    breaking: false,
  },
  {
    fromVersion: "1.1.0",
    toVersion: "2.0.0",
    description: "Reserved — multi-pipeline routing and parallel normalization.",
    breaking: true,
  },
];

export const PIPELINE_LIFECYCLE_STAGES = [
  "defined",
  "validated",
  "runtime-bound",
  "processing",
  "verified",
  "deprecated",
  "archived",
] as const;

export type PipelineLifecycleStage = (typeof PIPELINE_LIFECYCLE_STAGES)[number];
