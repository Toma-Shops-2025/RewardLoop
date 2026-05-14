
# Phase 3 — Get RewardLoop on the Play Store (Windows)

You're on Windows, have a Play Console account, and want to ship. Here's the exact sequence. Do these steps in order — don't skip ahead. Total time: ~3–6 hours, mostly waiting on downloads and Play review.

---

## Part A — One-time setup on your PC (~1 hour, mostly downloads)

Install these four things. Reboot after each if it asks.

1. **Git for Windows** — https://git-scm.com/download/win
   - Accept all defaults during install.
2. **Node.js LTS** — https://nodejs.org (download the "LTS" button)
   - Capacitor's CLI needs Node.
3. **Bun for Windows** — open PowerShell and run:
   ```
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
4. **Android Studio** — https://developer.android.com/studio (~1 GB)
   - During the setup wizard, accept all defaults. It will download the Android SDK automatically (another ~2 GB). Let it finish.
5. **Java JDK 17** — Android Studio usually bundles this. If `bunx cap sync` later complains about Java, install JDK 17 from https://adoptium.net.

After installing, **close and reopen PowerShell** so it picks up the new commands.

---

## Part B — Push code from Lovable to GitHub (~5 min)

In Lovable:
1. Bottom-left of chat → **+** button → **GitHub** → **Connect project**
2. Authorize the Lovable GitHub app
3. Pick your GitHub account → **Create Repository**
4. Lovable shows you the repo URL (looks like `https://github.com/yourname/rewardloop.git`) — **copy it**

---

## Part C — Get the code on your PC (~5 min)

Open PowerShell. Pick a folder you'll remember (Desktop is fine):

```
cd Desktop
git clone https://github.com/yourname/rewardloop.git
cd rewardloop
bun install
```

Replace the URL with yours. `bun install` downloads all dependencies — takes 1–2 minutes.

---

## Part D — Build the Android project (~10 min)

Still in PowerShell, inside the `rewardloop` folder:

```
bun run build
bunx cap add android
bunx cap sync
bunx cap open android
```

What each does:
- `bun run build` — compiles your web app into a `dist/` folder
- `bunx cap add android` — creates a native Android wrapper around your web app (creates an `android/` folder)
- `bunx cap sync` — copies your latest web build into that wrapper
- `bunx cap open android` — opens the project in Android Studio

Android Studio takes 2–5 minutes the first time it opens — it's downloading more SDK pieces and indexing. Wait until the bottom status bar says "Gradle sync finished" or similar.

---

## Part E — Generate a signing key (~5 min, do this ONCE ever)

This key proves future updates come from you. **If you lose it, you can never update your app.** Back it up.

In Android Studio:
1. Menu: **Build** → **Generate Signed App Bundle / APK**
2. Choose **Android App Bundle** → Next
3. Under "Key store path" → click **Create new**
4. Fill in:
   - Key store path: `C:\Users\YourName\rewardloop-keystore.jks` (somewhere safe, NOT inside the project folder)
   - Password: pick a strong one, **save it in a password manager**
   - Key alias: `rewardloop`
   - Key password: same as above is fine
   - Validity: 25 years
   - Certificate: just put your name and country, the rest can be blank
5. Click OK, then **Next**, choose **release**, click **Create**

After ~1 minute, Android Studio shows a notification with a "locate" link. That's your `.aab` file (something like `app-release.aab`). **That's what you upload to Play Store.**

---

## Part F — Upload to Play Console (~30 min + Google's review time)

1. Go to https://play.google.com/console → **Create app**
2. Fill in app name (RewardLoop), language, app/game, free/paid
3. Complete the required sections in the left sidebar (Google walks you through):
   - **App content** — privacy policy URL (you have `/legal/privacy` in your app — use the published Lovable URL once you publish), data safety form, target audience, ads declaration (you have ads → declare yes), content rating questionnaire
   - **Store listing** — short description, full description, screenshots (take from your phone or use Android Studio's emulator), feature graphic (1024×500 image), app icon
   - **Main store listing** + **App category**
4. Left sidebar → **Production** → **Create new release** → upload your `.aab` file
5. Fill release notes → **Save** → **Review release** → **Start rollout to Production**

Google's review usually takes **2–7 days for the first submission**.

---

## Part G — For every future update

When you change the app in Lovable later:
1. Lovable auto-pushes to GitHub
2. On your PC: `cd Desktop\rewardloop && git pull && bun install && bun run build && bunx cap sync`
3. In Android Studio: bump the `versionCode` in `android/app/build.gradle` (1 → 2 → 3...)
4. Build → Generate Signed App Bundle → use the **same keystore** from Part E
5. Upload new `.aab` to Play Console → new release

---

## Things that commonly trip people up

- **AdMob account**: separate from Play Console. Sign up at https://admob.google.com with the same Google account. Link your app once it's live on Play Store. Your AdMob IDs are already in the code.
- **`app-ads.txt`**: AdMob will tell you to host this. Your project already has `public/app-ads.txt` — it'll be live at `yoursite.com/app-ads.txt` once Lovable is published.
- **Privacy policy URL**: Play Store requires a public URL. Publish your Lovable app first (top-right Publish button in Lovable) so `/legal/privacy` is reachable, then use that URL.
- **Test on your phone before publishing**: in Android Studio, plug your Android phone in via USB (with USB debugging enabled in phone Developer Options), click the green ▶ Play button. The app installs on your phone. This catches bugs before Google's review wastes a week.

---

## What I'll do if you approve this plan

I'll add a `BUILD_AND_PUBLISH.md` file to your project containing this exact guide (with copy-pasteable commands), so you have it on your PC after cloning. I won't touch any of the code — your Capacitor + AdMob wiring is already done.
