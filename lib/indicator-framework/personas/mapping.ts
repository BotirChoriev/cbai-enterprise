import type { PersonaIndicatorValue } from "@/lib/indicator-framework/types";

/** How indicators create value per persona — no scores or recommendations. */
export const INDICATOR_PERSONA_MAPPING: readonly PersonaIndicatorValue[] = [
  {
    id: "citizen",
    title: "Citizen",
    indicatorValue:
      "Understand which public evidence categories exist for your country — and which remain unconnected — before trusting any evaluation.",
  },
  {
    id: "investor",
    title: "Investor",
    indicatorValue:
      "See which fiscal, procurement, and investment indicators require connected sources before due diligence conclusions.",
  },
  {
    id: "government",
    title: "Government",
    indicatorValue:
      "Review indicator methodology and evidence gaps to prioritize official data publication — not platform political ratings.",
  },
  {
    id: "student",
    title: "Student",
    indicatorValue:
      "Learn which education and research indicators apply to institutions — and when only registry facts are available today.",
  },
  {
    id: "researcher",
    title: "Researcher",
    indicatorValue:
      "Export indicator definitions, required sources, and status for reproducible research scoping.",
  },
  {
    id: "academic",
    title: "Academic",
    indicatorValue:
      "Cite indicator methodology and evidence requirements in academic work — separating registry facts from future evaluations.",
  },
];
