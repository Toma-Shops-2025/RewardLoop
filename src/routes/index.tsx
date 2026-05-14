import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import logo from "@/assets/rewardloop-logo.png";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Splash,
  head: () => ({
    meta: [
      { title: "RewardLoop — Gamified Rewards Platform" },
      { name: "description", content: "Earn reward points through missions, trivia, and engagement activities." },
    ],
  }),
});

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const onboarded = typeof window !== "undefined" && localStorage.getItem("onboarded") === "1";
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/app" });
      else if (!onboarded) navigate({ to: "/onboarding" });
      else navigate({ to: "/login" });
    }, 1200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand text-brand-foreground">
      <img src={logo} alt="RewardLoop logo" width={128} height={128}
        className="h-32 w-32 rounded-2xl animate-in fade-in zoom-in duration-700" />
      <h1 className="mt-6 text-3xl font-bold tracking-tight">RewardLoop</h1>
      <p className="mt-1 text-sm opacity-80">Engage. Earn. Repeat.</p>
      <p className="absolute bottom-6 text-xs opacity-70">Version 2.0.0</p>
    </main>
  );
}
