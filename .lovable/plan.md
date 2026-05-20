# Fix Android Login: Invisible Text + Google Sign-In

Two separate bugs, two separate fixes. Both ship in the same APK rebuild.

---

## Bug 1: Cursor shows but typing doesn't appear

**Cause:** Android's WebView is applying its own dark-mode text color (white) to the input fields, on top of the white background. The cursor is visible but the letters are white-on-white.

**Fix:** Force a light color scheme on the inputs and explicitly set the text color so the WebView can't override it.

### What I'll change

1. `src/styles.css` — add a global rule that pins inputs to a visible text color and tells the WebView "this app is light-themed":
   ```css
   html { color-scheme: light; }
   input, textarea, select {
     color: var(--foreground);
     -webkit-text-fill-color: var(--foreground);
     caret-color: var(--foreground);
     background-color: transparent;
   }
   ```

This fixes typing on **every** input in the app, not just login.

---

## Bug 2: Google sign-in breaks the app

**Cause:** Tapping Google navigates to `https://localhost/~oauth/initiate`, which is a Lovable web-hosting URL that doesn't exist inside the installed app. The WebView gets stuck on a broken page.

**Fix:** When running inside the Android app, the Google button will instead open the phone's real browser (Chrome), let the user sign in to Google there, and bounce back into the app via the `app.rewardloop://` URL scheme you already have configured.

### What I'll change

1. **Install two Capacitor plugins** (one-time, I run this for you):
   - `@capacitor/browser` — opens the in-app browser tab for Google
   - `@capacitor/app` — listens for the bounce-back to `app.rewardloop://`

2. **`src/lib/native-auth.ts` (new file)** — a small helper that:
   - Detects if we're in the native app (vs. the website)
   - Calls Supabase's `signInWithOAuth` with `skipBrowserRedirect: true` to get the Google sign-in URL
   - Opens that URL in the phone's browser via `Browser.open(...)`
   - Listens for the app to be reopened via `app.rewardloop://app?code=...`
   - Hands the code back to Supabase with `exchangeCodeForSession(...)` to finish login

3. **`src/routes/login.tsx` and `src/routes/signup.tsx`** — the Google button checks if it's running natively; if yes it uses the new helper, if no (website) it keeps using the existing Lovable broker flow that already works.

### What YOU need to do once (in Lovable Cloud settings)

For the bounce-back to work, the backend needs to know `app.rewardloop://app` is a trusted redirect. After I push the code:

1. Open **Cloud → Users → Auth Settings → URL Configuration**
2. Under **Redirect URLs**, add: `app.rewardloop://app`
3. Save

I'll remind you of this exact step with a clickable button at the end.

---

## After the code changes — rebuilding the APK

You've done this dance once already, so it'll be quick:

1. In the Lovable chat, after my changes finish, click **Export to GitHub** (or pull the latest if already exported)
2. On your PC, in your project folder, open a terminal and run:
   ```
   npm install
   npm run build
   npx cap sync android
   ```
3. In Android Studio: **Build → Generate Signed Bundle / APK** (same as last time)
4. Upload the new `.aab` to Play Console → Internal testing → Create new release

---

## Why I'm NOT just hiding the Google button

You picked option 2 (browser flow), so I'm building option 2. If it turns out the Supabase redirect-URL setup is a hassle, hiding the button on native is a 30-second follow-up edit.

---

## Technical notes (skip if you want)

- `Capacitor.isNativePlatform()` is the runtime check used to branch logic — no separate native/web builds needed.
- The OAuth flow uses Supabase's PKCE code exchange, not the implicit token flow, so no tokens land in URL fragments where the WebView could leak them.
- `App.addListener('appUrlOpen', ...)` fires when Android resolves the `app.rewardloop://` intent filter that's already in your `AndroidManifest.xml` (Capacitor adds it from `capacitor.config.ts`'s `appId`).
- The web `lovable.auth.signInWithOAuth("google", ...)` path is preserved unchanged — only the native branch is new.
