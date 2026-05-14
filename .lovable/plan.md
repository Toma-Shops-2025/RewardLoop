## Phase 2 — Wire AdMob into RewardLoop

You've got all four IDs. Here's exactly what I'll do in one pass.

### 1. Save the IDs

Replace the test IDs in `src/lib/ads.ts` with your real ones:
- App ID: `ca-app-pub-7552743356249250~3141333538`
- Rewarded: `ca-app-pub-7552743356249250/3775153111`
- Banner: `ca-app-pub-7552743356249250/4221875679`
- Interstitial: `ca-app-pub-7552743356249250/4896663097`

Keep Google's test IDs as a `TEST_AD_UNITS` constant and auto-use them when running on web preview / dev — only the real native Android build serves real ads. This prevents accidental self-clicks getting your account banned.

### 2. Add Capacitor + AdMob plugin

Install:
```
@capacitor/core @capacitor/cli @capacitor/android @capacitor-community/admob
```

Create `capacitor.config.ts` at project root:
- `appId: "app.rewardloop"` (this is the Android package name — locks in once published, choose carefully; alternatives: `com.rewardloop.app`, `io.rewardloop`)
- `appName: "RewardLoop"`
- `webDir: "dist"`
- AdMob plugin block with your App ID

### 3. Rewrite `src/lib/ads.ts` with native/web split

New shape:
- `initAds()` — called once at app boot. On native: `AdMob.initialize()` + UMP consent form (`AdMob.requestConsentInfo` → `AdMob.showConsentForm` if required). On web: no-op.
- `showRewardedAd()` — on native: `prepareRewardVideoAd` → `showRewardVideoAd`, returns `{success}` based on whether reward event fired. On web: existing 3-second simulated wait so preview keeps working.
- `showInterstitialAd()` — native real call, web no-op.
- `showBannerAd()` / `hideBannerAd()` — new helpers for the existing `AdSlot.tsx` component (currently just renders a placeholder div).

Platform detection via `Capacitor.getPlatform() === 'android'`.

### 4. Wire `initAds()` into app boot

Call from `src/routes/__root.tsx` (or `src/routes/app.tsx`) inside a `useEffect` so it runs once on mount. UMP consent must run before any ad request — required for EU users or AdMob will reject your account at policy review.

### 5. Update `AdSlot.tsx` to use real banners on native

When mounted on native: call `showBannerAd()` with the banner unit ID; on unmount: `hideBannerAd()`. On web: keep current placeholder.

### Technical details

- The `@capacitor-community/admob` plugin is the de-facto standard for AdMob in Capacitor apps; actively maintained, supports rewarded/banner/interstitial + UMP.
- Test IDs stay in code as a fallback so iterating in Lovable preview never touches your real ad units.
- No Supabase / backend changes — purely client-side.

### What you do after this turn (Phase 3)

Lovable's sandbox cannot build Android apps. On your own machine:
```
git clone <your repo>
bun install
bun run build
bunx cap add android
bunx cap sync
bunx cap open android
```
Then in Android Studio: generate signing key → Build → Generate Signed App Bundle → upload `.aab` to Play Console.

### One question before I start

What Android package name (`appId`) do you want? It's permanent once you publish to Play Store. Common choices:
- `app.rewardloop`
- `com.rewardloop.app`
- `io.rewardloop`

If you don't care, I'll default to `app.rewardloop`.
