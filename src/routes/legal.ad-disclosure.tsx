import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/ad-disclosure")({ component: Page });

function Page() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-foreground">
      <h2 className="text-xl font-extrabold">Ad Disclosure</h2>
      <p>RewardLoop displays advertising provided by third-party ad networks, including Google AdMob. Advertising revenue is what funds the optional reward points users may earn through engagement.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Sponsored slots are clearly labeled "Sponsored" and never disguised as content or claim buttons.</li>
        <li>Rewarded ads are always opt-in. We never auto-play interstitials on app open.</li>
        <li>Engagement with sponsored content may grant reward points based on advertiser availability and your region.</li>
        <li>We do not endorse or guarantee any advertised product or service.</li>
        <li>Ad networks may collect device identifiers and ad-interaction data subject to their privacy policies.</li>
        <li>You can manage advertising preferences through your device settings (Reset Advertising ID, opt out of personalization, etc.).</li>
      </ul>
      <p className="text-xs text-muted-foreground">Advertisers: RewardLoop is committed to brand-safe placements. Ads do not appear on auth, withdraw, or legal pages, and gameplay is never overlaid by ad content.</p>
      <p>For more information, see our Privacy Policy.</p>
    </article>
  );
}
