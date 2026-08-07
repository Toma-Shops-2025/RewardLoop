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

    // Initial slow spin
    const startAngle = angle + 360 * 2;
    setAngle(startAngle);

    try {
        const ad = await showRewardedAd();
        if (!ad.success) {
            setSpinning(false);
            return;
        }

        await waitForReturn();

        const { data, error } = await supabase.rpc("claim_spin_reward");
        if (error || !data) {
            toast.error(error?.message ?? "Connection error");
            setSpinning(false);
            return;
        }

        const spinData = data as { segment_index?: number; points: number };
        const reward = spinData.points;

        // FIND EXACT POSITION
        // We use the segment_index if returned, else find the first match
        const segmentIndex = (typeof spinData.segment_index === 'number')
            ? spinData.segment_index
            : SEGMENTS.indexOf(reward);

        const segDeg = 360 / SEGMENTS.length;

        // Math: Full rotations + Offset to center of slice
        const baseSpins = Math.ceil(startAngle / 360) * 360 + 360 * 5;
        const segmentOffset = 360 - (segmentIndex * segDeg + (segDeg / 2));
        const finalAngle = baseSpins + segmentOffset;

        setAngle(finalAngle);

        setTimeout(async () => {
            fireConfetti(reward >= 15 ? 70 : 30);
            toast.success(`Won ${reward} points!`);
            await refresh();
            setSpinning(false);
            setCooldown(COOLDOWN_SEC);
        }, 4200);
    } catch (e: any) {
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
    <div className="bg-background min-h-full pb-12 overflow-hidden">
      <header className="brand-header px-5 py-5 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/app" })} className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-black text-brand-foreground uppercase tracking-tighter">Reward Wheel</h1>
        </div>
        <div className="w-6" />
      </header>

      <div className="mx-4 mt-12 rounded-[3rem] p-10 bg-white/5 border border-white/10 backdrop-blur-xl relative">
        <div className="relative mx-auto h-72 w-72">
          {/* Pointer */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 drop-shadow-lg">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <path d="M20 35 L5 5 L35 5 Z" fill="white" stroke="black" strokeWidth="1" />
            </svg>
          </div>

          <div
            className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.15, 0, 0.15, 1)" : "none",
            }}
          >
            <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-full">
              {SEGMENTS.map((p, i) => (
                <path
                  key={`w${i}`}
                  d={wedgePath(i)}
                  fill={i % 2 === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}
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

          <div className="absolute inset-0 m-auto h-16 w-16 rounded-full flex items-center justify-center z-10 bg-black border-2 border-white/20 shadow-2xl">
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="px-6 mt-12">
        <button onClick={spin} disabled={spinning || cooldown > 0}
          className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all disabled:opacity-40 text-xl"
        >
          {spinning ? "Spinning..." : cooldown > 0 ? `Wait ${cooldown}s` : "SPIN FOR LOOT"}
        </button>
      </div>
    </div>
  );
}
