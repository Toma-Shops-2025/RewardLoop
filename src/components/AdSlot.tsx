import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { showBannerAd, hideBannerAd } from "@/lib/ads";

/**
 * Sponsored banner ad slot.
 * - On native (Android via Capacitor): mounts a real AdMob adaptive banner
 *   anchored to the bottom of the screen while this component is on screen.
 * - On web (Lovable preview, local dev): renders a clearly-labeled,
 *   non-clickable placeholder so layout is reserved.
 */
export function AdSlot({ label = "Sponsored" }: { label?: string }) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void showBannerAd();
    return () => {
      void hideBannerAd();
    };
  }, []);

  if (Capacitor.isNativePlatform()) {
    // Reserve space for both the native banner (~56dp) and the bottom tab
    // bar offset (~64dp) so page content isn't hidden behind either.
    return <div aria-hidden className="h-28" />;
  }

  return (
    <div
      role="complementary"
      aria-label="Sponsored content"
      className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-5 text-center"
    >
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-xs text-muted-foreground mt-1">Ad space</p>
    </div>
  );
}
