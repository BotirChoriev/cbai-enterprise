import assert from "node:assert/strict";
import test from "node:test";
import {
  ARTIFACT_ROOM_STAGES,
  PHD_ROOM_MODULES,
  confirmArtifactUnderstanding,
  createArtifactUnderstandingDraft,
} from "@/lib/artifact-workspace/artifact-workspace";

test("artifact understanding stays at a mandatory human checkpoint", () => {
  const draft = createArtifactUnderstandingDraft({
    title: "Catalyst stability",
    domain: "Chemistry",
    purpose: "Improve the experimental design",
    researchQuestion: "Which catalyst remains stable?",
    material: {
      fileName: "thesis.pdf",
      sizeBytes: 2048,
      mimeType: "application/pdf",
      checksumSha256: "abc123",
      pageCount: null,
      originalLanguage: "en",
      selectedAt: "2026-07-28T00:00:00.000Z",
      extractionStatus: "server_extraction_unavailable",
      persistence: "local_metadata_only",
      limitations: ["Server extraction unavailable."],
    },
  });

  assert.equal(draft.status, "awaiting_human_confirmation");
  assert.ok(draft.unknowns.some((item) => item.includes("not yet available")));
  assert.deepEqual(draft.suggestedModules, PHD_ROOM_MODULES);

  const room = confirmArtifactUnderstanding(draft);
  assert.equal(room.status, "human_confirmed");
  assert.equal(room.stage, "sense");
  assert.deepEqual(ARTIFACT_ROOM_STAGES, [
    "sense", "structure", "compare", "human_decide", "act", "verify", "learn",
  ]);
});
