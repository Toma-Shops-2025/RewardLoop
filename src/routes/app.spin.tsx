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

        const spinData = data as { segment?: number; points: number };
        const reward = spinData.points;

        // Accurate segment finding from Database index
        const segmentIndex = (typeof spinData.segment === 'number') ? spinData.segment : SEGMENTS.indexOf(reward);

        const segDeg = 360 / SEGMENTS.length;
        const baseSpins = Math.ceil(startAngle / 360) * 360 + (360 * 6);
        const segmentOffset = 360 - (segmentIndex * segDeg + (segDeg / 2));
        const finalAngle = baseSpins + segmentOffset;

        setAngle(finalAngle);

        setTimeout(async () => {
            fireConfetti(reward >= 15 ? 70 : 30);
            toast.success(`Won ${reward} points!`);
            await refresh();
            setSpinning(false);
            setCooldown(COOLDOWN_SEC);
        }, 5100);
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

  const WEDGE_COLORS = [ "#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4", "#6366f1", "#10b981", "#eab308" ];

  return (
    <div className="bg-background min-h-full pb-12 overflow-hidden flex flex-col">
      <header className="bg-brand px-5 py-6 flex items-center gap-3 shadow-lg">
        <button onClick={() => navigate({ to: "/app" })} className="text-white"><ArrowLeft className="h-6 w-6" /></button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Reward Wheel</h1>
        </div>
        <div className="w-6" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="mx-auto rounded-[3.5rem] p-12 bg-slate-950 border-8 border-white/5 shadow-2xl relative scale-110">
            <div className="relative mx-auto h-72 w-72">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 drop-shadow-2xl">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <path d="M24 40 L6 8 L42 8 Z" fill="white" stroke="#000" strokeWidth="2" />
                </svg>
              </div>

              <div
                className="absolute inset-0 rounded-full"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transition: spinning ? "transform 5s cubic-bezier(0.2, 0, 0.1, 1)" : "none",
                }}
              >
                <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-full">
                  {SEGMENTS.map((p, i) => (
                    <path key={`w${i}`} d={wedgePath(i)} fill={WEDGE_COLORS[i]} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  ))}
                  {SEGMENTS.map((p, i) => {
                    const midDeg = i * segDeg + segDeg / 2;
                    return (
                      <g key={`t${i}`} transform={`rotate(${midDeg} ${C} ${C}) translate(${C} ${C - R_LABEL})`}>
                        <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="white" style={{ fontSize: 20, fontWeight: 900, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
                          {p}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="absolute inset-0 m-auto h-16 w-16 rounded-full flex items-center justify-center z-10 bg-white shadow-2xl border-4 border-slate-950">
                <Sparkles className="h-6 w-6 text-brand" />
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm px-6 mt-16 text-center">
            <button onClick={spin} disabled={spinning || cooldown > 0}
              className="w-full bg-brand text-white py-6 rounded-full font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-40 text-xl"
            >
              {spinning ? "Spinning..." : cooldown > 0 ? `Wait ${cooldown}s` : "SPIN NOW"}
            </button>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-6">Watch Ad to unlock Spin</p>
          </div>
      </div>
    </div>
  );
}
