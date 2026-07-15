// Generates dist/client/index.html for Capacitor.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "dist/client");
const manifestCandidates = [
  resolve(root, ".vite/manifest.json"),
  resolve(process.cwd(), "dist/server/.vite/manifest.json"),
];

const manifestPath = manifestCandidates.find((candidate) => existsSync(candidate));
const manifest = manifestPath ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const clientAssetsDir = resolve(root, "assets");

function normalizeEntryPath(file) {
  if (typeof file !== "string" || file.length === 0) return undefined;
  const trimmed = file.replace(/^\.\//, "").replace(/^\//, "");
  if (existsSync(resolve(root, trimmed))) return trimmed;
  const assetRelative = trimmed.replace(/^assets\//, "");
  if (existsSync(resolve(clientAssetsDir, assetRelative))) return `assets/${assetRelative}`;
  return undefined;
}

function readClientEntryFromManifest(value) {
  if (!value || typeof value !== "object") return undefined;
  if (typeof value.clientEntry === "string") return normalizeEntryPath(value.clientEntry);
  if (typeof value.entryChunkFileName === "string") return normalizeEntryPath(value.entryChunkFileName);
  for (const chunk of Object.values(value)) {
    if (chunk?.isEntry && typeof chunk.file === "string") return normalizeEntryPath(chunk.file);
  }
  return undefined;
}

function inferClientEntryFromAssets() {
  if (!existsSync(clientAssetsDir)) return undefined;
  const candidates = readdirSync(clientAssetsDir)
    .filter((file) => /^(index|entry-client|main)-.*\.js$/.test(file))
    .map((file) => ({ file, size: statSync(resolve(clientAssetsDir, file)).size }))
    .sort((a, b) => b.size - a.size);
  const preferred = candidates.find(({ file }) => !file.includes("route") && !file.includes("legal"));
  return preferred ? `assets/${preferred.file}` : undefined;
}

function inferStylesheetsFromAssets() {
  if (!existsSync(clientAssetsDir)) return [];
  const cssFiles = readdirSync(clientAssetsDir).filter((file) => file.endsWith(".css"));
  const preferred = cssFiles.filter((file) => /^styles-.*\.css$/.test(file));
  const selected = preferred.length > 0 ? preferred : cssFiles;
  return selected.sort().map((file) => `assets/${file}`);
}

const entryFile = readClientEntryFromManifest(manifest) ?? inferClientEntryFromAssets();

if (!entryFile) {
  console.error("[capacitor-index] Could not resolve client entry.");
  process.exit(1);
}

const cssLinks = inferStylesheetsFromAssets()
  .map((href) => `    <link rel="stylesheet" href="${href}" />`)
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#f59e0b" />
    <title>RewardLoop</title>
${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.onerror = function(msg, url, line, col, error) {
        var errStr = msg + "\\nAt: " + url + ":" + line + ":" + col;
        if (error && error.stack) errStr += "\\nStack: " + error.stack;
        alert("CRASH CAUGHT:\\n" + errStr);
      };
      console.log("Capacitor Index: Ready.");
    </script>
    <script type="module">
      import("./${entryFile}");
    </script>
  </body>
</html>
`;

writeFileSync(resolve(root, "index.html"), html);
console.log(`[capacitor-index] Wrote dist/client/index.html (entry: ${entryFile})`);
