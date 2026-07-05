export type NavItem = {
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "core"
    | "countries"
    | "companies"
    | "universities"
    | "search"
    | "graph"
    | "reasoning"
    | "ai-control"
    | "agents"
    | "knowledge"
    | "workflows"
    | "analytics"
    | "settings";
};

export const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "CBAI Core", href: "/core", icon: "core" },
  { label: "Countries", href: "/countries", icon: "countries" },
  { label: "Companies", href: "/companies", icon: "companies" },
  { label: "Universities", href: "/universities", icon: "universities" },
  { label: "Global Search", href: "/search", icon: "search" },
  { label: "Knowledge Graph", href: "/graph", icon: "graph" },
  { label: "Reasoning Engine", href: "/reasoning", icon: "reasoning" },
  { label: "AI Control", href: "/ai-control", icon: "ai-control" },
  { label: "AI Agents", href: "/agents", icon: "agents" },
  { label: "Knowledge", href: "/knowledge", icon: "knowledge" },
  { label: "Workflows", href: "/workflows", icon: "workflows" },
  { label: "Analytics", href: "/analytics", icon: "analytics" },
  { label: "Settings", href: "/settings", icon: "settings" },
];
