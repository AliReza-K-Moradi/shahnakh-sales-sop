import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
if (process.argv.includes("--build")) {
  execFileSync(process.execPath, [path.join(root, "scripts/build.mjs")], {
    stdio: "inherit",
  });
}
if (!fs.existsSync(path.join(dist, "index.html"))) {
  throw new Error("Run pnpm build before previewing the site.");
}
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};
http
  .createServer((req, res) => {
    try {
      const url = new URL(req.url, `http://127.0.0.1:${port}`);
      let pathname = decodeURIComponent(url.pathname);
      // Accept the GitHub Pages project prefix during local checks, too.
      pathname = pathname.replace(/^\/shahnakh-sales-sop(?=\/|$)/, "") || "/";
      const file = path.resolve(
        dist,
        "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname),
      );
      if (file !== dist && !file.startsWith(dist + path.sep)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(400);
      res.end("Bad request");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Preview: http://127.0.0.1:${port}/shahnakh-sales-sop/`),
  );
