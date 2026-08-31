import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, Wallet, CreditCard, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
import { sendTransactionalEmail } from "@/lib/email/send";

export const Route = createFileRoute("/app/withdraw")({ component: Withdraw });

const FEE_RATE = 0.02;
const POINTS_PER_USD = 1000;

const REWARDS = [
  { id: "v5", name: "$5 Visa Card", ptsCost: 5_000, brand: "visa" as const, type: "Visa" as const },
  { id: "a5", name: "$5 Amazon Gift", ptsCost: 5_000, brand: "amazon" as const, type: "Amazon" as const },
  { id: "g5", name: "$5 Google Play", ptsCost: 5_000, brand: "google_play" as const, type: "Google" as const },
  { id: "v10", name: "$10 Visa Card", ptsCost: 10_000, brand: "visa" as const, type: "Visa" as const },
  { id: "a10", name: "$10 Amazon Gift", ptsCost: 10_000, brand: "amazon" as const, type: "Amazon" as const },
  { id: "g10", name: "$10 Google Play", ptsCost: 10_000, brand: "google_play" as const, type: "Google" as const },
  { id: "v25", name: "$25 Visa Card", ptsCost: 25_000, brand: "visa" as const, type: "Visa" as const },
  { id: "a25", name: "$25 Amazon Gift", ptsCost: 25_000, brand: "amazon" as const, type: "Amazon" as const },
  { id: "g25", name: "$25 Google Play", ptsCost: 25_000, brand: "google_play" as const, type: "Google" as const },
];

type W = {
  id: string;
  points: number;
  status: string;
  created_at: string;
  gift_card_brand: string | null;
  recipient_email: string | null;
};

function Withdraw() {
  const { profile, userId, refresh } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<W[]>([]);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemEmail, setRedeemEmail] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("withdrawals")
      .select("id, points, status, created_at, gift_card_brand, recipient_email")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    setItems((data ?? []) as W[]);
  };

  useEffect(() => {
    if (!userId) return;
    refresh();
    load();
    setRedeemEmail(profile?.email ?? "");
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const balance = profile?.points ?? 0;

  const handleRedeem = async (reward: (typeof REWARDS)[number]) => {
    const email = redeemEmail.trim();
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email to receive your gift card.");
      return;
    }
    const fee = Math.ceil(reward.ptsCost * FEE_RATE);
    const total = reward.ptsCost + fee;
    if (balance < total) {
      toast.error(`Need ${total.toLocaleString()} pts (includes 2% fee).`);
      return;
    }
    if (!confirm(`Redeem ${reward.name} for ${reward.ptsCost.toLocaleString()} pts?`)) return;

    setIsRedeeming(true);
    try {
      const { data, error } = await supabase
        .rpc("request_withdrawal", {
          p_points: reward.ptsCost,
          p_brand: reward.brand,
          p_email: email,
        })
        .single();
      const wd = data as W | null;
      if (error) throw error;

      toast.success("Redemption submitted!", {
        description: "Gift cards are delivered within 2 business days.",
      });

      if (wd?.id) {
        sendTransactionalEmail({
          templateName: "new-redemption-alert",
          idempotencyKey: `redemption-alert-${wd.id}`,
          templateData: {
            userName: profile?.name ?? "Player",
            userEmail: profile?.email ?? null,
            points: wd.points,
            giftCardBrand: wd.gift_card_brand,
            recipientEmail: wd.recipient_email,
            withdrawalId: wd.id,
          },
        }).catch((err) => console.error("Admin alert email failed", err));
      }

      await refresh();
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Redemption failed");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="bg-background min-h-full pb-8 text-foreground">
      <header className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Link
          to="/app/withdraw-history"
          className="h-10 w-10 rounded-full bg-white/5 border border-border flex items-center justify-center shrink-0"
          aria-label="History"
        >
          <Clock className="h-5 w-5 text-brand" />
        </Link>
        <h1 className="text-xl font-black uppercase italic tracking-tighter flex-1 text-center pr-10">
          THE <span className="text-brand">REWARD VAULT</span>
        </h1>
      </header>

      <div className="px-4">
        <div className="bg-gradient-to-br from-[#1a1208] to-black border border-brand/20 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24 rotate-12 text-brand" />
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 italic">
            Total Reward Balance
          </p>
          <p className="text-6xl font-black tracking-tighter tabular-nums italic">
            {balance.toLocaleString()}
          </p>
          <p className="text-[10px] text-brand font-bold mt-2 uppercase tracking-widest">
            PTS · Redemption Ready
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-2 italic">
            Delivery email
          </label>
          <input
            type="email"
            value={redeemEmail}
            onChange={(e) => setRedeemEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-card border border-border rounded-xl py-3 px-3 text-sm outline-none focus:border-brand"
            maxLength={255}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 italic">
            Select Reward
          </h3>
          {REWARDS.map((r) => {
            const fee = Math.ceil(r.ptsCost * FEE_RATE);
            const total = r.ptsCost + fee;
            const isUnlocked = balance >= total;
            const Icon = r.type === "Google" ? Wallet : CreditCard;
            const iconBg =
              r.type === "Amazon"
                ? "bg-orange-600"
                : r.type === "Google"
                  ? "bg-emerald-600"
                  : "bg-brand";

            return (
              <div
                key={r.id}
                className={cn(
                  "rounded-3xl border p-5 flex items-center justify-between transition-all",
                  isUnlocked ? "border-brand/30 bg-brand/5" : "border-border bg-card/50 opacity-50",
                )}
              >
                <div className="flex items-center gap-4 text-left min-w-0">
                  <div className={cn("h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center shadow-lg text-white", iconBg)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm uppercase italic truncate">{r.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">
                      {isUnlocked
                        ? "Ready to claim"
                        : `Unlock at ${r.ptsCost.toLocaleString()} pts`}
                    </p>
                  </div>
                </div>
                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => void handleRedeem(r)}
                    disabled={isRedeeming}
                    className="shrink-0 bg-brand text-brand-foreground text-[10px] font-black px-5 py-2.5 rounded-xl active:scale-95 transition-all italic disabled:opacity-50"
                  >
                    {isRedeeming ? "..." : "REDEEM"}
                  </button>
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0 mr-1" />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-4 px-2">
          2% processing fee added at checkout · {POINTS_PER_USD.toLocaleString()} pts ≈ $1
        </p>

        {items.length > 0 && (
          <section className="mt-8 pt-6 border-t border-border">
            <h2 className="font-bold text-sm mb-3 uppercase tracking-widest text-muted-foreground">Recent</h2>
            <ul className="space-y-2">
              {items.map((w) => (
                <li key={w.id} className="bg-card border border-border rounded-xl p-3 text-sm flex justify-between gap-2">
                  <span className="font-bold truncate">{w.points.toLocaleString()} pts · {w.gift_card_brand}</span>
                  <span className="text-[10px] uppercase text-muted-foreground shrink-0">{w.status}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <button
          type="button"
          onClick={() => navigate({ to: "/app" })}
          className="block mx-auto mt-8 text-muted-foreground text-[10px] font-black uppercase tracking-widest underline italic"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
