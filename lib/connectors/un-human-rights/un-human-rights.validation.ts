/**
 * CBAI UN / Human Rights Connector Readiness — future record validation helpers.
 * Validates shape and neutrality risks only — does not execute against live UN data.
 */

import { countries } from "@/lib/countries";
import {
  isUnHumanRightsCodeMapped,
  resolveUnHumanRightsIndicatorFamily,
} from "@/lib/connectors/un-human-rights/un-human-rights.mapping";
import type {
  UnHumanRightsRecordInput,
  UnHumanRightsRecordSchema,
} from "@/lib/connectors/un-human-rights/un-human-rights.schema";
import type {
  UnHumanRightsRecordValidationIssue,
  UnHumanRightsRecordValidationReport,
} from "@/lib/connectors/un-human-rights/un-human-rights.types";

const KNOWN_COUNTRY_CODES = new Set(
  countries.flatMap((country) => [country.code.toUpperCase(), country.id.toUpperCase()]),
);

/** Patterns indicating prohibited political or sentiment scoring content. */
const SENTIMENT_SCORING_PATTERNS: readonly RegExp[] = [
  /\bsentiment\s+score\b/i,
  /\bapproval\s+rating\b/i,
  /\bpopularity\s+(index|score|rating)\b/i,
  /\bunrest\s+score\b/i,
  /\bprotest\s+intensity\b/i,
  /\bsocial\s+unrest\s+index\b/i,
  /\bcitizen\s+sentiment\b/i,
  /\bpublic\s+mood\s+score\b/i,
  /\bhappiness\s+ranking\b/i,
] as const;

/** Patterns indicating politically sensitive wording risks. */
const POLITICAL_SENSITIVITY_PATTERNS: readonly RegExp[] = [
  /\bpolitical\s+endorsement\b/i,
  /\bpolitical\s+condemnation\b/i,
  /\bshould\s+elect\b/i,
  /\bmust\s+vote\s+for\b/i,
  /\bparty\s+recommendation\b/i,
  /\bleader\s+recommendation\b/i,
  /\bpolicy\s+prescription\b/i,
  /\bregime\s+change\b/i,
  /\bgovernment\s+illegitimate\b/i,
] as const;

