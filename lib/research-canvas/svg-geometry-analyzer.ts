/**
 * SVG geometry analyzer — supported elements only.
 */

export type SvgGeometryElement = {
  readonly tag: string;
  readonly id?: string | null;
  readonly label?: string | null;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly length?: number | null;
  readonly area?: number | null;
  readonly perimeter?: number | null;
  readonly radius?: number | null;
  readonly limitation: string;
};

export type SvgAnalysisResult = {
  readonly elementCount: number;
  readonly viewBox?: string | null;
  readonly svgWidth?: string | null;
  readonly svgHeight?: string | null;
  readonly svgUnit?: string | null;
  readonly elements: readonly SvgGeometryElement[];
  readonly textLabels: readonly string[];
  readonly unsupportedPaths: number;
  readonly limitations: readonly string[];
};

function parseNum(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function extractAttr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return match?.[1] ?? null;
}

export function analyzeSvgContent(svgText: string): SvgAnalysisResult {
  const limitations: string[] = [];
  const elements: SvgGeometryElement[] = [];
  const textLabels: string[] = [];
  let unsupportedPaths = 0;

  const viewBox = svgText.match(/viewBox=["']([^"']+)["']/i)?.[1] ?? null;
  const svgWidth = svgText.match(/<svg[^>]*\swidth=["']([^"']+)["']/i)?.[1] ?? null;
  const svgHeight = svgText.match(/<svg[^>]*\sheight=["']([^"']+)["']/i)?.[1] ?? null;

  const rectMatches = svgText.matchAll(/<rect\b[^>]*\/?>/gi);
  for (const m of rectMatches) {
    const tag = m[0];
    const w = parseNum(extractAttr(tag, "width") ?? undefined);
    const h = parseNum(extractAttr(tag, "height") ?? undefined);
    elements.push({
      tag: "rect",
      id: extractAttr(tag, "id"),
      width: w,
      height: h,
      area: w !== null && h !== null ? w * h : null,
      perimeter: w !== null && h !== null ? 2 * (w + h) : null,
      limitation: "User-space units — not manufacturing dimensions without calibration.",
    });
  }

  const circleMatches = svgText.matchAll(/<circle\b[^>]*\/?>/gi);
  for (const m of circleMatches) {
    const tag = m[0];
    const r = parseNum(extractAttr(tag, "r") ?? undefined);
    elements.push({
      tag: "circle",
      id: extractAttr(tag, "id"),
      radius: r,
      area: r !== null ? Math.PI * r * r : null,
      perimeter: r !== null ? 2 * Math.PI * r : null,
      limitation: "User-space units.",
    });
  }

  const lineMatches = svgText.matchAll(/<line\b[^>]*\/?>/gi);
  for (const m of lineMatches) {
    const tag = m[0];
    const x1 = parseNum(extractAttr(tag, "x1") ?? undefined) ?? 0;
    const y1 = parseNum(extractAttr(tag, "y1") ?? undefined) ?? 0;
    const x2 = parseNum(extractAttr(tag, "x2") ?? undefined) ?? 0;
    const y2 = parseNum(extractAttr(tag, "y2") ?? undefined) ?? 0;
    const length = Math.hypot(x2 - x1, y2 - y1);
    elements.push({
      tag: "line",
      id: extractAttr(tag, "id"),
      length,
      limitation: "Line length in SVG user units.",
    });
  }

  const pathCount = (svgText.match(/<path\b/gi) ?? []).length;
  unsupportedPaths = pathCount;
  if (pathCount > 0) {
    limitations.push(`${pathCount} path element(s) — exact path geometry not fully analyzed.`);
  }

  const textMatches = svgText.matchAll(/<text\b[^>]*>([^<]*)<\/text>/gi);
  for (const m of textMatches) {
    const label = m[1]?.trim();
    if (label) textLabels.push(label);
  }

  if (elements.length === 0 && pathCount === 0) {
    limitations.push("No supported measurable SVG elements detected.");
  }

  limitations.push("SVG units may differ from physical units without reference calibration.");

  return {
    elementCount: elements.length + pathCount + textLabels.length,
    viewBox,
    svgWidth,
    svgHeight,
    svgUnit: svgWidth?.replace(/[\d.]/g, "").trim() || null,
    elements,
    textLabels,
    unsupportedPaths,
    limitations,
  };
}
