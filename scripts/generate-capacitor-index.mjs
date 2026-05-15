// Generates dist/client/index.html for Capacitor.
// TanStack Start SSR builds don't emit a static index.html, but Capacitor
// requires one as the WebView entry point. We read the Vite manifest for the
// client build and produce a minimal HTML document that TanStack Start can
// hydrate (it hydrates `document`, not a #root div).
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "dist/client");
const manifestCandidates = [
  resolve(root, ".vite/manifest.json"),
  resolve(process.cwd(), "dist/server/.vite/manifest.json"),
];

const manifestPath = manifestCandidates.find((candidate) => existsSync(candidate));

if (!manifestPath) {
  console.error(
    "[capacitor-index] No build manifest found in dist/client or dist/server — run `vite build` first.",
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

// Find the client entry (isEntry: true). TanStack Start emits one.
const entry = Object.values(manifest).find(
  (chunk) => chunk?.isEntry && typeof chunk.file === "string" && chunk.file.includes("assets/"),
);
if (!entry) {
  console.error("[capacitor-index] No isEntry chunk found in manifest.");
  process.exit(1);
}

const clientAssetsDir = resolve(root, "assets");
const hasClientEntryFile = existsSync(resolve(root, entry.file));

if (!hasClientEntryFile && existsSync(clientAssetsDir)) {
  const assetFiles = new Set(readdirSync(clientAssetsDir));
  if (typeof entry.file === "string" && assetFiles.has(entry.file.replace(/^assets\//, ""))) {
    entry.file = entry.file.replace(/^assets\//, "assets/");
  }
}

const cssLinks = (entry.css || [])
  .map((href) => `    <link rel="stylesheet" href="/${href}">`)
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#f59e0b" />
    <title>RewardLoop</title>
    <link rel="manifest" href="/manifest.webmanifest" />
${cssLinks}
  </head>
  <body>
    <script type="module" src="/${entry.file}"></script>
  </body>
</html>
`;

writeFileSync(resolve(root, "index.html"), html);
console.log(`[capacitor-index] Wrote dist/client/index.html (entry: ${entry.file})`);