function pushIssue(
  target: UnHumanRightsRecordValidationIssue[],
  issue: UnHumanRightsRecordValidationIssue,
): void {
  target.push(issue);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidYear(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1900 && value <= 2200;
}

function isValidValue(value: unknown): boolean {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function collectTextFields(record: UnHumanRightsRecordInput): string[] {
  const texts: string[] = [];

  if (typeof record.indicatorName === "string") texts.push(record.indicatorName);
  if (typeof record.source === "string") texts.push(record.source);
  if (typeof record.sourceAgency === "string") texts.push(record.sourceAgency);
  if (typeof record.methodologyReference === "string") texts.push(record.methodologyReference);

  if (record.metadata) {
    for (const value of Object.values(record.metadata)) {
      texts.push(value);
    }
  }

  return texts;
}

export function validateUnHumanRightsCountryCode(
  countryCode: unknown,
): UnHumanRightsRecordValidationIssue | null {
  if (!isNonEmptyString(countryCode)) {
    return {
      code: "missing_country_code",
      severity: "error",
      message: "Country code is required and must be a non-empty string.",
      field: "countryCode",
    };
  }

  if (!KNOWN_COUNTRY_CODES.has(countryCode.trim().toUpperCase())) {
    return {
      code: "unknown_country",
      severity: "error",
      message: `Country code "${countryCode}" is not in the CBAI local country registry.`,
      field: "countryCode",
    };
  }

  return null;
}

export function validateUnHumanRightsIndicatorCode(
  indicatorCode: unknown,
): UnHumanRightsRecordValidationIssue[] {
  const issues: UnHumanRightsRecordValidationIssue[] = [];

  if (!isNonEmptyString(indicatorCode)) {
    pushIssue(issues, {
      code: "missing_indicator_code",
      severity: "error",
      message: "Indicator code is required and must be a non-empty string.",
      field: "indicatorCode",
    });
    return issues;
  }

  const family = resolveUnHumanRightsIndicatorFamily(indicatorCode);
  if (!family) {
    pushIssue(issues, {
      code: "unknown_indicator_mapping",
      severity: "warning",
      message: `Indicator code "${indicatorCode}" has no registered UN / human-rights family mapping.`,
      field: "indicatorCode",
    });
    return issues;
  }

  if (!isUnHumanRightsCodeMapped(indicatorCode)) {
    pushIssue(issues, {
      code: "unknown_indicator_mapping",
      severity: "warning",
      message: `Indicator code "${indicatorCode}" is not mapped to a CBAI indicator (status: ${family.mappingStatus}).`,
      field: "indicatorCode",
    });
  }

  return issues;
}

export function validateUnHumanRightsYear(
  year: unknown,
): UnHumanRightsRecordValidationIssue | null {
  if (year === undefined || year === null) {
    return {
      code: "missing_year",
      severity: "error",
      message: "Year is required.",
      field: "year",
    };
  }

  if (!isValidYear(year)) {
    return {
      code: "missing_year",
      severity: "error",
      message: "Year must be an integer between 1900 and 2200.",
      field: "year",
    };
  }

  return null;
}

export function validateUnHumanRightsSource(
  source: unknown,
): UnHumanRightsRecordValidationIssue | null {
  if (!isNonEmptyString(source)) {
    return {
      code: "missing_source",
      severity: "error",
      message: "Source attribution is required and must be a non-empty string.",
      field: "source",
    };
  }

  return null;
}

export function validateUnHumanRightsSourceAgency(
  sourceAgency: unknown,
): UnHumanRightsRecordValidationIssue | null {
  if (!isNonEmptyString(sourceAgency)) {
    return {
      code: "missing_source_agency",
      severity: "error",
      message: "Source agency is required and must identify the publishing UN body.",
      field: "sourceAgency",
    };
  }

  return null;
}

export function validateUnHumanRightsMethodologyReference(
  methodologyReference: unknown,
): UnHumanRightsRecordValidationIssue | null {
  if (!isNonEmptyString(methodologyReference)) {
    return {
      code: "missing_methodology_reference",
      severity: "error",
      message: "Methodology reference is required for reproducibility.",
      field: "methodologyReference",
    };
  }

  return null;
}

export function validateUnHumanRightsValue(
  value: unknown,
): UnHumanRightsRecordValidationIssue | null {
  if (value === undefined) return null;

  if (!isValidValue(value)) {
    return {
      code: "invalid_value_type",
      severity: "error",
      message: "Value must be a finite number or null when not reported.",
      field: "value",
    };
  }

  return null;
}

/** Scan text fields for prohibited sentiment scoring language. */
export function validateUnHumanRightsSentimentRisk(
  record: UnHumanRightsRecordInput,
): UnHumanRightsRecordValidationIssue[] {
  const issues: UnHumanRightsRecordValidationIssue[] = [];
  const texts = collectTextFields(record);

  for (const text of texts) {
    for (const pattern of SENTIMENT_SCORING_PATTERNS) {
      if (pattern.test(text)) {
        pushIssue(issues, {
          code: "social_sentiment_scoring_risk",
          severity: "error",
          message: `Text contains prohibited sentiment or popularity scoring language: "${text.slice(0, 80)}".`,
        });
        break;
      }
    }
  }

  return issues;
}

/** Scan text fields for politically sensitive wording risks. */
export function validateUnHumanRightsPoliticalSensitivityRisk(
  record: UnHumanRightsRecordInput,
): UnHumanRightsRecordValidationIssue[] {
  const issues: UnHumanRightsRecordValidationIssue[] = [];
  const texts = collectTextFields(record);

  for (const text of texts) {
    for (const pattern of POLITICAL_SENSITIVITY_PATTERNS) {
      if (pattern.test(text)) {
        pushIssue(issues, {
          code: "politically_sensitive_wording_risk",
          severity: "warning",
          message: `Text may contain politically sensitive wording — governance review required: "${text.slice(0, 80)}".`,
        });
        break;
      }
    }
  }

  return issues;
}

/** Validate a partial or complete future UN / human-rights record. */
export function validateUnHumanRightsRecord(
  record: UnHumanRightsRecordInput,
): UnHumanRightsRecordValidationReport {
  const errors: UnHumanRightsRecordValidationIssue[] = [];
  const warnings: UnHumanRightsRecordValidationIssue[] = [];

  function route(issue: UnHumanRightsRecordValidationIssue | null): void {
    if (!issue) return;
    if (issue.severity === "error") errors.push(issue);
    else warnings.push(issue);
  }

  function routeAll(issues: UnHumanRightsRecordValidationIssue[]): void {
    for (const issue of issues) {
      if (issue.severity === "error") errors.push(issue);
      else warnings.push(issue);
    }
  }

  route(validateUnHumanRightsCountryCode(record.countryCode));
  routeAll(validateUnHumanRightsIndicatorCode(record.indicatorCode));
  route(validateUnHumanRightsYear(record.year));
  route(validateUnHumanRightsSource(record.source));
  route(validateUnHumanRightsSourceAgency(record.sourceAgency));
  route(validateUnHumanRightsMethodologyReference(record.methodologyReference));
  route(validateUnHumanRightsValue(record.value));
  routeAll(validateUnHumanRightsSentimentRisk(record));
  routeAll(validateUnHumanRightsPoliticalSensitivityRisk(record));

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

export function isCompleteUnHumanRightsRecord(
  record: UnHumanRightsRecordInput,
): record is UnHumanRightsRecordSchema {
  return validateUnHumanRightsRecord(record).valid;
}

export function assertValidUnHumanRightsRecord(record: UnHumanRightsRecordInput): void {
  const report = validateUnHumanRightsRecord(record);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`UN / human-rights record validation failed: ${summary}`);
  }
}
