/**
 * Method and virtual instrument registries.
 */

import type { InstrumentCapabilityState } from "@/lib/research-canvas/research-canvas-types";

export type MethodRecord = {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly purpose: string;
  readonly measurand: string;
  readonly requiredInput: string;
  readonly instrumentId: string;
  readonly unit: string;
  readonly calibration: string;
  readonly uncertaintyModel: string;
  readonly limitation: string;
  readonly capabilityState: InstrumentCapabilityState;
};

export type VirtualInstrumentRecord = {
  readonly id: string;
  readonly name: string;
  readonly supportedInput: readonly string[];
  readonly producedOutput: string;
  readonly capabilityState: InstrumentCapabilityState;
  readonly calibrationRequired: boolean;
  readonly uncertaintySupport: boolean;
  readonly validationRequired: boolean;
  readonly limitations: readonly string[];
  readonly backendRequired: boolean;
};

export const METHOD_REGISTRY: readonly MethodRecord[] = [
  {
    id: "image-scale",
    name: "Image reference-scale measurement",
    domain: "image_measurement",
    purpose: "Measure lengths using pixel calibration",
    measurand: "length",
    requiredInput: "Image with reference scale",
    instrumentId: "image-measurement-tool",
    unit: "m",
    calibration: "User-defined reference length",
    uncertaintyModel: "Manual limitation statement",
    limitation: "Approximate unless metrology conditions documented.",
    capabilityState: "Preview",
  },
  {
    id: "svg-geometry",
    name: "SVG geometry analysis",
    domain: "geometry",
    purpose: "Extract supported vector measurements",
    measurand: "length/area",
    requiredInput: "SVG with supported elements",
    instrumentId: "svg-geometry-analyzer",
    unit: "user-space",
    calibration: "SVG unit / viewBox",
    uncertaintyModel: "Not applicable without physical calibration",
    limitation: "User-space units are not physical units by default.",
    capabilityState: "Working",
  },
  {
    id: "manual-entry",
    name: "Manual measurement entry",
    domain: "general",
    purpose: "Record a manually sourced measurement",
    measurand: "user-defined",
    requiredInput: "Value, unit, method, raw data reference",
    instrumentId: "measurement-passport",
    unit: "SI-compatible",
    calibration: "User documented",
    uncertaintyModel: "User documented",
    limitation: "Human-entered — not instrument-acquired automatically.",
    capabilityState: "Working",
  },
  {
    id: "molecular-formula",
    name: "Molecular formula analysis",
    domain: "molecular_structure",
    purpose: "Parse formula and compute mass",
    measurand: "molecular mass",
    requiredInput: "Structured molecular formula",
    instrumentId: "molecular-formula-analyzer",
    unit: "g/mol",
    calibration: "Atomic mass table",
    uncertaintyModel: "Table precision only",
    limitation: "No structure inference from images.",
    capabilityState: "Working",
  },
] as const;

export const VIRTUAL_INSTRUMENT_REGISTRY: readonly VirtualInstrumentRecord[] = [
  {
    id: "image-measurement-tool",
    name: "Image Measurement Tool",
    supportedInput: ["PNG", "JPEG", "WEBP"],
    producedOutput: "Calibrated length/area (manual coordinates)",
    capabilityState: "Preview",
    calibrationRequired: true,
    uncertaintySupport: true,
    validationRequired: true,
    limitations: ["Interactive drawing uses manual coordinate input in Preview mode."],
    backendRequired: false,
  },
  {
    id: "svg-geometry-analyzer",
    name: "SVG Geometry Analyzer",
    supportedInput: ["SVG"],
    producedOutput: "Element geometry in user units",
    capabilityState: "Working",
    calibrationRequired: true,
    uncertaintySupport: false,
    validationRequired: true,
    limitations: ["Path elements partially supported."],
    backendRequired: false,
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    supportedInput: ["numeric value", "unit id"],
    producedOutput: "Converted value with formula",
    capabilityState: "Working",
    calibrationRequired: false,
    uncertaintySupport: false,
    validationRequired: false,
    limitations: ["Dimension-safe conversions only."],
    backendRequired: false,
  },
  {
    id: "scientific-calculator",
    name: "Scientific Calculator",
    supportedInput: ["approved formula variables"],
    producedOutput: "Calculation record",
    capabilityState: "Working",
    calibrationRequired: false,
    uncertaintySupport: true,
    validationRequired: true,
    limitations: ["Not an experimental result."],
    backendRequired: false,
  },
  {
    id: "molecular-formula-analyzer",
    name: "Molecular Formula Analyzer",
    supportedInput: ["molecular formula text"],
    producedOutput: "Element counts and molecular mass",
    capabilityState: "Working",
    calibrationRequired: false,
    uncertaintySupport: false,
    validationRequired: true,
    limitations: ["No SMILES/InChI parser installed."],
    backendRequired: false,
  },
  {
    id: "spectrum-viewer",
    name: "Spectrum Viewer",
    supportedInput: ["spectrum data"],
    producedOutput: "Spectrum visualization",
    capabilityState: "Not Connected",
    calibrationRequired: true,
    uncertaintySupport: true,
    validationRequired: true,
    limitations: ["External instrument required."],
    backendRequired: true,
  },
] as const;

export function getMethod(id: string): MethodRecord | null {
  return METHOD_REGISTRY.find((m) => m.id === id) ?? null;
}

export function getVirtualInstrument(id: string): VirtualInstrumentRecord | null {
  return VIRTUAL_INSTRUMENT_REGISTRY.find((i) => i.id === id) ?? null;
}
