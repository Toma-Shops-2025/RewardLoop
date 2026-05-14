import { useState } from "react";
import { PlayCircle, X } from "lucide-react";
import { showRewardedAdWithFallback } from "@/lib/ads";
import { toast } from "sonner";

type Props = {
  /** Short reason shown in the CTA, e.g. "Double this round". */
  offer: string;
  /** Bonus point value displayed on the CTA. */
  bonus: number;
  /** Called only after the rewarded ad completes successfully. */
  onReward: () => void | Promise<void>;
  /** Optional override for the label. */
  label?: string;
};

/**
 * RewardedGate
 * - Always an explicit, dismissable CTA.
 * - Never auto-plays.
 * - Clearly labeled "Sponsored clip" so it isn't confused with a normal claim button.
 */
export function RewardedGate({ offer, bonus, onReward, label = "Watch sponsored clip" }: Props) {
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const trigger = async () => {
    if (busy) return;
    setBusy(true);
    toast("Loading sponsored content…");
    const res = await showRewardedAdWithFallback();
    if (!res.success) {
      toast.error(res.fallback ? "Ad unavailable, please try again" : "Reward not granted");
      setBusy(false);
      return;
    }
    await onReward();
    setBusy(false);
    setDismissed(true);
  };

  return (
    <div className="relative rounded-2xl border border-border bg-card p-4 card-shadow">
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute top-2 right-2 text-muted-foreground p-1"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        Optional · Sponsored
      </p>
      <p className="font-bold mt-1 text-foreground">{offer}</p>
      <p className="text-xs text-muted-foreground">+{bonus} bonus reward points</p>
      <button
        onClick={trigger}
        disabled={busy}
        className="mt-3 w-full pill-btn bg-primary text-primary-foreground text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <PlayCircle className="h-4 w-4" />
        {busy ? "Loading…" : label}
      </button>
    </div>
  );
}
