import type {
  IntelligenceSubjectEntity,
  IntelligenceSummary,
} from "@/lib/intelligence/result.types";

/**
 * Formatted sections of an intelligence result for delivery surfaces.
 *
 * Formatting only — must never alter semantic meaning.
 */
export interface FormattedIntelligenceResultSections {
  claim: string;
  finalAnswer: string;
  executiveSummary: string;
  summary: IntelligenceSummary;
}

/**
 * Result formatter for the Intelligence Result Layer (BUILD-029).
 *
 * Responsible only for formatting result sections. Must never change meaning
 * or introduce business logic.
 */
export class ResultFormatter {
  /**
   * Format result text sections from assembled factual content.
   */
  formatSections(input: {
    executiveSummary: string;
    summary: IntelligenceSummary;
  }): FormattedIntelligenceResultSections {
    const normalizedSummary = this.formatSummary(input.summary);

    return {
      claim: this.formatClaim(input.executiveSummary),
      finalAnswer: this.formatFinalAnswer(input.executiveSummary),
      executiveSummary: this.formatExecutiveSummary(input.executiveSummary),
      summary: normalizedSummary,
    };
  }

  /**
   * Normalize executive summary whitespace without changing content.
   */
  formatExecutiveSummary(text: string): string {
    return text.trim();
  }

  /**
   * Format claim field — identical to executive summary in BUILD-029.
   */
  formatClaim(executiveSummary: string): string {
    return this.formatExecutiveSummary(executiveSummary);
  }

  /**
   * Format final answer field — identical to executive summary in BUILD-029.
   */
  formatFinalAnswer(executiveSummary: string): string {
    return this.formatExecutiveSummary(executiveSummary);
  }

  /**
   * Normalize summary strings without adding or removing factual content.
   */
  formatSummary(summary: IntelligenceSummary): IntelligenceSummary {
    return {
      headline: summary.headline.trim(),
      keyFindings: summary.keyFindings.map((finding) => finding.trim()),
      caveats: summary.caveats.map((caveat) => caveat.trim()),
      recommendedActions: summary.recommendedActions.map((action) => action.trim()),
    };
  }

  /**
   * Format related entity display names without altering identifiers.
   */
  formatRelatedEntities(
    entities: IntelligenceSubjectEntity[],
  ): IntelligenceSubjectEntity[] {
    return entities.map((entity) => ({
      type: entity.type,
      id: entity.id,
      name: entity.name.trim(),
    }));
  }
}

/** Shared default result formatter singleton. */
export const defaultResultFormatter = new ResultFormatter();
