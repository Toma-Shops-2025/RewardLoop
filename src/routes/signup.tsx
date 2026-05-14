import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", referral: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { name: form.name, referral_code: form.referral.trim().toUpperCase() },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! 🎉 Check your email to confirm.");
    navigate({ to: "/login" });
  };

  const signUpWithGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/app`,
      extraParams: form.referral.trim()
        ? { state: `ref=${form.referral.trim().toUpperCase()}` }
        : undefined,
    });
    if (result.error) {
      setGoogleLoading(false);
      return toast.error(result.error.message ?? "Google sign-in failed");
    }
    if (result.redirected) return;
    navigate({ to: "/app" });
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="brand-header relative flex items-center justify-center py-5">
        <h1 className="text-xl font-bold text-brand-foreground">Sign Up</h1>
        <Link to="/login" className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-foreground"><X /></Link>
      </header>

      <div className="flex-1 px-6 pt-6 pb-6 max-w-md w-full mx-auto">
        <button
          type="button"
          onClick={signUpWithGoogle}
          disabled={googleLoading || loading}
          className="pill-btn w-full bg-card border border-border text-foreground flex items-center justify-center gap-3 disabled:opacity-60 mb-5"
        >
          <GoogleIcon />
          <span className="font-bold">{googleLoading ? "Connecting…" : "Sign up with Google"}</span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">or email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-5">
          {[
            { key: "name", label: "Your Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "password", label: "Password", type: "password" },
            { key: "referral", label: "Referral Code (optional)", type: "text" },
          ].map((f) => (
            <label key={f.key} className="block">
              <span className="text-base font-bold text-foreground">{f.label}</span>
              <input
                type={f.type}
                required={f.key !== "referral"}
                value={form[f.key as keyof typeof form]}
                onChange={set(f.key as keyof typeof form)}
                className="mt-2 w-full bg-transparent border-b border-border py-2 outline-none focus:border-brand text-foreground"
              />
            </label>
          ))}

          <p className="text-brand font-semibold text-sm">Have a referral code? Enter it to claim a 50-point welcome bonus.</p>
          <p className="text-foreground/80 text-sm">By signing up you agree to our <Link to="/legal/terms" className="font-bold underline">Terms</Link> and <Link to="/legal/privacy" className="font-bold underline">Privacy Policy</Link>.</p>

          <button type="submit" disabled={loading || googleLoading} className="pill-btn bg-primary text-primary-foreground w-full disabled:opacity-60">
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <Link to="/login" className="mt-4 block text-center pill-btn bg-card border border-border text-foreground">
          Already Have Account? <span className="font-extrabold">Log in</span>
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
