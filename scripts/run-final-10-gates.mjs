/**
 * Sequential acceptance-gate runner for the CBAI Final 10/10 consolidation pass.
 *
 * Runs TypeScript, ESLint, every `test:*` script declared in package.json,
 * the voice doctor and the production build, writing one log per gate under
 * docs/verification/cbai-final-10/gates/.
 */
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, createWriteStream } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const logDir = join(root, "docs/verification/cbai-final-10/gates");
mkdirSync(logDir, { recursive: true });

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const skipBrowser = process.env.CBAI_SKIP_BROWSER === "1";
const testScripts = Object.keys(pkg.scripts)
  .filter((name) => name.startsWith("test:"))
  .filter((name) => !(skipBrowser && (name === "test:browser-regression" || name === "test:doctor-voice")))
  .sort();

const gates = [
  { name: "typecheck", command: "npx", args: ["tsc", "--noEmit"] },
  { name: "lint", command: "npx", args: ["eslint", ".", "--max-warnings", "9999"] },
  ...testScripts.map((name) => ({ name, command: "npm", args: ["run", "--silent", name] })),
  { name: "doctor-voice", command: "npm", args: ["run", "--silent", "doctor:voice"] },
  { name: "build", command: "npm", args: ["run", "--silent", "build"] },
];

/**
 * Interactive shells in this workspace may export live Supabase/OpenAI
 * credentials. Several suites assert honest "unconfigured" behaviour, so gates
 * run against a sanitized environment instead of inherited session secrets.
 */
const SANITIZED_ENV_PREFIXES = ["SUPABASE", "NEXT_PUBLIC_SUPABASE", "OPENAI", "CBAI_TEST_USER"];

function gateEnv() {
  const env = { ...process.env, CI: "1", FORCE_COLOR: "0" };
  for (const key of Object.keys(env)) {
    if (SANITIZED_ENV_PREFIXES.some((prefix) => key.startsWith(prefix))) delete env[key];
  }
  return env;
}

function run(gate) {
  return new Promise((resolve) => {
    const logPath = join(logDir, `${gate.name.replace(/[:/]/g, "_")}.log`);
    const stream = createWriteStream(logPath);
    const started = Date.now();
    const child = spawn(gate.command, gate.args, {
      cwd: root,
      env: gateEnv(),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let settled = false;
    const settle = (code) => {
      if (settled) return;
      settled = true;
      stream.end();
      resolve({ name: gate.name, code: code ?? -1, ms: Date.now() - started, logPath });
    };
    // Browser regression can hang forever when a half-dead next process is
    // listening but never answering. Cap it so the rest of the gates can finish.
    const timeoutMs = gate.name === "test:browser-regression" ? 90_000 : 10 * 60_000;
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5_000);
      settle(124);
    }, timeoutMs);
    child.stdout.pipe(stream, { end: false });
    child.stderr.pipe(stream, { end: false });
    child.on("close", (code) => {
      clearTimeout(timer);
      settle(code);
    });
  });
}

const results = [];
for (const gate of gates) {
  const result = await run(gate);
  results.push(result);
  console.log(`${result.code === 0 ? "PASS" : "FAIL"} ${result.name} (${(result.ms / 1000).toFixed(1)}s)`);
}

const failed = results.filter((item) => item.code !== 0);
writeFileSync(
  join(logDir, "summary.json"),
  JSON.stringify({ ranAt: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 2),
);
console.log(`\n${results.length - failed.length}/${results.length} gates passed.`);
if (failed.length) {
  console.log(`Failed: ${failed.map((item) => item.name).join(", ")}`);
  process.exitCode = 1;
}
