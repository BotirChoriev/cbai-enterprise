/**
 * Comparative Intelligence safety model (Adaptive Intelligence Workspace, Phase 7).
 *
 * CBAI compares WORK and EVIDENCE — research questions, methods, datasets,
 * results, limitations. It never scores or judges a person's worth,
 * intelligence, or general competence, and it never calls something a
 * weakness without an evidence-supported, precisely classified reason.
 */

/** The only permitted limitation classifications — no vague "weak" labels. */
export const COMPARISON_CLASSIFICATIONS = [
  "evidence_unavailable",
  "method_limitation",
  "dataset_limitation",
  "scope_mismatch",
  "not_independently_verified",
  "conflicting_result",
  "insufficient_information",
  "author_declared_limitation",
] as const;

export type ComparisonClassification = (typeof COMPARISON_CLASSIFICATIONS)[number];

/** Every rendered comparison block must declare what kind of content it is. */
export const COMPARISON_CONTENT_ORIGINS = [
  "official_source",
  "user_provided",
  "cbai_summary",
  "cbai_inference",
  "uncertainty",
  "recommendation",
] as const;

export type ComparisonContentOrigin = (typeof COMPARISON_CONTENT_ORIGINS)[number];

export type ComparisonBlock = {
  readonly origin: ComparisonContentOrigin;
  readonly text: string;
};

export type ComparisonLimitation = {
  readonly classification: ComparisonClassification;
  readonly text: string;
  readonly origin: ComparisonContentOrigin;
};

export type ComparisonStrength = {
  readonly text: string;
  /** A strength claim is only valid when tied to concrete evidence. */
  readonly evidenceRef: string;
  readonly origin: ComparisonContentOrigin;
};

export type ComparisonOutcome = {
  readonly commonGround: readonly ComparisonBlock[];
  readonly differences: readonly ComparisonBlock[];
  readonly strengths: readonly ComparisonStrength[];
  readonly limitations: readonly ComparisonLimitation[];
  readonly contradictions: readonly ComparisonBlock[];
  readonly missingEvidence: readonly ComparisonBlock[];
  readonly combinationOpportunities: readonly ComparisonBlock[];
  /** Three to five new research options — enforced by validation. */
  readonly newResearchOptions: readonly ComparisonBlock[];
  readonly synthesis: {
    readonly text: string;
    readonly reasoning: string;
    readonly remainingUncertainty: string;
    readonly origin: "recommendation";
  } | null;
  /** The comparison always ends at a human decision checkpoint. */
  readonly humanCheckpoint: true;
};

/**
 * Detects judgments about a person rather than their work. Deliberately
 * targeted at personal-worth language; methodological critique ("the method
 * has a dataset limitation") passes.
 */
const PERSONAL_JUDGMENT_PATTERNS: readonly RegExp[] = [
  /\b(stupid|incompetent|worthless|lazy|fraud(ster)?|charlatan|mediocre (scientist|researcher|author))\b/i,
  /\b(bad|poor|weak|inferior) (scientist|researcher|author|scholar|person)\b/i,
  /\b(smarter|dumber|more intelligent|less intelligent) than\b/i,
  /\b(iq|intelligence) (score|level|rating) of (the )?(author|scientist|researcher)\b/i,
  // Note: \b is ASCII-only in JavaScript, so non-Latin patterns avoid it.
  /(olim|tadqiqotchi|muallif)\s+(yaroqsiz|qobiliyatsiz|bilimsiz)/i,
  /(учёный|ученый|исследователь|автор)\s+(глуп|некомпетентен|бездарен)/i,
  /(bilim insanı|araştırmacı|yazar)\s+(yetersiz|beceriksiz|aptal)/i,
];

export function containsPersonalJudgment(text: string): boolean {
  return PERSONAL_JUDGMENT_PATTERNS.some((pattern) => pattern.test(text));
}

export type ComparisonValidation = {
  readonly ok: boolean;
  readonly problems: readonly string[];
};

export function validateComparisonOutcome(outcome: ComparisonOutcome): ComparisonValidation {
  const problems: string[] = [];

  if (outcome.newResearchOptions.length < 3 || outcome.newResearchOptions.length > 5) {
    problems.push("new_research_options_must_be_three_to_five");
  }
  if (outcome.humanCheckpoint !== true) {
    problems.push("human_checkpoint_required");
  }
  for (const limitation of outcome.limitations) {
    if (!COMPARISON_CLASSIFICATIONS.includes(limitation.classification)) {
      problems.push(`unclassified_limitation:${limitation.classification}`);
    }
  }
  for (const strength of outcome.strengths) {
    if (!strength.evidenceRef.trim()) {
      problems.push("strength_without_evidence");
    }
  }
  const allBlocks: readonly { readonly text: string }[] = [
    ...outcome.commonGround,
    ...outcome.differences,
    ...outcome.strengths,
    ...outcome.limitations,
    ...outcome.contradictions,
    ...outcome.missingEvidence,
    ...outcome.combinationOpportunities,
    ...outcome.newResearchOptions,
    ...(outcome.synthesis ? [outcome.synthesis] : []),
  ];
  for (const block of allBlocks) {
    if (containsPersonalJudgment(block.text)) {
      problems.push("personal_judgment_rejected");
    }
  }

  return { ok: problems.length === 0, problems };
}
