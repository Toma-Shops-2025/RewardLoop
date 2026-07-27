import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.rewardloop",
  appName: "RewardLoop",
  webDir: "dist/client",
  server: {
    url: "https://rewardloop.fun",
    cleartext: false,
  },
  android: {
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    }
  },
};

export default config;
