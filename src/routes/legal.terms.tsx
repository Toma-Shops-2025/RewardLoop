import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/terms")({ component: Page });

function Page() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-foreground">
      <h2 className="text-xl font-extrabold">Terms of Service</h2>
      <p className="text-muted-foreground text-xs">Last updated: 2026</p>

      <p>By using RewardLoop, you agree to these Terms.</p>

      <h3 className="font-bold mt-4">Eligibility</h3>
      <p>You must be at least 13 years old (or the minimum age in your jurisdiction) and capable of forming a binding contract.</p>

      <h3 className="font-bold mt-4">Reward points</h3>
      <p>Points are a virtual loyalty currency with no inherent cash value until you complete a valid redemption. Reward values may vary based on advertiser availability and your region. Rewards are not guaranteed.</p>

      <h3 className="font-bold mt-4">Account conduct &amp; anti-fraud</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>One account per person and per device household.</li>
        <li>No bots, automation, auto-clickers, scripts, emulators, or fake engagement.</li>
        <li>No VPNs, proxies, or location spoofing to misrepresent your region.</li>
        <li>No fraudulent referrals, self-invites, or duplicate accounts.</li>
        <li>Game sessions are validated server-side. Tampered scores are discarded.</li>
        <li>We may restrict, suspend, or terminate accounts and forfeit unredeemed points associated with prohibited activity.</li>
      </ul>

      <h3 className="font-bold mt-4">Advertising</h3>
      <p>RewardLoop displays third-party advertising. We are not responsible for the content of any advertisement.</p>

      <h3 className="font-bold mt-4">No financial services</h3>
      <p>RewardLoop is not a financial product. Redemptions are delivered as third-party gift card codes (e.g. Amazon, Visa, Google Play) and are processed at our discretion. We are not affiliated with any gift card issuer or financial institution and may require additional verification for high-value redemptions.</p>

      <h3 className="font-bold mt-4">Termination</h3>
      <p>We may terminate or restrict access for any violation of these terms or applicable law, and may forfeit unredeemed points associated with prohibited activity.</p>

      <h3 className="font-bold mt-4">Liability</h3>
      <p>The service is provided "as is" without warranty. To the maximum extent permitted by law, we are not liable for indirect or consequential damages.</p>

      <h3 className="font-bold mt-4">Changes</h3>
      <p>We may update these Terms. Continued use after changes constitutes acceptance.</p>
    </article>
  );
}
