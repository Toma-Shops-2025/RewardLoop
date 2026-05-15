import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete your RewardLoop account" },
      { name: "description", content: "How to delete your RewardLoop account and what data is removed or retained." },
      { property: "og:title", content: "Delete your RewardLoop account" },
      { property: "og:description", content: "Steps to permanently delete your RewardLoop account and associated data." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-foreground">
      <h2 className="text-xl font-extrabold">Delete your RewardLoop account</h2>
      <p className="text-muted-foreground text-xs">App name: RewardLoop · Developer: RewardLoop</p>

      <p>
        You can permanently delete your RewardLoop account at any time. Deletion frees your email
        address so it can be reused for a new account.
      </p>

      <h3 className="font-bold mt-4">Option 1 — Delete in the app (fastest)</h3>
      <ol className="list-decimal pl-5 space-y-1">
        <li>Open RewardLoop and sign in.</li>
        <li>Go to <strong>Profile</strong> (bottom navigation).</li>
        <li>Scroll to the bottom and tap <strong>Delete account</strong>.</li>
        <li>Confirm the warning, then type <code>DELETE</code> to finish.</li>
      </ol>
      <p className="text-xs text-muted-foreground">
        Your account is removed immediately and you are signed out.
      </p>

      <h3 className="font-bold mt-4">Option 2 — Request by email</h3>
      <p>
        If you can no longer sign in, email{" "}
        <a href="mailto:support@rewardloop.app" className="underline font-semibold">support@rewardloop.app</a>{" "}
        from the address tied to your account with the subject{" "}
        <strong>"Delete my account"</strong>. We verify ownership and complete deletion within{" "}
        <strong>30 days</strong> (typically within 7 days).
      </p>

      <h3 className="font-bold mt-4">What gets deleted</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Your profile (name, email, avatar initial, preferences)</li>
        <li>Your authentication record (you can no longer sign in)</li>
        <li>Points balance, lifetime earnings, login streaks, levels and badges</li>
        <li>Transaction history (videos watched, spins, trivia, daily check-ins)</li>
        <li>Game scores and leaderboard entries</li>
        <li>Redemption / withdrawal history and pending requests</li>
        <li>Device identifiers and ad attribution data tied to your account</li>
      </ul>

      <h3 className="font-bold mt-4">What may be retained</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Anonymized referral records</strong> — if other users joined via your referral
          code, the link is kept in an anonymized form (no PII) so their account history stays
          intact.
        </li>
        <li>
          <strong>Completed redemption records</strong> — kept up to{" "}
          <strong>7 years</strong> where required for tax, accounting, fraud prevention, and
          legal compliance. These records contain no login credentials.
        </li>
        <li>
          <strong>Aggregated, non-identifying analytics</strong> — kept indefinitely; cannot be
          linked back to you.
        </li>
        <li>
          <strong>Backups</strong> — residual copies in encrypted backups are overwritten within{" "}
          <strong>30 days</strong>.
        </li>
      </ul>

      <h3 className="font-bold mt-4">Partial data deletion</h3>
      <p>
        We do not currently offer partial data deletion. Account deletion removes all personal
        data as listed above. For specific data requests (export, correction), email{" "}
        <a href="mailto:support@rewardloop.app" className="underline font-semibold">support@rewardloop.app</a>.
      </p>

      <h3 className="font-bold mt-4">Need help?</h3>
      <p>
        Contact{" "}
        <a href="mailto:support@rewardloop.app" className="underline font-semibold">support@rewardloop.app</a>.
      </p>
    </article>
  );
}
