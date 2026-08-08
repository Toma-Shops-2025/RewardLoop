// RewardLoop - High Reliability Ad Engine
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";

const isNative = () => Capacitor.isNativePlatform();
const UNITY_GAME_ID = "6168867";

declare global {
  interface Window {
    unityads?: any;
  }
}

/** Initialize and Load Ads */
export async function initAds(): Promise<void> {
  if (!isNative()) return;

  const startInit = () => {
    if (window.unityads && typeof window.unityads.initialize === 'function') {
      window.unityads.initialize(UNITY_GAME_ID, false, () => {
        console.log("✅ Unity Ads Ready - RewardLoop");
        if (typeof window.unityads.load === 'function') {
            window.unityads.load("Rewarded_Android");
            window.unityads.load("Interstitial_Android");
            window.unityads.load("Banner_Android");
        }
      });
    }
  };

  if (window.unityads) startInit();
  else document.addEventListener("deviceready", startInit, { once: true });
}

/** Show a rewarded ad with Auto-Reload */
export async function showRewardedAd(): Promise<{ success: boolean }> {
  if (!isNative()) {
    toast.info("Simulating Ad...");
    return { success: true };
  }

  return new Promise((resolve) => {
    if (!window.unityads || typeof window.unityads.show !== 'function') {
      toast.error("Ad Engine starting... try again in 5 seconds");
      initAds();
      resolve({ success: false });
      return;
    }

    window.unityads.show("Rewarded_Android", (res: any) => {
      if (typeof window.unityads.load === 'function') {
          window.unityads.load("Rewarded_Android");
      }

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
    if (!isNative() || !window.unityads || typeof window.unityads.show !== 'function') return;

    window.unityads.show("Interstitial_Android", () => {
        if (typeof window.unityads.load === 'function') {
            window.unityads.load("Interstitial_Android");
        }
    });
}

/** Banner control */
export function setBannerVisible(visible: boolean): void {
    if (!isNative() || !window.unityads) return;

    try {
        if (visible) {
            if (typeof window.unityads.showBanner === 'function') {
                window.unityads.showBanner("Banner_Android", 1); // 1 = Bottom
            } else if (typeof window.unityads.showBannerAd === 'function') {
                window.unityads.showBannerAd("Banner_Android", 1);
            }
        } else {
            if (typeof window.unityads.hideBanner === 'function') {
                window.unityads.hideBanner();
            } else if (typeof window.unityads.hideBannerAd === 'function') {
                window.unityads.hideBannerAd();
            }
        }
    } catch (e) {
        console.error("Banner Ad Error:", e);
    }
}

export async function showBannerAd(): Promise<void> { setBannerVisible(true); }
export async function hideBannerAd(): Promise<void> { setBannerVisible(false); }
