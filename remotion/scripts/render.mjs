import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FINAL = "/mnt/documents/rewardloop-promo-vertical-9x16.mp4";
const SILENT = "/tmp/rewardloop-silent.mp4";
const MUSIC = path.resolve(__dirname, "../public/audio/bg.mp3");

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled, id: "main", puppeteerInstance: browser,
});

// Render silent video (sandbox ffmpeg lacks libfdk_aac for in-render audio)
await renderMedia({
  composition, serveUrl: bundled, codec: "h264",
  outputLocation: SILENT,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
});

await browser.close({ silent: false });
console.log("Silent render done. Muxing music...");

// Mux music with aac (default ffmpeg encoder)
const hasMusic = fs.existsSync(MUSIC);
if (hasMusic) {
  execSync(
    `ffmpeg -y -i "${SILENT}" -i "${MUSIC}" -c:v copy -c:a aac -b:a 192k -shortest "${FINAL}"`,
    { stdio: "inherit" }
  );
} else {
  fs.copyFileSync(SILENT, FINAL);
}
console.log("DONE", FINAL);
