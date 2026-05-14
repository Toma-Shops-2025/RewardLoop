import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PlayCircle, Zap, Gift, Calendar, Trophy, Target, Brain, BarChart3, Star, Flame, Sparkles, Hand } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
import { showRewardedAd } from "@/lib/ads";
import { fireConfetti } from "@/lib/confetti";
import logo from "@/assets/rewardloop-logo.png";

export const Route = createFileRoute("/app/")({ component: Home });

const isBonusHour = () => new Date().getMinutes() < 30;
const XP_PER_LEVEL = 500;

const MOTIVATION = [
  "Small wins add up — keep going!",
  "Your streak is fuel. Stay consistent.",
  "Engage today, level up tomorrow.",
  "A few minutes a day unlocks more.",
];

function levelFor(total: number) {
  const level = Math.floor(total / XP_PER_LEVEL) + 1;
  const into = total % XP_PER_LEVEL;
  return { level, progress: (into / XP_PER_LEVEL) * 100, into, next: XP_PER_LEVEL };
}

type Tx = { id: string; type: string; points: number; created_at: string };
const TX_LABEL: Record<string, string> = {
  watch_video: "Featured video",
  spin_wheel: "Reward wheel",
  daily_checkin: "Daily reward",
  referral_bonus: "Referral bonus",
  referral_commission: "Referral activity",
  trivia: "Trivia answered",
  withdrawal: "Redemption",
};

