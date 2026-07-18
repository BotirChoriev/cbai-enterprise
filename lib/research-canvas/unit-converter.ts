/**
 * Dimension-safe unit conversion — rejects incompatible dimensions.
 */

import { getUnit, dimensionsCompatible, formatDimension } from "@/lib/research-canvas/unit-registry";
import type { ConversionRecord, DimensionVector } from "@/lib/research-canvas/research-canvas-types";
import { genesisId } from "@/lib/genesis/genesis-storage";

export type ConversionResult =
  | {
      ok: true;
      convertedValue: number;
      conversionFactor: number;
      formula: string;
      record: Omit<ConversionRecord, "id" | "timestamp">;
      roundingWarning?: string;
    }
  | { ok: false; reason: string };

function dimensionPower(d: DimensionVector): number {
  const exponents = [d.time, d.length, d.mass, d.current, d.temperature, d.amount, d.luminous];
  const nonZero = exponents.filter((v) => v !== 0);
  if (nonZero.length === 1) return Math.abs(nonZero[0]!);
  return 1;
}

function toSiBase(value: number, unit: NonNullable<ReturnType<typeof getUnit>>): number {
  if (unit.dimension.temperature === 1) return value * unit.scale + unit.offset;
  const power = dimensionPower(unit.dimension);
  return value * Math.pow(unit.scale, power);
}

function fromSiBase(siValue: number, unit: NonNullable<ReturnType<typeof getUnit>>): number {
  if (unit.dimension.temperature === 1) return (siValue - unit.offset) / unit.scale;
  const power = dimensionPower(unit.dimension);
  return siValue / Math.pow(unit.scale, power);
}

export function convertUnits(input: {
  value: number;
  fromUnitId: string;
  toUnitId: string;
  smartIdeaId: string;
  significantFigures?: number;
}): ConversionResult {
  const from = getUnit(input.fromUnitId);
  const to = getUnit(input.toUnitId);
  if (!from || !to) {
    return { ok: false, reason: "Unknown unit identifier." };
  }
  if (!from.conversionSupported || !to.conversionSupported) {
    return { ok: false, reason: `Conversion not supported for ${from.symbol} or ${to.symbol}.` };
  }
  if (!dimensionsCompatible(from.dimension, to.dimension)) {
    return {
      ok: false,
      reason: `Incompatible dimensions: ${formatDimension(from.dimension)} cannot convert to ${formatDimension(to.dimension)}.`,
    };
  }

  let converted: number;
  let formula: string;

  if (from.dimension.temperature === 1 && to.dimension.temperature === 1) {
    const kelvinFrom = toSiBase(input.value, from);
    converted = fromSiBase(kelvinFrom, to);
    formula = "K = value×scale_from + offset_from; result = (K - offset_to) / scale_to";
  } else {
    const si = toSiBase(input.value, from);
    converted = fromSiBase(si, to);
    const power = dimensionPower(from.dimension);
    formula =
      power === 1
        ? `result = value × (${from.scale}/${to.scale})`
        : `result = value × (${from.scale}/${to.scale})^${power}`;
  }

  const sigFigs = input.significantFigures ?? 6;
  const rounded = Number(converted.toPrecision(sigFigs));
  const roundingWarning =
    rounded !== converted ? "Result rounded — original value preserved in record." : undefined;

  return {
    ok: true,
    convertedValue: rounded,
    conversionFactor: rounded / input.value,
    formula,
    roundingWarning,
    record: {
      smartIdeaId: input.smartIdeaId,
      fromValue: input.value,
      fromUnitId: from.id,
      toUnitId: to.id,
      convertedValue: rounded,
      conversionFactor: rounded / input.value,
      formula,
    },
  };
}

export function buildConversionRecord(input: Omit<ConversionRecord, "id" | "timestamp">): ConversionRecord {
  return {
    ...input,
    id: genesisId("conv"),
    timestamp: new Date().toISOString(),
  };
}
