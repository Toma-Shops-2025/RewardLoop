import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Zap, Brain, Hand, Sparkles, Trophy } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/app/games")({ component: GamesHub });

const GAMES = [
  {
    to: "/app/tap-dash" as const,
    icon: Hand,
    title: "Tap Dash",
    blurb: "30-second arcade combo challenge",
    difficulty: "Skill",
    reward: "5 – 35 pts",
    featured: true,
  },
  {
    to: "/app/trivia" as const,
    icon: Brain,
    title: "Trivia",
    blurb: "Answer questions across categories",
    difficulty: "Medium",
    reward: "15 pts / answer",
  },
  {
    to: "/app/spin" as const,
    icon: Zap,
    title: "Reward Wheel",
    blurb: "Spin for a chance at bonus points",
    difficulty: "Easy",
    reward: "5 – 100 pts",
  },
];

const DIFF_CLASS: Record<string, string> = {
  Easy: "badge-common",
  Medium: "badge-rare",
  Skill: "badge-bonus",
};

function GamesHub() {
  const navigate = useNavigate();
  return (
    <div className="bg-background min-h-full page-fade">
      <header className="brand-header px-5 py-5 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/app" })} aria-label="Back" className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-brand-foreground">Games</h1>
          <p className="text-xs text-brand-foreground/80">Engagement mini-games · skill & luck</p>
        </div>
        <Link to="/app/leaderboard" className="text-brand-foreground/90"><Trophy className="h-5 w-5" /></Link>
      </header>

      <section className="px-4 pt-5 pb-10 space-y-3">
        {/* Featured */}
        {GAMES.filter((g) => g.featured).map((g) => {
          const Icon = g.icon;
          return (
            <Link key={g.to} to={g.to} className="block bg-card border border-border rounded-2xl p-5 card-shadow active:scale-[0.99] transition relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full badge-bonus">FEATURED</span>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl brand-bg flex items-center justify-center text-brand-foreground brand-shadow">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-extrabold">{g.title}</p>
                  <p className="text-sm text-muted-foreground">{g.blurb}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFF_CLASS[g.difficulty]}`}>{g.difficulty}</span>
                    <span className="text-[11px] font-bold text-brand inline-flex items-center gap-1"><Sparkles className="h-3 w-3" />{g.reward}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Rest */}
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground pt-3 px-1">More games</h2>
        {GAMES.filter((g) => !g.featured).map((g) => {
          const Icon = g.icon;
          return (
            <Link key={g.to} to={g.to} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 card-shadow active:scale-[0.99] transition">
              <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="font-bold">{g.title}</p>
                <p className="text-sm text-muted-foreground">{g.blurb}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFF_CLASS[g.difficulty]}`}>{g.difficulty}</span>
                  <span className="text-[11px] font-bold text-brand">{g.reward}</span>
                </div>
              </div>
            </Link>
          );
        })}

        <div className="pt-2">
          <AdSlot />
        </div>

        <p className="text-[11px] text-muted-foreground text-center pt-2">
          All games are for entertainment. Reward points are optional and not guaranteed.
        </p>
      </section>
    </div>
  );
}
