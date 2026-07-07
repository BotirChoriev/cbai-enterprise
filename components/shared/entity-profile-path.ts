export const PROFILE_FLOW_STEPS = [
  { id: "overview", label: "Overview" },
  { id: "evidence", label: "Evidence" },
  { id: "missing-evidence", label: "Missing" },
  { id: "decision-package", label: "Decision" },
  { id: "reports", label: "Reports" },
] as const;

export function profileSectionHref(baseHref: string, sectionId: string): string {
  const hash = `#${sectionId}`;
  return baseHref.includes("#") ? baseHref.replace(/#.*$/, hash) : `${baseHref}${hash}`;
}
