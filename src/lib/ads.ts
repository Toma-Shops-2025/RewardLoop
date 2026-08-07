// RewardLoop - Unity Ads Integration
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";

const isNative = () => Capacitor.isNativePlatform();
const UNITY_GAME_ID = "6168867";

declare global {
  interface Window {
    unityads?: any;
  }
}

/** Initialize Unity Ads SDK */
export async function initAds(): Promise<void> {
  if (!isNative()) return;

  const startInit = () => {
    if (window.unityads) {
      window.unityads.initialize(UNITY_GAME_ID, false, () => {
        console.log("✅ Unity Ads Initialized - RewardLoop");
        // Pre-load units for better performance
        window.unityads.load("Rewarded_Android");
        window.unityads.load("Interstitial_Android");
      });
    }
  };

  if (window.unityads) startInit();
  else document.addEventListener("deviceready", startInit, { once: true });
}

/** Show a rewarded ad */
export async function showRewardedAd(): Promise<{ success: boolean }> {
  if (!isNative()) {
    toast.info("Simulating Rewarded Video...");
    await new Promise((r) => setTimeout(r, 2000));
    return { success: true };
  }

  return new Promise((resolve) => {
    if (!window.unityads) {
      toast.error("Ad Engine not ready. Try again in a moment.");
      initAds(); // Attempt to re-init
      resolve({ success: false });
      return;
    }

    window.unityads.show("Rewarded_Android", (res: any) => {
      // Reload next ad
      window.unityads.load("Rewarded_Android");

      if (res === "COMPLETED") {
        resolve({ success: true });
      } else {
        toast.error("Ad not finished - no reward granted");
        resolve({ success: false });
      }
    });
  });
}

/** Compatibility alias */
export async function showRewardedAdWithFallback(): Promise<{ success: boolean }> {
    return showRewardedAd();
}

/** Show an interstitial ad */
export async function showInterstitial(): Promise<void> {
    if (!isNative() || !window.unityads) return;
    window.unityads.show("Interstitial_Android", () => {
        window.unityads.load("Interstitial_Android");
    });
}

/** Show/Hide Banner Ad */
export function setBannerVisible(visible: boolean): void {
    console.log("Banner visibility set to:", visible);
}
