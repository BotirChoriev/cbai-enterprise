import assert from "node:assert/strict";
import test from "node:test";
import {
  handleArtifactScanRequest,
  type ArtifactScanProcessorEnv,
} from "@/lib/artifact-workspace/artifact-scan-processor";

const ARTIFACT_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";
const SHA = "a".repeat(64);
const ORIGIN = "https://preview.example.com";

const env: ArtifactScanProcessorEnv = {
  SUPABASE_URL: "https://preview-project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-secret",
  ARTIFACT_SCANNER_URL: "https://scanner.internal",
  ARTIFACT_SCANNER_TOKEN: "scanner-secret",
  ARTIFACT_ALLOWED_ORIGINS: ORIGIN,
};

function request(origin = ORIGIN): Request {
  return new Request("https://preview.example.com/api/artifacts/scan", {
    method: "POST",
    headers: {
      origin,
      authorization: "Bearer user-jwt",
      "content-type": "application/json",
    },
    body: JSON.stringify({ artifactId: ARTIFACT_ID }),
  });
}

function mockFetch(
  verdict: "clean" | "infected" = "clean",
  options: { scannerThrows?: boolean; scannerSha?: string; owner?: string } = {},
) {
  const patches: Array<Record<string, unknown>> = [];
  const fetchFn: typeof fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/auth/v1/user")) {
      return Response.json({ id: USER_ID });
    }
    if (url.includes("/rest/v1/document_artifacts?") && init?.method !== "PATCH") {
      return Response.json([
        {
          id: ARTIFACT_ID,
          owner_user_id: options.owner ?? USER_ID,
          bucket: "cbai-artifacts",
          storage_key: `${USER_ID}/${ARTIFACT_ID}/thesis.pdf`,
          byte_size: 1234,
          checksum_sha256: SHA,
          scan_status: "pending",
        },
      ]);
    }
    if (url.includes("/storage/v1/object/sign/")) {
      return Response.json({ signedURL: "/storage/v1/object/sign/cbai-artifacts/file?token=signed" });
    }
    if (url === "https://scanner.internal/v1/scan-url") {
      if (options.scannerThrows) throw new Error("network_down");
      return Response.json({
        status: verdict,
        scanner: "clamav",
        signature: verdict === "infected" ? "Eicar-Signature" : null,
        sha256: options.scannerSha ?? SHA,
      });
    }
    if (url.includes("/rest/v1/document_artifacts?") && init?.method === "PATCH") {
      patches.push(JSON.parse(String(init.body)));
      return new Response(null, { status: 204 });
    }
    throw new Error(`unexpected_fetch:${url}`);
  };
  return { fetchFn, patches };
}

test("clean artifact advances to mandatory human review", async () => {
  const { fetchFn, patches } = mockFetch("clean");
  const response = await handleArtifactScanRequest(request(), env, fetchFn);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), ORIGIN);
  assert.deepEqual(await response.json(), {
    artifactId: ARTIFACT_ID,
    status: "clean",
  });
  assert.equal(patches.at(-1)?.scan_status, "clean");
  assert.equal(patches.at(-1)?.processing_status, "needs_human_review");
  assert.equal(patches.at(-1)?.scanner_provider, "clamav");
});

test("EICAR-style infected verdict remains blocked", async () => {
  const { fetchFn, patches } = mockFetch("infected");
  const response = await handleArtifactScanRequest(request(), env, fetchFn);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    artifactId: ARTIFACT_ID,
    status: "infected",
    signature: "Eicar-Signature",
  });
  assert.equal(patches.at(-1)?.scan_status, "infected");
  assert.equal(patches.at(-1)?.processing_status, "failed");
});

test("scanner outage is fail-closed and returns artifact to quarantine", async () => {
  const { fetchFn, patches } = mockFetch("clean", { scannerThrows: true });
  const response = await handleArtifactScanRequest(request(), env, fetchFn);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "scanner_unreachable" });
  assert.equal(patches.at(-1)?.scan_status, "external_blocked");
  assert.equal(patches.at(-1)?.processing_status, "quarantined");
});

test("hash mismatch is rejected and marked failed", async () => {
  const { fetchFn, patches } = mockFetch("clean", { scannerSha: "b".repeat(64) });
  const response = await handleArtifactScanRequest(request(), env, fetchFn);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "scanner_result_invalid" });
  assert.equal(patches.at(-1)?.scan_status, "failed");
});

test("cross-owner scan returns not found before signing or scanning", async () => {
  const { fetchFn, patches } = mockFetch("clean", {
    owner: "33333333-3333-4333-8333-333333333333",
  });
  const response = await handleArtifactScanRequest(request(), env, fetchFn);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "artifact_not_found" });
  assert.equal(patches.length, 0);
});

test("unknown browser origin is rejected before authentication", async () => {
  let called = false;
  const response = await handleArtifactScanRequest(
    request("https://evil.example"),
    env,
    async () => {
      called = true;
      throw new Error("should_not_fetch");
    },
  );
  assert.equal(response.status, 403);
  assert.equal(called, false);
});
