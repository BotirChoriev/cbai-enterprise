/**
 * SI-based unit registry — established conversion definitions only.
 */

import type { DimensionVector } from "@/lib/research-canvas/research-canvas-types";

export type UnitRecord = {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly dimension: DimensionVector;
  readonly siBaseExpression: string;
  readonly scale: number;
  readonly offset: number;
  readonly domain: string;
  readonly aliases: readonly string[];
  readonly conversionSupported: boolean;
  readonly sigFigGuidance: string;
  readonly sourceReference: string;
  readonly limitation: string;
};

const ZERO: DimensionVector = {
  time: 0,
  length: 0,
  mass: 0,
  current: 0,
  temperature: 0,
  amount: 0,
  luminous: 0,
};

function dim(partial: Partial<DimensionVector>): DimensionVector {
  return { ...ZERO, ...partial };
}

export const UNIT_REGISTRY: readonly UnitRecord[] = [
  {
    id: "m",
    name: "metre",
    symbol: "m",
    dimension: dim({ length: 1 }),
    siBaseExpression: "m",
    scale: 1,
    offset: 0,
    domain: "length",
    aliases: ["meter", "metre"],
    conversionSupported: true,
    sigFigGuidance: "Preserve input precision unless rounding is documented.",
    sourceReference: "SI Brochure — metre",
    limitation: "Definition assumes standard SI metre.",
  },
  {
    id: "cm",
    name: "centimetre",
    symbol: "cm",
    dimension: dim({ length: 1 }),
    siBaseExpression: "0.01 m",
    scale: 0.01,
    offset: 0,
    domain: "length",
    aliases: ["centimeter"],
    conversionSupported: true,
    sigFigGuidance: "1 cm = 0.01 m exactly.",
    sourceReference: "SI prefix centi-",
    limitation: "",
  },
  {
    id: "mm",
    name: "millimetre",
    symbol: "mm",
    dimension: dim({ length: 1 }),
    siBaseExpression: "0.001 m",
    scale: 0.001,
    offset: 0,
    domain: "length",
    aliases: ["millimeter"],
    conversionSupported: true,
    sigFigGuidance: "1 mm = 0.001 m exactly.",
    sourceReference: "SI prefix milli-",
    limitation: "",
  },
  {
    id: "kg",
    name: "kilogram",
    symbol: "kg",
    dimension: dim({ mass: 1 }),
    siBaseExpression: "kg",
    scale: 1,
    offset: 0,
    domain: "mass",
    aliases: [],
    conversionSupported: true,
    sigFigGuidance: "Preserve measurement precision.",
    sourceReference: "SI Brochure — kilogram",
    limitation: "",
  },
  {
    id: "g",
    name: "gram",
    symbol: "g",
    dimension: dim({ mass: 1 }),
    siBaseExpression: "0.001 kg",
    scale: 0.001,
    offset: 0,
    domain: "mass",
    aliases: ["gramme"],
    conversionSupported: true,
    sigFigGuidance: "1 g = 0.001 kg exactly.",
    sourceReference: "SI prefix kilo-",
    limitation: "",
  },
  {
    id: "s",
    name: "second",
    symbol: "s",
    dimension: dim({ time: 1 }),
    siBaseExpression: "s",
    scale: 1,
    offset: 0,
    domain: "time",
    aliases: ["sec"],
    conversionSupported: true,
    sigFigGuidance: "Preserve timing precision.",
    sourceReference: "SI Brochure — second",
    limitation: "",
  },
  {
    id: "K",
    name: "kelvin",
    symbol: "K",
    dimension: dim({ temperature: 1 }),
    siBaseExpression: "K",
    scale: 1,
    offset: 0,
    domain: "temperature",
    aliases: ["kelvin"],
    conversionSupported: true,
    sigFigGuidance: "Kelvin is SI base unit for thermodynamic temperature.",
    sourceReference: "SI Brochure — kelvin",
    limitation: "",
  },
  {
    id: "degC",
    name: "degree Celsius",
    symbol: "°C",
    dimension: dim({ temperature: 1 }),
    siBaseExpression: "K = °C + 273.15",
    scale: 1,
    offset: 273.15,
    domain: "temperature",
    aliases: ["celsius", "C"],
    conversionSupported: true,
    sigFigGuidance: "Offset conversion — not a simple scale factor alone.",
    sourceReference: "ITS-90 / SI degree Celsius definition",
    limitation: "Use for Celsius ↔ kelvin only with offset formula.",
  },
  {
    id: "m2",
    name: "square metre",
    symbol: "m²",
    dimension: dim({ length: 2 }),
    siBaseExpression: "m²",
    scale: 1,
    offset: 0,
    domain: "area",
    aliases: ["sqm"],
    conversionSupported: true,
    sigFigGuidance: "Area conversions require squared scale factors.",
    sourceReference: "SI derived unit",
    limitation: "",
  },
  {
    id: "m3",
    name: "cubic metre",
    symbol: "m³",
    dimension: dim({ length: 3 }),
    siBaseExpression: "m³",
    scale: 1,
    offset: 0,
    domain: "volume",
    aliases: [],
    conversionSupported: true,
    sigFigGuidance: "Volume conversions require cubed scale factors.",
    sourceReference: "SI derived unit",
    limitation: "",
  },
  {
    id: "N",
    name: "newton",
    symbol: "N",
    dimension: dim({ mass: 1, length: -2, time: -2 }),
    siBaseExpression: "kg·m/s²",
    scale: 1,
    offset: 0,
    domain: "force",
    aliases: ["newton"],
    conversionSupported: false,
    sigFigGuidance: "Derived unit — convert via component SI units.",
    sourceReference: "SI derived unit",
    limitation: "Direct conversion only among compatible force units when registered.",
  },
  {
    id: "Pa",
    name: "pascal",
    symbol: "Pa",
    dimension: dim({ mass: 1, length: -1, time: -2 }),
    siBaseExpression: "N/m²",
    scale: 1,
    offset: 0,
    domain: "pressure",
    aliases: ["pascal"],
    conversionSupported: false,
    sigFigGuidance: "Derived unit.",
    sourceReference: "SI derived unit",
    limitation: "",
  },
  {
    id: "A",
    name: "ampere",
    symbol: "A",
    dimension: dim({ current: 1 }),
    siBaseExpression: "A",
    scale: 1,
    offset: 0,
    domain: "electric_current",
    aliases: ["ampere"],
    conversionSupported: true,
    sigFigGuidance: "Electric current base unit.",
    sourceReference: "SI Brochure — ampere",
    limitation: "",
  },
  {
    id: "cd",
    name: "candela",
    symbol: "cd",
    dimension: dim({ luminous: 1 }),
    siBaseExpression: "cd",
    scale: 1,
    offset: 0,
    domain: "luminous_intensity",
    aliases: ["candela"],
    conversionSupported: true,
    sigFigGuidance: "Luminous intensity base unit.",
    sourceReference: "SI Brochure — candela",
    limitation: "",
  },
  {
    id: "mol",
    name: "mole",
    symbol: "mol",
    dimension: dim({ amount: 1 }),
    siBaseExpression: "mol",
    scale: 1,
    offset: 0,
    domain: "amount",
    aliases: ["mole"],
    conversionSupported: true,
    sigFigGuidance: "Amount of substance.",
    sourceReference: "SI Brochure — mole",
    limitation: "",
  },
  {
    id: "mol/L",
    name: "molar concentration",
    symbol: "mol/L",
    dimension: dim({ amount: 1, length: -3 }),
    siBaseExpression: "mol/m³ (via 1000 factor)",
    scale: 1000,
    offset: 0,
    domain: "concentration",
    aliases: ["M", "molar"],
    conversionSupported: false,
    sigFigGuidance: "1 mol/L = 1000 mol/m³.",
    sourceReference: "Common chemistry unit",
    limitation: "Register mol/m³ separately for full dimensional safety.",
  },
  {
    id: "rad",
    name: "radian",
    symbol: "rad",
    dimension: ZERO,
    siBaseExpression: "dimensionless angle",
    scale: 1,
    offset: 0,
    domain: "angle",
    aliases: ["radian"],
    conversionSupported: true,
    sigFigGuidance: "Dimensionless ratio.",
    sourceReference: "SI supplementary unit treated as dimensionless",
    limitation: "Angle is dimensionless in this registry.",
  },
  {
    id: "dimensionless",
    name: "dimensionless ratio",
    symbol: "—",
    dimension: ZERO,
    siBaseExpression: "1",
    scale: 1,
    offset: 0,
    domain: "ratio",
    aliases: ["unitless", "percent"],
    conversionSupported: true,
    sigFigGuidance: "Percent requires explicit /100 when converting.",
    sourceReference: "Dimensionless quantity",
    limitation: "Percent and ratio conversions require explicit context.",
  },
] as const;

export function getUnit(id: string): UnitRecord | null {
  return UNIT_REGISTRY.find((u) => u.id === id || u.aliases.includes(id)) ?? null;
}

export function dimensionsCompatible(a: DimensionVector, b: DimensionVector): boolean {
  const keys = ["time", "length", "mass", "current", "temperature", "amount", "luminous"] as const;
  return keys.every((k) => a[k] === b[k]);
}

export function formatDimension(d: DimensionVector): string {
  const parts: string[] = [];
  if (d.time) parts.push(`T^${d.time}`);
  if (d.length) parts.push(`L^${d.length}`);
  if (d.mass) parts.push(`M^${d.mass}`);
  if (d.current) parts.push(`I^${d.current}`);
  if (d.temperature) parts.push(`Θ^${d.temperature}`);
  if (d.amount) parts.push(`N^${d.amount}`);
  if (d.luminous) parts.push(`J^${d.luminous}`);
  return parts.length > 0 ? parts.join("·") : "dimensionless";
}
