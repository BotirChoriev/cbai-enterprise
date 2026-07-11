// Minimal ESM loader resolving this repo's "@/..." path alias (tsconfig.json's `paths`) for
// Node's own native TypeScript execution — zero new dependencies (no ts-node, no tsx). Node 22+
// runs .ts files directly; it just doesn't know about bundler-style path aliases, so this loader
// rewrites "@/x" to the real project-relative file with an explicit ".ts" extension (required by
// ESM resolution) before handing back to Node's default resolver.
import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

register(pathToFileURL(new URL(import.meta.url).pathname).href, pathToFileURL(`${process.cwd()}/`));

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = path.join(process.cwd(), specifier.slice(2));
    const asFile = `${base}.ts`;
    const resolvedPath = existsSync(asFile) ? asFile : path.join(base, "index.ts");
    return nextResolve(pathToFileURL(resolvedPath).href, context);
  }
  return nextResolve(specifier, context);
}
