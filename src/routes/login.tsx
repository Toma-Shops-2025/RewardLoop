import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import logo from "@/assets/rewardloop-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { isNativeApp, signInWithGoogleNative } from "@/lib/native-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/app" });
  };

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    if (isNativeApp()) {
      const { error } = await signInWithGoogleNative();
      setGoogleLoading(false);
      if (error) return toast.error(error.message ?? "Google sign-in failed");
      return; // session will be set by deep-link handler
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/app`,
    });
    if (result.error) {
      setGoogleLoading(false);
      return toast.error(result.error.message ?? "Google sign-in failed");
    }
    if (result.redirected) return; // browser navigates away
    navigate({ to: "/app" });
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="brand-header relative flex items-center justify-center py-5">
        <h1 className="text-xl font-bold text-brand-foreground">Login</h1>
        <Link to="/onboarding" className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-foreground"><X /></Link>
      </header>

      <div className="flex-1 px-6 pt-8 pb-6 max-w-md w-full mx-auto">
        <img src={logo} alt="RewardLoop" width={128} height={128} className="mx-auto h-28 w-28 rounded-2xl mb-4" loading="lazy" />
        <p className="text-center text-muted-foreground text-sm mb-6">Welcome back to RewardLoop</p>

        {!isNativeApp() && (
          <>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={googleLoading || loading}
              className="pill-btn w-full bg-card border border-border text-foreground flex items-center justify-center gap-3 disabled:opacity-60"
            >
              <GoogleIcon />
              <span className="font-bold">{googleLoading ? "Connecting…" : "Continue with Google"}</span>
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">or email</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-6">
          <label className="block">
            <span className="text-base font-bold text-foreground">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-transparent border-b border-border py-2 outline-none focus:border-brand text-foreground" />
          </label>
          <label className="block">
            <span className="text-base font-bold text-foreground">Password</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-transparent border-b border-border py-2 outline-none focus:border-brand text-foreground" />
          </label>

          <button type="submit" disabled={loading || googleLoading} className="pill-btn bg-primary text-primary-foreground w-full disabled:opacity-60">
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <Link to="/signup" className="mt-4 block text-center pill-btn bg-card border border-border text-foreground">
          New user? <span className="font-extrabold">Sign Up</span>
        </Link>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.8 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.5 29.3 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.4-.3-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.5 29.3 3.5 24 3.5c-7.5 0-14 4.3-17.7 11.2z" />
      <path fill="#4CAF50" d="M24 44.5c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.3 2.4-5.2 0-9.6-3.2-11.2-7.7l-6.5 5C9.9 40.4 16.5 44.5 24 44.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6.2 5.2c-.4.4 6.8-5 6.8-14.6 0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
