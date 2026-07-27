/**
 * Minimal loopback static server for the `out/` export, used by local visual
 * verification. Serves files only from `out/`, binds to 127.0.0.1 and applies
 * the same clean-URL fallback Cloudflare Pages uses (`/route` -> `route.html`).
 */
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.cwd(), "out");
const port = Number(process.env.PORT ?? 3100);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidates =
    clean === "/" || clean === ""
      ? ["index.html"]
      : [clean.replace(/^\//, ""), `${clean.replace(/^\//, "")}.html`, join(clean.replace(/^\//, ""), "index.html")];
  for (const candidate of candidates) {
    const full = join(root, candidate);
    if (!full.startsWith(root)) continue;
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

createServer((req, res) => {
  const file = resolveFile(req.url ?? "/");
  if (!file) {
    const notFound = join(root, "404.html");
    if (existsSync(notFound)) {
      res.writeHead(404, { "content-type": TYPES[".html"] });
      createReadStream(notFound).pipe(res);
      return;
    }
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log(`Serving ./out on http://127.0.0.1:${port}`);
});
