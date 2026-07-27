export type WorkContext = "chemistry" | "research" | "general";

export type ContextTool = {
  readonly id: string;
  readonly href: string;
  readonly icon: string;
  readonly label: { readonly en: string; readonly uz: string };
  readonly detail: { readonly en: string; readonly uz: string };
};

const COMMON_TOOLS: readonly ContextTool[] = [
  {
    id: "evidence",
    href: "/evidence",
    icon: "◎",
    label: { en: "Evidence", uz: "Dalillar" },
    detail: { en: "Verify claims and sources", uz: "Da’vo va manbalarni tekshirish" },
  },
  {
    id: "research",
    href: "/research",
    icon: "⌁",
    label: { en: "Research", uz: "Tadqiqot" },
    detail: { en: "Find related research contexts", uz: "Tegishli tadqiqotlarni ochish" },
  },
  {
    id: "scenarios",
    href: "/reasoning",
    icon: "⑂",
    label: { en: "Scenarios", uz: "Ssenariylar" },
    detail: { en: "Compare possible next paths", uz: "Keyingi yo‘llarni taqqoslash" },
  },
  {
    id: "collaboration",
    href: "/rooms",
    icon: "◌",
    label: { en: "Collaboration", uz: "Hamkorlik" },
    detail: { en: "Bring people into the review", uz: "Mutaxassislarni tekshiruvga qo‘shish" },
  },
];

const CHEMISTRY_TOOLS: readonly ContextTool[] = [
  {
    id: "chemical-graph",
    href: "/graph?view=relationships&domain=chemistry",
    icon: "⬡",
    label: { en: "Chemical graph", uz: "Kimyoviy graf" },
    detail: { en: "Explore elements and relationships", uz: "Element va bog‘lanishlarni ko‘rish" },
  },
  {
    id: "universities",
    href: "/universities",
    icon: "⌂",
    label: { en: "Universities", uz: "Universitetlar" },
    detail: { en: "Find relevant institutions", uz: "Tegishli muassasalarni topish" },
  },
  ...COMMON_TOOLS,
];

export function detectWorkContext(input: string): WorkContext {
  const normalized = input.toLowerCase();
  if (/(chem|kimyo|chemical|molecule|molekul|reaction|reaksiya|element|compound)/i.test(normalized)) {
    return "chemistry";
  }
  if (/(phd|thesis|dissert|research|tadqiqot|paper|article|maqola|laborator)/i.test(normalized)) {
    return "research";
  }
  return "general";
}

export function toolsForWorkContext(context: WorkContext): readonly ContextTool[] {
  if (context === "chemistry") return CHEMISTRY_TOOLS;
  return COMMON_TOOLS;
}
