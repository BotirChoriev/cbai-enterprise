export type LiveProcessItem = {
  readonly id: string;
  readonly text: string;
  readonly kind: "step" | "question" | "caution";
};

export function extractLiveProcessItems(text: string): LiveProcessItem[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\s+(?=\d+[.)]\s)/)
    .map((item) => item.replace(/^\d+[.)]\s*/, "").trim())
    .filter((item) => item.length >= 4)
    .slice(-8)
    .map((item, index) => ({
      id: `live-${index}-${item.slice(0, 16)}`,
      text: item,
      kind: item.endsWith("?")
        ? "question"
        : /(cannot|must|required|missing|risk|tasdiq|yetishmaydi|kerak)/i.test(item)
          ? "caution"
          : "step",
    }));
}
