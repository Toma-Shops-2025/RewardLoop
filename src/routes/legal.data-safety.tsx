import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/data-safety")({ component: Page });

const collected = [
  { label: "Email address", purpose: "Account creation, sign-in, redemption delivery", required: true },
  { label: "Display name", purpose: "Profile and leaderboards", required: false },
  { label: "App activity (missions, scores, points)", purpose: "Run the rewards platform, prevent fraud", required: true },
  { label: "Device identifiers", purpose: "Fraud prevention and ad attribution (with consent)", required: false },
  { label: "Approximate region", purpose: "Reward eligibility and tax/legal compliance", required: false },
  { label: "Crash & performance diagnostics", purpose: "Stability monitoring", required: false },
];

const shared = [
  { label: "Google AdMob", purpose: "Serving ads and measuring performance" },
  { label: "Supabase (our backend)", purpose: "Authentication and data storage" },
  { label: "Gift card fulfillment partners", purpose: "Delivering redemption codes" },
];

function Page() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-foreground">
      <h2 className="text-xl font-extrabold">Data Safety</h2>
      <p className="text-muted-foreground text-xs">
        This page mirrors the Data safety form submitted on the Google Play store listing.
      </p>

      <h3 className="font-bold mt-4">Data we collect</h3>
      <ul className="space-y-2">
        {collected.map((c) => (
          <li key={c.label} className="bg-card border border-border rounded-xl p-3">
            <p className="font-bold">{c.label} <span className="ml-1 text-[10px] uppercase text-muted-foreground">{c.required ? "required" : "optional"}</span></p>
            <p className="text-xs text-muted-foreground">{c.purpose}</p>
          </li>
        ))}
      </ul>

      <h3 className="font-bold mt-4">Data we share</h3>
      <ul className="space-y-2">
        {shared.map((s) => (
          <li key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="font-bold">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.purpose}</p>
          </li>
        ))}
      </ul>

      <h3 className="font-bold mt-4">Security</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Data is transmitted over HTTPS.</li>
        <li>Passwords are hashed; we never store them in plain text.</li>
        <li>Database access is restricted by row-level security policies.</li>
      </ul>

      <h3 className="font-bold mt-4">Your controls</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Export or correct your data: contact support@rewardloop.app.</li>
        <li>Delete your account: Profile → Delete account (in-app).</li>
        <li>Reset your advertising ID via your device privacy settings.</li>
      </ul>
    </article>
  );
}
