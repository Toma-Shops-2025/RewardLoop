import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/disclaimer")({ component: Page });

function Page() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-foreground">
      <h2 className="text-xl font-extrabold">Reward Disclaimer</h2>
      <p>RewardLoop is an entertainment and engagement platform. Points are earned through optional activities.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Rewards are based on advertiser availability and engagement activity.</li>
        <li>Reward values may vary by region and platform conditions.</li>
        <li>Rewards are not guaranteed and may change over time.</li>
        <li>This app is not affiliated with any gift card issuer or financial institution.</li>
        <li>Abuse, fraud, or automated behavior may result in account restriction.</li>
      </ul>
      <p>RewardLoop does not make any guarantee of income or earnings. Use the platform for entertainment and engagement purposes only.</p>
    </article>
  );
}
