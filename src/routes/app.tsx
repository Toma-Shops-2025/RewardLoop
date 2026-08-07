import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Home, Gamepad2, Users, Wallet, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth, fetchProfile, type Profile } from "@/lib/auth";
import { showInterstitial, setBannerVisible } from "@/lib/ads";
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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
        const p = await fetchProfile(user.id);
        if (p) setProfile(p);
    } finally {
        setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refresh();

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
            console.log("Profile Update:", payload.new);
            setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
        if (channel) supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  useEffect(() => {
    if (user) setBannerVisible(true);
    else setBannerVisible(false);
  }, [user]);

  const handleTabClick = (to: string) => {
      if (to === "/app/withdraw" && location.pathname !== "/app/withdraw") {
          showInterstitial();
      }
  };

  if (authLoading || !user || (!profile && isSyncing)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand text-brand-foreground gap-3">
        <img src={logo} alt="" width={64} height={64} className="h-16 w-16 rounded-2xl animate-pulse shadow-2xl" />
        <p className="text-sm font-black uppercase tracking-widest opacity-90 animate-pulse">Syncing Vault...</p>
        <Loader2 className="h-6 w-6 animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ profile, userId: user.id, refresh, loading: isSyncing }}>
      <div
        className="min-h-screen flex flex-col bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <main
          className="flex-1"
          style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        >
          <div key={location.pathname} className="page-fade">
            <Outlet />
          </div>
        </main>

        <nav
          className="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-xl border-t border-border card-shadow z-30"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ul className="grid grid-cols-5 max-w-md mx-auto h-20">
            {tabs.map((t) => {
              const active = location.pathname === t.to || (t.to === '/app' && location.pathname === '/app/');
              const Icon = t.icon;
              return (
                <li key={t.to} className="flex flex-col items-center justify-center">
                  <Link
                    to={t.to}
                    onClick={() => handleTabClick(t.to)}
                    className={`relative flex flex-col items-center gap-1 py-2 transition-all ${active ? "text-brand scale-110" : "text-muted-foreground/60"}`}
                  >
                    <Icon className={`h-6 w-6 ${active ? "fill-brand/20" : ""}`} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{t.label}</span>
                    {active && <span className="absolute -bottom-2 h-1 w-6 rounded-t-full bg-brand" />}
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
