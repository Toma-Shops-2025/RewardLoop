// Native (Capacitor) Google sign-in flow.
// On the web we use the Lovable broker. On Android the broker URL
// (https://localhost/~oauth/...) doesn't exist inside the WebView, so we open
// the system browser, let Supabase handle Google OAuth, and bounce back via
// the app.rewardloop:// custom URL scheme.
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App, type URLOpenListenerEvent } from "@capacitor/app";
import { supabase } from "@/integrations/supabase/client";

export const isNativeApp = () => Capacitor.isNativePlatform();

const NATIVE_REDIRECT = "app.rewardloop://app";

export async function signInWithGoogleNative(): Promise<{ error?: Error }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: NATIVE_REDIRECT,
        skipBrowserRedirect: true,
      },
    });
    if (error) return { error };
    if (!data?.url) return { error: new Error("No OAuth URL returned") };

    // Listen for the deep-link bounce-back BEFORE opening the browser.
    const handle = await App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
      if (!event.url || !event.url.startsWith(NATIVE_REDIRECT.split("://")[0] + "://")) return;
      try {
        await Browser.close();
      } catch {
        /* Browser may already be closed */
      }
      // Supabase PKCE: pass the full callback URL so it can extract `code`.
      const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(event.url);
      if (exchangeErr) {
        console.error("[native-auth] exchangeCodeForSession failed", exchangeErr);
      }
      handle.remove();
    });

    await Browser.open({ url: data.url, presentationStyle: "popover" });
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}
