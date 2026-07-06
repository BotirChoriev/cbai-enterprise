/**
 * CBAI World Bank Connector Readiness — future record validation helpers.
 * Validates shape only — does not execute against live World Bank data.
 */

import { countries } from "@/lib/countries";
import {
  isWorldBankCodeMapped,
  resolveWorldBankIndicatorFamily,
} from "@/lib/connectors/world-bank/world-bank.mapping";
import type {
  WorldBankRecordInput,
  WorldBankRecordSchema,
} from "@/lib/connectors/world-bank/world-bank.schema";
import type {
  WorldBankRecordValidationIssue,
  WorldBankRecordValidationReport,
} from "@/lib/connectors/world-bank/world-bank.types";

const KNOWN_COUNTRY_CODES = new Set(
  countries.flatMap((country) => [country.code.toUpperCase(), country.id.toUpperCase()]),
);

function pushIssue(
  target: WorldBankRecordValidationIssue[],
  issue: WorldBankRecordValidationIssue,
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

/** Validate country code against local CBAI country registry. */
export function validateWorldBankCountryCode(
  countryCode: unknown,
): WorldBankRecordValidationIssue | null {
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

/** Validate WDI indicator code presence and mapping readiness. */
export function validateWorldBankIndicatorCode(
  indicatorCode: unknown,
): WorldBankRecordValidationIssue[] {
  const issues: WorldBankRecordValidationIssue[] = [];

  if (!isNonEmptyString(indicatorCode)) {
    pushIssue(issues, {
      code: "missing_indicator_code",
      severity: "error",
      message: "Indicator code is required and must be a non-empty string.",
      field: "indicatorCode",
    });
    return issues;
  }

  const family = resolveWorldBankIndicatorFamily(indicatorCode);
  if (!family) {
    pushIssue(issues, {
      code: "unknown_indicator_mapping",
      severity: "warning",
      message: `Indicator code "${indicatorCode}" has no registered World Bank family mapping.`,
      field: "indicatorCode",
    });
    return issues;
  }

  if (!isWorldBankCodeMapped(indicatorCode)) {
    pushIssue(issues, {
      code: "unknown_indicator_mapping",
      severity: "warning",
      message: `Indicator code "${indicatorCode}" is not mapped to a CBAI indicator (status: ${family.mappingStatus}).`,
      field: "indicatorCode",
    });
  }

  return issues;
}

/** Validate observation year. */
export function validateWorldBankYear(year: unknown): WorldBankRecordValidationIssue | null {
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

/** Validate source attribution field. */
export function validateWorldBankSource(source: unknown): WorldBankRecordValidationIssue | null {
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

/** Validate numeric value type — null is permitted for not-reported observations. */
export function validateWorldBankValue(value: unknown): WorldBankRecordValidationIssue | null {
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

/** Validate a partial or complete future World Bank record. */
export function validateWorldBankRecord(
  record: WorldBankRecordInput,
): WorldBankRecordValidationReport {
  const errors: WorldBankRecordValidationIssue[] = [];
  const warnings: WorldBankRecordValidationIssue[] = [];

  function route(issue: WorldBankRecordValidationIssue | null): void {
    if (!issue) return;
    if (issue.severity === "error") errors.push(issue);
    else warnings.push(issue);
  }

  function routeAll(issues: WorldBankRecordValidationIssue[]): void {
    for (const issue of issues) {
      if (issue.severity === "error") errors.push(issue);
      else warnings.push(issue);
    }
  }

  route(validateWorldBankCountryCode(record.countryCode));
  routeAll(validateWorldBankIndicatorCode(record.indicatorCode));
  route(validateWorldBankYear(record.year));
  route(validateWorldBankSource(record.source));
  route(validateWorldBankValue(record.value));

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Type guard — checks whether an object satisfies the full record schema shape. */
export function isCompleteWorldBankRecord(
  record: WorldBankRecordInput,
): record is WorldBankRecordSchema {
  return validateWorldBankRecord(record).valid;
}

/** Assert record validity — throws on validation errors. */
export function assertValidWorldBankRecord(record: WorldBankRecordInput): void {
  const report = validateWorldBankRecord(record);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`World Bank record validation failed: ${summary}`);
  }
}
