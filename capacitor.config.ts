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
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    }
  },
};

export default config;
