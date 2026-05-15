import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
import { showRewardedAd } from "@/lib/ads";
import { fireConfetti } from "@/lib/confetti";

export const Route = createFileRoute("/app/spin")({ component: Spin });

const SEGMENTS = [5, 10, 25, 50, 15, 100, 20, 75];
const COLORS = ["#fb923c", "#fbbf24", "#f97316", "#fcd34d", "#fb923c", "#fbbf24", "#f97316", "#fcd34d"];
const COOLDOWN_SEC = 8;

function Spin() {
  const { profile, refresh } = useApp();
  const navigate = useNavigate();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lastWin, setLastWin] = useState<number | null>(null);

  // Refresh balance on entry so the header always reflects latest points
  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const spin = async () => {
    if (spinning || cooldown > 0) return;
    setSpinning(true);
    setLastWin(null);
    toast("Loading sponsored content…");
    const ad = await showRewardedAd();
    if (!ad.success) { setSpinning(false); return; }

    const { data, error } = await supabase.rpc("claim_spin_reward");
    if (error || !data) {
      toast.error(error?.message ?? "Spin failed");
      setSpinning(false);
      return;
    }
    const idx = (data as { segment: number; points: number }).segment;
    const reward = (data as { segment: number; points: number }).points;
    const seg = 360 / SEGMENTS.length;
    const target = 360 * 6 + (360 - (idx * seg + seg / 2));
    setAngle(target);

    setTimeout(async () => {
      setLastWin(reward);
      if (reward >= 50) fireConfetti(80);
      else if (reward >= 20) fireConfetti(40);
      else fireConfetti(20);
      toast.success(`🎉 You won ${reward} points!`);
      await refresh();
      setSpinning(false);
      setCooldown(COOLDOWN_SEC);
    }, 4200);
  };

  const seg = 360 / SEGMENTS.length;
  const disabled = spinning || cooldown > 0;
  const radius = 92; // px from center for label placement (wheel ~288px, inner ~272px)

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

      <div className="relative mx-auto mt-10 h-72 w-72">
        {/* Pointer */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-foreground drop-shadow-md" />
        </div>

        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand to-warning p-2 brand-shadow">
          <div
            className="h-full w-full rounded-full border-4 border-card relative overflow-hidden"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: "transform 4s cubic-bezier(0.17, 0.67, 0.18, 1)",
              background: `conic-gradient(${SEGMENTS.map((_, i) =>
                `${COLORS[i]} ${i * seg}deg ${(i + 1) * seg}deg`
              ).join(", ")})`,
            }}
          >
            {/* Separator lines */}
            {SEGMENTS.map((_, i) => (
              <div key={`l${i}`}
                className="absolute left-1/2 top-1/2 origin-top h-1/2 w-px bg-card/70"
                style={{ transform: `translate(-50%, 0) rotate(${i * seg}deg)` }} />
            ))}
            {/* Numeric labels — placed near outer rim, upright */}
            {SEGMENTS.map((p, i) => {
              const mid = (i * seg + seg / 2 - 90) * (Math.PI / 180);
              const x = Math.cos(mid) * radius;
              const y = Math.sin(mid) * radius;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center"
                  style={{
                    transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                  }}
                >
                  <span className="text-card font-extrabold text-2xl leading-none tabular-nums drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                    {p}
                  </span>
                  <span className="text-card/95 font-bold text-[10px] uppercase tracking-wider mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                    pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center hub */}
        <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-card border-4 border-brand flex items-center justify-center brand-shadow">
          <Sparkles className="h-6 w-6 text-brand" />
        </div>
      </div>

      {lastWin !== null && !spinning && (
        <div className="mx-auto mt-5 text-center reward-pop">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">You won</p>
          <p className="text-3xl font-extrabold text-brand">+{lastWin} pts</p>
        </div>
      )}

      <div className="px-6 mt-7">
        <button onClick={spin} disabled={disabled}
          className="pill-btn bg-primary text-primary-foreground w-full text-lg disabled:opacity-60 flex items-center justify-center gap-2">
          {spinning ? "Spinning…" : cooldown > 0 ? (<><Clock className="h-5 w-5" /> Wait {cooldown}s</>) : "SPIN NOW"}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">A short sponsored clip plays before the spin.</p>
        <p className="text-center text-[11px] text-muted-foreground mt-1">Reward values may vary. Every spin grants points — no losses.</p>
      </div>
    </div>
  );
}
