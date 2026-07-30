// RewardLoop Ad Abstraction - AppLovin MAX Integration
import { Capacitor } from "@capacitor/core";

const isNative = () => Capacitor.isNativePlatform();

// Types for AppLovinMAX (Cordova Plugin)
interface AppLovinMAX {
  initialize(sdkKey: string, callback: (configuration: any) => void): void;
  showRewardedAd(adUnitId: string): void;
  loadRewardedAd(adUnitId: string): void;
  isRewardedAdReady(adUnitId: string, callback: (isReady: boolean) => void): void;
  // Add other methods as needed
}

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
          // Preload the first rewarded ad
          window.applovin.loadRewardedAd(REWARDED_AD_UNIT_ID);
          resolve();
        });
      } else {
        // Wait for deviceready if not available yet
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

    // Check if ad is ready
    window.applovin.isRewardedAdReady(REWARDED_AD_UNIT_ID, (isReady: boolean) => {
      if (isReady) {
        // Set up listeners for the ad result
        const onAdHidden = () => {
          // This usually fires when the ad is closed
          // Note: In a real implementation, you'd track if the reward was actually granted
          // by listening to the 'onRewardedAdVideoCompletedEvent' equivalent.
          // For the Cordova plugin, we use specific event listeners.
          cleanup();
          resolve({ success: true });
          window.applovin.loadRewardedAd(REWARDED_AD_UNIT_ID); // Load next one
        };

        const onAdFailed = () => {
          cleanup();
          resolve({ success: false });
          window.applovin.loadRewardedAd(REWARDED_AD_UNIT_ID);
        };

        // For simplicity in this abstraction, we assume success if they finish.
        // Real implementations should use window.addEventListener('AppLovinEvent', ...)

        window.applovin.showRewardedAd(REWARDED_AD_UNIT_ID);

        // Auto-resolve for now to prevent hanging if events are missed
        // Ideally, listen for: "onRewardedAdHiddenEvent" or "onRewardedAdReceivedRewardEvent"
        setTimeout(() => resolve({ success: true }), 31000);

      } else {
        window.applovin.loadRewardedAd(REWARDED_AD_UNIT_ID);
        resolve({ success: false });
      }
    });

    function cleanup() {
       // Remove listeners here if added via addEventListener
    }
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
  // Implementation for Interstitial would go here
}

/** No-op Banner Controls */
export async function showBannerAd(): Promise<void> {
  if (!isNative() || !window.applovin) return;
  // Implementation for Banner would go here
}

export async function hideBannerAd(): Promise<void> {
  if (!isNative() || !window.applovin) return;
  // Implementation for Banner would go here
}
