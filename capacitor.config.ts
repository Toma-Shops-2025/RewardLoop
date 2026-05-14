import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.rewardloop",
  appName: "RewardLoop",
  webDir: "dist",
  plugins: {
    AdMob: {
      // RewardLoop AdMob App ID — Android
      appId: "ca-app-pub-7552743356249250~3141333538",
    },
  },
};

export default config;
