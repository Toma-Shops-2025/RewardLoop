import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Pause, Play, RotateCcw, Volume2, VolumeX, Vibrate, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-context";
import { fireConfetti } from "@/lib/confetti";
import { RewardedGate } from "@/components/RewardedGate";

export const Route = createFileRoute("/app/tap-dash")({ component: TapDash });

const ROUND_MS = 30_000;
const TARGET_MIN = 36;
const TARGET_MAX = 64;

type Target = {
  id: number;
  x: number; // %
  y: number; // %
  size: number;
  bornAt: number;
  lifeMs: number;
  honeypot: boolean;
};

type Floater = { id: number; x: number; y: number; text: string };

type Phase = "idle" | "playing" | "paused" | "over";

const LS_KEYS = { sound: "td:sound", vibrate: "td:vibrate", best: "td:best" };

function readBool(k: string, def: boolean) {
  if (typeof window === "undefined") return def;
  const v = localStorage.getItem(k);
  return v == null ? def : v === "1";
}

function beep(enabled: boolean, freq = 880) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.value = 0.05;
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.06);
    setTimeout(() => ctx.close(), 120);
  } catch { /* ignore */ }
}

function TapDash() {
  const navigate = useNavigate();
  const { refresh } = useApp();
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [targets, setTargets] = useState<Target[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [best, setBest] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(LS_KEYS.best) ?? "0");
  });
  const [sound, setSound] = useState(() => readBool(LS_KEYS.sound, true));
  const [vibrate, setVibrate] = useState(() => readBool(LS_KEYS.vibrate, true));
  const [reward, setReward] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [doubled, setDoubled] = useState(false);

  const startRef = useRef(0);
  const pauseAccumRef = useRef(0);
  const pauseAtRef = useRef(0);
  const idRef = useRef(1);
  const tapTimesRef = useRef<number[]>([]);
  const playRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(LS_KEYS.sound, sound ? "1" : "0"); }, [sound]);
  useEffect(() => { localStorage.setItem(LS_KEYS.vibrate, vibrate ? "1" : "0"); }, [vibrate]);

  const multiplier = combo >= 20 ? 4 : combo >= 10 ? 3 : combo >= 5 ? 2 : 1;

  const reset = useCallback(() => {
    setPhase("idle");
    setScore(0); setCombo(0); setComboMax(0); setHits(0);
    setTimeLeft(ROUND_MS); setTargets([]); setFloaters([]);
    setReward(null); setDoubled(false);
    pauseAccumRef.current = 0; pauseAtRef.current = 0;
    tapTimesRef.current = [];
  }, []);

  const start = useCallback(() => {
    reset();
    startRef.current = Date.now();
    setPhase("playing");
  }, [reset]);

  const togglePause = useCallback(() => {
    setPhase((p) => {
      if (p === "playing") { pauseAtRef.current = Date.now(); return "paused"; }
      if (p === "paused") { pauseAccumRef.current += Date.now() - pauseAtRef.current; return "playing"; }
      return p;
    });
  }, []);

  // Game tick: timer + spawner
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - startRef.current - pauseAccumRef.current;
      const remaining = Math.max(0, ROUND_MS - elapsed);
      setTimeLeft(remaining);

      // Difficulty curve: lifespan shrinks 1500→700ms, spawn interval shrinks
      const t = elapsed / ROUND_MS; // 0..1
      const desired = Math.min(5, 2 + Math.floor(t * 4));
      setTargets((prev) => {
        // remove expired
        const now = Date.now();
        const alive = prev.filter((tg) => now - tg.bornAt < tg.lifeMs);
        const expired = prev.length - alive.length;
        if (expired > 0) {
          // missed targets reset combo
          setCombo(0);
        }
        // spawn until desired count
        const spawn = Math.max(0, desired - alive.length);
        const next = [...alive];
        for (let i = 0; i < spawn; i++) {
          const honeypot = Math.random() < 0.04 && t > 0.25;
          const lifeMs = Math.max(700, 1500 - Math.floor(t * 800));
          const size = Math.max(TARGET_MIN, Math.round(TARGET_MAX - t * 22));
          next.push({
            id: idRef.current++,
            x: 6 + Math.random() * 88,
            y: 8 + Math.random() * 84,
            size,
            bornAt: now,
            lifeMs,
            honeypot,
          });
        }
        return next;
      });

      if (remaining <= 0) { setPhase("over"); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Submit on round end
  useEffect(() => {
    if (phase !== "over") return;
    if (submitting) return;
    setSubmitting(true);
    const duration = Date.now() - startRef.current - pauseAccumRef.current;
    const dur = Math.min(35_000, Math.max(28_000, duration));

    (async () => {
      try {
        const { data, error } = await (supabase as any).rpc("claim_tapdash_reward", {
          p_score: score,
          p_hits: hits,
          p_combo_max: comboMax,
          p_duration_ms: dur,
        });
        if (error) throw error;
        const rp = (data?.reward_points ?? 0) as number;
        setReward(rp);
        if (score > best) {
          setBest(score);
          localStorage.setItem(LS_KEYS.best, String(score));
          fireConfetti(80);
          toast.success(`New personal best: ${score}!`);
        } else if (rp > 0) {
          fireConfetti(40);
        }
        await refresh();
      } catch (e: any) {
        toast.error(e?.message ?? "Could not submit round");
        setReward(0);
      } finally {
        setSubmitting(false);
      }
    })();
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTapTarget = (tg: Target, ev: React.MouseEvent | React.TouchEvent) => {
    ev.stopPropagation();
    if (phase !== "playing") return;

    // Anti-autoclick: rolling 1s window cap
    const now = Date.now();
    tapTimesRef.current = tapTimesRef.current.filter((t) => now - t < 1000);
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 12) {
      // soft penalty: ignore + reset combo
      setCombo(0);
      return;
    }

    setTargets((prev) => prev.filter((t) => t.id !== tg.id));

    if (tg.honeypot) {
      setCombo(0);
      beep(sound, 220);
      return;
    }

    const newCombo = combo + 1;
    setCombo(newCombo);
    setComboMax((m) => Math.max(m, newCombo));
    const mult = newCombo >= 20 ? 4 : newCombo >= 10 ? 3 : newCombo >= 5 ? 2 : 1;
    setScore((s) => s + mult);
    setHits((h) => h + 1);
    if (vibrate && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);
    beep(sound, 880 + mult * 120);

    // Floater
    const fid = idRef.current++;
    setFloaters((prev) => [...prev, { id: fid, x: tg.x, y: tg.y, text: `+${mult}` }]);
    setTimeout(() => setFloaters((prev) => prev.filter((f) => f.id !== fid)), 700);
  };

  const onMissArea = () => {
    if (phase !== "playing") return;
    setCombo(0);
  };

  const doubleReward = useCallback(async () => {
    if (doubled || !reward || reward <= 0) return;
    // Award the same milestone again as a bonus.
    const { error } = await supabase.rpc("award_points" as any, {
      p_type: "tap_dash",
      p_points: reward,
      p_meta: { bonus: "rewarded_ad" },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setDoubled(true);
    fireConfetti(60);
    toast.success(`+${reward} bonus pts`);
    await refresh();
  }, [doubled, reward, refresh]);

  const pct = (timeLeft / ROUND_MS) * 100;

  return (
    <div className="bg-background min-h-full page-fade">
      <header className="brand-header px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/app/games" })} aria-label="Back" className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-lg font-bold text-brand-foreground flex-1">Tap Dash</h1>
        <button onClick={() => setSound((s) => !s)} aria-label="Sound" className="text-brand-foreground/90 p-1.5">
          {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
        <button onClick={() => setVibrate((s) => !s)} aria-label="Vibration" className={`p-1.5 ${vibrate ? "text-brand-foreground" : "text-brand-foreground/40"}`}>
          <Vibrate className="h-5 w-5" />
        </button>
      </header>

      {/* HUD */}
      <div className="px-4 -mt-3 mb-3">
        <div className="bg-card rounded-2xl card-shadow px-4 py-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Score</p>
            <p className="text-2xl font-extrabold tabular-nums">{score}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Combo</p>
            <p className="text-2xl font-extrabold tabular-nums">
              {combo} <span className="text-xs text-brand">x{multiplier}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Best</p>
            <p className="text-2xl font-extrabold tabular-nums">{best}</p>
          </div>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand to-warning transition-[width] duration-100" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Play area */}
      <div className="px-4">
        <div
          ref={playRef}
          onClick={onMissArea}
          className="relative w-full rounded-3xl border border-border bg-card overflow-hidden card-shadow"
          style={{ height: "62vh", minHeight: 360 }}
        >
          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <Trophy className="h-10 w-10 text-brand" />
              <h2 className="font-extrabold text-xl mt-2">Ready to dash?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tap orange targets fast. Build combos for x2, x3, x4 multipliers. Avoid grey decoys.
              </p>
              <button onClick={start} className="mt-5 pill-btn bg-primary text-primary-foreground px-8">Start round</button>
              <p className="text-[11px] text-muted-foreground mt-3">30 second round · 60s cooldown · 20 rewards/day</p>
            </div>
          )}

          {phase === "paused" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/85 backdrop-blur">
              <div className="text-center">
                <Pause className="h-10 w-10 mx-auto text-brand" />
                <p className="font-bold mt-2">Paused</p>
                <button onClick={togglePause} className="mt-3 pill-btn bg-primary text-primary-foreground px-6">Resume</button>
              </div>
            </div>
          )}

          {phase === "over" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/95 backdrop-blur p-6">
              <div className="text-center w-full max-w-xs">
                <p className="text-[11px] tracking-widest font-bold text-muted-foreground">ROUND COMPLETE</p>
                <p className="text-5xl font-extrabold tabular-nums mt-1">{score}</p>
                <p className="text-sm text-muted-foreground">{hits} hits · best combo x{comboMax}</p>
                {submitting ? (
                  <p className="mt-3 text-sm">Submitting…</p>
                ) : reward !== null ? (
                  <>
                    <p className="mt-3 text-sm font-bold text-success">
                      {reward > 0 ? `+${reward} reward points!` : "No milestone reached — try again"}
                    </p>
                    {reward > 0 && !doubled && (
                      <div className="mt-3 text-left">
                        <RewardedGate
                          offer="Double this round's reward"
                          bonus={reward}
                          onReward={doubleReward}
                        />
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button onClick={start} className="flex-1 pill-btn bg-primary text-primary-foreground py-2"><Play className="h-4 w-4 inline" /> Play again</button>
                      <button onClick={() => navigate({ to: "/app/games" })} className="flex-1 pill-btn border border-border py-2">Games</button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Targets */}
          {phase !== "idle" && targets.map((tg) => (
            <button
              key={tg.id}
              onClick={(e) => onTapTarget(tg, e)}
              className={`td-target ${tg.honeypot ? "honeypot" : ""}`}
              aria-label={tg.honeypot ? "Decoy" : "Target"}
              style={{
                left: `calc(${tg.x}% - ${tg.size / 2}px)`,
                top: `calc(${tg.y}% - ${tg.size / 2}px)`,
                width: tg.size,
                height: tg.size,
              }}
            />
          ))}

          {/* Floaters */}
          {floaters.map((f) => (
            <span key={f.id} className="td-floater" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
              {f.text}
            </span>
          ))}
        </div>

        {/* Bottom controls */}
        {(phase === "playing" || phase === "paused") && (
          <div className="mt-3 flex gap-2">
            <button onClick={togglePause} className="flex-1 pill-btn border border-border py-2">
              {phase === "paused" ? <><Play className="h-4 w-4 inline" /> Resume</> : <><Pause className="h-4 w-4 inline" /> Pause</>}
            </button>
            <button onClick={reset} className="flex-1 pill-btn border border-border py-2">
              <RotateCcw className="h-4 w-4 inline" /> Restart
            </button>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center mt-4 px-4 pb-6">
          Skill-based mini-game for entertainment. Reward points are not guaranteed and depend on advertiser availability.
        </p>
      </div>
    </div>
  );
}
