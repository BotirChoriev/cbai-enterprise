/**
 * Runtime response validation — reject malformed payloads before normalize.
 */

import type { FailureClass } from "@/lib/official-connector-foundation/types";

export type ValidationSuccess<T> = {
  readonly ok: true;
  readonly data: T;
};

export type ValidationFailure = {
  readonly ok: false;
  readonly failureClass: FailureClass;
  readonly message: string;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export function parseJsonResponse(bodyText: string): ValidationResult<unknown> {
  if (!bodyText || !bodyText.trim()) {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: "Empty response body",
    };
  }
  try {
    return { ok: true, data: JSON.parse(bodyText) as unknown };
  } catch {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: "Response is not valid JSON",
    };
  }
}

export function assertObject(
  value: unknown,
  label = "payload"
): ValidationResult<Record<string, unknown>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: `${label} must be a non-array object`,
    };
  }
  return { ok: true, data: value as Record<string, unknown> };
}

export function requireStringField(
  obj: Record<string, unknown>,
  field: string
): ValidationResult<string> {
  const value = obj[field];
  if (typeof value !== "string" || !value.trim()) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: `Missing or invalid string field: ${field}`,
    };
  }
  return { ok: true, data: value.trim() };
}

export function requireFiniteNumberField(
  obj: Record<string, unknown>,
  field: string
): ValidationResult<number> {
  const value = obj[field];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: `Missing or invalid number field: ${field}`,
    };
  }
  return { ok: true, data: value };
}

/**
 * Generic observation-shaped payload validator for foundation tests.
 * Not tied to any live source schema.
 */
export function validateObservationPayload(
  raw: unknown
): ValidationResult<{
  indicatorCode: string;
  indicatorName: string;
  value: number;
  unit: string;
  referencePeriod: string;
  entityId: string;
  entityLabel: string;
  officialSourceUrl: string;
  datasetOrEndpoint: string;
  jurisdiction: string;
  publicationDate: string | null;
}> {
  const parsedObject = assertObject(raw, "observation");
  if (!parsedObject.ok) return parsedObject;

  const fields = [
    "indicatorCode",
    "indicatorName",
    "unit",
    "referencePeriod",
    "entityId",
    "entityLabel",
    "officialSourceUrl",
    "datasetOrEndpoint",
    "jurisdiction",
  ] as const;

  const strings: Record<(typeof fields)[number], string> = {} as Record<
    (typeof fields)[number],
    string
  >;
  for (const field of fields) {
    const result = requireStringField(parsedObject.data, field);
    if (!result.ok) return result;
    strings[field] = result.data;
  }

  const value = requireFiniteNumberField(parsedObject.data, "value");
  if (!value.ok) return value;

  const publicationDateRaw = parsedObject.data.publicationDate;
  const publicationDate =
    typeof publicationDateRaw === "string" && publicationDateRaw.trim()
      ? publicationDateRaw.trim()
      : null;

  return {
    ok: true,
    data: {
      ...strings,
      value: value.data,
      publicationDate,
    },
  };
}
