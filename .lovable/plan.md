## Plan

1. **Isolate the freeze on auth screens**
   - Prevent native ad/consent initialization from running while the user is on `/login`, `/signup`, and onboarding/auth-adjacent screens.
   - Keep the web consent banner behavior intact in preview/web, but avoid any native overlay that can steal focus before the keyboard opens.

2. **Harden Android text input behavior**
   - Add Android-safe input handling for the auth form so taps always focus the field and the soft keyboard can take over cleanly.
   - If needed, wire the Capacitor keyboard integration for native builds and avoid any viewport or focus settings that can lock the WebView after the first tap.

3. **Add targeted native diagnostics and fallback protection**
   - Add temporary console logging around field focus, blur, keyboard show/hide, and native ad/consent startup so the next test build tells us exactly what is blocking input.
   - Guard native ad/consent calls so a failed or hanging native plugin cannot freeze the login UI.

4. **Validate the fix in the Android flow**
   - Verify that tapping email/password opens the keyboard, typing updates the field immediately, and the app no longer becomes unresponsive.
   - Confirm this on login first, then signup, since both use the same input pattern.

## Expected outcome
- The login screen should behave normally on Android: tap a field, keyboard appears, typing works, and the app does not freeze.
- Google sign-in stays hidden in the native app, and email/password remains the working sign-in path.

## Technical details
- Likely culprit: a native Android overlay/focus trap from the ad-consent path, not text color styling.
- Files most likely to change: `src/lib/ads.ts`, `src/components/AdSlot.tsx` or route-level callers, auth routes (`src/routes/login.tsx`, `src/routes/signup.tsx`), and possibly `capacitor.config.ts` or a small native-keyboard helper.
- I’ll keep the change tightly scoped to the login freeze and won’t alter unrelated auth logic.