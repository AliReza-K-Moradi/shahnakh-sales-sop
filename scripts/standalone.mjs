import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
let html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const cssFile = html.match(/<link rel="stylesheet" href="\.\/([^\"]+)"\s*\/>/);
const scriptFile = html.match(/<script defer src="\.\/([^\"]+)"><\/script>/);
if (!cssFile || !scriptFile) throw new Error("Missing production assets");
const font = fs
  .readFileSync(path.join(dist, "assets/Vazirmatn.ttf"))
  .toString("base64");
const css = fs
  .readFileSync(path.join(dist, cssFile[1]), "utf8")
  .replace("./Vazirmatn.ttf", `data:font/ttf;base64,${font}`);
let js = fs.readFileSync(path.join(dist, scriptFile[1]), "utf8");
const license = path.join(dist, scriptFile[1] + ".LEGAL.txt");
const licenseHTML = fs.existsSync(license)
  ? `<script id="bundled-licenses" type="application/json">${JSON.stringify(fs.readFileSync(license, "utf8")).replaceAll("<", "\\u003c")}</script>`
  : "";
html = html
  .replace(cssFile[0], () => `<style>${css}</style>`)
  .replace(
    scriptFile[0],
    () =>
      `${licenseHTML}<script>${js.replaceAll("</script", "<\\/script")}</script>`,
  );
const icon =
  "data:image/svg+xml," +
  encodeURIComponent(fs.readFileSync(path.join(dist, "favicon.svg"), "utf8"));
html = html.replace("./favicon.svg", icon);
const output = path.join(dist, "ShahNakh-Personal-SOP-Interactive-FA.html");
fs.writeFileSync(output, html);
console.log("Standalone HTML created:", output);
