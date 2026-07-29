import { createHash, timingSafeEqual } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.PORT || 8080);
const SCANNER_TOKEN = process.env.SCANNER_TOKEN || "";
const ALLOWED_DOWNLOAD_ORIGIN = process.env.ALLOWED_DOWNLOAD_ORIGIN || "";
const ALLOW_INSECURE_LOCALHOST = process.env.ALLOW_INSECURE_LOCALHOST === "1";
const MAX_BYTES = Number(process.env.MAX_SCAN_BYTES || 209_715_200);

function send(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function tokenMatches(header) {
  const supplied = Buffer.from((header || "").replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(SCANNER_TOKEN);
  return supplied.length === expected.length && supplied.length > 0 && timingSafeEqual(supplied, expected);
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32_768) throw new Error("request_too_large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function downloadToFile(url, path, expectedBytes) {
  const parsed = new URL(url);
  const localTestOrigin =
    ALLOW_INSECURE_LOCALHOST
    && parsed.protocol === "http:"
    && parsed.hostname === "host.docker.internal";
  if ((!localTestOrigin && parsed.protocol !== "https:") || parsed.origin !== ALLOWED_DOWNLOAD_ORIGIN) {
    throw new Error("download_origin_not_allowed");
  }
  const response = await fetch(parsed, { redirect: "error", signal: AbortSignal.timeout(120_000) });
  if (!response.ok || !response.body) throw new Error(`download_failed_${response.status}`);

  const hash = createHash("sha256");
  const output = createWriteStream(path, { flags: "wx", mode: 0o600 });
  let bytes = 0;
  try {
    for await (const chunk of response.body) {
      bytes += chunk.length;
      if (bytes > MAX_BYTES) throw new Error("artifact_too_large");
      hash.update(chunk);
      if (!output.write(chunk)) await new Promise((resolve) => output.once("drain", resolve));
    }
  } finally {
    await new Promise((resolve, reject) => output.end((error) => (error ? reject(error) : resolve())));
  }
  if (bytes !== expectedBytes) throw new Error("byte_size_mismatch");
  return { bytes, sha256: hash.digest("hex") };
}

async function scan(path) {
  try {
    await execFileAsync("clamdscan", ["--no-summary", "--fdpass", path], {
      timeout: 120_000,
      maxBuffer: 64 * 1024,
    });
    return { status: "clean", signature: null };
  } catch (error) {
    if (error?.code === 1) {
      const output = `${error.stdout || ""}\n${error.stderr || ""}`;
      const match = output.match(/:\s+(.+)\s+FOUND/i);
      return { status: "infected", signature: match?.[1]?.trim() || "malware_detected" };
    }
    throw new Error("clamav_scan_failed");
  }
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/healthz") {
    try {
      await execFileAsync("clamdscan", ["--ping=1:1"], { timeout: 5_000 });
      const { stdout } = await execFileAsync("clamdscan", ["--version"], { timeout: 5_000 });
      return send(response, 200, { status: "ok", scanner: stdout.trim() });
    } catch {
      return send(response, 503, { status: "unhealthy" });
    }
  }
  if (request.method !== "POST" || request.url !== "/v1/scan-url") {
    return send(response, 404, { error: "not_found" });
  }
  if (!SCANNER_TOKEN || !ALLOWED_DOWNLOAD_ORIGIN || !tokenMatches(request.headers.authorization)) {
    return send(response, 401, { error: "unauthorized" });
  }

  let directory;
  try {
    const body = await readJson(request);
    if (
      typeof body.url !== "string"
      || !/^[a-f0-9]{64}$/.test(body.expectedSha256)
      || !Number.isInteger(body.expectedBytes)
      || body.expectedBytes < 1
      || body.expectedBytes > MAX_BYTES
    ) {
      return send(response, 400, { error: "invalid_scan_request" });
    }

    directory = await mkdtemp(join(tmpdir(), "cbai-scan-"));
    const path = join(directory, "artifact.pdf");
    const downloaded = await downloadToFile(body.url, path, body.expectedBytes);
    const file = await stat(path);
    if (file.size !== body.expectedBytes || downloaded.sha256 !== body.expectedSha256) {
      return send(response, 422, { error: "artifact_integrity_mismatch" });
    }

    const result = await scan(path);
    return send(response, 200, {
      ...result,
      scanner: "clamav",
      sha256: downloaded.sha256,
    });
  } catch (error) {
    return send(response, 502, {
      error: error instanceof Error ? error.message : "scan_failed",
    });
  } finally {
    if (directory) await rm(directory, { recursive: true, force: true });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`CBAI ClamAV scanner listening on ${PORT}`);
});
