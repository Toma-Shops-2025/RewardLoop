import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Home, Gamepad2, Users, Wallet, User as UserIcon } from "lucide-react";
import { useAuth, fetchProfile, type Profile } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { AppContext } from "@/lib/app-context";
import logo from "@/assets/rewardloop-logo.png";

export const Route = createFileRoute("/app")({ component: AppLayout });

const tabs = [
  { to: "/app", icon: Home, label: "Home" },
  { to: "/app/games", icon: Gamepad2, label: "Games" },
  { to: "/app/referrals", icon: Users, label: "Invite" },
  { to: "/app/withdraw", icon: Wallet, label: "Redeem" },
  { to: "/app/profile", icon: UserIcon, label: "Profile" },
] as const;

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setProfile(await fetchProfile(user.id));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refresh();
    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => setProfile(payload.new as Profile)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refresh]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand text-brand-foreground gap-3">
        <img src={logo} alt="" width={64} height={64} className="h-16 w-16 rounded-2xl animate-pulse" />
        <p className="text-sm font-semibold opacity-90">Loading RewardLoop…</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ profile, userId: user.id, refresh }}>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 pb-20">
          <div key={location.pathname} className="page-fade">
            <Outlet />
          </div>
        </main>

        <nav className="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur border-t border-border card-shadow z-30">
          <ul className="grid grid-cols-5 max-w-md mx-auto">
            {tabs.map((t) => {
              const active = location.pathname === t.to;
              const Icon = t.icon;
              return (
                <li key={t.to}>
                  <Link to={t.to} className={`relative flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active ? "text-brand" : "text-muted-foreground"}`}>
                    {active && <span className="absolute top-0 h-1 w-8 rounded-b-full bg-brand" style={{ boxShadow: "0 2px 10px oklch(0.85 0.16 200 / 0.7)" }} />}
                    <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
                    <span className="text-[11px] font-semibold">{t.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </AppContext.Provider>
  );
}
