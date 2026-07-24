/**
 * Real navigation translation lookup (Global Language Foundation gap fix — Platform Activation
 * mission). `lib/navigation.ts`'s `primaryNavSections`/`secondaryNavSections` are plain module-
 * level data (no hooks available there), so the English `label`/`title` strings they carry double
 * as stable lookup keys here rather than a second, parallel navigation data structure. Every real
 * nav item and section title already has a matching `navigation.*` dictionary key — this only
 * connects the two; Sidebar and MobileNavDrawer both call these instead of rendering `item.label`
 * directly, so switching languages now genuinely relabels navigation instead of leaving it in
 * English.
 */

type TFunc = (path: string, vars?: Record<string, string>) => string;

const NAV_LABEL_KEYS: Record<string, string> = {
  "/": "navigation.home",
  "/my-work": "navigation.myWork",
  "/search": "navigation.search",
  "/countries": "navigation.countries",
  "/companies": "navigation.companies",
  "/universities": "navigation.universities",
  "/research": "navigation.research",
  "/knowledge": "navigation.evidence",
  "/evidence": "navigation.evidence",
  "/analytics": "navigation.reports",
  "/reports": "navigation.reports",
  "/trust": "navigation.trust",
  "/settings": "navigation.settings",
  "/government": "navigation.government",
  "/investor": "navigation.investor",
  "/citizen": "navigation.citizen",
  "/dashboard": "navigation.dashboard",
  "/reasoning": "navigation.reasoning",
  "/graph": "navigation.knowledgeGraph",
  "/ai-control": "navigation.governance",
  "/governance": "navigation.governance",
  "/about": "navigation.about",
  "/research/workspace": "navigation.researchWorkspace",
  "/workspace": "navigation.workspace",
  "/scientific-documents": "navigation.scientificDocuments",
  "/files": "navigation.files",
  "/teams": "navigation.teams",
  "/messages": "navigation.messages",
  "/notifications": "navigation.notifications",
  "/publications": "navigation.publications",
};

const NAV_SECTION_TITLE_KEYS: Record<string, string> = {
  Explore: "navigation.explore",
  Intelligence: "navigation.intelligence",
  Operations: "navigation.operations",
  Oversight: "navigation.oversight",
  Collaboration: "navigation.collaboration",
  Advanced: "navigation.advanced",
  System: "navigation.system",
  Ecosystems: "navigation.intelligenceLenses",
  "Intelligence Lenses": "navigation.intelligenceLenses",
};

/** Real label for a nav item's real href — falls back to the item's own English label only for a
 * route this lookup doesn't recognize yet, never a blank or fabricated translation. */
export function translateNavLabel(t: TFunc, href: string, fallbackLabel: string): string {
  const key = NAV_LABEL_KEYS[href];
  return key ? t(key) : fallbackLabel;
}

export function translateNavSectionTitle(t: TFunc, title: string): string {
  if (!title) return title;
  const key = NAV_SECTION_TITLE_KEYS[title];
  return key ? t(key) : title;
}
