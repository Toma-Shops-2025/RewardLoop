import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const LS_KEY = "rl:consent:v1";

type Choice = "accepted" | "essential";

/**
 * Lightweight ad / analytics consent banner. AdMob's UMP SDK takes over on
 * native builds; this web banner satisfies the equivalent obligation in the
 * preview / PWA context and records the choice for audit.
 */
export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(LS_KEY)) setShow(true);
  }, []);

  const persist = async (choice: Choice) => {
    localStorage.setItem(LS_KEY, choice);
    setShow(false);
    try {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      await supabase.from("user_consent").upsert({
        user_id: uid,
        ads_personalized: choice === "accepted",
        analytics: choice === "accepted",
        accepted_at: new Date().toISOString(),
      });
    } catch {
      /* best-effort */
    }
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and ad consent"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-border bg-card text-foreground card-shadow p-4">
        <h2 className="font-extrabold text-sm">Your privacy choices</h2>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          We use cookies and device identifiers to keep you signed in, prevent
          fraud, and (with your consent) show personalized ads through Google
          AdMob. You can change this any time in Profile → Privacy.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => persist("essential")}
            className="flex-1 pill-btn border border-border py-2 text-xs"
          >
            Essential only
          </button>
          <button
            onClick={() => persist("accepted")}
            className="flex-1 pill-btn bg-primary text-primary-foreground py-2 text-xs"
          >
            Accept all
          </button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          See our{" "}
          <Link to="/legal/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/legal/ad-disclosure" className="underline">
            Ad Disclosure
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
