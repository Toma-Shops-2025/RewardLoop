// AdMob integration for RewardLoop.
//
// Native (Android via Capacitor): real AdMob ads via @capacitor-community/admob.
// Web (Lovable preview, local dev): simulated flow so the UI can be exercised
// without ever touching real ad units (which would risk invalid-traffic strikes).
//
// Compliance rules enforced by callers:
// - Never auto-trigger a rewarded ad. The user must tap an explicit CTA.
// - Never disguise an ad as a reward button.
// - No interstitial on app open / login / withdraw / legal pages.
// - Ads must be dismissable; round gameplay must never be covered.

import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  AdmobConsentStatus,
  RewardAdPluginEvents,
  type AdOptions,
  type RewardAdOptions,
  type BannerAdOptions,
} from "@capacitor-community/admob";

// AdMob publisher ID for RewardLoop: pub-7552743356249250
// (declared in /public/app-ads.txt for seller verification).

// Real production ad units (RewardLoop Android app).
const PROD_AD_UNITS = {
  rewardedVideo: "ca-app-pub-7552743356249250/3775153111",
  banner: "ca-app-pub-7552743356249250/4221875679",
  interstitial: "ca-app-pub-7552743356249250/4896663097",
};

// Google's official test ad units. Used in dev / web preview to avoid
// accidentally serving (or self-clicking) real ads — Google bans accounts
// that show invalid traffic on production units.
const TEST_AD_UNITS = {
  rewardedVideo: "ca-app-pub-3940256099942544/5224354917",
  banner: "ca-app-pub-3940256099942544/6300978111",
  interstitial: "ca-app-pub-3940256099942544/1033173712",
};

const isNative = () => Capacitor.isNativePlatform();

// Real ads on the installed Android app (Capacitor native). Web preview /
// Lovable preview / local dev all run in a browser → test units, always.
//
// Note: this is evaluated lazily via a getter because Capacitor's native
// bridge isn't guaranteed to be attached at module top-level on every
// runtime, but IS attached by the time any ad call is made.
export function getAdUnits() {
  return isNative() ? PROD_AD_UNITS : TEST_AD_UNITS;
}
// Back-compat for any callers reading the constant directly.
export const AD_UNITS = new Proxy({} as typeof PROD_AD_UNITS, {
  get: (_t, prop: keyof typeof PROD_AD_UNITS) => getAdUnits()[prop],
});

export type RewardedResult = { success: boolean; fallback: boolean };

let initialized = false;

/**
 * Initialise the AdMob SDK and request UMP consent.
 * Safe to call multiple times — subsequent calls no-op.
 * No-op on web.
 */
export async function initAds(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (!isNative()) return;

  try {
    await AdMob.initialize({
      // Always false on native — we want real ads in the installed Play
      // Store app. For your own device, register it as a test device in the
      // AdMob console (Settings → Test devices) using the device ID printed
      // in logcat: "Use AdRequest.Builder.addTestDevice(...)".
      initializeForTesting: false,
    });

    // EU User Messaging Platform consent. Required by Google before any ad
    // request to an EEA / UK user, otherwise AdMob policy review will fail.
    const consent = await AdMob.requestConsentInfo();
    if (
      consent.status === AdmobConsentStatus.REQUIRED &&
      consent.isConsentFormAvailable
    ) {
      await AdMob.showConsentForm();
    }
  } catch (err) {
    // Don't crash the app if AdMob init fails — ads simply won't render.
    console.error("[ads] initAds failed", err);
  }
}

/** Show a rewarded ad. Resolves once the user earns the reward (or it fails). */
export async function showRewardedAd(): Promise<{ success: boolean }> {
  if (!isNative()) {
    // Web preview simulation.
    await new Promise((r) => setTimeout(r, 3000));
    return { success: true };
  }

  try {
    await initAds();

    const options: RewardAdOptions = {
      adId: AD_UNITS.rewardedVideo,
    };

    return await new Promise<{ success: boolean }>((resolve) => {
      let earned = false;

      const onReward = AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        earned = true;
      });

      const onDismiss = AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
        await onReward.then((s) => s.remove()).catch(() => {});
        await onDismiss.then((s) => s.remove()).catch(() => {});
        await onFailed.then((s) => s.remove()).catch(() => {});
        resolve({ success: earned });
      });

      const onFailed = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, async () => {
        await onReward.then((s) => s.remove()).catch(() => {});
        await onDismiss.then((s) => s.remove()).catch(() => {});
        await onFailed.then((s) => s.remove()).catch(() => {});
        resolve({ success: false });
      });

      AdMob.prepareRewardVideoAd(options)
        .then(() => AdMob.showRewardVideoAd())
        .catch(async (err) => {
          console.error("[ads] rewarded show failed", err);
          await onReward.then((s) => s.remove()).catch(() => {});
          await onDismiss.then((s) => s.remove()).catch(() => {});
          await onFailed.then((s) => s.remove()).catch(() => {});
          resolve({ success: false });
        });
    });
  } catch (err) {
    console.error("[ads] rewarded error", err);
    return { success: false };
  }
}

/** Show a rewarded ad with a hard timeout fallback (for native flakiness). */
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

export async function showInterstitialAd(): Promise<void> {
  if (!isNative()) {
    await new Promise((r) => setTimeout(r, 600));
    return;
  }
  try {
    await initAds();
    const options: AdOptions = { adId: AD_UNITS.interstitial };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
  } catch (err) {
    console.error("[ads] interstitial error", err);
  }
}

let bannerVisible = false;

export async function showBannerAd(): Promise<void> {
  if (!isNative() || bannerVisible) return;
  try {
    await initAds();
    const options: BannerAdOptions = {
      adId: AD_UNITS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      // Lift the banner above the in-app bottom tab bar (~64dp) so the
      // navigation tabs (Home / Games / Invite / Redeem / Profile) remain
      // visible and tappable on native.
      margin: 64,
    };
    await AdMob.showBanner(options);
    bannerVisible = true;
  } catch (err) {
    console.error("[ads] banner show error", err);
  }
}

export async function hideBannerAd(): Promise<void> {
  if (!isNative() || !bannerVisible) return;
  try {
    await AdMob.removeBanner();
    bannerVisible = false;
  } catch (err) {
    console.error("[ads] banner hide error", err);
  }
}
