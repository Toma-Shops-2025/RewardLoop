import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/privacy")({ component: Page });

function Page() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-foreground">
      <h2 className="text-xl font-extrabold">Privacy Policy</h2>
      <p className="text-muted-foreground text-xs">Last updated: 2026</p>

      <p>RewardLoop ("we", "us") respects your privacy. This policy describes what data we collect, how we use it, and your choices.</p>

      <h3 className="font-bold mt-4">Information we collect</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Account info: name, email, password (hashed).</li>
        <li>Engagement data: missions completed, points earned, streaks, referrals.</li>
        <li>Device/usage: device type, app version, anonymized analytics.</li>
        <li>Ad-related identifiers used by our advertising partners (e.g., Google AdMob) consistent with their policies.</li>
      </ul>

      <h3 className="font-bold mt-4">How we use information</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>To operate the rewards platform and track engagement.</li>
        <li>To prevent fraud, bot activity, and abuse.</li>
        <li>To serve and measure advertising performance via partner networks.</li>
        <li>To process redemption requests you submit.</li>
      </ul>

      <h3 className="font-bold mt-4">Advertising partners</h3>
      <p>We use third-party ad networks including Google AdMob. These partners may collect device identifiers and ad-interaction data subject to their privacy policies.</p>

      <h3 className="font-bold mt-4">Data retention</h3>
      <p>We retain account and engagement data for as long as your account is active. You may request deletion by contacting support.</p>

      <h3 className="font-bold mt-4">Your rights</h3>
      <p>You may request access, correction, export, or deletion of your data at any time. You can also delete your account directly in-app from Profile → Delete account, which permanently removes your data and frees your email. For other requests, contact support@rewardloop.app.</p>

      <h3 className="font-bold mt-4">Children</h3>
      <p>RewardLoop is not directed to children under 13 (or the minimum age in your jurisdiction). We do not knowingly collect data from children. If you believe a child has provided us with personal data, contact us and we will delete it.</p>

      <h3 className="font-bold mt-4">Contact</h3>
      <p>For privacy questions: support@rewardloop.app</p>
    </article>
  );
}
