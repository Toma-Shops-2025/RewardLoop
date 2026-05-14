import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, PlayCircle, Calendar, Brain, Users, RefreshCw, Clock, ShieldAlert } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/missions")({ component: Missions });

type Tx = { type: string; created_at: string };
type Rarity = "common" | "rare" | "bonus";

function useResetCountdown() {
  const [s, setS] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setS(`${h}h ${m}m ${sec}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return s;
}

function Missions() {
  const { userId, profile } = useApp();
  const navigate = useNavigate();
  const [todayTxs, setTodayTxs] = useState<Tx[]>([]);
  const reset = useResetCountdown();

  useEffect(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    supabase.from("transactions").select("type,created_at").eq("user_id", userId)
      .gte("created_at", start.toISOString())
      .then(({ data }) => setTodayTxs((data ?? []) as Tx[]));
  }, [userId]);

  const count = (t: string) => todayTxs.filter((x) => x.type === t).length;
  const todayClaimed = profile?.last_login_date === new Date().toISOString().slice(0, 10);

  const missions: { icon: any; label: string; done: number; goal: number; reward: number; to: any; rarity: Rarity }[] = [
    { icon: PlayCircle, label: "Watch 3 sponsored videos", done: Math.min(count("watch_video"), 3), goal: 3, reward: 30, to: "/app", rarity: "common" },
    { icon: RefreshCw, label: "Spin the reward wheel", done: count("spin_wheel") > 0 ? 1 : 0, goal: 1, reward: 20, to: "/app/spin", rarity: "common" },
    { icon: Calendar, label: "Claim daily reward", done: todayClaimed ? 1 : 0, goal: 1, reward: 25, to: "/app", rarity: "common" },
    { icon: Brain, label: "Answer 3 trivia questions", done: Math.min(count("trivia"), 3), goal: 3, reward: 45, to: "/app/trivia", rarity: "rare" },
    { icon: Users, label: "Invite 1 friend", done: 0, goal: 1, reward: 100, to: "/app/referrals", rarity: "bonus" },
  ];

  const completed = missions.filter((m) => m.done >= m.goal).length;
  const totalPct = (completed / missions.length) * 100;

  return (
    <div className="bg-background min-h-full pb-12">
      <header className="brand-header px-5 py-5 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app" })} aria-label="Back" className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-brand-foreground">Daily Missions</h1>
          <p className="text-xs text-brand-foreground/80">{completed} of {missions.length} completed</p>
        </div>
      </header>

      {/* Progress + reset */}
      <section className="px-4 pt-5">
        <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold">Today's completion</span>
            <span className="flex items-center gap-1 text-muted-foreground tabular-nums">
              <Clock className="h-3 w-3" /> Resets in {reset}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full brand-bg transition-all duration-700" style={{ width: `${totalPct}%` }} />
          </div>
        </div>
      </section>

      <ul className="px-4 pt-4 space-y-3">
        {missions.map((m, idx) => {
          const Icon = m.icon;
          const done = m.done >= m.goal;
          const pct = Math.min(100, (m.done / m.goal) * 100);
          const rarityClass =
            m.rarity === "bonus" ? "badge-bonus" :
            m.rarity === "rare" ? "badge-rare" : "badge-common";
          return (
            <li key={idx}>
              <Link to={m.to} className={`block bg-card border rounded-2xl p-4 card-shadow active:scale-[0.99] transition ${done ? "border-success/40 bg-success/5" : "border-border"}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${done ? "bg-success text-success-foreground" : "brand-bg text-brand-foreground"}`}>
                    {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{m.label}</p>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide ${rarityClass}`}>
                        {m.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">{m.done}/{m.goal} · +{m.reward} pts</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${done ? "bg-success" : "brand-bg"}`} style={{ width: `${pct}%` }} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mx-4 mt-6 bg-card border border-border rounded-xl p-3 card-shadow flex gap-3">
        <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Fair play: bots, scripts, and duplicate accounts are prohibited. Suspicious activity may result in mission lockout or account restriction.
        </p>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4 px-6">
        Reward values may vary by region and advertiser availability.{" "}
        <Link to="/app/how-rewards" className="underline font-semibold">Learn how rewards work</Link>
      </p>
    </div>
  );
}
