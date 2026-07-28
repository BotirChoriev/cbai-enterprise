import type { LocalPdfMetadata } from "@/lib/pdf-ingestion/local-pdf-ingestion";

export type ArtifactRoomStage =
  | "sense"
  | "structure"
  | "compare"
  | "human_decide"
  | "act"
  | "verify"
  | "learn";

export type ArtifactUnderstandingDraft = {
  readonly id: string;
  readonly title: string;
  readonly domain: string;
  readonly purpose: string;
  readonly researchQuestion: string;
  readonly material: LocalPdfMetadata;
  readonly knownFromHuman: readonly string[];
  readonly unknowns: readonly string[];
  readonly suggestedModules: readonly string[];
  readonly status: "awaiting_human_confirmation";
  readonly createdAt: string;
};

export type ConfirmedArtifactRoom = Omit<ArtifactUnderstandingDraft, "status"> & {
  readonly status: "human_confirmed";
  readonly stage: ArtifactRoomStage;
  readonly confirmedAt: string;
};

const STORE_KEY = "cbai-artifact-research-rooms-v1";

export const ARTIFACT_ROOM_STAGES: readonly ArtifactRoomStage[] = [
  "sense",
  "structure",
  "compare",
  "human_decide",
  "act",
  "verify",
  "learn",
];

export const PHD_ROOM_MODULES = [
  "Research question",
  "Evidence map",
  "Contradiction radar",
  "Methodology clinic",
  "Literature gaps",
  "Scenario comparison",
  "Decision log",
  "Monitoring",
] as const;

export function createArtifactUnderstandingDraft(input: {
  readonly title: string;
  readonly domain: string;
  readonly purpose: string;
  readonly researchQuestion: string;
  readonly material: LocalPdfMetadata;
}): ArtifactUnderstandingDraft {
  const title = input.title.trim() || input.material.fileName.replace(/\.pdf$/i, "");
  const domain = input.domain.trim() || "Unconfirmed research domain";
  const purpose = input.purpose.trim();
  const question = input.researchQuestion.trim();

  return {
    id: `artifact_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    domain,
    purpose,
    researchQuestion: question,
    material: input.material,
    knownFromHuman: [
      `Title: ${title}`,
      `Domain: ${domain}`,
      ...(purpose ? [`Purpose: ${purpose}`] : []),
      ...(question ? [`Research question: ${question}`] : []),
      ...(input.material.pageCount
        ? [`Locally extracted page count: ${input.material.pageCount}`]
        : []),
    ],
    unknowns: [
      input.material.extractionStatus === "metadata_ready"
        ? "Text was extracted locally, but its scientific meaning and claims are not yet verified."
        : "Document text is not yet available for semantic verification.",
      "Citations, figures, formulas, and scientific claims still require structured review.",
      "Scientific validity and originality require human and source review.",
    ],
    suggestedModules: [...PHD_ROOM_MODULES],
    status: "awaiting_human_confirmation",
    createdAt: new Date().toISOString(),
  };
}

export function confirmArtifactUnderstanding(
  draft: ArtifactUnderstandingDraft,
): ConfirmedArtifactRoom {
  return {
    ...draft,
    status: "human_confirmed",
    stage: "sense",
    confirmedAt: new Date().toISOString(),
  };
}

export function readArtifactRooms(): readonly ConfirmedArtifactRoom[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as ConfirmedArtifactRoom[]) : [];
  } catch {
    return [];
  }
}

export function saveArtifactRoom(room: ConfirmedArtifactRoom): void {
  if (typeof window === "undefined") return;
  const rooms = [...readArtifactRooms()];
  const index = rooms.findIndex((item) => item.id === room.id);
  if (index >= 0) rooms[index] = room;
  else rooms.unshift(room);
  window.localStorage.setItem(STORE_KEY, JSON.stringify(rooms));
}