function Home() {
  const { profile, userId, refresh } = useApp();
  const [watching, setWatching] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [recent, setRecent] = useState<Tx[]>([]);
  const [todayDone, setTodayDone] = useState({ video: 0, spin: 0, trivia: 0, daily: 0 });
  const bonus = isBonusHour();
  const todayClaimed = profile?.last_login_date === new Date().toISOString().slice(0, 10);
  const lvl = levelFor(profile?.total_earned ?? 0);
  const motivation = MOTIVATION[(profile?.login_streak ?? 0) % MOTIVATION.length];

  useEffect(() => {
    if (!userId) return;
    supabase.from("transactions").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => setRecent((data ?? []) as Tx[]));
    const start = new Date(); start.setHours(0, 0, 0, 0);
    supabase.from("transactions").select("type").eq("user_id", userId)
      .gte("created_at", start.toISOString())
      .then(({ data }) => {
        const c = { video: 0, spin: 0, trivia: 0, daily: 0 };
        (data ?? []).forEach((t: any) => {
          if (t.type === "watch_video") c.video++;
          else if (t.type === "spin_wheel") c.spin++;
          else if (t.type === "trivia") c.trivia++;
          else if (t.type === "daily_checkin") c.daily++;
        });
        setTodayDone(c);
      });
  }, [userId, profile?.total_earned]);

  // 4 daily targets: 3 videos, 1 spin, 1 trivia, 1 daily
  const dailyDone = Math.min(todayDone.video, 3) + Math.min(todayDone.spin, 1)
    + Math.min(todayDone.trivia, 1) + Math.min(todayDone.daily, 1);
  const dailyTotal = 6;
  const dailyPct = (dailyDone / dailyTotal) * 100;

  const claimReward = async () => {
    if (watching) return;
    setWatching(true);
    toast("Loading sponsored content…");
    try {
      const res = await showRewardedAd();
      if (!res.success) { toast.error("Reward not granted — engagement incomplete"); return; }
      const { error } = await supabase.rpc("claim_video_reward");
      if (error) throw error;
      fireConfetti(40);
      toast.success("Reward points granted!");
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to grant reward");
    } finally { setWatching(false); }
  };

  const claimDaily = async () => {
    setClaiming(true);
    const { error } = await supabase.rpc("daily_checkin");
    setClaiming(false);
    if (error) return toast.error(error.message);
    fireConfetti(60);
    toast.success("Daily reward claimed!");
    await refresh();
  };

  return (
    <div className="bg-background">
      <header className="brand-header px-5 pt-5 pb-7">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" width={40} height={40} className="h-10 w-10 rounded-lg" loading="lazy" />
          <div className="flex-1">
            <p className="text-xs text-brand-foreground/80">Welcome back</p>
            <p className="font-bold text-brand-foreground truncate">{profile?.name ?? "Member"}</p>
          </div>
          {(profile?.login_streak ?? 0) > 0 && (
            <div className="flex items-center gap-1 bg-card/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Flame className="h-4 w-4 text-warning flame-pulse" />
              <span className="text-sm font-extrabold text-brand-foreground">{profile?.login_streak}</span>
            </div>
          )}
          <Link to="/app/leaderboard" className="text-brand-foreground/90 ml-1"><BarChart3 className="h-5 w-5" /></Link>
        </div>

        <div className="mt-5 bg-card rounded-2xl px-5 py-4 card-shadow flex items-center gap-4">
          <div className="h-12 w-12 rounded-full brand-bg flex items-center justify-center text-brand-foreground">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-semibold">REWARD POINTS</p>
            <p className="text-3xl font-extrabold text-foreground tabular-nums">{profile?.points ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Lifetime</p>
            <p className="font-bold text-foreground tabular-nums">{profile?.total_earned ?? 0}</p>
          </div>
        </div>

        {/* Level / XP */}
        <div className="mt-3 bg-card/95 rounded-xl px-4 py-3 card-shadow">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1"><Star className="h-3.5 w-3.5 text-brand fill-brand" /> Level {lvl.level}</span>
            <span className="text-muted-foreground tabular-nums">{lvl.into}/{lvl.next} XP</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full brand-bg transition-all duration-700" style={{ width: `${lvl.progress}%` }} />
          </div>
        </div>
      </header>

      {bonus && (
        <div className="mx-4 -mt-3 mb-4 happy-bg rounded-xl px-4 py-3 flex items-center gap-3 text-brand-foreground card-shadow">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm font-bold flex-1">Bonus Hour active — engagement rewards x2</p>
        </div>
      )}

      {/* Today's progress */}
      <section className="px-4 pt-4">
        <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold">Today's progress</p>
            <span className="text-xs text-muted-foreground tabular-nums">{dailyDone}/{dailyTotal}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand to-warning transition-all duration-700" style={{ width: `${dailyPct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{motivation}</p>
        </div>
      </section>

      {/* Quick nav */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-2">
          <Link to="/app/tap-dash" className="bg-card border border-border rounded-xl p-3 text-center card-shadow active:scale-95 transition relative">
            <span className="absolute -top-1 -right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full badge-bonus">NEW</span>
            <Hand className="h-6 w-6 mx-auto text-brand" />
            <p className="text-[11px] font-bold mt-1">Tap Dash</p>
          </Link>
          <Link to="/app/missions" className="bg-card border border-border rounded-xl p-3 text-center card-shadow active:scale-95 transition">
            <Target className="h-6 w-6 mx-auto text-brand" />
            <p className="text-[11px] font-bold mt-1">Missions</p>
          </Link>
          <Link to="/app/trivia" className="bg-card border border-border rounded-xl p-3 text-center card-shadow active:scale-95 transition">
            <Brain className="h-6 w-6 mx-auto text-brand" />
            <p className="text-[11px] font-bold mt-1">Trivia</p>
          </Link>
          <Link to="/app/leaderboard" className="bg-card border border-border rounded-xl p-3 text-center card-shadow active:scale-95 transition">
            <BarChart3 className="h-6 w-6 mx-auto text-brand" />
            <p className="text-[11px] font-bold mt-1">Leaders</p>
          </Link>
        </div>
      </section>

      <section className="px-4 pt-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Earn Points</h2>

        <button onClick={claimReward} disabled={watching}
          className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 card-shadow active:scale-[0.99] transition disabled:opacity-60">
          <div className="h-14 w-14 rounded-xl brand-bg flex items-center justify-center text-brand-foreground">
            <PlayCircle className="h-7 w-7" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground">Featured Videos</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded badge-common">SPONSORED</span>
            </div>
            <p className="text-sm text-muted-foreground">~30s · earn {bonus ? "10–20" : "5–10"} pts</p>
          </div>
          <span className="pill-btn bg-primary text-primary-foreground text-sm py-2 px-4">{watching ? "..." : "Claim"}</span>
        </button>

        <button onClick={claimDaily} disabled={claiming || todayClaimed}
          className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 card-shadow active:scale-[0.99] transition disabled:opacity-60">
          <div className="h-14 w-14 rounded-xl bg-success flex items-center justify-center text-success-foreground">
            <Calendar className="h-7 w-7" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-foreground">Daily Reward</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-warning" />
              {profile?.login_streak ?? 0} day streak
            </p>
          </div>
          <span className="pill-btn bg-primary text-primary-foreground text-sm py-2 px-4">{todayClaimed ? "Claimed" : "Claim"}</span>
        </button>

        <Link to="/app/spin"
          className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 card-shadow active:scale-[0.99] transition">
          <div className="h-14 w-14 rounded-xl bg-warning flex items-center justify-center text-warning-foreground">
            <Zap className="h-7 w-7" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-foreground">Reward Wheel</p>
            <p className="text-sm text-muted-foreground">Spin for up to 100 bonus points</p>
          </div>
          <span className="pill-btn bg-primary text-primary-foreground text-sm py-2 px-4">Spin</span>
        </Link>

        <Link to="/app/referrals"
          className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 card-shadow active:scale-[0.99] transition">
          <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
            <Gift className="h-7 w-7" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-foreground">Invite Friends</p>
            <p className="text-sm text-muted-foreground">50-pt welcome bonus + referral bonus</p>
          </div>
          <span className="pill-btn bg-primary text-primary-foreground text-sm py-2 px-4">Invite</span>
        </Link>
      </section>

      {/* Recent activity */}
      {recent.length > 0 && (
        <section className="px-4 pt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Recent Activity</h2>
            <Link to="/app/profile" className="text-xs font-bold text-brand">See all</Link>
          </div>
          <ul className="space-y-2">
            {recent.map((t) => (
              <li key={t.id} className="bg-card border border-border rounded-xl p-3 card-shadow flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold">{TX_LABEL[t.type] ?? t.type}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                </div>
                <span className={`text-sm font-extrabold tabular-nums ${t.points >= 0 ? "text-success" : "text-destructive"}`}>
                  {t.points >= 0 ? "+" : ""}{t.points}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 mx-4 h-16 rounded-xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
        Sponsored — Ad area
      </div>

      <p className="text-[11px] text-muted-foreground text-center mt-3 px-6 pb-2">
        Reward values may vary based on advertiser availability and your region.{" "}
        <Link to="/app/how-rewards" className="underline font-semibold">Learn more</Link>
      </p>
    </div>
  );
}
