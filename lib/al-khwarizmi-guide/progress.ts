export type GuideStage = {
  readonly id: "problem" | "evidence" | "contradictions" | "scenarios" | "decision" | "monitoring";
  readonly href: string;
  readonly routes: readonly string[];
};

export const GUIDE_STAGES: readonly GuideStage[] = [
  { id: "problem", href: "/problems", routes: ["/", "/problems", "/my-work", "/search"] },
  {
    id: "evidence",
    href: "/evidence",
    routes: ["/evidence", "/research", "/files", "/scientific-documents", "/universities"],
  },
  { id: "contradictions", href: "/evidence", routes: ["/knowledge", "/graph"] },
  {
    id: "scenarios",
    href: "/reasoning",
    routes: ["/reasoning", "/countries", "/companies", "/government", "/investor", "/citizen"],
  },
  {
    id: "decision",
    href: "/reports",
    routes: ["/reports", "/organization", "/rooms", "/workspace", "/teams", "/messages"],
  },
  {
    id: "monitoring",
    href: "/governance",
    routes: ["/governance", "/trust", "/analytics", "/notifications", "/settings", "/ai-control"],
  },
] as const;

function routeMatches(pathname: string, route: string): boolean {
  return pathname === route || (route !== "/" && pathname.startsWith(`${route}/`));
}

export function guideStageIndexForPath(pathname: string): number {
  const index = GUIDE_STAGES.findIndex((stage) =>
    stage.routes.some((route) => routeMatches(pathname, route)),
  );
  return index >= 0 ? index : 0;
}

export function nextGuideStage(pathname: string): GuideStage {
  const current = guideStageIndexForPath(pathname);
  return GUIDE_STAGES[Math.min(current + 1, GUIDE_STAGES.length - 1)];
}
