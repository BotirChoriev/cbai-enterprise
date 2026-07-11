// Shared structural-validation result shape. Extracted during the RC-1 platform audit
// (EPIC-10) after finding six independently-declared, byte-for-byte-identical
// `{ valid, issues }` interfaces across the Evidence, Workflow, Reasoning, Orchestration,
// Network, and Workspace engines — a pure type consolidation with zero behavior change. Every
// validator's return shape is unchanged; only the declared type name is now shared, the same
// "promote a genuine duplicate, alias it back" discipline used since EPIC-04's Confidence
// extraction.
export interface PlatformValidationResult {
  valid: boolean;
  issues: readonly string[];
}
