// RewardLoop - Unity Ads Integration
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";

const isNative = () => Capacitor.isNativePlatform();

// YOUR REAL UNITY GAME ID for RewardLoop
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
        console.log("✅ Unity Ads Ready - RewardLoop");
        // Pre-load units
        window.unityads.load("Rewarded_Android");
        window.unityads.load("Interstitial_Android");
        window.unityads.load("Banner_Android");
      });
    }
  };

  if (window.unityads) startInit();
  else document.addEventListener("deviceready", startInit, { once: true });
}

/** Show a rewarded ad */
export async function showRewardedAd(): Promise<{ success: boolean }> {
  if (!isNative()) {
    toast.info("Simulating Ad...");
    return { success: true };
  }

  return new Promise((resolve) => {
    if (!window.unityads) {
      toast.error("Ad Engine not ready");
      initAds();
      resolve({ success: false });
      return;
    }

    window.unityads.show("Rewarded_Android", (res: any) => {
      window.unityads.load("Rewarded_Android");
      if (res === "COMPLETED") {
        resolve({ success: true });
      } else {
        toast.error("Video skipped - no points earned");
        resolve({ success: false });
      }
    });
  });
}

export async function showRewardedAdWithFallback(): Promise<{ success: boolean }> {
    return showRewardedAd();
}

/** Show an interstitial */
export async function showInterstitial(): Promise<void> {
    if (!isNative() || !window.unityads) return;
    window.unityads.show("Interstitial_Android", () => {
        window.unityads.load("Interstitial_Android");
    });
}

/** Legacy banner control */
export function setBannerVisible(visible: boolean): void {
    if (!isNative() || !window.unityads) return;
    if (visible) window.unityads.showBanner("Banner_Android");
    else window.unityads.hideBanner();
}

/** New banner exports to fix Netlify build */
export async function showBannerAd(): Promise<void> {
    setBannerVisible(true);
}

export async function hideBannerAd(): Promise<void> {
    setBannerVisible(false);
}
