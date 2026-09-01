import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({ component: AuthCallback });

function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) {
            toast.error(error.message ?? "Google sign-in failed");
            navigate({ to: "/login" });
          }
          return;
        }
        window.history.replaceState({}, document.title, `${window.location.origin}/#/app`);
      }

      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;

      if (error || !data.session) {
        setMessage("Sign-in incomplete");
        toast.error("Could not finish Google sign-in. Try again.");
        navigate({ to: "/login" });
        return;
      }

      toast.success("Welcome back!");
      navigate({ to: "/app" });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background gap-3 px-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
