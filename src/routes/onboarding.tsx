import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, PlayCircle, Target, Zap, Users, Trophy, Gift, X } from "lucide-react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const slides = [
  { icon: Gift, title: "Welcome to RewardLoop", text: "A gamified engagement platform where everyday activities turn into reward points you can redeem." },
  { icon: Target, title: "Daily Missions", text: "Complete simple daily missions — explore featured content, play trivia, and claim your daily reward." },
  { icon: PlayCircle, title: "Sponsored Content", text: "Discover short sponsored videos and featured offers. Engage to earn bonus points." },
  { icon: RefreshCw, title: "Spin the Wheel", text: "Try your luck on the daily wheel for bonus point rewards." },
  { icon: Zap, title: "Streaks & Bonuses", text: "Keep your daily streak alive to unlock bigger bonuses and level up your rank." },
  { icon: Users, title: "Invite Friends", text: "Share your invite code. Friends get a starter bonus, and you earn a referral bonus from their activity." },
  { icon: Trophy, title: "Redeem Rewards", text: "Reach the minimum threshold and redeem your points. Reward values may vary by region and availability." },
];

function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const Slide = slides[i];
  const Icon = Slide.icon;

  const finish = () => {
    localStorage.setItem("onboarded", "1");
    navigate({ to: "/login" });
  };
  const next = () => (i < slides.length - 1 ? setI(i + 1) : finish());

  return (
    <main className="flex min-h-screen flex-col bg-brand text-brand-foreground px-6 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <button onClick={finish} className="text-base font-bold opacity-90">Skip</button>
        <button onClick={finish} aria-label="Close" className="opacity-90"><X /></button>
      </div>
      <section key={i} className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
        <Icon className="w-28 h-28 mb-10" strokeWidth={1.5} />
        <h1 className="text-3xl font-extrabold text-center mb-4">{Slide.title}</h1>
        <p className="text-center text-lg leading-relaxed max-w-sm opacity-95">{Slide.text}</p>
      </section>
      <div className="flex justify-center gap-2 mb-6">
        {slides.map((_, idx) => (
          <span key={idx} className={`h-2.5 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2.5 bg-white/40"}`} />
        ))}
      </div>
      <button onClick={next} className="pill-btn border-2 border-white text-brand-foreground text-lg">
        {i === slides.length - 1 ? "Get Started" : "NEXT"}
      </button>
    </main>
  );
}
