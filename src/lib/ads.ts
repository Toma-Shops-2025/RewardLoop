// RewardLoop Ad Abstraction - CLEANED (No AdMob)
// Returns simulated success for testing and production during network transition.

import { Capacitor } from "@capacitor/core";

const isNative = () => Capacitor.isNativePlatform();

export type RewardedResult = { success: boolean; fallback: boolean };

/** No-op initialization */
export async function initAds(): Promise<void> {
  return;
}

/** Show a simulated rewarded ad. Always resolves with success. */
export async function showRewardedAd(): Promise<{ success: boolean }> {
  // Add a slight delay to feel like a "moment" before the reward
  await new Promise((r) => setTimeout(r, 1500));
  return { success: true };
}

/** Show a simulated rewarded ad with fallback logic. */
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
  return;
}

/** No-op Banner Controls */
export async function showBannerAd(): Promise<void> {
  return;
}

export async function hideBannerAd(): Promise<void> {
  return;
}
