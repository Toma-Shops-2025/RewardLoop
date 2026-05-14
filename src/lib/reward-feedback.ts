import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";

/** Standardized reward-claim feedback. */
export function celebrateReward(points: number, label = "Reward claimed!") {
  fireConfetti(Math.min(120, 30 + points * 2));
  toast.success(`${label} +${points} pts`);
}

export function softFail(message: string) {
  toast.error(message);
}
