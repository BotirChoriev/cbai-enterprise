/**
 * CBAI Intelligence Engine — Intelligence Result Layer (BUILD-029).
 *
 * Deterministic result assembly. No LLM, external services, or fabricated intelligence.
 *
 * @see docs/build-029-report.md
 */

export {
  DEFAULT_RESULT_ASSEMBLER_ID,
  DefaultResultAssembler,
  defaultResultAssembler,
  RESULT_ASSEMBLER_VERSION,
  type ResultAssembler,
  type ResultAssemblerInput,
} from "@/lib/intelligence/result/assembler";

export {
  defaultResultFormatter,
  ResultFormatter,
  type FormattedIntelligenceResultSections,
} from "@/lib/intelligence/result/formatter";

export {
  buildFactualCaveats,
  buildFactualKeyFindings,
  buildIntelligenceSummary,
  defaultSummaryBuilder,
  EMPTY_EVIDENCE_EXECUTIVE_SUMMARY,
  isResultEvidenceInsufficient,
  resolveLifecycleState,
  resolveRelatedEntities,
  SummaryBuilder,
} from "@/lib/intelligence/result/summary";
