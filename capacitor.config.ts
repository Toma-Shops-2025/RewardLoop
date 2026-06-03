import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.rewardloop",
  appName: "RewardLoop",
  webDir: "dist/client",
  server: {
    // Load the live site so the Android shell renders the SSR'd app
    // (the bundled static index.html can't hydrate TanStack Start without SSR,
    // which is what was causing the "Invariant failed" white screen).
    url: "https://rewardloop.fun",
    cleartext: false,
  },
  android: {
    // Critical for input freeze fix: let the WebView resize when the soft
    // keyboard opens instead of getting stuck mid-focus transition.
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    Keyboard: {
      // "native" = Android resizes the WebView when keyboard opens, which
      // prevents the "tap input → screen frozen" bug we were seeing.
      resize: "native",
      resizeOnFullScreen: true,
    },
    AdMob: {
      // RewardLoop AdMob App ID — Android
      appId: "ca-app-pub-7552743356249250~3141333538",
    },
  },
};

export default config;
