/**
 * Focused Final-10 gate set — skips suites that hang when a half-dead next
 * process is listening on :3000 without answering (browser-regression,
 * doctor-voice). Use this when the full runner is blocked by that environment
 * condition; the full runner remains the authoritative inventory.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, createWriteStream } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const logDir = join(root, "docs/verification/cbai-final-10/gates-focused");
mkdirSync(logDir, { recursive: true });

const gates = [
  { name: "typecheck", command: "npx", args: ["tsc", "--noEmit"] },
  { name: "lint", command: "npx", args: ["eslint", ".", "--max-warnings", "9999"] },
  { name: "test:cbai-final-10", command: "npm", args: ["run", "--silent", "test:cbai-final-10"] },
  { name: "test:final-product-completion", command: "npm", args: ["run", "--silent", "test:final-product-completion"] },
  { name: "test:launch-gate", command: "npm", args: ["run", "--silent", "test:launch-gate"] },
  { name: "test:locale-completeness", command: "npm", args: ["run", "--silent", "test:locale-completeness"] },
  { name: "test:localization-closure", command: "npm", args: ["run", "--silent", "test:localization-closure"] },
  { name: "test:operational-objects", command: "npm", args: ["run", "--silent", "test:operational-objects"] },
  { name: "test:live-intelligence-rooms", command: "npm", args: ["run", "--silent", "test:live-intelligence-rooms"] },
  { name: "test:spatial-world-intelligence", command: "npm", args: ["run", "--silent", "test:spatial-world-intelligence"] },
  { name: "test:voice-operator", command: "npm", args: ["run", "--silent", "test:voice-operator"] },
  { name: "test:voice-session-lifecycle", command: "npm", args: ["run", "--silent", "test:voice-session-lifecycle"] },
  { name: "test:platform-shell", command: "npm", args: ["run", "--silent", "test:platform-shell"] },
  { name: "build", command: "npm", args: ["run", "--silent", "build"] },
];

const SANITIZED = ["SUPABASE", "NEXT_PUBLIC_SUPABASE", "OPENAI", "CBAI_TEST_USER"];

function env() {
  const next = { ...process.env, CI: "1", FORCE_COLOR: "0" };
  for (const key of Object.keys(next)) {
    if (SANITIZED.some((prefix) => key.startsWith(prefix))) delete next[key];
  }
  return next;
}

function run(gate) {
  return new Promise((resolve) => {
    const logPath = join(logDir, `${gate.name.replace(/[:/]/g, "_")}.log`);
    const stream = createWriteStream(logPath);
    const started = Date.now();
    const child = spawn(gate.command, gate.args, { cwd: root, env: env(), stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.pipe(stream, { end: false });
    child.stderr.pipe(stream, { end: false });
    child.on("close", (code) => {
      stream.end();
      resolve({ name: gate.name, code: code ?? -1, ms: Date.now() - started });
    });
  });
}

const results = [];
for (const gate of gates) {
  const result = await run(gate);
  results.push(result);
  console.log(`${result.code === 0 ? "PASS" : "FAIL"} ${result.name} (${(result.ms / 1000).toFixed(1)}s)`);
}
writeFileSync(join(logDir, "summary.json"), JSON.stringify({ results }, null, 2));
const failed = results.filter((item) => item.code !== 0);
console.log(`\n${results.length - failed.length}/${results.length} focused gates passed.`);
if (failed.length) {
  console.log(`Failed: ${failed.map((item) => item.name).join(", ")}`);
  process.exitCode = 1;
}
