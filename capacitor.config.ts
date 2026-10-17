import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.rewardloop",
  appName: "RewardLoop",
  webDir: "dist",
  server: {
    androidScheme: 'https'
  },
  android: {
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: false,
    },
  },
};

export default config;
