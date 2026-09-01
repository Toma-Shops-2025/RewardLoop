/** Hash-router OAuth return path (RewardLoop uses createHashHistory). */
export function getOAuthRedirectUrl() {
  // Keep origin + hash path. Supabase will usually return as:
  //   https://rewardloop.fun/?code=...#/auth/callback
  return `${window.location.origin}/#/auth/callback`;
}

/** If Supabase appended ?code= before the hash, exchange it before the router boots. */
export async function exchangeOAuthCodeFromUrl(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return false;

  const { supabase } = await import("@/integrations/supabase/client");
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[oauth] exchangeCodeForSession failed", error);
    return false;
  }

  const hash = window.location.hash || "#/app";
  window.history.replaceState({}, document.title, `${window.location.origin}/${hash.startsWith("#") ? hash : `#${hash}`}`);
  return true;
}
