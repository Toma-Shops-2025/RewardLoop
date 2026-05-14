import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/legal/faq")({ component: Page });

const faqs = [
  { q: "What is RewardLoop?", a: "RewardLoop is a gamified engagement platform where you complete missions, play trivia, and engage with sponsored content to earn reward points." },
  { q: "How do I earn points?", a: "By completing daily missions, watching featured videos, claiming daily rewards, spinning the wheel, playing trivia, and inviting friends." },
  { q: "How long does redemption take?", a: "Redemption processing times vary by method and may take up to several business days. Verification may be required for some redemptions." },
  { q: "Why did my reward value change?", a: "Reward values depend on advertiser availability and your region. Values may change over time." },
  { q: "How do I get paid?", a: "Redemptions are delivered as gift card codes (Amazon, Visa, Google Play, Apple, Steam, Starbucks) emailed to the address you provide at checkout. RewardLoop is not affiliated with any gift card issuer." },
  { q: "Can I have more than one account?", a: "No. Duplicate accounts are prohibited and may result in account restriction." },
  { q: "What happens if I use a VPN or bot?", a: "Bots, scripts, automated behavior, and VPN abuse are prohibited. Such accounts may be restricted and any associated points forfeited." },
];

function Page() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <article className="space-y-2 text-sm">
      <h2 className="text-xl font-extrabold mb-3">Frequently Asked Questions</h2>
      {faqs.map((f, i) => (
        <div key={i} className="bg-card border border-border rounded-xl">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-3 text-left font-bold">
            <span>{f.q}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && <p className="px-3 pb-3 text-muted-foreground">{f.a}</p>}
        </div>
      ))}
    </article>
  );
}
