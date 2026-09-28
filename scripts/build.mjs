import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const dist = path.join(root, "dist");
process.chdir(root);

// Build output is always confined to this project's dist directory.
if (path.dirname(dist) !== root || path.basename(dist) !== "dist") {
  throw new Error("Unexpected output directory");
}
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "assets"), { recursive: true });

const masterName = "ShahNakh-Sales-SOP-KPI-Interactive-FA.html";
const master = fs.readFileSync(
  path.join(root, "reference", masterName),
  "utf8",
);
const names = [
  "stages",
  "follows",
  "recordGood",
  "recordBad",
  "visitLabels",
  "orderLabels",
  "metricData",
  "reviews",
  "callCases",
];
const content = {};
for (const name of names) {
  const literal = master.match(new RegExp(`const ${name}=([\\s\\S]*?);`));
  if (!literal) throw new Error(`Missing reference section: ${name}`);
  content[name] = vm.runInNewContext(`(${literal[1]})`, Object.create(null), {
    timeout: 100,
  });
}
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(
  "src/data/reference-content.json",
  JSON.stringify(content, null, 2) + "\n",
);

const fontFace = master.match(/@font-face\{[^}]+\}/)?.[0];
const font = fontFace?.match(/base64,([A-Za-z0-9+/=]+)['"]?\)/);
if (!font) throw new Error("Embedded Vazirmatn font is missing");
fs.writeFileSync(
  path.join(dist, "assets/Vazirmatn.ttf"),
  Buffer.from(font[1], "base64"),
);
const fontCSS = fontFace.replace(/url\([^)]+\)/, 'url("./Vazirmatn.ttf")');

execFileSync(
  process.execPath,
  [
    require.resolve("tailwindcss/lib/cli.js"),
    "-i",
    "src/styles.css",
    "-o",
    "dist/assets/app.css",
    "--minify",
  ],
  { stdio: "inherit" },
);
const cssPath = path.join(dist, "assets/app.css");
fs.writeFileSync(cssPath, fontCSS + "\n" + fs.readFileSync(cssPath, "utf8"));
const cssHash = createHash("sha256")
  .update(fs.readFileSync(cssPath))
  .digest("hex")
  .slice(0, 12);
const cssName = `app-${cssHash}.css`;
fs.renameSync(cssPath, path.join(dist, "assets", cssName));

const bundle = await build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  outdir: "dist/assets",
  entryNames: "app-[hash]",
  metafile: true,
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "linked",
  target: ["es2020"],
});
const script = Object.keys(bundle.metafile.outputs).find((file) =>
  file.endsWith(".js"),
);
if (!script) throw new Error("JavaScript bundle was not created");

const symbols = master.match(/<svg aria-hidden="true"[\s\S]*?<\/svg>/)?.[0];
const notices = master.match(/<!-- Open-source asset notices[\s\S]*?-->/)?.[0];
if (!symbols || !notices)
  throw new Error("Missing reference assets or license notices");
let html = fs
  .readFileSync("index.html", "utf8")
  .replace(
    "<!-- BUILD_STYLES -->",
    `<link rel="stylesheet" href="./assets/${cssName}" />`,
  )
  .replace("<!-- ASSET_NOTICES -->", () => notices)
  .replace("<!-- SVG_SYMBOLS -->", () => symbols)
  .replace(
    "<!-- MASTER_SOURCE -->",
    () =>
      `<script id="master-source" type="application/json">${JSON.stringify(master).replaceAll("<", "\\u003c")}</script>`,
  )
  .replace(
    "<!-- BUILD_SCRIPT -->",
    `<script defer src="./${script.replace(/^dist\//, "")}"></script>`,
  );
fs.writeFileSync(path.join(dist, "index.html"), html);
fs.cpSync("public", dist, { recursive: true });
fs.mkdirSync(path.join(dist, "reference"), { recursive: true });
fs.copyFileSync(
  path.join(root, "reference", masterName),
  path.join(dist, "reference", masterName),
);
fs.writeFileSync(path.join(dist, ".nojekyll"), "");
console.log("Production site built in dist/");
