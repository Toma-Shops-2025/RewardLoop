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

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const spin = async () => {
    if (spinning || cooldown > 0) return;
    setSpinning(true);

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

        await waitForReturn();

        const { data, error } = await supabase.rpc("claim_spin_reward");
        if (error || !data) {
            toast.error(error?.message ?? "Spin failed. Check connection.");
            setSpinning(false);
            return;
        }

        // IMPROVED ACCURACY: Use segment index from DB if available, else find first match
        const spinData = data as { segment?: number; points: number };
        const reward = spinData.points;
        const segmentIndex = (typeof spinData.segment === 'number')
            ? spinData.segment
            : SEGMENTS.indexOf(reward);

        const segDeg = 360 / SEGMENTS.length;

        // Calculate rotation: full spins + offset to segment center
        const baseSpins = Math.ceil(previewAngle / 360) * 360 + 360 * 5;
        const segmentOffset = 360 - (segmentIndex * segDeg + (segDeg / 2));
        const finalAngle = baseSpins + segmentOffset;

        setAngle(finalAngle);

        setTimeout(async () => {
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
        <button onClick={() => navigate({ to: "/app" })} className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-brand-foreground uppercase tracking-tight">Reward Wheel</h1>
          <p className="text-brand-foreground/80 text-[10px] font-black uppercase tracking-widest tabular-nums mt-0.5">{(profile?.points ?? 0).toLocaleString()} POINTS</p>
        </div>
        <div className="w-6" />
      </header>

      <div className="neon-stage mx-4 mt-6 rounded-[2.5rem] p-8 border border-white/5 bg-white/5 backdrop-blur-md">
        <div className="relative mx-auto h-72 w-72">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <path d="M18 30 L4 6 L32 6 Z" fill="white" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))" }} />
            </svg>
          </div>

          <div
            className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.15, 0, 0.15, 1)" : "transform 0.5s ease-out",
            }}
          >
            <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-full">
              <circle cx={C} cy={C} r={R_OUTER + 2} fill="white" opacity="0.05" />
              {SEGMENTS.map((p, i) => (
                <path
                  key={`w${i}`}
                  d={wedgePath(i)}
                  fill={i % 2 === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.5"
                />
              ))}
              {SEGMENTS.map((p, i) => {
                const midDeg = i * segDeg + segDeg / 2;
                return (
                  <g key={`t${i}`} transform={`rotate(${midDeg} ${C} ${C}) translate(${C} ${C - R_LABEL})`}>
                    <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="white" style={{ fontSize: 16, fontWeight: 900 }}>
                      {p}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute inset-0 m-auto h-16 w-14 rounded-full flex items-center justify-center z-10 bg-white/10 backdrop-blur-xl border border-white/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="px-6 mt-8">
        <button onClick={spin} disabled={spinning || cooldown > 0}
          className="w-full bg-white text-black py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-40 italic"
        >
          {spinning ? "SPINNING..." : cooldown > 0 ? `WAIT ${cooldown}S` : "SPIN NOW"}
        </button>
        <p className="text-center text-[10px] text-white/30 font-bold uppercase tracking-widest mt-4">Video ad required per spin</p>
      </div>
    </div>
  );
}
