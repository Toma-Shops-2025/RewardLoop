// RewardLoop Ad Abstraction - AppLovin MAX Integration
import { Capacitor } from "@capacitor/core";

const isNative = () => Capacitor.isNativePlatform();

declare global {
  interface Window {
    applovin?: any;
  }
}

const SDK_KEY = "YOUR_SDK_KEY_HERE";
const REWARDED_AD_UNIT_ID = "YOUR_REWARDED_AD_UNIT_ID_HERE";

export type RewardedResult = { success: boolean; fallback: boolean };

/** Initialize AppLovin MAX SDK */
export async function initAds(): Promise<void> {
  if (!isNative()) return;

  return new Promise((resolve) => {
    const checkPlugin = () => {
      if (window.applovin) {
        window.applovin.initialize(SDK_KEY, (configuration: any) => {
          console.log("AppLovin SDK Initialized", configuration);
          window.applovin.loadRewardedAd(REWARDED_AD_UNIT_ID);
          resolve();
        });
      } else {
        document.addEventListener("deviceready", () => {
          if (window.applovin) {
            window.applovin.initialize(SDK_KEY, (configuration: any) => {
              console.log("AppLovin SDK Initialized (deviceready)", configuration);
              window.applovin.loadRewardedAd(REWARDED_AD_UNIT_ID);
              resolve();
            });
          }
        }, { once: true });
      }
    };
    checkPlugin();
  });
}

/** Show a rewarded ad */
export async function showRewardedAd(): Promise<{ success: boolean }> {
  if (!isNative()) {
    console.log("Simulating ad on web...");
    await new Promise((r) => setTimeout(r, 1500));
    return { success: true };
  }

  return new Promise((resolve) => {
    if (!window.applovin) {
      resolve({ success: false });
      return;
    }

    window.applovin.isRewardedAdReady(REWARDED_AD_UNIT_ID, (isReady: boolean) => {
      if (isReady) {
        window.applovin.showRewardedAd(REWARDED_AD_UNIT_ID);
        // Fallback resolve
        setTimeout(() => resolve({ success: true }), 31000);
      } else {
        window.applovin.loadRewardedAd(REWARDED_AD_UNIT_ID);
        resolve({ success: false });
      }
    });
  });
}

/** Show a rewarded ad with fallback logic. */
export async function showRewardedAdWithFallback(timeoutMs = 30000): Promise<RewardedResult> {
  const adP = showRewardedAd();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutP = new Promise<RewardedResult>((resolve) => {
    timer = setTimeout(() => resolve({ success: false, fallback: true }), timeoutMs);
  });
  const result = await Promise.race([
    adP.then<RewardedResult>((r) => ({ success: r.success, fallback: false })),
    timeoutP,
  ]);
  if (timer) clearTimeout(timer);
  return result;
}

/** No-op Interstitial */
export async function showInterstitialAd(): Promise<void> {
  if (!isNative() || !window.applovin) return;
}

/** No-op Banner Controls */
export async function showBannerAd(): Promise<void> {
  if (!isNative() || !window.applovin) return;
}

export async function hideBannerAd(): Promise<void> {
  if (!isNative() || !window.applovin) return;
}
