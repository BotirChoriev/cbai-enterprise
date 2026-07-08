export {
  METHOD_COMPARISON_STATUSES,
  METHOD_COMPARISON_MODEL_VERSION,
  METHOD_COMPARISON_STATUS_LABELS,
  METHOD_COMPARISON_HONEST_NOTICE,
  METHOD_COMPARISON_HUMAN_REVIEW_NOTICE,
  METHOD_COMPARISON_LIMITATIONS,
  WORKSPACE_METHOD_PREVIEW_LIMIT,
  WORKSPACE_METHOD_PREVIEW_MIN,
  type MethodComparisonStatus,
  type MethodEvidenceRow,
  type MethodEvidenceMatrixCell,
  type MethodComparison,
} from "@/lib/research/method-comparison/method-comparison-types";

export {
  buildMethodComparisonForTopic,
  buildMethodEvidenceMatrix,
  selectWorkspaceMethodRows,
} from "@/lib/research/method-comparison/method-comparison-builder";

export {
  getMethodComparisonForTopic,
  getMethodComparison,
  getMethodEvidenceMatrixForTopic,
  getWorkspaceMethodRows,
} from "@/lib/research/method-comparison/method-comparison-query";

export {
  validateMethodComparison,
  validateMethodComparisons,
  type MethodComparisonValidationIssue,
  type MethodComparisonValidationReport,
} from "@/lib/research/method-comparison/method-comparison-validation";
