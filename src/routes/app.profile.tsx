import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LogOut, History, Shield, FileText, Info, Wallet, Target, Brain, BarChart3, HelpCircle, Flame, Trophy, Star, Award, Zap, Trash2, Database, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { deleteMyAccount } from "@/lib/account.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({ component: ProfilePage });

type Tx = { id: string; type: string; points: number; created_at: string };

const LABELS: Record<string, string> = {
  watch_video: "Sponsored video",
  spin_wheel: "Reward wheel",
  daily_checkin: "Daily reward",
  referral_bonus: "Referral bonus",
  referral_commission: "Referral activity bonus",
  trivia: "Trivia answered",
  withdrawal: "Redemption",
};

const XP_PER_LEVEL = 500;

function ProfilePage() {
  const { profile, userId } = useApp();
  const navigate = useNavigate();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const runDelete = useServerFn(deleteMyAccount);

  useEffect(() => {
    supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setTxs((data ?? []) as Tx[]));
    supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [userId]);

  const logout = async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); };

  const onDeleteAccount = async () => {
    const confirm1 = window.confirm("Permanently delete your account?\n\nThis erases your points, scores, transactions, and redemption history. This cannot be undone.");
    if (!confirm1) return;
    const typed = window.prompt("Type DELETE to confirm:");
    if (typed !== "DELETE") return;
    setDeleting(true);
    try {
      await runDelete();
      await supabase.auth.signOut();
      toast.success("Account deleted.");
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not delete account");
      setDeleting(false);
    }
  };

  const lifetime = profile?.total_earned ?? 0;
  const level = Math.floor(lifetime / XP_PER_LEVEL) + 1;
  const intoLevel = lifetime % XP_PER_LEVEL;
  const progress = (intoLevel / XP_PER_LEVEL) * 100;
  const streak = profile?.login_streak ?? 0;

  // Achievement badges
  const badges = [
    { id: "first", icon: Star, label: "First Steps", earned: lifetime >= 50, color: "text-warning" },
    { id: "earner", icon: Trophy, label: "Earner", earned: lifetime >= 500, color: "text-brand" },
    { id: "fan", icon: Award, label: "Top Fan", earned: lifetime >= 2000, color: "text-success" },
    { id: "streak3", icon: Flame, label: "3-Day Streak", earned: streak >= 3, color: "text-destructive" },
    { id: "streak7", icon: Flame, label: "Week Warrior", earned: streak >= 7, color: "text-destructive" },
    { id: "spinner", icon: Zap, label: "Lucky Spinner", earned: txs.filter(t => t.type === "spin_wheel").length >= 5, color: "text-warning" },
  ];

  // 7-day streak strip
  const last7 = useMemo(() => {
    const days: { d: string; active: boolean }[] = [];
    const days_with_activity = new Set(
      txs.map(t => new Date(t.created_at).toISOString().slice(0, 10))
    );
    for (let i = 6; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const iso = dt.toISOString().slice(0, 10);
      days.push({ d: dt.toLocaleDateString(undefined, { weekday: "short" })[0], active: days_with_activity.has(iso) });
    }
    return days;
  }, [txs]);

  return (
    <div className="bg-background min-h-full pb-10">
      <header className="brand-header px-5 pt-5 pb-8 text-center">
        <div className="relative inline-block">
          <div className="mx-auto h-20 w-20 rounded-full bg-card flex items-center justify-center text-3xl font-extrabold text-brand card-shadow">
            {(profile?.name ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-extrabold rounded-full px-2 py-0.5 border-2 border-brand">
            Lv {level}
          </span>
        </div>
        <p className="mt-3 font-bold text-brand-foreground">{profile?.name ?? "Member"}</p>
        <p className="text-sm text-brand-foreground/80">{profile?.email}</p>

        {/* XP bar */}
        <div className="mt-4 bg-card/95 rounded-xl px-4 py-3 card-shadow text-left max-w-sm mx-auto">
          <div className="flex justify-between text-xs">
            <span className="font-bold">Level {level} progress</span>
            <span className="text-muted-foreground tabular-nums">{intoLevel}/{XP_PER_LEVEL} XP</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full brand-bg transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <section className="px-4 mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Points" value={profile?.points ?? 0} />
        <Stat label="Lifetime" value={lifetime} />
        <Stat label="Streak" value={streak} icon={<Flame className="h-3 w-3 text-warning" />} />
      </section>

      {/* 7-day streak strip */}
      <section className="px-4 mt-5">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
          <Flame className="h-4 w-4" /> This Week
        </h2>
        <div className="bg-card border border-border rounded-xl p-3 card-shadow flex justify-between">
          {last7.map((d, i) => (
            <div key={i} className="text-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                d.active ? "brand-bg text-brand-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {d.active ? <Flame className="h-4 w-4" /> : d.d}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Badges */}
      <section className="px-4 mt-5">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
          <Award className="h-4 w-4" /> Achievements
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.id} className={`bg-card border border-border rounded-xl p-3 text-center card-shadow ${b.earned ? "" : "opacity-40 grayscale"}`}>
                <Icon className={`h-6 w-6 mx-auto ${b.earned ? b.color : "text-muted-foreground"}`} />
                <p className="text-[10px] font-bold mt-1 leading-tight">{b.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-6">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
          <History className="h-4 w-4" /> Activity
        </h2>
        <ul className="space-y-2">
          {txs.slice(0, 10).map((t) => (
            <li key={t.id} className="bg-card border border-border rounded-xl p-3 card-shadow flex justify-between text-sm">
              <div>
                <p className="font-bold">{LABELS[t.type] ?? t.type}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
              </div>
              <span className={`font-extrabold tabular-nums ${t.points >= 0 ? "text-success" : "text-destructive"}`}>
                {t.points >= 0 ? "+" : ""}{t.points}
              </span>
            </li>
          ))}
          {txs.length === 0 && <p className="text-sm text-muted-foreground">No activity yet — start earning!</p>}
        </ul>
      </section>

      <section className="px-4 mt-8 space-y-2">
        <Row icon={Target} label="Daily Missions" to="/app/missions" />
        <Row icon={Brain} label="Trivia" to="/app/trivia" />
        <Row icon={BarChart3} label="Leaderboard" to="/app/leaderboard" />
        <Row icon={HelpCircle} label="How Rewards Work" to="/app/how-rewards" />
        <Row icon={Wallet} label="Redemption History" to="/app/withdraw-history" />
        <Row icon={Info} label="About App" to="/app/about" />
        <Row icon={Shield} label="Privacy Policy" to="/legal/privacy" />
        <Row icon={FileText} label="Terms & Conditions" to="/legal/terms" />
        <Row icon={Database} label="Data Safety" to="/legal/data-safety" />
        <a href="mailto:support@rewardloop.app" className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 card-shadow active:scale-[0.99] transition">
          <HelpCircle className="h-5 w-5 text-muted-foreground" /> <span className="font-semibold">Contact Support</span>
        </a>
        <button onClick={logout} className="w-full pill-btn bg-destructive text-destructive-foreground flex items-center justify-center gap-2">
          <LogOut className="h-4 w-4" /> Log out
        </button>
        <button
          onClick={onDeleteAccount}
          disabled={deleting}
          className="w-full pill-btn border border-destructive text-destructive bg-card flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" /> {deleting ? "Deleting…" : "Delete account"}
        </button>
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          Account deletion permanently removes your data and frees your email.
        </p>
      </section>
    </div>
  );
}

function Row({ icon: Icon, label, to }: { icon: any; label: string; to: any }) {
  return (
    <Link to={to} className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 card-shadow active:scale-[0.99] transition">
      <Icon className="h-5 w-5 text-muted-foreground" /> <span className="font-semibold">{label}</span>
    </Link>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl py-3 card-shadow">
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">{icon}{label}</p>
      <p className="text-xl font-extrabold text-foreground tabular-nums">{value}</p>
    </div>
  );
}
