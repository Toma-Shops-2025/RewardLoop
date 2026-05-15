// Generates dist/client/index.html for Capacitor.
// TanStack Start SSR builds don't emit a static index.html, but Capacitor
// requires one as the WebView entry point. We read the Vite client manifest
// to find the hashed entry JS + CSS and produce a minimal SPA shell that
// boots the same React app.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "dist/client");
const manifestPath = resolve(root, ".vite/manifest.json");

if (!existsSync(manifestPath)) {
  console.error("[capacitor-index] dist/client/.vite/manifest.json missing — run `vite build` first.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

// Find the client entry (isEntry: true). TanStack Start emits one.
const entry = Object.values(manifest).find((c) => c.isEntry);
if (!entry) {
  console.error("[capacitor-index] No isEntry chunk found in manifest.");
  process.exit(1);
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
    <div id="root"></div>
    <script type="module" src="/${entry.file}"></script>
  </body>
</html>
`;

writeFileSync(resolve(root, "index.html"), html);
console.log(`[capacitor-index] Wrote dist/client/index.html (entry: ${entry.file})`);
