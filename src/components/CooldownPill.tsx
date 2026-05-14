import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/** Live cooldown countdown pill. Shows "Ready" when expired. */
export function CooldownPill({ seconds, label = "Cooldown" }: { seconds: number; label?: string }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => setRemaining(seconds), [seconds]);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  if (remaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Ready
      </span>
    );
  }
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
      <Clock className="h-3 w-3" /> {label} {m > 0 ? `${m}m ` : ""}{s}s
    </span>
  );
}
