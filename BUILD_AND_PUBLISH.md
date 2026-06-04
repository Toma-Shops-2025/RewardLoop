# Phase 3 — Get RewardLoop on the Play Store (Windows)

Step-by-step guide to build the Android app on your PC and publish it to the Google Play Store. Total time: ~3–6 hours, mostly waiting on downloads and Play review.

---

## Part A — One-time setup on your PC (~1 hour, mostly downloads)

Install these. Reboot if asked.

1. **Git for Windows** — https://git-scm.com/download/win (accept all defaults)
2. **Node.js LTS** — https://nodejs.org (the "LTS" button)
3. **Bun for Windows** — open PowerShell:
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
4. **Android Studio** — https://developer.android.com/studio (~1 GB). The setup wizard will download the Android SDK automatically (~2 GB more). Let it finish.
5. **Java JDK 17** — Android Studio usually bundles it. If `bunx cap sync` complains about Java later, install from https://adoptium.net.

After installing, **close and reopen PowerShell** so it picks up the new commands.

---

## Part B — Push code from Lovable to GitHub (~5 min)

In Lovable:
1. Bottom-left of chat → **+** button → **GitHub** → **Connect project**
2. Authorize the Lovable GitHub app
3. Pick your account → **Create Repository**
4. Copy the repo URL (e.g. `https://github.com/yourname/rewardloop.git`)

---

## Part C — Get the code on your PC (~5 min)

Open PowerShell:

```powershell
cd Desktop
git clone https://github.com/yourname/rewardloop.git
cd rewardloop
bun install
```

Replace the URL with your own.

---

## Part D — Build the Android project (~10 min)

```powershell
bun run build
bunx cap add android
bunx cap sync
bunx cap open android
```

What each does:
- `bun run build` — compiles the web app into `dist/`
- `bunx cap add android` — creates the native Android wrapper (`android/` folder)
- `bunx cap sync` — copies the latest web build into the wrapper
- `bunx cap open android` — opens the project in Android Studio

First open of Android Studio takes 2–5 minutes (downloads more SDK pieces, indexes). Wait until the bottom status bar says **"Gradle sync finished"**.

---

## Part E — Generate a signing key (do this ONCE, ever)

This key proves future updates come from you. **Lose it = you can never update your app.** Back it up.

In Android Studio:
1. Menu: **Build** → **Generate Signed App Bundle / APK**
2. Choose **Android App Bundle** → Next
3. Under "Key store path" → **Create new**
4. Fill in:
   - Path: `C:\Users\YourName\rewardloop-keystore.jks` (somewhere safe, **NOT inside the project folder**)
   - Password: strong, save in a password manager
   - Key alias: `rewardloop`
   - Key password: same is fine
   - Validity: 25 years
   - Certificate: name + country, rest can stay blank
5. OK → **Next** → choose **release** → **Create**

After ~1 minute, a notification with a "locate" link appears. That's your `.aab` file (`app-release.aab`). That is what you upload.

---

## Part F — Upload to Play Console (~30 min + Google's review time)

1. https://play.google.com/console → **Create app**
2. App name (RewardLoop), language, app/game, free/paid
3. Complete required sections in left sidebar:
   - **App content** — privacy policy URL, data safety form, target audience, ads declaration (yes — this app shows ads), content rating questionnaire
   - **Store listing** — short + full description, screenshots, feature graphic (1024×500), app icon
   - **App category**
4. Left sidebar → **Production** → **Create new release** → upload your `.aab`
5. Release notes → **Save** → **Review release** → **Start rollout to Production**

First review usually takes **2–7 days**.

---

## Part G — For every future update

When you change anything in Lovable:
1. Lovable auto-pushes to GitHub
2. On your PC:
   ```powershell
   cd Desktop\rewardloop
   git pull
   bun install
   bun run build
   bun run assets:generate   # regenerates Android launcher icon + splash from resources/
   bunx cap sync
   ```

   `assets:generate` reads `resources/icon.png`, `resources/icon-foreground.png`,
   `resources/icon-background.png`, and `resources/splash.png` and writes every
   `mipmap-*` density + splash drawable into `android/app/src/main/res/`. To
   update the app icon later, just replace those PNGs in `resources/` and rerun.
3. In Android Studio: bump `versionCode` in `android/app/build.gradle` (1 → 2 → 3…)
4. Build → Generate Signed App Bundle → use the **same keystore** from Part E
5. Upload the new `.aab` → new release in Play Console

---

## Common gotchas

- **AdMob account** — separate from Play Console. Sign up at https://admob.google.com with the same Google account. Your AdMob IDs are already wired in (`src/lib/ads.ts`, `capacitor.config.ts`). Link your app inside AdMob once it's live on Play.
- **`app-ads.txt`** — AdMob will tell you to host this. Already in `public/app-ads.txt`; live at `yoursite.com/app-ads.txt` once you publish in Lovable.
- **Privacy policy URL** — Play requires a public URL. Publish your Lovable app first (top-right Publish button) so `/legal/privacy` is reachable, then use that URL in Play Console.
- **Test on your phone before publishing** — plug your Android phone in via USB with USB debugging on (Settings → Developer options), click the green ▶ in Android Studio. Catches bugs before wasting a week of Google's review.
- **Web preview vs real ads** — Lovable preview and dev builds use Google's TEST ad units (safe to click). Real ads only serve from the signed Play Store build. This is intentional — clicking your own real ads gets your AdMob account banned.
