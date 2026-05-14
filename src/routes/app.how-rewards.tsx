import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronDown, Target, Gift, Shield, Wallet, Sparkles, AlertCircle, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/app/how-rewards")({ component: HowRewards });

const sections = [
  {
    icon: Target,
    title: "How you earn points",
    body: "Points are earned through optional engagement activities — completing daily missions, engaging with sponsored content, claiming daily rewards, playing skill-based games like Tap Dash, answering trivia, spinning the reward wheel, and inviting friends.",
  },
  {
    icon: Gift,
    title: "Where rewards come from",
    body: "Rewards are advertiser-supported. When you choose to engage with sponsored content, advertisers fund a portion of your reward points. RewardLoop is not a financial product and does not pay salaries, wages, or income.",
  },
  {
    icon: Sparkles,
    title: "Why rewards vary",
    body: "Reward values depend on advertiser availability, your region, engagement quality, and any active bonus multipliers (such as Bonus Hour). Values may change over time based on advertiser demand.",
  },
  {
    icon: Shield,
    title: "Anti-abuse policy",
    body: "Bots, scripts, automated tapping, fake engagement, VPN abuse, multiple accounts, and emulator farming are prohibited. Sessions are validated server-side and abusive accounts may have rewards forfeited.",
  },
  {
    icon: Wallet,
    title: "Gift card redemption",
    body: "Reach the 3,000-point minimum, choose a gift card brand (Amazon, Visa, Google Play, Apple, Steam, Starbucks), and enter your email. We review each request and email the gift card code, typically within 2 business days.",
  },
  {
    icon: AlertCircle,
    title: "Important disclaimers",
    body: "Rewards are not guaranteed and are not income. RewardLoop is for entertainment and engagement only and is not affiliated with any gift card issuer, gambling provider, or financial institution.",
  },
];

const FAQ = [
  { q: "Will I earn money?", a: "No. RewardLoop is an entertainment app. You earn reward points that may optionally be redeemed when thresholds are met. There is no salary, income, or guaranteed payout." },
  { q: "Why do reward values change?", a: "Advertiser demand varies by region and time. We adjust point values so the platform stays sustainable for advertisers, users, and reviewers." },
  { q: "How long do redemptions take?", a: "Most redemptions are reviewed within a few business days. High-value redemptions may take longer due to additional verification." },
  { q: "Are the games fair?", a: "Yes. Tap Dash is a pure skill challenge, Trivia rewards correct answers, and the Reward Wheel uses server-side randomness with published segment values." },
  { q: "How often do ads appear?", a: "Sponsored content only appears in clearly labeled, optional slots. We never auto-play interstitials on app open and never disguise ads as reward buttons." },
  { q: "Is one account per person?", a: "Yes. Multiple accounts, shared devices for farming, or referral self-invites violate the Terms and may result in account closure." },
  { q: "How is my account protected?", a: "We rate-limit reward claims, validate game sessions server-side, and monitor for abnormal patterns. Always keep your login credentials private." },
  { q: "How do I contact support?", a: "Email support@rewardloop.app or use the Contact link in your Profile. We aim to respond within 2 business days." },
];

function HowRewards() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="bg-background min-h-full">
      <header className="brand-header px-5 py-5 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app" })} aria-label="Back" className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-xl font-bold text-brand-foreground">How Rewards Work</h1>
      </header>

      <section className="px-4 pt-5 pb-10 space-y-3">
        <div className="bg-card border border-border rounded-2xl p-5 card-shadow text-center">
          <Gift className="h-10 w-10 mx-auto text-brand" />
          <h2 className="font-extrabold text-lg mt-2">Transparent reward system</h2>
          <p className="text-sm text-muted-foreground mt-1">
            RewardLoop is a gamified engagement platform. Here is exactly how everything works.
          </p>
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { i: BadgeCheck, t: "Not a get-rich app" },
            { i: Shield, t: "Anti-abuse enforced" },
            { i: AlertCircle, t: "Rewards may vary" },
          ].map((b, idx) => {
            const I = b.i;
            return (
              <div key={idx} className="bg-card border border-border rounded-xl p-3 text-center card-shadow">
                <I className="h-5 w-5 mx-auto text-brand" />
                <p className="text-[11px] font-bold mt-1">{b.t}</p>
              </div>
            );
          })}
        </div>

        {sections.map((s, i) => {
          const Icon = s.icon;
          const isOpen = open === i;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl card-shadow overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-3 p-4 text-left">
                <div className="h-10 w-10 rounded-xl brand-bg flex items-center justify-center text-brand-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="flex-1 font-bold text-sm">{s.title}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              )}
            </div>
          );
        })}

        {/* FAQ */}
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground pt-4 px-1">FAQ</h2>
        <div className="bg-card border border-border rounded-2xl card-shadow overflow-hidden divide-y divide-border">
          {FAQ.map((f, i) => {
            const isOpen = faqOpen === i;
            return (
              <div key={i}>
                <button onClick={() => setFaqOpen(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-4 text-left">
                  <span className="flex-1 font-semibold text-sm">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link to="/legal/privacy" className="bg-card border border-border rounded-xl p-3 text-center text-xs font-bold card-shadow">Privacy Policy</Link>
          <Link to="/legal/terms" className="bg-card border border-border rounded-xl p-3 text-center text-xs font-bold card-shadow">Terms of Service</Link>
          <Link to="/legal/ad-disclosure" className="bg-card border border-border rounded-xl p-3 text-center text-xs font-bold card-shadow">Ad Disclosure</Link>
          <Link to="/legal/faq" className="bg-card border border-border rounded-xl p-3 text-center text-xs font-bold card-shadow">More FAQ</Link>
        </div>

        <p className="text-[11px] text-muted-foreground text-center pt-2">
          Need help? <a href="mailto:support@rewardloop.app" className="font-bold text-brand">support@rewardloop.app</a>
        </p>
      </section>
    </div>
  );
}
