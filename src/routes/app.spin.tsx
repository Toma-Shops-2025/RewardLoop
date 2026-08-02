import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
import { showRewardedAd } from "@/lib/ads";
import { fireConfetti } from "@/lib/confetti";
import { Capacitor } from "@capacitor/core";

export const Route = createFileRoute("/app/spin")({ component: Spin });

const SEGMENTS = [2, 5, 3, 10, 2, 15, 5, 8];
const COOLDOWN_SEC = 30;

/**
 * Helper to wait for the app to regain focus after an ad.
 */
async function waitForReturn() {
    if (!Capacitor.isNativePlatform()) return;
    return new Promise((resolve) => {
        const handler = () => {
            if (document.visibilityState === 'visible') {
                document.removeEventListener('visibilitychange', handler);
                setTimeout(resolve, 600);
            }
        };
        document.addEventListener('visibilitychange', handler);
    });
}

function Spin() {
  const { profile, refresh } = useApp();
  const navigate = useNavigate();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lastWin, setLastWin] = useState<number | null>(null);

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const spin = async () => {
    if (spinning || cooldown > 0) return;
    setSpinning(true);
    setLastWin(null);

    // START VISUAL FEEDBACK (A slow "loading" rotation)
    const previewAngle = angle + 360 * 2;
    setAngle(previewAngle);

    toast("Loading sponsor clip...");
    try {
        const ad = await showRewardedAd();
        if (!ad.success) {
            toast.error("Ad not ready yet. Please try again.");
            setSpinning(false);
            return;
        }

        // WAIT FOR USER TO RETURN FROM AD
        await waitForReturn();

        const { data, error } = await supabase.rpc("claim_spin_reward");
        if (error || !data) {
            toast.error(error?.message ?? "Spin failed. Check connection.");
            setSpinning(false);
            return;
        }

        const reward = (data as { segment: number; points: number }).points;
        const idx = SEGMENTS.indexOf(reward);
        const seg = 360 / SEGMENTS.length;

        // CALCULATE FINAL LANDING (Landing in middle of segment)
        const base = Math.ceil(previewAngle / 360) * 360 + 360 * 4;
        const target = base + (360 - (idx * seg + (seg / 2)));
        setAngle(target);

        setTimeout(async () => {
            setLastWin(reward);
            fireConfetti(reward >= 15 ? 60 : 25);
            toast.success(`🎉 You won ${reward} points!`);
            await refresh();
            setSpinning(false);
            setCooldown(COOLDOWN_SEC);
        }, 4200);
    } catch (e: any) {
        console.error(e);
        toast.error("Something went wrong. Please try again.");
        setSpinning(false);
    }
  };

  const VB = 200;
  const C = VB / 2;
  const R_OUTER = 96;
  const R_INNER = 22;
  const R_LABEL = 82;
  const segDeg = 360 / SEGMENTS.length;

  const wedgePath = (i: number) => {
    const start = (i * segDeg - 90) * (Math.PI / 180);
    const end = ((i + 1) * segDeg - 90) * (Math.PI / 180);
    const x1 = C + R_OUTER * Math.cos(start);
    const y1 = C + R_OUTER * Math.sin(start);
    const x2 = C + R_OUTER * Math.cos(end);
    const y2 = C + R_OUTER * Math.sin(end);
    const xi1 = C + R_INNER * Math.cos(start);
    const yi1 = C + R_INNER * Math.sin(start);
    const xi2 = C + R_INNER * Math.cos(end);
    const yi2 = C + R_INNER * Math.sin(end);
    return `M ${xi1} ${yi1} L ${x1} ${y1} A ${R_OUTER} ${R_OUTER} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${R_INNER} ${R_INNER} 0 0 0 ${xi1} ${yi1} Z`;
  };

  return (
    <div className="bg-background min-h-full pb-12">
      <header className="brand-header px-5 py-5 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/app" })} aria-label="Back" className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-brand-foreground">Reward Wheel</h1>
          <p className="text-brand-foreground/80 text-xs mt-0.5 tabular-nums">Balance: {(profile?.points ?? 0).toLocaleString()} pts</p>
        </div>
        <div className="w-6" />
      </header>

      <div className="neon-stage mx-4 mt-6 rounded-3xl p-6 border border-white/5">
        <div className="relative mx-auto h-72 w-72">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-bob">
            <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
              <defs>
                <linearGradient id="ptr" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.85 0.16 200)" />
                  <stop offset="100%" stopColor="oklch(0.78 0.19 55)" />
                </linearGradient>
              </defs>
              <path d="M18 30 L4 6 L32 6 Z" fill="url(#ptr)"
                style={{ filter: "drop-shadow(0 0 6px oklch(0.85 0.16 200 / 0.9))" }} />
            </svg>
          </div>

          <div className="absolute inset-0 rounded-full neon-pulse" />

          <div
            className="absolute inset-0 rounded-full"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.18, 1)" : "transform 0.5s ease-out",
            }}
          >
            <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-full">
              {/* Outer rim */}
              <circle cx={C} cy={C} r={R_OUTER + 3} fill="#1a1a2e" />
              {SEGMENTS.map((p, i) => (
                <path
                  key={`w${i}`}
                  d={wedgePath(i)}
                  fill={i % 2 === 0 ? "var(--wheel-segment-a)" : "var(--wheel-segment-b)"}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.8"
                />
              ))}
              {SEGMENTS.map((p, i) => {
                const midDeg = i * segDeg + segDeg / 2;
                return (
                  <g key={`t${i}`} transform={`rotate(${midDeg} ${C} ${C}) translate(${C} ${C - R_LABEL})`}>
                    <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#0b0b14" stroke="white" strokeWidth="0.6" paintOrder="stroke" style={{ fontSize: 18, fontWeight: 900 }}>
                      {p}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute inset-0 m-auto h-14 w-14 rounded-full flex items-center justify-center z-10"
            style={{
              background: "radial-gradient(circle at 30% 30%, oklch(0.30 0.05 270), oklch(0.12 0.05 270))",
              boxShadow: "0 0 18px oklch(0.85 0.16 200 / 0.6), inset 0 0 0 1.5px oklch(0.85 0.16 200 / 0.7)",
            }}>
            <Sparkles className="h-6 w-6" style={{ color: "oklch(0.85 0.16 200)" }} />
          </div>
        </div>
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/50 mt-4">All values in points</p>
      </div>

      <div className="px-6 mt-6">
        <button onClick={spin} disabled={spinning || cooldown > 0}
          className="pill-btn w-full text-lg text-white disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: (spinning || cooldown > 0) ? "oklch(0.30 0.03 265)" : "var(--gradient-neon)",
            boxShadow: (spinning || cooldown > 0) ? "none" : "0 0 24px oklch(0.85 0.16 200 / 0.55)",
          }}>
          {spinning ? "Spinning…" : cooldown > 0 ? (<><Clock className="h-5 w-5" /> Wait {cooldown}s</>) : "SPIN NOW"}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">A short sponsored clip plays before the spin.</p>
      </div>
    </div>
  );
}
